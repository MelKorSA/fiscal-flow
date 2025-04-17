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
import { Banknote, Landmark, Wallet } from 'lucide-react';

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
  if (!account) return { name: 'Unknown', icon: <Banknote className="h-4 w-4 text-gray-400" /> };
  let icon;
  switch (account.type) {
    case 'Bank Account': icon = <Landmark className="h-4 w-4 text-blue-500" />; break;
    case 'Cash': icon = <Wallet className="h-4 w-4 text-green-500" />; break;
    default: icon = <Banknote className="h-4 w-4 text-gray-400" />;
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
    return dateObj ? format(dateObj, "yyyy-MM-dd") : "Invalid Date";
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Total Spent: ${totalExpenses.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              {/* Ensure no whitespace inside this TableRow */}
              <TableRow><TableHead className="w-[100px]">Date</TableHead><TableHead>Account</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => {
                  const { name: accountName, icon: accountIcon } = getAccountInfo(expense.accountId, accounts);
                  // Return TableRow directly without extra whitespace/newlines
                  return (
                    // NO WHITESPACE here
                    <TableRow key={expense.id}><TableCell className="font-medium text-xs">{formatDate(expense.date)}</TableCell><TableCell className="text-xs"><div className="flex items-center space-x-1.5">{accountIcon}<span>{accountName}</span></div></TableCell><TableCell><Badge variant="outline">{expense.category}</Badge></TableCell><TableCell className="text-xs">{expense.description || "-"}</TableCell><TableCell className="text-right font-medium">-${expense.amount.toFixed(2)}</TableCell></TableRow>
                    // NO WHITESPACE here
                  );
                })
              ) : (
                // NO WHITESPACE here
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No expenses recorded yet.</TableCell></TableRow>
                // NO WHITESPACE here
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
