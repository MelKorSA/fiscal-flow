'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { format, subDays } from 'date-fns';
import { FreelanceIncome } from './freelance-dashboard';
import {
  Clock,
  TrendingUp,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Star,
  LineChart,
  CircleDollarSign,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartLineChart,
  Line
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

interface TimeTrackingProps {
  incomes: FreelanceIncome[];
}

interface TimeEntry {
  date: Date;
  project: string;
  client: string;
  category: string;
  hours: number;
  hourlyRate: number;
  amount: number;
}

// Chart colors
const CHART_COLORS = {
  primary: '#007AFF',
  secondary: '#34C759',
  accent: '#FF9500',
  muted: '#8E8E93',
  error: '#FF3B30',
  categories: {
    'Web Development': '#007AFF',
    'Design': '#5E5CE6',
    'Marketing': '#FF9500',
    'Other': '#8E8E93'
  }
};

// Chart config for styling
const chartConfig = {
  hourlyRate: {
    color: '#007AFF'
  },
  hours: {
    color: '#34C759'
  },
  category: {
    theme: {
      light: 'rgba(0, 122, 255, 0.6)',
      dark: 'rgba(10, 132, 255, 0.6)'
    }
  }
};

export function TimeTracking({ incomes }: TimeTrackingProps) {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [targetRate, setTargetRate] = useState<number>(75);

  // Convert incomes to time entries for easier analysis
  const timeEntries: TimeEntry[] = useMemo(() => {
    return incomes.map((income) => {
      const hourlyRate = income.amount / income.hoursWorked;
      return {
        date: income.date instanceof Date ? income.date : new Date(income.date),
        project: income.project,
        client: income.client,
        category: income.category,
        hours: income.hoursWorked,
        hourlyRate,
        amount: income.amount,
      };
    });
  }, [incomes]);

  // Filter entries by selected time frame
  const filteredEntries = useMemo(() => {
    const now = new Date();
    
    switch (timeFrame) {
      case 'week':
        return timeEntries.filter(entry => entry.date >= subDays(now, 7));
      case 'month':
        return timeEntries.filter(entry => entry.date >= subDays(now, 30));
      case 'quarter':
        return timeEntries.filter(entry => entry.date >= subDays(now, 90));
      case 'all':
      default:
        return timeEntries;
    }
  }, [timeEntries, timeFrame]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalHours: 0,
        totalAmount: 0,
        avgHourlyRate: 0,
        bestRate: 0,
        worstRate: 0,
        hoursBelowTarget: 0,
        hourlyRatePercentiles: { min: 0, p25: 0, median: 0, p75: 0, max: 0 }
      };
    }

    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const avgHourlyRate = totalAmount / totalHours;
    
    const hourlyRates = filteredEntries.map(entry => entry.hourlyRate).sort((a, b) => a - b);
    const bestRate = Math.max(...hourlyRates);
    const worstRate = Math.min(...hourlyRates);
    
    const hoursBelowTarget = filteredEntries
      .filter(entry => entry.hourlyRate < targetRate)
      .reduce((sum, entry) => sum + entry.hours, 0);
    
    // Calculate percentiles
    const getPercentile = (arr: number[], percentile: number) => {
      const index = Math.ceil(arr.length * percentile) - 1;
      return arr[Math.max(0, index)];
    };
    
    const hourlyRatePercentiles = {
      min: worstRate,
      p25: getPercentile(hourlyRates, 0.25),
      median: getPercentile(hourlyRates, 0.5),
      p75: getPercentile(hourlyRates, 0.75),
      max: bestRate
    };

    return {
      totalHours,
      totalAmount,
      avgHourlyRate,
      bestRate,
      worstRate,
      hoursBelowTarget,
      hourlyRatePercentiles
    };
  }, [filteredEntries, targetRate]);

  // Chart data
  const hourlyRateByCategory = useMemo(() => {
    const categories = [...new Set(filteredEntries.map(entry => entry.category))];
    
    return categories.map(category => {
      const entries = filteredEntries.filter(entry => entry.category === category);
      const hours = entries.reduce((sum, entry) => sum + entry.hours, 0);
      const amount = entries.reduce((sum, entry) => sum + entry.amount, 0);
      const avgRate = amount / hours;
      
      return {
        name: category,
        hourlyRate: avgRate,
        hours,
        amount,
        fill: CHART_COLORS.categories[category as keyof typeof CHART_COLORS.categories] || CHART_COLORS.muted
      };
    }).sort((a, b) => b.hourlyRate - a.hourlyRate);
  }, [filteredEntries]);

  // Hours distribution data
  const hoursDistribution = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredEntries.forEach(entry => {
      const existingValue = categoryMap.get(entry.category) || 0;
      categoryMap.set(entry.category, existingValue + entry.hours);
    });
    
    return Array.from(categoryMap.entries()).map(([category, hours]) => ({
      name: category,
      value: hours,
      fill: CHART_COLORS.categories[category as keyof typeof CHART_COLORS.categories] || CHART_COLORS.muted
    }));
  }, [filteredEntries]);

  // Client hourly rate comparison data
  const clientHourlyRates = useMemo(() => {
    const clientMap = new Map<string, { hours: number, amount: number }>();
    
    filteredEntries.forEach(entry => {
      const existing = clientMap.get(entry.client);
      
      if (existing) {
        existing.hours += entry.hours;
        existing.amount += entry.amount;
      } else {
        clientMap.set(entry.client, {
          hours: entry.hours,
          amount: entry.amount
        });
      }
    });
    
    return Array.from(clientMap.entries())
      .map(([client, data]) => ({
        name: client,
        hourlyRate: data.amount / data.hours,
        hours: data.hours,
        amount: data.amount
      }))
      .sort((a, b) => b.hourlyRate - a.hourlyRate);
  }, [filteredEntries]);

  // Calculate time optimization opportunities
  const optimizationOpportunities = useMemo(() => {
    if (filteredEntries.length === 0) return [];
    
    const lowRateEntries = filteredEntries
      .filter(entry => entry.hourlyRate < metrics.avgHourlyRate * 0.8)
      .sort((a, b) => a.hourlyRate - b.hourlyRate);
    
    const opportunities = lowRateEntries.slice(0, 3).map(entry => {
      const potentialIncrease = (metrics.avgHourlyRate - entry.hourlyRate) * entry.hours;
      const percentBelowAvg = ((metrics.avgHourlyRate - entry.hourlyRate) / metrics.avgHourlyRate) * 100;
      
      return {
        project: entry.project,
        client: entry.client,
        category: entry.category,
        currentRate: entry.hourlyRate,
        hours: entry.hours,
        percentBelowAvg,
        potentialIncrease,
        suggestion: percentBelowAvg > 30 
          ? 'Consider dropping or renegotiating this project'
          : 'Optimize workflow or increase rates'
      };
    });
    
    return opportunities;
  }, [filteredEntries, metrics.avgHourlyRate]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const perfectDayHours = 
    filteredEntries.length > 0
      ? Math.max(...filteredEntries.map(entry => entry.hourlyRate))
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">Time Analytics & Optimization</h2>
          <p className="text-sm text-[#86868B] dark:text-[#98989D]">
            Track your time efficiency and optimize your hourly rates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="quarter">Past Quarter</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 bg-[#F2F2F7] dark:bg-[#38383A] rounded-md px-3 py-1.5">
            <span className="text-xs text-[#86868B] dark:text-[#98989D]">Target Rate:</span>
            <span className="text-xs font-medium text-[#007AFF] dark:text-[#0A84FF]">${targetRate}/hr</span>
            <input
              type="range"
              min="25"
              max="200"
              step="5"
              value={targetRate}
              onChange={(e) => setTargetRate(parseInt(e.target.value))}
              className="w-20 h-1.5 bg-[#E5E5EA] dark:bg-[#48484A] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#007AFF] dark:[&::-webkit-slider-thumb]:bg-[#0A84FF]"
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Hours</CardTitle>
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Clock className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{metrics.totalHours}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Billable hours</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Avg. Rate</CardTitle>
            <div className="p-1.5 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full">
              <CircleDollarSign className="h-5 w-5 text-[#34C759] dark:text-[#30D158]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text:white">${metrics.avgHourlyRate.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Per hour</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Best Rate</CardTitle>
            <div className="p-1.5 bg-[#FEF4E8] dark:bg-[#382D1E] rounded-full">
              <Star className="h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text:white">${metrics.bestRate.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Per hour</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Worst Rate</CardTitle>
            <div className="p-1.5 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full">
              <AlertCircle className="h-5 w-5 text-[#FF3B30] dark:text-[#FF453A]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text:white">${metrics.worstRate.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Per hour</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Hours Below Target</CardTitle>
            <div className="p-1.5 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full">
              <TrendingUp className="h-5 w-5 text-[#8E8E93] dark:text-[#98989D]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text:white">{metrics.hoursBelowTarget}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Under ${targetRate}/hr</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart for Hourly Rate by Category */}
          <Card className="border-0 shadow-sm bg:white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  Hourly Rate by Category
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                Compare the effectiveness of different work categories
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] w-full p-4">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={hourlyRateByCategory}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" domain={[0, 'dataMax + 20']} tickFormatter={(value) => `$${value}`} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Hourly Rate']}
                        labelFormatter={(value) => `Category: ${value}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="hourlyRate"
                        name="Hourly Rate"
                      >
                        {hourlyRateByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time Optimization Opportunities */}
          <Card className="border-0 shadow-sm bg:white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white flex items-center">
                <Zap className="mr-2 h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
                Time Optimization Opportunities
              </CardTitle>
              <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                These projects have below-average hourly rates and could be optimized
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {optimizationOpportunities.map((opportunity, index) => (
                    <div key={index} className="bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-[#1D1D1F] dark:text:white">{opportunity.project}</h4>
                          <p className="text-xs text-[#86868B] dark:text-[#98989D] mt-1">
                            {opportunity.client} • {opportunity.category} • {opportunity.hours} hours
                          </p>
                        </div>
                        <Badge variant={opportunity.percentBelowAvg > 30 ? 'destructive' : 'outline'}>
                          {opportunity.currentRate.toFixed(2)}/hr
                        </Badge>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="text-[#86868B] dark:text-[#98989D]">
                            {opportunity.percentBelowAvg.toFixed(0)}% below average rate
                          </span>
                          <span className="text-[#FF3B30] dark:text-[#FF453A] font-medium">
                            ${opportunity.potentialIncrease.toFixed(2)} potential loss
                          </span>
                        </div>
                        <Progress
                          value={100 - opportunity.percentBelowAvg}
                          className="h-1.5"
                          style={{
                            "--progress-color": opportunity.percentBelowAvg > 30 ? "#FF3B30" : "#FF9500"
                          } as React.CSSProperties}
                        />
                      </div>

                      <div className="mt-3 text-xs font-medium inline-flex items-center bg-[#FCF2F1]/50 dark:bg-[#3A281E]/50 text-[#FF3B30] dark:text-[#FF453A] px-2 py-1 rounded">
                        <AlertCircle className="h-3 w-3 mr-1.5" />
                        {opportunity.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-[#86868B] dark:text-[#98989D] text-sm">
                    No significant optimization opportunities found
                  </p>
                  <p className="text-xs text-[#86868B] dark:text-[#98989D] mt-2">
                    Great job! Your projects are performing well above the rate threshold.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rate Distribution */}
          <Card className="border-0 shadow-sm bg:white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                Rate Distribution
              </CardTitle>
              <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                Hourly rate percentiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 px-4 py-5 bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#86868B] dark:text-[#98989D]">Min</span>
                  <span className="text-xs text-[#86868B] dark:text-[#98989D]">25%</span>
                  <span className="text-xs text-[#86868B] dark:text-[#98989D]">Median</span>
                  <span className="text-xs text-[#86868B] dark:text-[#98989D]">75%</span>
                  <span className="text-xs text-[#86868B] dark:text-[#98989D]">Max</span>
                </div>
                
                <div className="relative h-2 bg-[#E5E5EA] dark:bg-[#48484A] rounded-full mt-1 mb-2">
                  <div
                    className="absolute left-0 h-full bg-[#34C759] dark:bg-[#30D158] rounded-l-full"
                    style={{ width: '25%' }}
                  ></div>
                  <div
                    className="absolute left-[25%] h-full bg-[#007AFF] dark:bg-[#0A84FF]"
                    style={{ width: '25%' }}
                  ></div>
                  <div
                    className="absolute left-[50%] h-full bg-[#007AFF] dark:bg-[#0A84FF]"
                    style={{ width: '25%' }}
                  ></div>
                  <div
                    className="absolute left-[75%] h-full bg-[#FF9500] dark:bg-[#FF9F0A] rounded-r-full"
                    style={{ width: '25%' }}
                  ></div>
                  
                  {/* Markers */}
                  <div className="absolute left-0 bottom-full transform -translate-x-1/2 translate-y-[-8px]">
                    <div className="h-3 w-1 bg-[#86868B] dark:bg-[#98989D] rounded-full"></div>
                  </div>
                  <div className="absolute left-1/4 bottom-full transform -translate-x-1/2 translate-y-[-8px]">
                    <div className="h-3 w-1 bg-[#86868B] dark:bg-[#98989D] rounded-full"></div>
                  </div>
                  <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 translate-y-[-8px]">
                    <div className="h-3 w-1 bg-[#86868B] dark:bg-[#98989D] rounded-full"></div>
                  </div>
                  <div className="absolute left-3/4 bottom-full transform -translate-x-1/2 translate-y-[-8px]">
                    <div className="h-3 w-1 bg-[#86868B] dark:bg-[#98989D] rounded-full"></div>
                  </div>
                  <div className="absolute left-full bottom-full transform -translate-x-1/2 translate-y-[-8px]">
                    <div className="h-3 w-1 bg-[#86868B] dark:bg-[#98989D] rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text:white">${metrics.hourlyRatePercentiles.min.toFixed(2)}</span>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text:white">${metrics.hourlyRatePercentiles.p25.toFixed(2)}</span>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text:white">${metrics.hourlyRatePercentiles.median.toFixed(2)}</span>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text:white">${metrics.hourlyRatePercentiles.p75.toFixed(2)}</span>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text:white">${metrics.hourlyRatePercentiles.max.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-[#1D1D1F] dark:text:white">Your Target Rate</h4>
                  <Badge variant="outline" className="text-[#007AFF] dark:text-[#0A84FF]">
                    ${targetRate}/hr
                  </Badge>
                </div>
                
                <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg mt-2">
                  <div className="text-xs text-[#86868B] dark:text-[#98989D] flex items-center justify-between">
                    <span>Hours below target rate:</span>
                    <span className="font-medium text-[#1D1D1F] dark:text:white">{metrics.hoursBelowTarget} hours</span>
                  </div>
                  <div className="text-xs text-[#86868B] dark:text-[#98989D] flex items-center justify-between mt-2">
                    <span>Percentage of time below target:</span>
                    <span className="font-medium text-[#1D1D1F] dark:text:white">
                      {metrics.totalHours > 0
                        ? `${((metrics.hoursBelowTarget / metrics.totalHours) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-[#1D1D1F] dark:text:white mb-2">Hours Distribution</h4>
                <div className="h-[180px]">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={hoursDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {hoursDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} hours`, 'Time Spent']} 
                          labelFormatter={(value) => value}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-2">
                  {hoursDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: entry.fill }}
                        ></span>
                        <span className="text-[#1D1D1F] dark:text:white">{entry.name}</span>
                      </div>
                      <span className="text-[#86868B] dark:text-[#98989D]">
                        {entry.value} hrs ({((entry.value / metrics.totalHours) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}