'use client';

import React, { useMemo } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from './ui/card';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { addDays, format, startOfDay, differenceInDays, parseISO } from 'date-fns';

// Placeholder types - replace with actual data types if available
type Transaction = {
  date: Date | string;
  amount: number;
  type: 'income' | 'expense';
};

type RecurringTransaction = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number;
  type: 'income' | 'expense';
  startDate: Date | string;
  endDate?: Date | string;
  dayOfWeek?: number; // 1 (Mon) - 7 (Sun)
  dayOfMonth?: number; // 1 - 31
};

interface PredictiveCashFlowProps {
  currentBalance: number;
  transactions: Transaction[]; // Recent transactions for baseline (past data)
  recurringTransactions: RecurringTransaction[];
}

// Define colors
const AREA_COLORS = { projection: "#0A84FF", zeroLine: "#FF453A" };

export function PredictiveCashFlow({ currentBalance, transactions, recurringTransactions }: PredictiveCashFlowProps) {

  const projectionData = useMemo(() => {
    const data: { date: string; balance: number }[] = [];
    const today = startOfDay(new Date());
    let balance = currentBalance;

    // --- Enhanced Prediction Logic ---
    // 1. Calculate average daily net flow from historical transactions (excluding today)
    let totalNetFlow = 0;
    let daysOfHistory = 0;
    const historicalTransactions = transactions
      .map(t => ({ ...t, date: startOfDay(typeof t.date === 'string' ? parseISO(t.date) : t.date) })) // Ensure date objects and start of day
      .filter(t => t.date < today) // Only use past transactions
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date

    if (historicalTransactions.length > 0) {
      const firstDate = historicalTransactions[0].date;
      daysOfHistory = differenceInDays(today, firstDate);

      historicalTransactions.forEach(t => {
        totalNetFlow += t.type === 'income' ? t.amount : -t.amount;
      });
    }

    // Avoid division by zero, default to 0 if no history or only 1 day
    const averageDailyNetFlow = daysOfHistory > 0 ? totalNetFlow / daysOfHistory : 0;
    // --- End of Historical Analysis ---


    // Add today's balance
    data.push({ date: format(today, 'MMM d'), balance: parseFloat(balance.toFixed(2)) });

    // Project for the next 90 days
    for (let i = 1; i <= 90; i++) {
      const currentDate = addDays(today, i);
      let dailyIncome = 0;
      let dailyExpense = 0;

      // 2. Add recurring transactions for the current projection day
      recurringTransactions.forEach(rt => {
        // Ensure dates are Date objects
        const rtStartDate = startOfDay(typeof rt.startDate === 'string' ? parseISO(rt.startDate) : rt.startDate);
        const rtEndDate = rt.endDate ? startOfDay(typeof rt.endDate === 'string' ? parseISO(rt.endDate) : rt.endDate) : null;


        if (currentDate >= rtStartDate && (!rtEndDate || currentDate <= rtEndDate)) {
          let occursToday = false;
          switch (rt.frequency) {
            case 'daily':
              occursToday = true;
              break;
            case 'weekly':
              // date-fns getDay: 0 (Sun) - 6 (Sat), adjust if dayOfWeek is 1-7
              const dayOfWeek = rt.dayOfWeek ? (rt.dayOfWeek % 7) : 1; // Assuming 1=Mon...7=Sun -> 1...6, 0
              if (currentDate.getDay() === dayOfWeek) occursToday = true;
              break;
            case 'monthly':
              if (currentDate.getDate() === (rt.dayOfMonth ?? 1)) occursToday = true; // Default to 1st if not specified
              break;
            // Yearly can be added if needed
          }

          if (occursToday) {
            if (rt.type === 'income') dailyIncome += rt.amount;
            else dailyExpense += rt.amount;
          }
        }
      });

      // 3. Apply recurring transactions AND the average daily net flow from history
      balance += dailyIncome - dailyExpense + averageDailyNetFlow;
      data.push({ date: format(currentDate, 'MMM d'), balance: parseFloat(balance.toFixed(2)) });
    }

    return data;
    // Ensure transactions is included in dependencies for recalculation
  }, [currentBalance, transactions, recurringTransactions]);

  const chartConfig = {
    balance: { label: "Projected Balance", color: AREA_COLORS.projection },
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md flex flex-col min-h-[320px] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#D4FEE0] dark:bg-[#00411A] rounded-full">
            <TrendingUp className="h-4 w-4 text-[#30D158] dark:text-[#30D158]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">
            Predictive Cash Flow (90 Days)
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
          Estimated cash balance based on recurring and historical transaction trends.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 py-4 transition-all duration-300">
        {projectionData.length > 1 ? (
          <ChartContainer config={chartConfig} className="w-full h-[240px] px-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projectionData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AREA_COLORS.projection} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={AREA_COLORS.projection} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                  fontSize={10}
                  stroke="#8E8E93"
                  interval={Math.floor(projectionData.length / 6)} // Show fewer labels
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickFormatter={(value) => `$${value}`}
                  stroke="#8E8E93"
                  domain={['auto', 'auto']} // Adjust domain as needed
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="balance"
                  type="monotone"
                  fill="url(#fillBalance)"
                  stroke={AREA_COLORS.projection}
                  strokeWidth={2}
                  name="Projected Balance"
                  dot={false}
                  animationDuration={1000}
                />
                 {/* Optional: Add a zero line if relevant */}
                 {/* <ReferenceLine y={0} stroke={AREA_COLORS.zeroLine} strokeDasharray="3 3" /> */}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[240px] flex items-center justify-center text-[#8E8E93] dark:text-[#98989D] text-sm px-4">
            Need more data for cash flow projection (e.g., current balance, recurring transactions).
          </div>
        )}
      </CardContent>
    </Card>
  );
}
