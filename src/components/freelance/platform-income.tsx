'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FreelanceIncome, Platform } from './freelance-dashboard';
import { 
  ArrowRightIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  ChevronsUpDown,
  DollarSign,
  Filter,
  Receipt
} from 'lucide-react';

interface PlatformIncomeProps {
  platforms: Platform[];
  incomes: FreelanceIncome[];
  onViewIncome?: (income: FreelanceIncome) => void;
}

// Colors for charts
const PLATFORM_COLORS: Record<string, string> = {
  'Upwork': '#14a800',
  'Fiverr': '#1dbf73',
  'Freelancer': '#29B2FE',
  'Toptal': '#204ECF',
  'Direct': '#FF5722',
  'Other': '#6C757D'
};

// Chart config for styling
const chartConfig = {
  income: {
    color: '#007AFF'
  },
  fees: {
    color: '#FF3B30'
  },
  netIncome: {
    color: '#34C759'
  },
  platforms: {
    theme: {
      light: 'rgba(0, 122, 255, 0.6)',
      dark: 'rgba(10, 132, 255, 0.6)'
    }
  }
};

export function PlatformIncome({ platforms, incomes, onViewIncome }: PlatformIncomeProps) {
  const [sortBy, setSortBy] = useState<'income' | 'fees' | 'netIncome'>('income');
  const [view, setView] = useState<'chart' | 'details'>('chart');

  // Sort platforms by selected criteria
  const sortedPlatforms = useMemo(() => {
    return [...platforms].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [platforms, sortBy]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    return platforms.reduce(
      (acc, platform) => {
        acc.income += platform.income;
        acc.fees += platform.fees;
        acc.netIncome += platform.netIncome;
        acc.transactions += platform.transactions;
        return acc;
      },
      { income: 0, fees: 0, netIncome: 0, transactions: 0 }
    );
  }, [platforms]);

  // Calculate platform fee percentage
  const calculateFeePercentage = (platform: Platform) => {
    if (platform.income === 0) return 0;
    return (platform.fees / platform.income) * 100;
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Generate chart data
  const chartData = useMemo(() => {
    return sortedPlatforms.map((platform) => ({
      name: platform.name,
      income: platform.income,
      fees: platform.fees,
      netIncome: platform.netIncome,
      feePercentage: calculateFeePercentage(platform),
      fill: PLATFORM_COLORS[platform.name] || PLATFORM_COLORS['Other']
    }));
  }, [sortedPlatforms]);

  // Pie chart data for income distribution
  const pieData = useMemo(() => {
    return platforms.map((platform) => ({
      name: platform.name,
      value: platform.income,
      fill: PLATFORM_COLORS[platform.name] || PLATFORM_COLORS['Other']
    }));
  }, [platforms]);

  // Get recent transactions for a platform
  const getPlatformTransactions = (platformName: string) => {
    return incomes
      .filter((income) => income.platform === platformName)
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      })
      .slice(0, 3); // Show only the 3 most recent transactions
  };

  // Format date values
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">Platform Income Analytics</h2>
          <p className="text-sm text-[#86868B] dark:text-[#98989D]">
            Compare fees and income across different freelancing platforms
          </p>
        </div>
        <div className="flex gap-3">
          <div className="inline-flex rounded-lg border border-[#E5E5EA] dark:border-[#38383A]">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-l-lg ${
                view === 'chart'
                  ? 'bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white'
                  : 'bg-white dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#98989D]'
              }`}
              onClick={() => setView('chart')}
            >
              Chart View
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-r-lg ${
                view === 'details'
                  ? 'bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white'
                  : 'bg-white dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#98989D]'
              }`}
              onClick={() => setView('details')}
            >
              Details View
            </button>
          </div>
        </div>
      </div>

      {view === 'chart' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  Income by Platform
                </CardTitle>
                <div className="inline-flex rounded-lg border border-[#E5E5EA] dark:border-[#38383A] text-xs">
                  <button
                    className={`px-3 py-1 ${
                      sortBy === 'income'
                        ? 'bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white'
                        : 'bg-white dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#98989D]'
                    }`}
                    onClick={() => setSortBy('income')}
                  >
                    Gross
                  </button>
                  <button
                    className={`px-3 py-1 ${
                      sortBy === 'fees'
                        ? 'bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white'
                        : 'bg-white dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#98989D]'
                    }`}
                    onClick={() => setSortBy('fees')}
                  >
                    Fees
                  </button>
                  <button
                    className={`px-3 py-1 ${
                      sortBy === 'netIncome'
                        ? 'bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white'
                        : 'bg-white dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#98989D]'
                    }`}
                    onClick={() => setSortBy('netIncome')}
                  >
                    Net
                  </button>
                </div>
              </div>
              <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                {sortBy === 'income'
                  ? 'Total gross income before platform fees'
                  : sortBy === 'fees'
                  ? 'Platform fees deducted from your earnings'
                  : 'Net income after platform fees'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[380px] w-full p-4">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${Math.round(value)}`} />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-[#2C2C2E] shadow-lg rounded-lg p-2 border border-[#E5E5EA] dark:border-[#48484A] text-xs">
                                <p className="font-medium text-[#1D1D1F] dark:text-white mb-1">{label}</p>
                                <p className="text-[#007AFF] dark:text-[#0A84FF]">
                                  Gross Income: ${payload[0].payload.income.toFixed(2)}
                                </p>
                                <p className="text-[#FF3B30] dark:text-[#FF453A]">
                                  Platform Fees: ${payload[0].payload.fees.toFixed(2)} ({payload[0].payload.feePercentage.toFixed(1)}%)
                                </p>
                                <p className="text-[#34C759] dark:text-[#30D158]">
                                  Net Income: ${payload[0].payload.netIncome.toFixed(2)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey={sortBy}
                        name={sortBy === 'income' ? 'Gross Income' : sortBy === 'fees' ? 'Platform Fees' : 'Net Income'}
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                <Receipt className="mr-2 h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
                Income Distribution
              </CardTitle>
              <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                Percentage of income by platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[240px] w-full p-4">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="p-4 bg-[#F9F9FB] dark:bg-[#28282A] m-4 rounded-lg">
                <h3 className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-2">
                  Total Platform Stats
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[#86868B] dark:text-[#98989D]">Total Gross Income</div>
                    <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                      ${totalStats.income.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#86868B] dark:text-[#98989D]">Total Platform Fees</div>
                    <div className="text-[#FF3B30] dark:text-[#FF453A] font-medium mt-1">
                      ${totalStats.fees.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#86868B] dark:text-[#98989D]">Total Net Income</div>
                    <div className="text-[#34C759] dark:text-[#30D158] font-medium mt-1">
                      ${totalStats.netIncome.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#86868B] dark:text-[#98989D]">Transactions</div>
                    <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                      {totalStats.transactions}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {platforms.map((platform) => (
            <Card
              key={platform.id}
              className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{
                        backgroundColor: PLATFORM_COLORS[platform.name]
                          ? `${PLATFORM_COLORS[platform.name]}20`
                          : '#6C757D20',
                      }}
                    >
                      <span
                        style={{
                          color: PLATFORM_COLORS[platform.name] || '#6C757D',
                          fontWeight: 'bold',
                        }}
                      >
                        {platform.name.substring(0, 1)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">
                        {platform.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                        {platform.transactions} transaction{platform.transactions !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={platform.name === 'Direct' ? 'outline' : 'secondary'}
                    className={
                      platform.name === 'Direct'
                        ? 'border-green-500 text-green-500 dark:border-green-400 dark:text-green-400'
                        : ''
                    }
                  >
                    {platform.name === 'Direct' ? 'No fees' : `${calculateFeePercentage(platform).toFixed(1)}% fee`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg">
                    <div className="text-xs text-[#86868B] dark:text-[#98989D]">Gross Income</div>
                    <div className="text-base font-medium text-[#1D1D1F] dark:text-white mt-1">
                      ${platform.income.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg">
                    <div className="text-xs text-[#86868B] dark:text-[#98989D]">Platform Fees</div>
                    <div className="text-base font-medium text-[#FF3B30] dark:text-[#FF453A] mt-1">
                      ${platform.fees.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg">
                    <div className="text-xs text-[#86868B] dark:text-[#98989D]">Net Income</div>
                    <div className="text-base font-medium text-[#34C759] dark:text-[#30D158] mt-1">
                      ${platform.netIncome.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-2">
                    Recent Transactions ({platform.name})
                  </h4>
                  <div className="bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg p-3">
                    {getPlatformTransactions(platform.name).length > 0 ? (
                      <div className="space-y-3">
                        {getPlatformTransactions(platform.name).map((income) => (
                          <div key={income.id} className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                                {income.project}
                              </div>
                              <div className="text-xs text-[#86868B] dark:text-[#98989D] flex items-center gap-2">
                                <span>{income.client}</span>
                                <span>•</span>
                                <span>{formatDate(income.date)}</span>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-[#34C759] dark:text-[#30D158]">
                              ${income.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[#86868B] dark:text-[#98989D] text-center py-2">
                        No recent transactions
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}