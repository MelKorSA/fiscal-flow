'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, DollarSign, Sparkles, Scissors, MoreHorizontal, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Account } from '@/app/dashboard/page'; 
import { 
  availableExpenseCategoriesArray, 
  getExpenseCategoryDetails, 
  availableMainCategoriesArray,
  getSubcategories,
  isMainCategory,
  getParentCategory,
  formatCategoryDisplay,
  MainExpenseCategory,
  parseCategoryValue
} from '@/config/expense-categories';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Switch } from './ui/switch';
import { SplitExpenseItem, SplitItem } from './split-expense-item';
import { v4 as uuidv4 } from 'uuid';
import { CategorySelect } from './ui/category-select';

interface AddExpenseFormProps {
  onAddExpense: (expense: { 
    accountId: string; 
    amount: number; 
    category: string; 
    date: Date; 
    description: string;
    splitItems?: SplitItem[];
  }) => void;
  categories: string[];
  accounts: Account[];
  previousTransactions?: Array<{description: string; category: string; amount?: number}>;
}

export function AddExpenseForm({ onAddExpense, categories, accounts, previousTransactions = [] }: AddExpenseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [accountId, setAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(''); // Category state now holds the prefixed value
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: string; confidence: number } | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  // Split transaction states
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [splitItems, setSplitItems] = useState<SplitItem[]>([]);
  
  // Calculate the remaining amount to be allocated
  const totalAmount = parseFloat(amount) || 0;
  const allocatedAmount = splitItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - allocatedAmount);

  // Add a new split item
  const addSplitItem = () => {
    // Only allow adding split items if there's remaining amount to allocate
    if (remainingAmount > 0) {
      const newItem: SplitItem = {
        id: uuidv4(),
        category: '',
        amount: remainingAmount
      };
      setSplitItems([...splitItems, newItem]);
    }
  };

  // Remove a split item
  const removeSplitItem = (id: string) => {
    setSplitItems(splitItems.filter(item => item.id !== id));
  };

  // Update a split item
  const updateSplitItem = (id: string, field: 'category' | 'amount', value: string | number) => {
    setSplitItems(splitItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Reset split items when total amount changes or splitting is disabled
  useEffect(() => {
    if (isSplitEnabled) {
      // If there are no split items, add the first one with the full amount
      if (splitItems.length === 0 && totalAmount > 0) {
        setSplitItems([{
          id: uuidv4(),
          category: category || '',
          amount: totalAmount
        }]);
      }
    } else {
      setSplitItems([]);
    }
  }, [isSplitEnabled, totalAmount]);

  // Update first split item's category when main category changes
  useEffect(() => {
    if (isSplitEnabled && splitItems.length > 0 && category) {
      // No need to parse here, split item category select will handle its own prefixed value
      updateSplitItem(splitItems[0].id, 'category', category);
    }
  }, [category]);

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
    if (!isNaN(numericAmount) && (isSplitEnabled ? allSplitItemsValid() : category) && date && accountId) {
      setIsSubmitting(true);
      try {
        const expenseData = {
          accountId,
          amount: numericAmount,
          // Parse the category value before sending it
          category: isSplitEnabled ? 'Split Transaction' : parseCategoryValue(category),
          date,
          description,
          // Parse split item category values as well
          splitItems: isSplitEnabled 
            ? splitItems.map(item => ({ ...item, category: parseCategoryValue(item.category) })) 
            : undefined,
        };
        await onAddExpense(expenseData);
        // Reset form
        formRef.current?.reset();
        setAccountId('');
        setAmount('');
        setCategory('');
        setDate(new Date());
        setDescription('');
        setIsSplitEnabled(false);
        setSplitItems([]);
        setAiSuggestion(null);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('Invalid input - ensure account, amount, category, and date are set.');
    }
  };

  // Validate all split items have a category and amount
  const allSplitItemsValid = () => {
    if (splitItems.length === 0) return false;
    
    // All split items should have a category and amount > 0
    const allValid = splitItems.every(item => item.category && item.amount > 0);
    
    // Total allocated amount should match the total expense amount
    const totalAllocated = splitItems.reduce((sum, item) => sum + item.amount, 0);
    const totalMatches = Math.abs(totalAllocated - totalAmount) < 0.01; // Allow for small floating point differences
    
    return allValid && totalMatches;
  };

  // Use the actual expense categories array if the provided categories are empty
  const categoriesList = categories.length ? categories : availableExpenseCategoriesArray;

  // Apply the AI suggestion
  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
    }
  };

  // Allocate remaining amount to split items
  const distributeRemainingAmount = () => {
    if (splitItems.length === 0 || remainingAmount <= 0) return;
    
    const amountPerItem = remainingAmount / splitItems.length;
    setSplitItems(splitItems.map(item => ({
      ...item,
      amount: item.amount + amountPerItem
    })));
  };

  // Evenly distribute the total amount among all split items
  const distributeEvenly = () => {
    if (splitItems.length === 0 || totalAmount <= 0) return;
    
    const amountPerItem = totalAmount / splitItems.length;
    setSplitItems(splitItems.map(item => ({
      ...item,
      amount: amountPerItem
    })));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
            onBlur={() => formRef.current?.requestSubmit()}
            placeholder="0.00"
            className="pl-9 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
            required
            step="0.01"
            suppressHydrationWarning={true}
          />
        </div>
      </div>

      {/* Split Transaction Toggle */}
      <div className="flex items-center justify-between bg-[#F9F9FA] dark:bg-[#38383A] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
            <Scissors className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">Split Transaction</p>
            <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">Divide across categories</p>
          </div>
        </div>
        <Switch 
          id="split-toggle"
          checked={isSplitEnabled} 
          onCheckedChange={setIsSplitEnabled} 
          disabled={!totalAmount}
        />
      </div>

      {!isSplitEnabled ? (
        // Single category selection when split is disabled
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Category</Label>
          
          {/* Replace the standard Select with our hierarchical CategorySelect component */}
          <CategorySelect
            value={category}
            onValueChange={setCategory}
            placeholder="Select category"
          />
          
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
      ) : (
        // Split transaction UI when split is enabled
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Split Categories</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-7 rounded-lg bg-[#F2F2F7] dark:bg-[#38383A] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] text-[#007AFF] dark:text-[#0A84FF]"
                onClick={distributeEvenly}
                disabled={splitItems.length <= 1 || totalAmount <= 0}
              >
                Distribute Evenly
              </Button>
            </div>
          </div>

          {/* Display split items */}
          {splitItems.map((item, index) => (
            <SplitExpenseItem
              key={item.id}
              item={item}
              index={index}
              categories={categoriesList}
              totalAmount={totalAmount}
              remainingAmount={remainingAmount}
              onUpdate={updateSplitItem}
              onRemove={removeSplitItem}
            />
          ))}
          
          {/* Show remaining amount if not fully allocated */}
          {remainingAmount > 0 && (
            <div className="flex items-center justify-between py-2 px-4 bg-[#F2F2F7] dark:bg-[#38383A] rounded-xl">
              <span className="text-sm text-[#1D1D1F] dark:text-white">Remaining amount</span>
              <span className="font-medium text-[#FF3B30] dark:text-[#FF453A]">${remainingAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Add another category button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 border-dashed border-[#DADADC] dark:border-[#48484A] hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] transition-colors"
            onClick={addSplitItem}
            disabled={remainingAmount <= 0}
          >
            <Plus className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
            <span className="text-sm font-medium text-[#007AFF] dark:text-[#0A84FF]">Add Category</span>
          </Button>
        </div>
      )}

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
        disabled={isSubmitting || (isSplitEnabled && !allSplitItemsValid())}
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
