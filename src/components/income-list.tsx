'use client';

import React from 'react';
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
import { format, isValid, parseISO } from 'date-fns'; // Import isValid, parseISO
import type { Account } from '@/app/dashboard/page'; 
import { Banknote, Landmark, Wallet, ArrowUpCircle } from 'lucide-react';

type Income = {
  id: string;
  accountId: string;
  amount: number;
  source: string;
  date: Date | string; // Allow string temporarily
  description: string;
};

interface IncomeListProps {
  income: Income[];
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

export function IncomeList({ income, accounts }: IncomeListProps) {
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  // Duplicating formatDate here, consider moving to a utils file later
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
         <div className="flex items-center space-x-2">
             <ArrowUpCircle className="h-5 w-5 text-green-600" />
             <CardTitle>Recent Income</CardTitle>
        </div>
        <CardDescription>Total Received: ${totalIncome.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full"> 
          <Table>
            <TableHeader>
              {/* NO WHITESPACE */}
              <TableRow><TableHead className="w-[100px]">Date</TableHead><TableHead>Account</TableHead><TableHead>Source</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {income.length > 0 ? (
                income.map((item) => {
                  const { name: accountName, icon: accountIcon } = getAccountInfo(item.accountId, accounts);
                  return (
                    // NO WHITESPACE
                    <TableRow key={item.id}><TableCell className="font-medium text-xs">{formatDate(item.date)}</TableCell><TableCell className="text-xs"><div className="flex items-center space-x-1.5">{accountIcon}<span>{accountName}</span></div></TableCell><TableCell><Badge variant="secondary">{item.source}</Badge></TableCell><TableCell className="text-xs">{item.description || "-"}</TableCell><TableCell className="text-right font-medium text-green-600">+${item.amount.toFixed(2)}</TableCell></TableRow>
                    // NO WHITESPACE
                  );
                })
              ) : (
                 // NO WHITESPACE
                 <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No income recorded yet.</TableCell></TableRow>
                 // NO WHITESPACE
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
