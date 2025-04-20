import { z } from "zod";
import { ai } from "../ai-instance"; // Import the initialized ai instance
import { categoryConfig } from "@/config/expense-categories"; // Import exported categoryConfig

// Define input and output schemas
const TransactionInputSchema = z.object({
  description: z.string().describe("The transaction description to categorize"),
  amount: z.number().optional().describe("The transaction amount"),
  date: z.string().optional().describe("The transaction date"),
  previousTransactions: z.array(
    z.object({
      description: z.string(),
      category: z.string(),
      amount: z.number().optional(),
    })
  ).optional().describe("Previous transactions and their categories for reference"),
});

const TransactionOutputSchema = z.object({
  category: z.string().describe("The suggested category for the transaction"),
  confidence: z.number().min(0).max(1).describe("Confidence score for the categorization"),
});

// Define the prompt using ai.definePrompt
const prompt = ai.definePrompt({
  name: "transactionCategorizationPrompt",
  input: {
    schema: TransactionInputSchema,
  },
  output: {
    schema: TransactionOutputSchema,
  },
  prompt: `You are a financial transaction categorization assistant. Your task is to analyze the given transaction description and categorize it into one of the available categories.

Available Categories:
${Object.keys(categoryConfig)
  .filter(category => category !== 'Split Transaction') // Exclude Split Transaction
  .map(category => `- ${category}`)
  .join('\n')
}

Transaction Description: {{{description}}}
{{#if amount}}Amount: {{{amount}}}{{/if}}
{{#if date}}Date: {{{date}}}{{/if}}

{{#if previousTransactions}}
Here are some previous transactions for reference:
{{#each previousTransactions}}
Description: {{{description}}}
Category: {{{category}}}
{{#if amount}}Amount: {{{amount}}}{{/if}}
{{/each}}
{{/if}}

Based on the description and any other provided information, choose the most appropriate category from the available options. If uncertain, assign the "Other" category.

The response should include:
1. The most appropriate category name (exactly matching one from the available list)
2. A confidence score between 0 and 1 indicating your certainty level (1.0 being completely certain)`,
} as any); // Type assertion remains for now if needed

// Create the flow using ai.defineFlow
export const transactionCategorizationFlow = ai.defineFlow< // Use ai.defineFlow
  typeof TransactionInputSchema,
  typeof TransactionOutputSchema
>({
  name: "transactionCategorizationFlow",
  inputSchema: TransactionInputSchema,
  outputSchema: TransactionOutputSchema,
}, async (input: z.infer<typeof TransactionInputSchema>) => {
  // Ensure prompt is called correctly and output is handled
  const result = await prompt(input);
  if (!result || !result.output) {
    throw new Error("AI prompt failed to return an output.");
  }
  return result.output;
});

export async function categorizeTxnWithAI(description: string, amount?: number, date?: string, previousTransactions?: Array<{description: string; category: string; amount?: number}>) {
  try {
    const output = await transactionCategorizationFlow({
      description,
      amount,
      date: date ? new Date(date).toISOString() : undefined,
      previousTransactions: previousTransactions || [],
    });
    
    // Ensure output exists before accessing properties
    if (!output) {
        throw new Error("Transaction categorization flow returned undefined output.");
    }

    return {
      category: output.category,
      confidence: output.confidence,
      success: true,
    };
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    // Propagate a more specific error or return a default failure state
    return {
      category: "Other", // Default category on error
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error), // Include error message
    };
  }
}