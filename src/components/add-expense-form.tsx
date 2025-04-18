'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, DollarSign, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Account } from '@/app/dashboard/page'; 
import { availableExpenseCategoriesArray, getExpenseCategoryDetails } from '@/config/expense-categories';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AddExpenseFormProps {
  onAddExpense: (expense: { accountId: string; amount: number; category: string; date: Date; description: string }) => void;
  categories: string[];
  accounts: Account[];
  previousTransactions?: Array<{description: string; category: string; amount?: number}>;
}

export function AddExpenseForm({ onAddExpense, categories, accounts, previousTransactions = [] }: AddExpenseFormProps) {
  const [accountId, setAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: string; confidence: number } | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  // Categorize transaction when description changes
  useEffect(() => {
    const categorizeTransaction = async () => {
      if (description.trim().length >= 3) {
        setIsCategorizing(true);
        setAiSuggestion(null); // Clear previous suggestion
        try {
          const response = await fetch('/api/categorize-expense', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description,
              amount: amount ? parseFloat(amount) : undefined,
              date: date?.toISOString(),
              // Pass previousTransactions in the request body
              previousTransactions: previousTransactions, 
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.category) { // Check if category exists in response
            setAiSuggestion({ 
              category: result.category, 
              confidence: result.confidence ?? 0 // Use confidence if provided, else 0
            });
            
            // Auto-select the category if confidence is high
            if ((result.confidence ?? 0) >= 0.85 && !category) {
              setCategory(result.category);
            }
          }
        } catch (error) {
          console.error("Error calling categorization API:", error);
          // Optionally set a default or error state for suggestion
          setAiSuggestion(null);
        } finally {
          setIsCategorizing(false);
        }
      } else {
        // Clear suggestion if description is too short
        setAiSuggestion(null);
      }
    };
    
    // Debounce the categorization
    const timer = setTimeout(() => {
      categorizeTransaction();
    }, 600);
    
    return () => clearTimeout(timer);
    // Add previousTransactions to dependency array if it can change
  }, [description, amount, date, previousTransactions, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && category && date && accountId) {
      setIsSubmitting(true);
      try {
        onAddExpense({ accountId, amount: numericAmount, category, date, description });
        // Reset form
        setAccountId('');
        setAmount('');
        setCategory('');
        setDate(new Date());
        setDescription('');
        setAiSuggestion(null);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('Invalid input - ensure account, amount, category, and date are set.');
    }
  };

  // Use the actual expense categories array if the provided categories are empty
  const categoriesList = categories.length ? categories : availableExpenseCategoriesArray;

  // Apply the AI suggestion
  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="expense-account" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">
          Account
        </Label>
        <Select value={accountId} onValueChange={setAccountId} required>
          <SelectTrigger 
            id="expense-account" 
            className="rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30 dark:focus:ring-opacity-30"
          >
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg border-[#DADADC] dark:border-[#48484A]">
            {accounts.map((acc) => (
              <SelectItem 
                key={acc.id} 
                value={acc.id} 
                className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A] rounded-md"
              >
                <div className="flex items-center gap-2">
                  {acc.type === 'Bank Account' ? 
                    <div className="w-3 h-3 rounded-full bg-[#007AFF] dark:bg-[#0A84FF]"></div> : 
                    <div className="w-3 h-3 rounded-full bg-[#34C759] dark:bg-[#30D158]"></div>
                  }
                  <span className="text-[#1D1D1F] dark:text-white">{acc.name}</span>
                  <span className="text-xs text-[#86868B] dark:text-[#A1A1A6]">({acc.type})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Amount</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6]" />
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-9 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
            required
            step="0.01"
            suppressHydrationWarning={true}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger 
            id="category" 
            className="rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg max-h-[300px]">
            <div className="grid grid-cols-1 gap-1 p-1 max-h-[300px] overflow-y-auto">
              {categoriesList.map((cat) => {
                const { icon: Icon, color } = getExpenseCategoryDetails(cat);
                // Highlight the AI-suggested category
                const isAiSuggested = aiSuggestion?.category === cat;
                
                return (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className={cn(
                      "focus:bg-[#F2F2F7] dark:focus:bg-[#48484A] rounded-md",
                      isAiSuggested && "relative bg-[#F2F2F7] dark:bg-[#38383A]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-opacity-20" style={{ backgroundColor: `var(--${color.replace('text-', '')}-100)` }}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-[#1D1D1F] dark:text-white">{cat}</span>
                      {isAiSuggested && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-1 gap-1 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-[#007AFF] dark:text-[#0A84FF]">
                                <Sparkles className="h-3 w-3" />
                                <span className="text-xs">
                                  {Math.round(aiSuggestion.confidence * 100)}%
                                </span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>AI suggested with {Math.round(aiSuggestion.confidence * 100)}% confidence</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </div>
          </SelectContent>
        </Select>
        
        {/* Show the AI suggestion button if available and not already selected */}
        {aiSuggestion && aiSuggestion.category !== category && (
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-[#86868B] dark:text-[#A1A1A6]">
              <Sparkles className="h-3 w-3 text-[#007AFF] dark:text-[#0A84FF]" />
              <span>AI suggests: <span className="font-medium">{aiSuggestion.category}</span></span>
            </div>
            <Button 
              type="button"
              variant="ghost"
              className="h-6 px-2 text-xs text-[#007AFF] dark:text-[#0A84FF] hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={applyAiSuggestion}
            >
              Apply
            </Button>
          </div>
        )}
        
        {/* Show categorizing indicator */}
        {isCategorizing && description.length >= 3 && !aiSuggestion && (
          <div className="flex items-center gap-2 text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Categorizing...</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A]",
                !date && "text-[#86868B] dark:text-[#A1A1A6]"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6]" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-xl border-[#DADADC] dark:border-[#48484A]">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="rounded-lg"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Description (Optional)</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Weekly groceries"
          className="rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
          suppressHydrationWarning={true}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0A7AEF] rounded-xl py-6 text-white font-medium shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Adding...</span>
          </div>
        ) : (
          <span>Add Expense</span>
        )}
      </Button>
    </form>
  );
}
