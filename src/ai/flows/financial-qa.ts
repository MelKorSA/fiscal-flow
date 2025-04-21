'use server';

import { z } from "zod";
// Import 'ai' directly instead of 'createFlow'
import { ai } from "../ai-instance";
import { format, parse, isValid, isWithinInterval, parseISO } from 'date-fns';

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
  // Add dateRange field for filtered queries
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    specified: z.boolean()
  }).optional().describe("Date range filter if the user asked for data within a specific period"),
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

// Helper function to extract date ranges from user queries
function extractDateRangeFromQuery(query: string): { from?: string, to?: string, specified: boolean } {
  const today = new Date();
  const result: { from?: string, to?: string, specified: boolean } = { from: undefined, to: undefined, specified: false };
  
  // Look for date range patterns
  const dateRangePatterns = [
    // Between date and date
    /between\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+and\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    /from\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+to\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    
    // Specific month or year
    /in\s+(\w+)(?:\s+(\d{4}))?/i,
    /during\s+(\w+)(?:\s+(\d{4}))?/i,
    
    // Last X days/weeks/months
    /last\s+(\d+)\s+(days|weeks|months|years)/i,
    
    // This week/month/year
    /this\s+(week|month|year)/i,
    
    // Simple date ranges like "since January" or "until December"
    /since\s+(\w+)(?:\s+(\d{4}))?/i,
    /until\s+(\w+)(?:\s+(\d{4}))?/i,
    /before\s+(\w+)(?:\s+(\d{4}))?/i,
    /after\s+(\w+)(?:\s+(\d{4}))?/i,
  ];

  // Try to match and process each pattern
  for (const pattern of dateRangePatterns) {
    const match = query.match(pattern);
    if (match) {
      result.specified = true;
      
      // Handle "between date and date" or "from date to date"
      if (match[1] && match[2] && (pattern.toString().includes('between') || pattern.toString().includes('from'))) {
        try {
          const fromDate = parseCustomDate(match[1]!);
          const toDate = parseCustomDate(match[2]!);
          
          if (fromDate && toDate) {
            result.from = fromDate.toISOString();
            result.to = toDate.toISOString();
            break;
          }
        } catch (e) {
          console.warn("Failed to parse explicit date range:", e);
        }
      }
      
      // Handle "in month" or "in month year"
      if (pattern.toString().includes('in\\s+') || pattern.toString().includes('during\\s+')) {
        const month = match[1]!;
        const year = match[2] || today.getFullYear().toString();
        
        try {
          const monthIndex = getMonthIndex(month);
          if (monthIndex >= 0) {
            const fromDate = new Date(parseInt(year), monthIndex, 1);
            const toDate = new Date(parseInt(year), monthIndex + 1, 0); // Last day of month
            result.from = fromDate.toISOString();
            result.to = toDate.toISOString();
            break;
          }
        } catch (e) {
          console.warn("Failed to parse month/year:", e);
        }
      }
      
      // Handle "last X days/weeks/months"
      if (pattern.toString().includes('last\\s+')) {
        const amount = parseInt(match[1]!);
        const unit = match[2]!.toLowerCase();
        const toDate = new Date();
        let fromDate = new Date();
        
        if (unit === 'days') {
          fromDate.setDate(toDate.getDate() - amount);
        } else if (unit === 'weeks') {
          fromDate.setDate(toDate.getDate() - (amount * 7));
        } else if (unit === 'months') {
          fromDate.setMonth(toDate.getMonth() - amount);
        } else if (unit === 'years') {
          fromDate.setFullYear(toDate.getFullYear() - amount);
        }
        
        result.from = fromDate.toISOString();
        result.to = toDate.toISOString();
        break;
      }
      
      // Handle "this week/month/year"
      if (pattern.toString().includes('this\\s+')) {
        const unit = match[1]!.toLowerCase();
        const toDate = new Date();
        let fromDate = new Date();
        
        if (unit === 'week') {
          const day = toDate.getDay();
          const diff = toDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
          fromDate = new Date(toDate.setDate(diff)); // Start of week (Monday)
        } else if (unit === 'month') {
          fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1); // Start of month
        } else if (unit === 'year') {
          fromDate = new Date(toDate.getFullYear(), 0, 1); // Start of year
        }
        
        result.from = fromDate.toISOString();
        result.to = toDate.toISOString();
        break;
      }
      
      // Handle "since month" or "until month"
      if (pattern.toString().includes('since\\s+') || pattern.toString().includes('after\\s+')) {
        const month = match[1]!;
        const year = match[2] || today.getFullYear().toString();
        
        try {
          const monthIndex = getMonthIndex(month);
          if (monthIndex >= 0) {
            const fromDate = new Date(parseInt(year), monthIndex, 1);
            result.from = fromDate.toISOString();
            // No "to" date in this case (open-ended query)
            break;
          }
        } catch (e) {
          console.warn("Failed to parse since date:", e);
        }
      }
      
      if (pattern.toString().includes('until\\s+') || pattern.toString().includes('before\\s+')) {
        const month = match[1]!;
        const year = match[2] || today.getFullYear().toString();
        
        try {
          const monthIndex = getMonthIndex(month);
          if (monthIndex >= 0) {
            const toDate = new Date(parseInt(year), monthIndex + 1, 0); // Last day of month
            result.to = toDate.toISOString();
            // No "from" date in this case (open-ended query)
            break;
          }
        } catch (e) {
          console.warn("Failed to parse until date:", e);
        }
      }
    }
  }
  
  return result;
}

