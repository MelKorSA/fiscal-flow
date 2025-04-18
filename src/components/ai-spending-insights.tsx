'use client';

import React, { useMemo, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from './ui/card';
import { Lightbulb, ZoomIn, ZoomOut, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { format, startOfMonth, parseISO, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Types to match dashboard
type Expense = {
  id: string; accountId: string; amount: number; category: string; date: Date | string; description: string;
};
type Income = {
   id: string; accountId: string; amount: number; source: string; date: Date | string; description: string;
};

interface AISpendingInsightsProps {
  expenses: Expense[];
  income: Income[];
}

// Define colors that match iOS palette
const PIE_COLORS = ["#0A84FF", "#30D158", "#FFD60A", "#FF9F0A", "#FF453A", "#BF5AF2", "#64D2FF"];
const BAR_COLORS = { income: "#30D158", expense: "#FF453A" };

export function AISpendingInsights({ expenses, income }: AISpendingInsightsProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'bar' | 'pie'>('bar');

  // --- Pie Chart Data (Category Spending) ---
  const categorySpendingData = useMemo(() => {
    if (expenses.length === 0) return { chartData: [], highestCategory: '', highestAmount: 0 };
    
    const spendingByCategory: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      spendingByCategory[exp.category] = (spendingByCategory[exp.category] || 0) + exp.amount;
    });
    
    let highestCategory = '';
    let highestAmount = 0;
    
    const chartData = Object.entries(spendingByCategory)
      .map(([category, amount]) => {
        if (amount > highestAmount) { 
          highestAmount = amount; 
          highestCategory = category; 
        }
        return { category, amount: parseFloat(amount.toFixed(2)), fill: PIE_COLORS[0] };
      })
      .sort((a, b) => b.amount - a.amount);
    
    chartData.forEach((item, index) => item.fill = PIE_COLORS[index % PIE_COLORS.length]);
    
    return { chartData, highestCategory, highestAmount };
  }, [expenses]);

  // --- Bar Chart Data (Monthly Income vs Expense) ---
  const monthlyTrendData = useMemo(() => {
    const monthlyMap: { [month: string]: { income: number; expense: number } } = {};
    
    const processTransactions = (transactions: Array<Income | Expense>, type: 'income' | 'expense') => {
      transactions.forEach(t => {
        // Robust date parsing and validation
        let dateObj: Date | null = null;
        if (t.date instanceof Date && isValid(t.date)) {
          dateObj = t.date;
        } else if (typeof t.date === 'string') {
          const parsed = parseISO(t.date);
          if (isValid(parsed)) {
            dateObj = parsed;
          }
        }
        if (!dateObj) return; // Skip if date is invalid

        const monthKey = format(startOfMonth(dateObj), 'yyyy-MM');
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { income: 0, expense: 0 };
        }
        monthlyMap[monthKey][type] += t.amount;
      });
    };
    
    processTransactions(income, 'income');
    processTransactions(expenses, 'expense');
    
    return Object.entries(monthlyMap)
      .map(([month, data]) => ({ 
        month: format(parseISO(month + '-01'), 'MMM yy'), 
        income: parseFloat(data.income.toFixed(2)), 
        expense: parseFloat(data.expense.toFixed(2)),
        savings: parseFloat((data.income - data.expense).toFixed(2))
      }))
      .sort((a, b) => {
        // Sort by actual date, not formatted string
        const dateA = parseISO(a.month.replace(/(\w{3}) (\d{2})/, '20$2-$1-01')); // Heuristic to parse 'MMM yy'
        const dateB = parseISO(b.month.replace(/(\w{3}) (\d{2})/, '20$2-$1-01'));
        if (!isValid(dateA) || !isValid(dateB)) return 0;
        return dateA.getTime() - dateB.getTime();
      }); 
  }, [income, expenses]);

  const { chartData: pieChartData, highestCategory, highestAmount } = categorySpendingData;

  // --- Generate dynamic insight text --- 
  const generateInsightText = () => {
    let insight = "";
    if (expenses.length === 0 && income.length === 0) return "Add transactions to see insights.";
    
    if (highestCategory) { 
      insight += `Highest spending: ${highestCategory} ($${highestAmount.toFixed(2)}). `; 
    }
    
    if (monthlyTrendData.length >= 2) {
      const lastMonth = monthlyTrendData[monthlyTrendData.length - 1]; 
      const prevMonth = monthlyTrendData[monthlyTrendData.length - 2];
      const netLast = lastMonth.income - lastMonth.expense; 
      const netPrev = prevMonth.income - prevMonth.expense;
      
      if (netLast > netPrev) { 
        insight += `Net savings increased from ${prevMonth.month} to ${lastMonth.month}. `; 
      } else if (netLast < netPrev) { 
        insight += `Net savings decreased from ${prevMonth.month} to ${lastMonth.month}. `; 
      }
    } else if (monthlyTrendData.length === 1) {
      const lastMonth = monthlyTrendData[0]; 
      const netLast = lastMonth.income - lastMonth.expense;
      insight += `In ${lastMonth.month}, net result was $${netLast.toFixed(2)}. `;
    }
    
    if (insight === "") return "Overview of spending patterns. Monthly income vs. expenses shown below.";
    return insight;
  };
  
  const insightText = generateInsightText();

  // --- Chart Configurations (for tooltips/legends) --- 
  const barChartConfig = {
    income: { label: "Income", color: BAR_COLORS.income },
    expense: { label: "Expenses", color: BAR_COLORS.expense },
    savings: { label: "Net Savings", color: "#0A84FF" }
  };
  
  const pieChartConfig = {
    amount: { label: "Amount" },
    ...pieChartData.reduce((acc, cur) => {
      acc[cur.category] = { label: cur.category, color: cur.fill };
      return acc;
    }, {} as any)
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md flex flex-col min-h-[320px] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"> 
      <CardHeader className="pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FEFCD4] dark:bg-[#413200] rounded-full">
              <Sparkles className="h-4 w-4 text-[#FFD60A] dark:text-[#FFD60A]" />
            </div>
            <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">
              Financial Insights
            </CardTitle>
          </div>
          <Button 
            onClick={() => setExpanded(!expanded)} 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-full"
          >
            {expanded ? 
              <ZoomOut className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" /> : 
              <ZoomIn className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
            }
          </Button>
        </div>
        <CardDescription className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
          {insightText}
        </CardDescription> 
      </CardHeader>
      
      <CardContent className={`p-0 ${expanded ? 'py-4' : 'py-2'} transition-all duration-300`}>
        <AnimatePresence mode="wait">
          {/* Chart selection tabs - only show when expanded */}
          {expanded && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center px-4 mb-2"
            >
              <div className="inline-flex bg-[#F2F2F7] dark:bg-[#38383A] p-1 rounded-full">
                <button
                  onClick={() => setActiveSection('bar')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    activeSection === 'bar' 
                      ? 'bg-white dark:bg-[#48484A] text-[#1D1D1F] dark:text-white shadow-sm' 
                      : 'text-[#8E8E93] dark:text-[#98989D]'
                  }`}
                >
                  Monthly Trends
                </button>
                <button
                  onClick={() => setActiveSection('pie')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    activeSection === 'pie' 
                      ? 'bg-white dark:bg-[#48484A] text-[#1D1D1F] dark:text-white shadow-sm' 
                      : 'text-[#8E8E93] dark:text-[#98989D]'
                  }`}
                >
                  Categories
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Bar Chart: Monthly Trend */}
          {(activeSection === 'bar' || !expanded) && (
            <motion.div 
              key="bar-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4"
            >
              {monthlyTrendData.length > 0 ? (
                <ChartContainer config={barChartConfig} className={`w-full ${expanded ? 'h-[300px]' : 'h-[180px]'}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={monthlyTrendData} 
                      margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                      barGap={1}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        tickMargin={8} 
                        axisLine={false} 
                        fontSize={10} 
                        stroke="#8E8E93" 
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        fontSize={10} 
                        tickFormatter={(value) => `$${value}`} 
                        stroke="#8E8E93"
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle" 
                        iconSize={8}
                        formatter={(value) => {
                          return <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">{value}</span>;
                        }}
                      />
                      <Bar 
                        dataKey="income" 
                        fill={BAR_COLORS.income} 
                        radius={[4, 4, 0, 0]} 
                        name="Income"
                        animationDuration={1000}
                      />
                      <Bar 
                        dataKey="expense" 
                        fill={BAR_COLORS.expense} 
                        radius={[4, 4, 0, 0]} 
                        name="Expenses"
                        animationDuration={1000}
                      />
                      {expanded && (
                        <Bar 
                          dataKey="savings" 
                          fill="#0A84FF" 
                          radius={[4, 4, 0, 0]} 
                          name="Net Savings"
                          animationDuration={1000}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className={`flex items-center justify-center text-[#8E8E93] dark:text-[#98989D] text-sm ${expanded ? 'h-[300px]' : 'h-[180px]'}`}>
                  Add income/expenses for trend charts
                </div>
              )}
            </motion.div>
          )}
          
          {/* Pie Chart: Spending Categories (Only show when expanded and active) */}
          {expanded && activeSection === 'pie' && (
            <motion.div
              key="pie-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4"
            >
              {pieChartData.length > 0 ? (
                <ChartContainer config={pieChartConfig} className="w-full h-[300px]"> 
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
                      <Pie 
                        data={pieChartData} 
                        dataKey="amount" 
                        nameKey="category" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        innerRadius={expanded ? 60 : 40}
                        animationDuration={800}
                        animationBegin={300}
                      >
                        <LabelList 
                          dataKey="category" 
                          position="outside" 
                          offset={12} 
                          className="fill-[#8E8E93] dark:fill-[#98989D] text-[10px]" 
                          formatter={(value: string) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
                        />
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-[#8E8E93] dark:text-[#98989D] text-sm">
                  Add expenses to see category distribution
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show button to see more/detailed insights if not expanded */}
        {!expanded && (
          <div className="flex justify-center mt-1">
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setExpanded(true)} 
              className="text-[#007AFF] dark:text-[#0A84FF] text-xs font-medium"
            >
              See detailed insights <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
