'use client';

import React from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from './ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, TrendingUp, PiggyBank, ChevronRight } from 'lucide-react';
import { format, addMonths, isPast, isValid, parseISO } from 'date-fns';
import type { Account } from '@/app/dashboard/page'; 

interface FixedDepositListProps {
  accounts: Account[];
}

const calculateMaturity = (principal: number, rate: number, tenureMonths: number, startDate: Date) => {
  const maturityDate = addMonths(startDate, tenureMonths);
  const annualRate = rate / 100;
  const years = tenureMonths / 12;
  const simpleInterest = principal * annualRate * years;
  const maturityAmount = principal + simpleInterest;
  return { maturityDate, maturityAmount };
};

export function FixedDepositList({ accounts }: FixedDepositListProps) {
  const fixedDeposits = accounts.filter(acc => acc.type === 'Fixed Deposit');

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F2F1FE] dark:bg-[#2D2A55] rounded-full">
            <CalendarClock className="h-4 w-4 text-[#AF52DE] dark:text-[#BF5AF2]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">
            Fixed Deposits
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-[#8E8E93] dark:text-[#98989D]">
          Your timed investments with fixed returns
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[260px] w-full">
          {fixedDeposits.length > 0 ? (
            <ul className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
              {fixedDeposits.map((fd) => {
                let startDateObj: Date | null = null;
                if (fd.startDate instanceof Date && isValid(fd.startDate)) {
                    startDateObj = fd.startDate;
                } else if (typeof fd.startDate === 'string') {
                    const parsed = parseISO(fd.startDate);
                    if (isValid(parsed)) startDateObj = parsed;
                }

                // Validate required fields before calculation
                if (fd.balance === undefined || !fd.interestRate || !fd.tenureMonths || !startDateObj) {
                     return (
                        <li key={fd.id} className="px-4 py-3 text-xs text-[#8E8E93] dark:text-[#98989D] italic">
                          Invalid/Incomplete FD data for "{fd.name}"
                        </li>
                     );
                }
                
                const { maturityDate, maturityAmount } = calculateMaturity(
                    fd.balance,
                    fd.interestRate,
                    fd.tenureMonths,
                    startDateObj
                 );
                const matured = isPast(maturityDate);

                return (
                  <li key={fd.id} className="px-4 py-3 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[#1D1D1F] dark:text-white">{fd.name}</span>
                          {matured && <Badge className="bg-[#FF3B30] dark:bg-[#FF453A] text-white text-xs py-0 px-1.5">Matured</Badge>}
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1 text-xs text-[#8E8E93] dark:text-[#98989D]">
                            <span>Principal:</span>
                            <span className="text-[#1D1D1F] dark:text-white font-medium">${fd.balance.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#8E8E93] dark:text-[#98989D]">
                            <span>Rate:</span>
                            <span className="text-[#1D1D1F] dark:text-white font-medium">{fd.interestRate.toFixed(2)}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#8E8E93] dark:text-[#98989D]">
                            <span>Term:</span>
                            <span className="text-[#1D1D1F] dark:text-white font-medium">{fd.tenureMonths} months</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#8E8E93] dark:text-[#98989D]">
                            <span>Maturity:</span>
                            <span className="text-[#1D1D1F] dark:text-white font-medium">{format(maturityDate, 'd MMM, yy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-[#34C759] dark:text-[#30D158] text-sm">
                            ${maturityAmount.toFixed(2)}
                          </span>
                          <TrendingUp className="h-3.5 w-3.5 text-[#34C759] dark:text-[#30D158]" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#C7C7CC] dark:text-[#48484A] opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="p-3 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] mb-3">
                <PiggyBank className="h-6 w-6 text-[#8E8E93] dark:text-[#98989D]" />
              </div>
              <p className="text-base font-medium text-[#1D1D1F] dark:text-white">No fixed deposits yet</p>
              <p className="text-sm text-[#8E8E93] dark:text-[#98989D] mt-1">
                Add a fixed deposit to track your investments
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
