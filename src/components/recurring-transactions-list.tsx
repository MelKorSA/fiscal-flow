'use client';

import React, { useEffect, useRef } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Repeat, Pause, Play, Check, ArrowUpCircle, Activity, 
  CalendarClock, AlertCircle, RotateCw, ChevronRight, 
  CalendarDays, Clock, Calendar
} from "lucide-react";
import { formatDate, RecurringTransactionStatus, RecurrenceFrequency } from "@/lib/utils";
import { gsap } from 'gsap';

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

// Helper function to get frequency icon and color
const getFrequencyDetails = (frequency: RecurrenceFrequency) => {
  switch(frequency) {
    case 'daily':
      return { icon: <CalendarDays className="h-4 w-4" />, color: 'text-purple-500 dark:text-purple-400' };
    case 'weekly':
      return { icon: <Calendar className="h-4 w-4" />, color: 'text-blue-500 dark:text-blue-400' };
    case 'bi-weekly':
      return { icon: <Calendar className="h-4 w-4" />, color: 'text-cyan-500 dark:text-cyan-400' };
    case 'monthly':
      return { icon: <CalendarClock className="h-4 w-4" />, color: 'text-indigo-500 dark:text-indigo-400' };
    case 'quarterly':
      return { icon: <Clock className="h-4 w-4" />, color: 'text-emerald-500 dark:text-emerald-400' };
    case 'yearly':
      return { icon: <RotateCw className="h-4 w-4" />, color: 'text-amber-500 dark:text-amber-400' };
    default:
      return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-500 dark:text-gray-400' };
  }
};

export function RecurringTransactionsList({ 
  recurringTransactions,
  onUpdateStatus
}: RecurringTransactionsListProps) {
  // Filter transactions by type
  const expenses = recurringTransactions.filter(tx => tx.type === 'expense');
  const incomes = recurringTransactions.filter(tx => tx.type === 'income');
  
  const listRef = useRef<HTMLDivElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);

  // Animation on mount
  useEffect(() => {
    if (listRef.current) {
      // Fade in the list content
      gsap.fromTo(
        listRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }

    if (emptyStateRef.current) {
      // Animate empty state
      gsap.fromTo(
        emptyStateRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
      
      // Gentle pulse animation for the icon
      gsap.to(
        emptyStateRef.current.querySelector('.empty-state-icon'),
        { 
          scale: 1.05, 
          repeat: -1, 
          yoyo: true, 
          duration: 1.5,
          ease: "sine.inOut"
        }
      );
    }
  }, [recurringTransactions.length]);

  const getFrequencyDisplay = (frequency: RecurrenceFrequency): string => {
    switch(frequency) {
      case 'bi-weekly': return 'Bi-Weekly';
      default: return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  const getStatusBadge = (status: RecurringTransactionStatus) => {
    switch(status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-[#E5F8EF]/50 text-[#34C759] dark:bg-[#0C372A]/50 dark:text-[#30D158] border-[#34C759]/20 dark:border-[#30D158]/20 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] dark:bg-[#30D158] animate-pulse"></span>
            <span>Active</span>
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="bg-[#FEF8EB]/50 text-[#FF9500] dark:bg-[#3A2A18]/50 dark:text-[#FF9F0A] border-[#FF9500]/20 dark:border-[#FF9F0A]/20 flex items-center gap-1">
            <Pause className="h-3 w-3" />
            <span>Paused</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-[#EDF4FE]/50 text-[#007AFF] dark:bg-[#1C3049]/50 dark:text-[#0A84FF] border-[#007AFF]/20 dark:border-[#0A84FF]/20 flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleStatusUpdate = (id: string, newStatus: RecurringTransactionStatus, event: React.MouseEvent) => {
    // Get the button that was clicked
    const button = event.currentTarget;
    
    // Animate the button
    gsap.to(button, {
      scale: 0.9,
      duration: 0.1,
      onComplete: () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.2,
          onComplete: () => {
            onUpdateStatus(id, newStatus);
          }
        });
      }
    });
  };

  const renderTransactions = (transactions: RecurringTransaction[]) => {
    if (transactions.length === 0) {
      return (
        <div ref={emptyStateRef} className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] mb-3 empty-state-icon">
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
        {transactions.map((transaction, index) => {
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
          
          const { icon: FrequencyIcon, color: frequencyColor } = getFrequencyDetails(transaction.frequency);
          
          // We'll reference this element for hover animations
          const listItemRef = useRef<HTMLLIElement>(null);
          
          // Stagger animation for list items
          useEffect(() => {
            if (listItemRef.current) {
              gsap.fromTo(
                listItemRef.current,
                { opacity: 0, x: -5 },
                { 
                  opacity: 1, 
                  x: 0, 
                  duration: 0.3, 
                  delay: index * 0.05, 
                  ease: "power1.out" 
                }
              );
            }
          }, []);
          
          return (
            <li 
              key={transaction.id} 
              ref={listItemRef}
              className="py-3 px-4 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors rounded-lg mb-0.5 group"
            >
              <div className="flex justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${iconBgClass} flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${iconColorClass}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#1D1D1F] dark:text-white flex items-center">
                      {transaction.description || (isExpense ? transaction.category : transaction.source) || 'Unnamed'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(transaction.status)}
                      <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">{transaction.accountName}</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <div className="flex items-center gap-1">
                        <span className={`${frequencyColor}`}>{FrequencyIcon}</span>
                        <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">{getFrequencyDisplay(transaction.frequency)}</span>
                      </div>
                      <span className="text-[#8E8E93] dark:text-[#98989D] text-lg leading-none">·</span>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5 text-[#8E8E93] dark:text-[#98989D]" />
                        <span className="text-xs font-medium text-[#1D1D1F] dark:text-white">{formatDate(transaction.nextOccurrence)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-between h-full">
                  <span className={`font-semibold ${amountColorClass} group-hover:scale-105 transition-transform`}>
                    {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {transaction.status === 'active' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
                        onClick={(e) => handleStatusUpdate(transaction.id, 'paused', e)}
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
                        onClick={(e) => handleStatusUpdate(transaction.id, 'active', e)}
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
                        onClick={(e) => handleStatusUpdate(transaction.id, 'completed', e)}
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
    <div ref={listRef} className="flex flex-col animate-fadeIn">
      <ScrollArea className="max-h-[350px]">
        {recurringTransactions.length === 0 ? (
          renderTransactions([])
        ) : (
          <>
            {expenses.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D] px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-full bg-[#FCF2F1] dark:bg-[#3A281E]">
                      <Activity className="h-3.5 w-3.5 text-[#FF3B30] dark:text-[#FF453A]" />
                    </div>
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
                    <div className="p-1 rounded-full bg-[#E5F8EF] dark:bg-[#0C372A]">
                      <ArrowUpCircle className="h-3.5 w-3.5 text-[#34C759] dark:text-[#30D158]" />
                    </div>
                    <span>Recurring Income</span>
                  </div>
                </h3>
                {renderTransactions(incomes)}
              </div>
            )}
          </>
        )}
      </ScrollArea>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}