// Helper for getting month index from name
function getMonthIndex(month: string): number {
  const months = [
    "january", "february", "march", "april", "may", "june", 
    "july", "august", "september", "october", "november", "december"
  ];
  const shortMonths = [
    "jan", "feb", "mar", "apr", "may", "jun", 
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];
  
  const normalized = month.toLowerCase();
  
  // Check full month names
  const fullIndex = months.findIndex(m => m === normalized);
  if (fullIndex !== -1) return fullIndex;
  
  // Check abbreviated month names
  const shortIndex = shortMonths.findIndex(m => m === normalized);
  if (shortIndex !== -1) return shortIndex;
  
  // Check start of month name
  for (let i = 0; i < months.length; i++) {
    if (months[i].startsWith(normalized) || shortMonths[i].startsWith(normalized)) {
      return i;
    }
  }
  
  return -1;
}

// Helper for parsing dates in different formats
function parseCustomDate(dateString: string): Date | null {
  // Remove ordinals like 1st, 2nd, 3rd, etc.
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
  
  // Try several format patterns
  const formats = [
    'MMMM d, yyyy', // January 1, 2025
    'MMM d, yyyy',  // Jan 1, 2025
    'MMMM d yyyy',  // January 1 2025
    'MMM d yyyy',   // Jan 1 2025
    'yyyy-MM-dd',   // 2025-01-01
    'M/d/yyyy',     // 1/1/2025
    'MM/dd/yyyy',   // 01/01/2025
    'dd/MM/yyyy',   // 01/01/2025 (European format)
  ];
  
  for (const formatString of formats) {
    try {
      const parsed = parse(cleanedDateString, formatString, new Date());
      if (isValid(parsed)) return parsed;
    } catch {
      // Try next format
    }
  }
  
  return null;
}

// Filter transactions by date range
function filterByDateRange<T extends { date: string }>(
  transactions: T[], 
  dateRange?: { from?: string; to?: string }
): T[] {
  if (!dateRange || (!dateRange.from && !dateRange.to)) {
    return transactions;
  }
  
  return transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    
    if (dateRange.from && dateRange.to) {
      return isWithinInterval(transactionDate, {
        start: parseISO(dateRange.from),
        end: parseISO(dateRange.to)
      });
    }
    
    if (dateRange.from) {
      return transactionDate >= parseISO(dateRange.from);
    }
    
    if (dateRange.to) {
      return transactionDate <= parseISO(dateRange.to);
    }
    
    return true;
  });
}

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

    // Extract date range from query
    const dateRange = extractDateRangeFromQuery(query);
    
    // Apply date filtering if a range was specified
    const filteredExpenses = dateRange.specified 
      ? filterByDateRange(validatedExpenses, dateRange) 
      : validatedExpenses;
      
    const filteredIncome = dateRange.specified 
      ? filterByDateRange(validatedIncome, dateRange) 
      : validatedIncome;
    
    // Include the date range information in the query to the AI
    const output = await financialQAFlow({
      query,
      accounts,
      expenses: filteredExpenses,
      income: filteredIncome,
      currentDate: new Date().toISOString(),
      dateRange: dateRange.specified ? dateRange : undefined,
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
