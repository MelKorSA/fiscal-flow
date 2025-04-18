'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, PlusCircle, CreditCard, BanknoteIcon, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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
  const [formExpanded, setFormExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) {
      toast.error('Account name and type are required');
      return;
    }

    const newAccount: Omit<Account, 'id' | 'balance'> & Partial<Pick<Account, 'balance' | 'startDate' | 'tenureMonths' | 'interestRate'> > = {
      name,
      type: type as Account['type'],
    };

    const principalAmount = parseFloat(balance); // Used for both Balance and FD Principal
    if (isNaN(principalAmount) || principalAmount <= 0) {
      toast.error(`Valid ${type === 'Fixed Deposit' ? 'principal amount' : 'balance'} is required`);
      return;
    }

    if (type === 'Bank Account' || type === 'Cash') {
      newAccount.balance = principalAmount;
    } else if (type === 'Fixed Deposit') {
      const tenure = parseInt(tenureMonths);
      const rate = parseFloat(interestRate);

      if (!startDate) {
        toast.error('Start date is required for Fixed Deposits');
        return;
      }
      
      if (isNaN(tenure) || tenure <= 0) {
        toast.error('Valid tenure period (in months) is required');
        return;
      }
      
      if (isNaN(rate) || rate <= 0) {
        toast.error('Valid interest rate is required');
        return;
      }
      
      newAccount.balance = principalAmount; // Store principal in balance field for FDs too
      newAccount.startDate = startDate;
      newAccount.tenureMonths = tenure;
      newAccount.interestRate = rate;
    }

    onAddAccount(newAccount as Omit<Account, 'id'>); // Type assertion after validation
    toast.success(`${name} account added successfully!`);

    // Reset form
    setName('');
    setType('');
    setBalance('');
    setStartDate(undefined);
    setTenureMonths('');
    setInterestRate('');
    setFormExpanded(false);
  };

  const getAccountIcon = () => {
    switch (type) {
      case 'Bank Account': return <CreditCard className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />;
      case 'Cash': return <BanknoteIcon className="h-4 w-4 text-[#34C759] dark:text-[#30D158]" />;
      case 'Fixed Deposit': return <PiggyBank className="h-4 w-4 text-[#AF52DE] dark:text-[#BF5AF2]" />;
      default: return <PlusCircle className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />;
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F2F2F7] dark:bg-[#38383A] rounded-full">
              {getAccountIcon()}
            </div>
            <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">
              Add New Account
            </CardTitle>
          </div>
          <Button 
            onClick={() => setFormExpanded(!formExpanded)} 
            size="sm" 
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A]"
          >
            <PlusCircle className={`h-4 w-4 text-[#007AFF] dark:text-[#0A84FF] transition-transform duration-200 ${formExpanded ? 'rotate-45' : ''}`} />
            <span className="sr-only">{formExpanded ? 'Close form' : 'Open form'}</span>
          </Button>
        </div>
        <CardDescription className="text-xs text-[#8E8E93] dark:text-[#98989D]">
          Add a bank account, cash wallet, or fixed deposit
        </CardDescription>
      </CardHeader>
      <AnimatePresence>
        {formExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="pt-4 pb-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div className="space-y-1.5">
                  <Label htmlFor="account-name" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                    Account Name
                  </Label>
                  <Input 
                    id="account-name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g., Savings Account, Emergency FD" 
                    required 
                    suppressHydrationWarning={true}
                    className="rounded-lg h-9 bg-[#F2F2F7]/70 dark:bg-[#38383A]/70 border-0 focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="account-type" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                    Account Type
                  </Label>
                  <Select value={type} onValueChange={(value) => setType(value as Account['type'])} required>
                    <SelectTrigger 
                      id="account-type"
                      className="rounded-lg h-9 bg-[#F2F2F7]/70 dark:bg-[#38383A]/70 border-0 focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30 [&>span]:text-[#1D1D1F] dark:[&>span]:text-white"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-[#E5E5EA] dark:border-[#38383A] rounded-lg overflow-hidden"
                    >
                      <SelectItem value="Bank Account" className="focus:bg-[#F2F2F7] dark:focus:bg-[#38383A]">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                          <span>Bank Account</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cash" className="focus:bg-[#F2F2F7] dark:focus:bg-[#38383A]">
                        <div className="flex items-center gap-2">
                          <BanknoteIcon className="h-4 w-4 text-[#34C759] dark:text-[#30D158]" />
                          <span>Cash</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Fixed Deposit" className="focus:bg-[#F2F2F7] dark:focus:bg-[#38383A]">
                        <div className="flex items-center gap-2">
                          <PiggyBank className="h-4 w-4 text-[#AF52DE] dark:text-[#BF5AF2]" />
                          <span>Fixed Deposit</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Field (Balance / Principal) - Required for all types */}
                <div className="space-y-1.5">
                  <Label htmlFor="account-balance" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                    {type === 'Fixed Deposit' ? 'Principal Amount' : 'Initial Balance'}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-[#8E8E93] dark:text-[#98989D]">$</div>
                    <Input 
                      id="account-balance" 
                      type="number" 
                      value={balance} 
                      onChange={(e) => setBalance(e.target.value)} 
                      placeholder="0.00" 
                      required 
                      min="0.01" 
                      step="0.01"
                      className="pl-7 rounded-lg h-9 bg-[#F2F2F7]/70 dark:bg-[#38383A]/70 border-0 focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
                    />
                  </div>
                </div>

                {/* Fields specific to Fixed Deposit */} 
                <AnimatePresence>
                  {type === 'Fixed Deposit' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="fd-start-date" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                          Start Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="fd-start-date"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal rounded-lg h-9",
                                "bg-[#F2F2F7]/70 dark:bg-[#38383A]/70 border-0 hover:bg-[#E5E5EA] dark:hover:bg-[#48484A]",
                                !startDate && "text-[#8E8E93] dark:text-[#98989D]"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                              {startDate ? format(startDate, "PP") : <span>Pick a start date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-auto p-0 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-[#E5E5EA] dark:border-[#38383A] rounded-lg overflow-hidden"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                              required
                              className="rounded-lg"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="fd-tenure" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                            Tenure (months)
                          </Label>
                          <Input 
                            id="fd-tenure" 
                            type="number" 
                            value={tenureMonths} 
                            onChange={(e) => setTenureMonths(e.target.value)} 
                            placeholder="e.g., 12" 
                            required 
                            min="1"
                            className="rounded-lg h-9 bg-[#F2F2F7]/70 dark:bg-[#38383A]/70 border-0 focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="fd-interest" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                            Interest Rate (%)
                          </Label>
                          <Input 
                            id="fd-interest" 
                            type="number" 
                            value={interestRate} 
                            onChange={(e) => setInterestRate(e.target.value)} 
                            placeholder="e.g., 5.5" 
                            required 
                            min="0.01" 
                            step="0.01"
                            className="rounded-lg h-9 bg-[#F2F2F7]/70 dark:bg-[#38383A]/70 border-0 focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0A7AEF] text-white rounded-lg h-10 font-medium transition-all duration-200"
                  >
                    Add {type || 'Account'}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      {!formExpanded && (
        <CardContent className="py-3">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => setFormExpanded(true)}
              className="w-full bg-[#F2F2F7] dark:bg-[#38383A] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] text-[#007AFF] dark:text-[#0A84FF] rounded-lg h-10 font-medium border-0"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Account
            </Button>
          </motion.div>
        </CardContent>
      )}
    </Card>
  );
}
