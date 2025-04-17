'use client';

import React, { useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from './ui/card';
import { Lightbulb } from 'lucide-react'; // Removed TrendingUp as it's not used directly
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { format, startOfMonth, parseISO } from 'date-fns';

// Define types to match dashboard
type Expense = {
  id: string; accountId: string; amount: number; category: string; date: Date; description: string;
};
type Income = {
   id: string; accountId: string; amount: number; source: string; date: Date; description: string;
};

interface AISpendingInsightsProps {
  expenses: Expense[];
  income: Income[]; // Include income prop
}

// Define colors
const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658"];
const BAR_COLORS = { income: "hsl(var(--chart-2))", expense: "hsl(var(--chart-1))" };

export function AISpendingInsights({ expenses, income }: AISpendingInsightsProps) {

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
        if (amount > highestAmount) { highestAmount = amount; highestCategory = category; }
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
                const dateObj = t.date instanceof Date ? t.date : parseISO(t.date as any as string);
                if (isNaN(dateObj.getTime())) return;
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
            .map(([month, data]) => ({ month: format(parseISO(month + '-01'), 'MMM yy'), ...data }))
            .sort((a, b) => a.month.localeCompare(b.month)); 
    }, [income, expenses]);

  const { chartData: pieChartData, highestCategory, highestAmount } = categorySpendingData;

  // Generate dynamic insight text based on trends
  const generateInsightText = () => {
    let insight = "";
    if (expenses.length === 0 && income.length === 0) return "Add transactions to see insights.";

    // Highest Spending Category
    if (highestCategory) { insight += `Highest spending category: ${highestCategory} ($${highestAmount.toFixed(2)}). `; }
    
    // Recent Trend Insight (Example: Compare last 2 available months)
    if (monthlyTrendData.length >= 2) {
        const lastMonth = monthlyTrendData[monthlyTrendData.length - 1];
        const prevMonth = monthlyTrendData[monthlyTrendData.length - 2];
        const netLast = lastMonth.income - lastMonth.expense;
        const netPrev = prevMonth.income - prevMonth.expense;
        if (netLast > netPrev) {
            insight += `Your net savings increased from ${prevMonth.month} to ${lastMonth.month}. `; 
        } else if (netLast < netPrev) {
            insight += `Your net savings decreased from ${prevMonth.month} to ${lastMonth.month}. `; 
        }
    } else if (monthlyTrendData.length === 1) {
         const lastMonth = monthlyTrendData[0];
         const netLast = lastMonth.income - lastMonth.expense;
         insight += `In ${lastMonth.month}, your net result was $${netLast.toFixed(2)}. `;
    }

    if (insight === "") return "Overview of spending patterns. Monthly income vs. expenses shown below.";
    
    return insight + "Monthly trends shown below.";
  };
  const insightText = generateInsightText();

  const barChartConfig = {
      income: { label: "Income", color: BAR_COLORS.income },
      expense: { label: "Expenses", color: BAR_COLORS.expense },
  };
  const pieChartConfig = {
      amount: { label: "Amount"},
      ...pieChartData.reduce((acc, cur) => {
          acc[cur.category] = { label: cur.category, color: cur.fill };
          return acc;
      }, {} as any)
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[600px] md:col-span-2"> 
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle>Financial Insights</CardTitle>
        </div>
        <CardDescription>{insightText}</CardDescription> 
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {/* Bar Chart: Monthly Trend */} 
        <div className="flex flex-col">
            <h3 className="text-sm font-semibold mb-2 text-center">Monthly Income vs. Expenses</h3>
            {monthlyTrendData.length > 0 ? (
                <ChartContainer config={barChartConfig} className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrendData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}> {/* Increased top margin for legend */}
                           <CartesianGrid vertical={false} strokeDasharray="3 3" />
                           <XAxis dataKey="month" tickLine={false} tickMargin={8} axisLine={false} fontSize={10} />
                           <YAxis tickLine={false} axisLine={false} fontSize={10} tickFormatter={(value) => `$${value / 1000}k`} />
                           <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            {/* Removed align prop */} 
                            <ChartLegend content={<ChartLegendContent verticalAlign="top" />} /> 
                            <Bar dataKey="income" fill={BAR_COLORS.income} radius={[4, 4, 0, 0]} name="Income"/>
                            <Bar dataKey="expense" fill={BAR_COLORS.expense} radius={[4, 4, 0, 0]} name="Expenses"/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
             ) : (
                 <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Add income/expenses for trend chart.</div>
             )}
        </div>
        
         {/* Pie Chart: Spending Categories */} 
         <div className="flex flex-col">
             <h3 className="text-sm font-semibold mb-2 text-center">Spending by Category</h3>
            {pieChartData.length > 0 ? (
                <ChartContainer config={pieChartConfig} className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="amount" />} />
                            <Pie data={pieChartData} dataKey="amount" nameKey="category" cx="50%" cy="50%" 
                                outerRadius={80} innerRadius={50} // Donut chart
                            >
                                <LabelList dataKey="category" position="outside" offset={12} className="fill-muted-foreground text-[10px]" formatter={(value: string) => value}/>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                 <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Add expenses for category chart.</div>
            )}
         </div>
      </CardContent>
    </Card>
  );
}
