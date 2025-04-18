'use client';

import { Account } from '@/app/dashboard/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { BanknoteIcon, Calendar, Clock3, PiggyBank, Percent } from 'lucide-react';

interface FixedDepositListProps {
  accounts: Account[];
}

export function FixedDepositList({ accounts }: FixedDepositListProps) {
  if (!accounts.length) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#FDF2E9] dark:bg-[#3A291E] rounded-full">
            <PiggyBank className="h-4 w-4 text-[#FF9500] dark:text-[#FF9F0A]" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">Fixed Deposits</CardTitle>
        </div>
        <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
          Your term deposits and interest rates
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <motion.div 
          className="grid gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {accounts.map((account) => (
            <motion.div
              key={account.id}
              variants={item}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="p-3 bg-[#F2F2F7] dark:bg-[#38383A] rounded-xl flex flex-col"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-white">
                  {account.name}
                </h3>
                <span className="text-sm font-mono font-medium text-[#1D1D1F] dark:text-white tabular-nums">
                  ${account.balance?.toFixed(2)}
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#86868B] dark:text-[#A1A1A6]">
                  <Calendar className="h-3 w-3 text-[#FF9500] dark:text-[#FF9F0A]" />
                  <span>
                    {account.startDate
                      ? format(account.startDate, 'MMM dd, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#86868B] dark:text-[#A1A1A6]">
                  <Clock3 className="h-3 w-3 text-[#007AFF] dark:text-[#0A84FF]" />
                  <span>{account.tenureMonths || 'N/A'} months</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#86868B] dark:text-[#A1A1A6]">
                  <Percent className="h-3 w-3 text-[#34C759] dark:text-[#30D158]" />
                  <span>{account.interestRate || 'N/A'}% p.a.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#86868B] dark:text-[#A1A1A6]">
                  <BanknoteIcon className="h-3 w-3 text-[#FF3B30] dark:text-[#FF453A]" />
                  <span>
                    ${((account.balance || 0) * ((account.interestRate || 0) / 100) * ((account.tenureMonths || 0) / 12)).toFixed(2)} interest
                  </span>
                </div>
              </div>
              
              <div className="mt-2 w-full bg-[#E5E5EA] dark:bg-[#48484A] rounded-full h-1.5">
                <motion.div 
                  className="bg-gradient-to-r from-[#FF9500] to-[#FFCC00] dark:from-[#FF9F0A] dark:to-[#FFD60A] h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${account.tenureMonths ? (account.tenureMonths > 0 ? Math.min(100, Math.max(5, Math.random() * 100)) : 100) : 0}%` 
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
