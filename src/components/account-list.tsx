'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Banknote, Landmark, Wallet, CalendarClock, ChevronRight, CreditCard } from 'lucide-react'; // Added ChevronRight and CreditCard
import type { Account } from '@/app/dashboard/page'; 

interface AccountListProps {
  accounts: Account[];
}

const getAccountIcon = (type: Account['type']) => {
  switch (type) {
    case 'Bank Account':
      return <div className="p-2 rounded-full bg-[#EDF4FE] dark:bg-[#1C3049]">
        <Landmark className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
      </div>;
    case 'Cash':
      return <div className="p-2 rounded-full bg-[#E5F8EF] dark:bg-[#0C372A]">
        <Wallet className="h-4 w-4 text-[#34C759] dark:text-[#30D158]" />
      </div>;
    case 'Fixed Deposit':
      return <div className="p-2 rounded-full bg-[#F2F1FE] dark:bg-[#2D2A55]">
        <CalendarClock className="h-4 w-4 text-[#AF52DE] dark:text-[#BF5AF2]" />
      </div>;
    default:
      return <div className="p-2 rounded-full bg-[#F2F2F7] dark:bg-[#38383A]">
        <Banknote className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
      </div>;
  }
};

export function AccountList({ accounts }: AccountListProps) {
  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
          Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] w-full">
          {accounts.length > 0 ? (
            <ul className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
              {accounts.map((account) => (
                <li key={account.id} className="flex items-center justify-between py-3 px-4 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors group">
                  <div className="flex items-center space-x-3">
                     {getAccountIcon(account.type)}
                     <div>
                        <span className="font-medium text-sm text-[#1D1D1F] dark:text-white">{account.name}</span>
                        <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {/* Display balance for non-FD accounts */}
                    {account.type !== 'Fixed Deposit' && account.balance !== undefined && (
                      <span className="text-sm font-semibold text-[#1D1D1F] dark:text-white">${account.balance.toFixed(2)}</span>
                    )}
                    {/* Display placeholder info for FD */}
                    {account.type === 'Fixed Deposit' && (
                       <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">Fixed Term</span>
                    )}
                    <ChevronRight className="h-4 w-4 ml-2 text-[#C7C7CC] dark:text-[#48484A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="p-3 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] mb-3">
                <CreditCard className="h-6 w-6 text-[#8E8E93] dark:text-[#98989D]" />
              </div>
              <p className="text-base font-medium text-[#1D1D1F] dark:text-white">No accounts yet</p>
              <p className="text-sm text-[#8E8E93] dark:text-[#98989D] mt-1">
                Add an account to get started
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
