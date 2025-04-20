'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, DollarSign, Sparkles, Scissors, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Account } from '@/app/dashboard/page'; 
import { 
  availableMainCategoriesArray, // Corrected import name
  parseCategoryValue,
  getFlatCategoryOptions
} from '@/config/expense-categories';
import { Switch } from './ui/switch';
import { SplitExpenseItem, SplitItem } from './split-expense-item';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
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
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: string; confidence: number } | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [splitItems, setSplitItems] = useState<SplitItem[]>([]);
  
  const totalAmount = parseFloat(amount) || 0;
  const allocatedAmount = splitItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - allocatedAmount);

  const categoryOptions = getFlatCategoryOptions();

  const addSplitItem = () => {
    if (remainingAmount > 0) {
      const newItem: SplitItem = {
        id: uuidv4(),
        category: '',
        amount: remainingAmount
      };
      setSplitItems([...splitItems, newItem]);
    }
  };

  const removeSplitItem = (id: string) => {
    setSplitItems(splitItems.filter(item => item.id !== id));
  };

  const updateSplitItem = (id: string, field: 'category' | 'amount', value: string | number) => {
    setSplitItems(splitItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  useEffect(() => {
    if (isSplitEnabled) {
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

  useEffect(() => {
    if (isSplitEnabled && splitItems.length > 0 && category) {
      updateSplitItem(splitItems[0].id, 'category', category);
    }
  }, [category]);

  useEffect(() => {
    const categorizeTransaction = async () => {
      if (description.trim().length >= 3) {
        setIsCategorizing(true);
        setAiSuggestion(null);
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
              previousTransactions: previousTransactions, 
            }),
          });

          // Check if the response status is OK
          if (!response.ok) {
            // Try to parse the error response body
            let errorBody = null;
            try {
              errorBody = await response.json();
            } catch (parseError) {
              // Ignore if parsing fails
            }
            console.error("API Error:", response.status, response.statusText, errorBody);
            // Throw an error to be caught below
            throw new Error(`API error: ${response.status} ${response.statusText}`); 
          }

          const result = await response.json();

          // Check if the result indicates success (based on the backend change)
          // And if a category was actually returned
          if (result.category) { // Assuming backend always returns category/confidence even on failure now
            setAiSuggestion({ 
              category: result.category, 
              confidence: result.confidence ?? 0
            });
            
            // Only auto-set if confidence is high and category isn't already set
            if ((result.confidence ?? 0) >= 0.85 && !category) {
              setCategory(result.category);
            }
          } else {
             // Handle cases where category might be missing even if response is 200
             console.warn("Categorization API returned success but no category:", result);
             setAiSuggestion(null);
          }

        } catch (error) {
          // Log the caught error (could be fetch error or the thrown API error)
          console.error("Error calling categorization API:", error); 
          setAiSuggestion(null); // Ensure suggestion is cleared on error
        } finally {
          setIsCategorizing(false);
        }
      } else {
        setAiSuggestion(null); // Clear suggestion if description is too short
        setIsCategorizing(false); // Ensure loading state is off
      }
    };
    
    // Debounce the API call
    const timer = setTimeout(() => {
      categorizeTransaction();
    }, 600); // Increased debounce slightly
    
    // Cleanup function to clear the timer if dependencies change before it fires
    return () => clearTimeout(timer);
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
          category: isSplitEnabled ? 'Split Transaction' : parseCategoryValue(category),
          date,
          description,
          splitItems: isSplitEnabled 
            ? splitItems.map(item => ({ ...item, category: parseCategoryValue(item.category) })) 
            : undefined,
        };
        await onAddExpense(expenseData);
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
      let errorMessage = 'Invalid input: ';
      const missingFields = [];
      if (!accountId) missingFields.push('account');
      if (isNaN(numericAmount) || numericAmount <= 0) missingFields.push('amount');
      if (!isSplitEnabled && !category) missingFields.push('category');
      if (isSplitEnabled && !allSplitItemsValid()) missingFields.push('split details (ensure all items have category/amount and total matches)');
      if (!date) missingFields.push('date');
      
      errorMessage += `Please provide ${missingFields.join(', ')}.`;
      toast.error(errorMessage);
    }
  };

  const allSplitItemsValid = () => {
    if (splitItems.length === 0) return false;
    const allValid = splitItems.every(item => item.category && item.amount > 0);
    const totalAllocated = splitItems.reduce((sum, item) => sum + item.amount, 0);
    const totalMatches = Math.abs(totalAllocated - totalAmount) < 0.01;
    return allValid && totalMatches;
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
    }
  };

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
            placeholder="0.00"
            className="pl-9 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
            required
            step="0.01"
            suppressHydrationWarning={true}
          />
        </div>
      </div>

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
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Category</Label>
          <CategorySelect 
            value={category} 
            onValueChange={setCategory} 
            required={true}
            aiSuggestion={aiSuggestion} 
            isCategorizing={isCategorizing} 
            description={description} 
          />
        </div>
      ) : (
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
          {splitItems.map((item, index) => (
            <SplitExpenseItem
              key={item.id}
              item={item}
              index={index}
              totalAmount={totalAmount}
              remainingAmount={remainingAmount}
              onUpdate={updateSplitItem}
              onRemove={removeSplitItem}
            />
          ))}
          {remainingAmount > 0 && (
            <div className="flex items-center justify-between py-2 px-4 bg-[#F2F2F7] dark:bg-[#38383A] rounded-xl">
              <span className="text-sm text-[#1D1D1F] dark:text-white">Remaining amount</span>
              <span className="font-medium text-[#FF3B30] dark:text-[#FF453A]">${remainingAmount.toFixed(2)}</span>
            </div>
          )}
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
        <Label htmlFor="description" className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">
          Description (Optional)
          <span className="ml-1 text-xs text-[#007AFF] dark:text-[#0A84FF]">
            For merchant analytics: "Merchant - Details"
          </span>
        </Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Cafe Luna - Coffee"
          className="rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
          suppressHydrationWarning={true}
        />
        <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">
          Tip: Format as "Merchant - Details" to enable merchant analytics and price comparisons
        </p>
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
