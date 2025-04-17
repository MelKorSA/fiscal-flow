'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Banknote, Landmark, Wallet, CalendarClock } from 'lucide-react'; // Import icons
import type { Account } from '@/app/dashboard/page'; // Import Account type

interface AccountListProps {
  accounts: Account[];
}

const getAccountIcon = (type: Account['type']) => {
  switch (type) {
    case 'Bank Account':
      return <Landmark className="h-5 w-5 text-blue-500" />;
    case 'Cash':
      return <Wallet className="h-5 w-5 text-green-500" />;
    case 'Fixed Deposit':
      return <CalendarClock className="h-5 w-5 text-purple-500" />;
    default:
      return <Banknote className="h-5 w-5 text-gray-500" />;
  }
};

export function AccountList({ accounts }: AccountListProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40 w-full">
          {accounts.length > 0 ? (
            <ul className="space-y-3">
              {accounts.map((account) => (
                <li key={account.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-3">
                     {getAccountIcon(account.type)}
                     <div>
                        <span className="font-medium text-sm">{account.name}</span>
                        <p className="text-xs text-muted-foreground">{account.type}</p>
                    </div>
                  </div>
                  {/* Display balance for non-FD accounts */}
                  {account.type !== 'Fixed Deposit' && account.balance !== undefined && (
                    <span className="text-sm font-semibold">${account.balance.toFixed(2)}</span>
                  )}
                   {/* Display placeholder info for FD */}
                  {account.type === 'Fixed Deposit' && (
                     <span className="text-xs text-muted-foreground italic">Fixed Deposit</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No accounts added yet.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
