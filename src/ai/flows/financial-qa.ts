'use server';

import { z } from "zod";
// Import 'ai' directly instead of 'createFlow'
import { ai } from "../ai-instance";
import { format } from 'date-fns';

// --- Input Schemas ---
const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Bank Account', 'Cash', 'Fixed Deposit']),
  balance: z.number().optional(),
});

const TransactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  amount: z.number(),
  date: z.string().describe("ISO 8601 date string"), // Expect ISO string from client
  description: z.string(),
});

const ExpenseSchema = TransactionSchema.extend({
  category: z.string(),
});

const IncomeSchema = TransactionSchema.extend({
  source: z.string(),
});

const FinancialQAInputSchema = z.object({
  query: z.string().describe("The user's financial question"),
  accounts: z.array(AccountSchema).describe("List of user's accounts"),
  expenses: z.array(ExpenseSchema).describe("List of user's expenses"),
  income: z.array(IncomeSchema).describe("List of user's income records"),
  currentDate: z.string().describe("The current date in ISO 8601 format"),
});

// --- Output Schema ---
const FinancialQAOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's query"),
});

// --- Prompt Definition ---
// Use ai.definePrompt directly
const prompt = ai.definePrompt({
  name: "financialQAPrompt",
  input: {
    schema: FinancialQAInputSchema,
  },
  output: {
    schema: FinancialQAOutputSchema,
  },
  prompt: `You are a personal financial assistant. Your ONLY task is to answer the user's question based *strictly* and *exclusively* on the financial data provided below. Do NOT use any external knowledge or make assumptions. Today's date is {{currentDate}}.

User's Question: {{{query}}}

Financial Data Context:

Accounts:
{{#if accounts}}
{{#each accounts}}
- Name: {{name}}, Type: {{type}}, Balance: {{#if balance}}{{balance}}{{else}}N/A{{/if}}
{{/each}}
{{else}}
(No account data provided)
{{/if}}

Expenses:
{{#if expenses}}
{{#each expenses}}
- Date: {{date}}, Amount: {{amount}}, Category: {{category}}, Description: {{description}}
{{/each}}
{{else}}
(No expense data provided)
{{/if}}

Income:
{{#if income}}
{{#each income}}
- Date: {{date}}, Amount: {{amount}}, Source: {{source}}, Description: {{description}}
{{/each}}
{{else}}
(No income data provided)
{{/if}}

Instructions:
1.  Analyze the provided 'Financial Data Context' above.
2.  Answer the 'User's Question' using *only* the information found in the context.
3.  If the answer cannot be determined from the provided data, explicitly state that the necessary information is not available in the provided context.
4.  Be concise and directly answer the question.

Answer:`,
} as any); // Type assertion to bypass potential schema inference issues

// --- Flow Definition ---
// Use ai.defineFlow directly
export const financialQAFlow = ai.defineFlow<
  typeof FinancialQAInputSchema,
  typeof FinancialQAOutputSchema
>({
  name: "financialQAFlow",
  inputSchema: FinancialQAInputSchema,
  outputSchema: FinancialQAOutputSchema,
}, async input => {
  // Format dates for better readability in the prompt if needed, though ISO strings are fine
  const formattedInput = {
    ...input,
    // Example: Formatting dates if the model prefers a specific format
    // expenses: input.expenses.map(e => ({ ...e, date: format(new Date(e.date), 'yyyy-MM-dd') })),
    // income: input.income.map(i => ({ ...i, date: format(new Date(i.date), 'yyyy-MM-dd') }))
  };

  const { output } = await prompt(formattedInput);
  return output!;
});

// --- Helper Function (Optional, can be called from API route) ---
export async function getFinancialAnswer(query: string, accounts: any[], expenses: any[], income: any[]) {
  try {
    // Ensure dates are ISO strings before sending to the flow
    const ensureISO = (date: Date | string | undefined): string | undefined => {
      if (!date) return undefined;
      if (date instanceof Date) return date.toISOString();
      // Basic check if it looks like an ISO string already
      if (typeof date === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) return date;
      // Attempt to parse if it's a different string format (might need more robust parsing)
      try { return new Date(date).toISOString(); } catch { return undefined; }
    };

    const validatedExpenses = expenses.map(e => ({ ...e, date: ensureISO(e.date) })).filter(e => e.date);
    const validatedIncome = income.map(i => ({ ...i, date: ensureISO(i.date) })).filter(i => i.date);

    const output = await financialQAFlow({
      query,
      accounts,
      expenses: validatedExpenses,
      income: validatedIncome,
      currentDate: new Date().toISOString(),
    });

    return {
      answer: output.answer,
      success: true,
    };
  } catch (error) {
    console.error("Error getting financial answer:", error);
    return {
      answer: "Sorry, I encountered an error trying to process your request.",
      success: false,
    };
  }
}
