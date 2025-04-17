'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from 'date-fns';
import type { Account } from '@/app/dashboard/page';
import { Banknote, Landmark, Wallet, ChevronRight } from 'lucide-react';
import { getExpenseCategoryDetails } from '@/config/expense-categories';

type Expense = {
  id: string;
  accountId: string;
  amount: number;
  category: string;
  date: Date | string; // Allow string temporarily from LS
  description: string;
};

interface ExpensesProps {
  expenses: Expense[];
  accounts: Account[];
}

const getAccountInfo = (accountId: string, accounts: Account[]) => {
  const account = accounts.find(acc => acc.id === accountId);
  if (!account) return { name: 'Unknown', icon: <Banknote className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" /> };
  
  let icon;
  switch (account.type) {
    case 'Bank Account': 
      icon = <Landmark className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />; 
      break;
    case 'Cash': 
      icon = <Wallet className="h-4 w-4 text-[#34C759] dark:text-[#30D158]" />; 
      break;
    default: 
      icon = <Banknote className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />;
  }
  
  return { name: account.name, icon };
};

export function Expenses({ expenses, accounts }: ExpensesProps) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatDate = (dateInput: Date | string): string => {
    let dateObj: Date | null = null;
    if (dateInput instanceof Date && isValid(dateInput)) {
        dateObj = dateInput;
    } else if (typeof dateInput === 'string') {
        const parsed = parseISO(dateInput);
        if (isValid(parsed)) {
            dateObj = parsed;
        }
    }
    return dateObj ? format(dateObj, "MMM d") : "Invalid Date";
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md flex flex-col h-[500px] rounded-2xl overflow-hidden">
      <CardHeader className="pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">Recent Expenses</CardTitle>
          <div className="flex items-center gap-1 text-[#007AFF] dark:text-[#0A84FF] text-sm font-medium">
            See All <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <CardDescription className="text-xs text-[#8E8E93] dark:text-[#98989D]">
          Total: <span className="font-medium text-[#FF3B30] dark:text-[#FF453A]">${totalExpenses.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden pt-0 px-0">
        <ScrollArea className="h-full">
          <div className="px-4">
            {expenses.length > 0 ? (
              <ul className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
                {expenses.map((expense) => {
                  const { name: accountName, icon: accountIcon } = getAccountInfo(expense.accountId, accounts);
                  const { icon: CategoryIcon, color } = getExpenseCategoryDetails(expense.category);
                  
                  return (
                    <li key={expense.id} className="py-3 flex items-center justify-between group transition-all hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]/50 rounded-lg px-2 my-0.5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] flex items-center justify-center">
                          <CategoryIcon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#1D1D1F] dark:text-white">{expense.category}</p>
                          <div className="flex items-center gap-1 text-xs text-[#8E8E93] dark:text-[#98989D]">
                            {accountIcon}
                            <span>{accountName}</span>
                            <span>•</span>
                            <span>{formatDate(expense.date)}</span>
                          </div>
                          {expense.description && (
                            <p className="text-xs text-[#8E8E93] dark:text-[#98989D] line-clamp-1 mt-0.5">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                          -${expense.amount.toFixed(2)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#C7C7CC] dark:text-[#48484A] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="p-3 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] mb-3">
                  <Banknote className="h-6 w-6 text-[#8E8E93] dark:text-[#98989D]" />
                </div>
                <p className="text-base font-medium text-[#1D1D1F] dark:text-white">No expenses yet</p>
                <p className="text-sm text-[#8E8E93] dark:text-[#98989D] mt-1">
                  Start adding expenses to track your spending
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
