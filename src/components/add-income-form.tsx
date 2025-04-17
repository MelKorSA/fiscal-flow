'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// Removed Card imports
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Account } from '@/app/dashboard/page'; // Import Account type

interface AddIncomeFormProps {
  // Add accountId
  onAddIncome: (income: { accountId: string; amount: number; source: string; date: Date; description: string }) => void;
  incomeSources: string[];
  accounts: Account[]; // Receive accounts
}

export function AddIncomeForm({ onAddIncome, incomeSources, accounts }: AddIncomeFormProps) {
  const [accountId, setAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    // Add accountId validation
    if (!isNaN(numericAmount) && source && date && accountId) {
      onAddIncome({ accountId, amount: numericAmount, source, date, description });
      // Reset form
      setAccountId('');
      setAmount('');
      setSource('');
      setDate(new Date());
      setDescription('');
    } else {
      console.error('Invalid input - ensure account, amount, source, and date are set.');
       // TODO: Show user-friendly validation message (e.g., Toast)
    }
  };

  return (
     <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection Dropdown */} 
         <div className="space-y-1.5">
            <Label htmlFor="income-account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger id="income-account">
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
        <Label htmlFor="income-amount">Amount</Label>
        <Input
          id="income-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="income-source">Source</Label>
        <Select value={source} onValueChange={setSource} required>
          <SelectTrigger id="income-source">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {incomeSources.map((src) => (
              <SelectItem key={src} value={src}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
          <Label htmlFor="income-date">Date</Label>
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
        <Label htmlFor="income-description">Description (Optional)</Label>
        <Input
          id="income-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Client Payment"
        />
      </div>

      <Button type="submit" className="w-full">Add Income</Button>
    </form>
  );
}
