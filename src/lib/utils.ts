import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, isValid, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Frequency options for recurring transactions
export type RecurrenceFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

// Status options for recurring transactions
export type RecurringTransactionStatus = 'active' | 'paused' | 'completed';

// Helper to safely format dates in a consistent way across app
export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Invalid Date";
  
  let dateObj: Date | null = null;
  if (dateInput instanceof Date && isValid(dateInput)) {
    dateObj = dateInput;
  } else if (typeof dateInput === 'string') {
    const parsed = parseISO(dateInput);
    if (isValid(parsed)) {
      dateObj = parsed;
    }
  }
  
  return dateObj ? format(dateObj, "yyyy-MM-dd") : "Invalid Date";
}

// Helper to calculate next occurrence based on frequency and last date
export function getNextOccurrence(lastDate: Date, frequency: RecurrenceFrequency): Date {
  const result = new Date(lastDate);
  
  switch (frequency) {
    case 'daily':
      result.setDate(result.getDate() + 1);
      break;
    case 'weekly':
      result.setDate(result.getDate() + 7);
      break;
    case 'bi-weekly':
      result.setDate(result.getDate() + 14);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + 1);
      break;
    case 'quarterly':
      result.setMonth(result.getMonth() + 3);
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + 1);
      break;
    default:
      // Default to monthly if unknown frequency
      result.setMonth(result.getMonth() + 1);
  }
  
  return result;
}
