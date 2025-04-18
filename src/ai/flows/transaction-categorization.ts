import { z } from "zod";
import { ai, createFlow } from "../ai-instance";
import { availableExpenseCategoriesArray } from "@/config/expense-categories";

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
${availableExpenseCategoriesArray.map(category => `- ${category}`).join('\n')}

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
} as any); // Type assertion to bypass the type check

// Create the flow using the pattern from spending-insights.ts
export const transactionCategorizationFlow = createFlow<
  typeof TransactionInputSchema,
  typeof TransactionOutputSchema
>({
  name: "transactionCategorizationFlow",
  inputSchema: TransactionInputSchema,
  outputSchema: TransactionOutputSchema,
}, async input => {
  const { output } = await prompt(input);
  return output!;
});

export async function categorizeTxnWithAI(description: string, amount?: number, date?: string, previousTransactions?: Array<{description: string; category: string; amount?: number}>) {
  try {
    const output = await transactionCategorizationFlow({
      description,
      amount,
      date: date ? new Date(date).toISOString() : undefined,
      previousTransactions: previousTransactions || [],
    });
    
    return {
      category: output.category,
      confidence: output.confidence,
      success: true,
    };
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return {
      category: "Other",
      confidence: 0,
      success: false,
    };
  }
}