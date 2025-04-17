'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// Removed Card imports as it's now wrapped in the dashboard
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Account } from '@/app/dashboard/page'; // Import Account type

interface AddExpenseFormProps {
  // Add accountId to the data passed back
  onAddExpense: (expense: { accountId: string; amount: number; category: string; date: Date; description: string }) => void;
  categories: string[];
  accounts: Account[]; // Receive accounts for the dropdown
}

export function AddExpenseForm({ onAddExpense, categories, accounts }: AddExpenseFormProps) {
  const [accountId, setAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    // Add accountId to validation
    if (!isNaN(numericAmount) && category && date && accountId) {
      onAddExpense({ accountId, amount: numericAmount, category, date, description });
      // Reset form
      setAccountId('');
      setAmount('');
      setCategory('');
      setDate(new Date());
      setDescription('');
    } else {
      console.error('Invalid input - ensure account, amount, category, and date are set.');
      // TODO: Show user-friendly validation message (e.g., Toast)
    }
  };

  return (
    // Remove Card wrapper, assumes parent provides it
     <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection Dropdown */} 
        <div className="space-y-1.5">
            <Label htmlFor="expense-account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger id="expense-account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
      </div>


      <div className="space-y-1.5">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Weekly groceries"
        />
      </div>

      <Button type="submit" className="w-full">Add Expense</Button>
    </form>
  );
}
