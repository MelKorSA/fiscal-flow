'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUpCircle } from 'lucide-react';

interface IncomeDisplayProps {
  totalIncome: number;
}

export function IncomeDisplay({ totalIncome }: IncomeDisplayProps) {
  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full">
              <ArrowUpCircle className="h-4 w-4 text-[#34C759] dark:text-[#30D158]" />
            </div>
            <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">
              Total Income
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-1 items-center justify-center py-6">
          <div className="text-3xl font-bold text-[#1D1D1F] dark:text-white">${totalIncome.toFixed(2)}</div>
          <p className="text-sm text-[#8E8E93] dark:text-[#98989D]">
            Total income recorded
          </p>
          
          {/* Visual indicator showing growth */}
          <div className="flex items-center gap-1.5 mt-4 bg-[#E5F8EF] dark:bg-[#0C372A] px-3 py-1.5 rounded-full">
            <ArrowUpCircle className="h-3.5 w-3.5 text-[#34C759] dark:text-[#30D158]" />
            <span className="text-xs font-medium text-[#34C759] dark:text-[#30D158]">All income sources</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
