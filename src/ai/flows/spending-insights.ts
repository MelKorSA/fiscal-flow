'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating spending insights and recommendations based on user spending data.
 *
 * - spendingInsights - A function that takes spending data as input and returns AI-driven insights and recommendations.
 * - SpendingInsightsInput - The input type for the spendingInsights function, representing user spending data.
 * - SpendingInsightsOutput - The return type for the spendingInsights function, containing AI-driven insights and recommendations.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  income: z.number().describe('The user\u2019s total income.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense (e.g., food, transport, entertainment).'),
      amount: z.number().describe('The amount spent on the expense.'),
    })
  ).describe('An array of expenses with their categories and amounts.'),
  budgetGoals: z.array(
    z.object({
      category: z.string().describe('The category for the budget goal.'),
      amount: z.number().describe('The budget goal amount for the category.'),
    })
  ).describe('An array of budget goals for different categories.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  insights: z.array(
    z.string().describe('AI-driven insights and recommendations based on spending habits.')
  ).describe('An array of insights and recommendations.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function spendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {
    schema: z.object({
      income: z.number().describe('The user\u2019s total income.'),
      expenses: z.array(
        z.object({
          category: z.string().describe('The category of the expense (e.g., food, transport, entertainment).'),
          amount: z.number().describe('The amount spent on the expense.'),
        })
      ).describe('An array of expenses with their categories and amounts.'),
      budgetGoals: z.array(
        z.object({
          category: z.string().describe('The category for the budget goal.'),
          amount: z.number().describe('The budget goal amount for the category.'),
        })
      ).describe('An array of budget goals for different categories.'),
    }),
  },
  output: {
    schema: z.object({
      insights: z.array(
        z.string().describe('AI-driven insights and recommendations based on spending habits.')
      ).describe('An array of insights and recommendations.'),
    }),
  },
  prompt: `You are a personal finance advisor. Analyze the user's spending habits based on their income, expenses, and budget goals.

  Income: {{{income}}}
  Expenses:
  {{#each expenses}}
  - Category: {{{category}}}, Amount: {{{amount}}}
  {{/each}}
  Budget Goals:
  {{#each budgetGoals}}
  - Category: {{{category}}}, Amount: {{{amount}}}
  {{/each}}

  Provide concise and actionable insights and recommendations to help the user improve their financial habits. Focus on areas where the user is overspending or not meeting their budget goals. Be direct, and use no more than 5 sentences.
  `,
});

const spendingInsightsFlow = ai.defineFlow<
  typeof SpendingInsightsInputSchema,
  typeof SpendingInsightsOutputSchema
>({
  name: 'spendingInsightsFlow',
  inputSchema: SpendingInsightsInputSchema,
  outputSchema: SpendingInsightsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
