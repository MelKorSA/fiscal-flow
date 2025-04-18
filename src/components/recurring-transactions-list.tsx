'use client';

import React from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Repeat, Pause, Play, Check, ArrowUpCircle, Activity, CalendarClock } from "lucide-react";
import { formatDate, RecurringTransactionStatus, RecurrenceFrequency } from "@/lib/utils";

type RecurringTransaction = {
  id: string;
  accountId: string;
  accountName: string;
  amount: number;
  category?: string;
  source?: string;
  description: string;
  startDate: Date;
  frequency: RecurrenceFrequency;
  occurrences?: number;
  completedOccurrences?: number;
  endDate?: Date;
  type: 'expense' | 'income';
  status: RecurringTransactionStatus;
  nextOccurrence: Date;
};

interface RecurringTransactionsListProps {
  recurringTransactions: RecurringTransaction[];
  onUpdateStatus: (id: string, status: RecurringTransactionStatus) => void;
}

export function RecurringTransactionsList({ 
  recurringTransactions,
  onUpdateStatus
}: RecurringTransactionsListProps) {
  // Filter transactions by type
  const expenses = recurringTransactions.filter(tx => tx.type === 'expense');
  const incomes = recurringTransactions.filter(tx => tx.type === 'income');

  const getFrequencyDisplay = (frequency: RecurrenceFrequency): string => {
    switch(frequency) {
      case 'bi-weekly': return 'Bi-Weekly';
      default: return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  const getStatusBadge = (status: RecurringTransactionStatus) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-[#E5F8EF]/50 text-[#34C759] dark:bg-[#0C372A]/50 dark:text-[#30D158] border-[#34C759]/20 dark:border-[#30D158]/20">Active</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-[#FEF8EB]/50 text-[#FF9500] dark:bg-[#3A2A18]/50 dark:text-[#FF9F0A] border-[#FF9500]/20 dark:border-[#FF9F0A]/20">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-[#EDF4FE]/50 text-[#007AFF] dark:bg-[#1C3049]/50 dark:text-[#0A84FF] border-[#007AFF]/20 dark:border-[#0A84FF]/20">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderTransactions = (transactions: RecurringTransaction[]) => {
    if (transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] mb-3">
            <CalendarClock className="h-5 w-5 text-[#8E8E93] dark:text-[#98989D]" />
          </div>
          <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">No recurring transactions</p>
          <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
            Add recurring payments to automate tracking
          </p>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
        {transactions.map((transaction) => {
          const isExpense = transaction.type === 'expense';
          const Icon = isExpense ? Activity : ArrowUpCircle;
          const iconColorClass = isExpense 
            ? "text-[#FF3B30] dark:text-[#FF453A]" 
            : "text-[#34C759] dark:text-[#30D158]";
          const iconBgClass = isExpense 
            ? "bg-[#FCF2F1] dark:bg-[#3A281E]" 
            : "bg-[#E5F8EF] dark:bg-[#0C372A]";
          const amountColorClass = isExpense 
            ? "text-[#FF3B30] dark:text-[#FF453A]" 
            : "text-[#34C759] dark:text-[#30D158]";
          
          return (
            <li key={transaction.id} className="py-3 px-4 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors group">
              <div className="flex justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${iconBgClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${iconColorClass}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#1D1D1F] dark:text-white">
                      {transaction.description || (isExpense ? transaction.category : transaction.source) || 'Unnamed'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(transaction.status)}
                      <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">{transaction.accountName}</span>
                      <span className="text-xs text-[#8E8E93] dark:text-[#98989D] px-1">•</span>
                      <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">{getFrequencyDisplay(transaction.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">Next:</span>
                      <span className="text-xs font-medium text-[#1D1D1F] dark:text-white">{formatDate(transaction.nextOccurrence)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-between h-full">
                  <span className={`font-semibold ${amountColorClass}`}>
                    {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center mt-1">
                    {transaction.status === 'active' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
                        onClick={() => onUpdateStatus(transaction.id, 'paused')}
                        title="Pause"
                      >
                        <Pause className="h-3.5 w-3.5 text-[#8E8E93] dark:text-[#98989D]" />
                      </Button>
                    )}
                    {transaction.status === 'paused' && (
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
                        onClick={() => onUpdateStatus(transaction.id, 'active')}
                        title="Resume"
                      >
                        <Play className="h-3.5 w-3.5 text-[#8E8E93] dark:text-[#98989D]" />
                      </Button>
                    )}
                    {(transaction.status === 'active' || transaction.status === 'paused') && (
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
                        onClick={() => onUpdateStatus(transaction.id, 'completed')}
                        title="Mark as Completed"
                      >
                        <Check className="h-3.5 w-3.5 text-[#8E8E93] dark:text-[#98989D]" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[350px]">
        {recurringTransactions.length === 0 ? (
          renderTransactions([])
        ) : (
          <>
            {expenses.length > 0 && (
              <div className="mb-2">
                <h3 className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D] px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#FF3B30] dark:text-[#FF453A]" />
                    <span>Recurring Expenses</span>
                  </div>
                </h3>
                {renderTransactions(expenses)}
              </div>
            )}
            
            {incomes.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D] px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpCircle className="h-3.5 w-3.5 text-[#34C759] dark:text-[#30D158]" />
                    <span>Recurring Income</span>
                  </div>
                </h3>
                {renderTransactions(incomes)}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}