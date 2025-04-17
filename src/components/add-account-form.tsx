'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Account } from '@/app/dashboard/page'; // Import Account type

interface AddAccountFormProps {
  onAddAccount: (account: Omit<Account, 'id'>) => void;
}

export function AddAccountForm({ onAddAccount }: AddAccountFormProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<Account['type'] | '' >('');
  const [balance, setBalance] = useState<string>(''); // Initial balance for Bank/Cash OR Principal for FD
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [tenureMonths, setTenureMonths] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>(''); // Annual rate %

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) {
      console.error('Account name and type are required');
      return;
    }

    const newAccount: Omit<Account, 'id' | 'balance'> & Partial<Pick<Account, 'balance' | 'startDate' | 'tenureMonths' | 'interestRate'> > = {
      name,
      type: type as Account['type'],
    };

    const principalAmount = parseFloat(balance); // Used for both Balance and FD Principal
     if (isNaN(principalAmount) || principalAmount <= 0) {
         console.error('Initial Balance / Principal Amount must be a positive number');
         // TODO: Show user validation
         return;
      }

    if (type === 'Bank Account' || type === 'Cash') {
       newAccount.balance = principalAmount;
    } else if (type === 'Fixed Deposit') {
       const tenure = parseInt(tenureMonths);
       const rate = parseFloat(interestRate);

       if (!startDate || isNaN(tenure) || tenure <= 0 || isNaN(rate) || rate <= 0) {
            console.error('Valid Principal, Start Date, Tenure (months), and Interest Rate (%) are required for Fixed Deposit');
            // TODO: Show user validation
            return;
       }
       newAccount.balance = principalAmount; // Store principal in balance field for FDs too
       newAccount.startDate = startDate;
       newAccount.tenureMonths = tenure;
       newAccount.interestRate = rate;
    }

    onAddAccount(newAccount as Omit<Account, 'id'>); // Type assertion after validation

    // Reset form
    setName('');
    setType('');
    setBalance('');
    setStartDate(undefined);
    setTenureMonths('');
    setInterestRate('');
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Add New Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Account Name</Label>
            <Input id="account-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Savings Account, 3-Year FD" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-type">Account Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as Account['type'])} required>
              <SelectTrigger id="account-type"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Account">Bank Account</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>

         {/* Amount Field (Balance / Principal) - Required for all types */}
          <div className="space-y-1.5">
              <Label htmlFor="account-balance">{type === 'Fixed Deposit' ? 'Principal Amount' : 'Initial Balance'}</Label>
              <Input id="account-balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" required min="0.01" step="0.01"/>
            </div>

          {/* Fields specific to Fixed Deposit */} 
          {type === 'Fixed Deposit' && (
            <>
               <div className="space-y-1.5">
                  <Label htmlFor="fd-start-date">Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            required
                        />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="fd-tenure">Tenure (in months)</Label>
                    <Input id="fd-tenure" type="number" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} placeholder="e.g., 12" required min="1"/>
                </div>

                 <div className="space-y-1.5">
                    <Label htmlFor="fd-interest">Annual Interest Rate (%)</Label>
                    <Input id="fd-interest" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="e.g., 5.5" required min="0.01" step="0.01"/>
                </div>
            </>
          )}

          <Button type="submit" className="w-full">Add Account</Button>
        </form>
      </CardContent>
    </Card>
  );
}
