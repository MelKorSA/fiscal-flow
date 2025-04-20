'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, PlusCircle, Calculator, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatIfScenariosProps {
  currentIncome: number;
  currentExpenses: number;
  currentSavings: number;
  recurringExpenses: any[];
}

export function WhatIfScenarios({
  currentIncome,
  currentExpenses,
  currentSavings,
  recurringExpenses
}: WhatIfScenariosProps) {
  // State for scenario parameters
  const [incomeChangePercent, setIncomeChangePercent] = useState(0);
  const [expenseChangePercent, setExpenseChangePercent] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(currentSavings * 2);
  const [timeframe, setTimeframe] = useState('6'); // in months
  const [additionalExpense, setAdditionalExpense] = useState(0);
  const [additionalIncome, setAdditionalIncome] = useState(0);
  const [currentTab, setCurrentTab] = useState('income-expenses');

  // Calculate results based on scenario parameters
  const calculateResults = () => {
    const months = parseInt(timeframe);
    const monthlyData = [];
    
    let projectedIncome = currentIncome;
    let projectedExpenses = currentExpenses;
    
    // Apply percentage changes
    if (incomeChangePercent !== 0) {
      projectedIncome = currentIncome * (1 + incomeChangePercent / 100);
    }
    
    if (expenseChangePercent !== 0) {
      projectedExpenses = currentExpenses * (1 + expenseChangePercent / 100);
    }
    
    // Add additional income/expenses
    projectedIncome += additionalIncome;
    projectedExpenses += additionalExpense;
    
    // Monthly savings
    const monthlySavings = projectedIncome - projectedExpenses;
    
    // Current savings amount
    let cumulativeSavings = currentSavings;
    
    // Generate data for each month
    for (let i = 0; i <= months; i++) {
      if (i > 0) {
        cumulativeSavings += monthlySavings;
      }
      
      monthlyData.push({
        month: i,
        savings: Math.round(cumulativeSavings),
        income: Math.round(projectedIncome),
        expenses: Math.round(projectedExpenses)
      });
    }
    
    // Calculate months to reach savings goal
    const monthsToGoal = monthlySavings > 0 
      ? Math.ceil((savingsGoal - currentSavings) / monthlySavings)
      : Infinity;
    
    return {
      monthlyData,
      monthlySavings,
      monthsToGoal,
      willReachGoal: monthlySavings > 0 && monthsToGoal <= months
    };
  };
  
  const results = calculateResults();

  return (
    <Card className="overflow-hidden bg-white dark:bg-[#1A1A1A] shadow-sm border border-[#E5E5EA] dark:border-[#333333] rounded-xl">
      <CardHeader className="bg-[#F5F5F7] dark:bg-[#252525] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#1D1D1F] dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
              What-If Scenarios
            </CardTitle>
            <CardDescription className="text-[#86868B] dark:text-[#98989D]">
              Simulate different financial scenarios to plan for the future
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="income-expenses">Income & Expenses</TabsTrigger>
            <TabsTrigger value="savings-goals">Savings Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income-expenses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                    Income Change (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[incomeChangePercent]} 
                      min={-50} 
                      max={50} 
                      step={1}
                      onValueChange={(value) => setIncomeChangePercent(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm">
                      {incomeChangePercent > 0 ? '+' : ''}{incomeChangePercent}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                    Expenses Change (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[expenseChangePercent]} 
                      min={-50} 
                      max={50} 
                      step={1}
                      onValueChange={(value) => setExpenseChangePercent(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm">
                      {expenseChangePercent > 0 ? '+' : ''}{expenseChangePercent}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                      Additional Income
                    </label>
                    <Input
                      type="number"
                      value={additionalIncome}
                      onChange={(e) => setAdditionalIncome(Number(e.target.value))}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                      Additional Expense
                    </label>
                    <Input
                      type="number"
                      value={additionalExpense}
                      onChange={(e) => setAdditionalExpense(Number(e.target.value))}
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                    Timeframe (months)
                  </label>
                  <Select
                    value={timeframe}
                    onValueChange={setTimeframe}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="60">5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3 bg-[#F5F5F7] dark:bg-[#252525] p-4 rounded-lg">
                <h3 className="font-medium text-[#1D1D1F] dark:text-white">Scenario Results</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                    <p className="text-xs text-[#86868B] dark:text-[#98989D]">Monthly Income</p>
                    <p className="font-medium text-[#1D1D1F] dark:text-white">
                      ${Math.round(results.monthlyData[1]?.income || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                    <p className="text-xs text-[#86868B] dark:text-[#98989D]">Monthly Expenses</p>
                    <p className="font-medium text-[#1D1D1F] dark:text-white">
                      ${Math.round(results.monthlyData[1]?.expenses || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                  <p className="text-xs text-[#86868B] dark:text-[#98989D]">Monthly Savings</p>
                  <p className={cn(
                    "font-medium",
                    results.monthlySavings > 0 
                      ? "text-emerald-600 dark:text-emerald-500" 
                      : "text-red-600 dark:text-red-500"
                  )}>
                    ${Math.abs(Math.round(results.monthlySavings)).toLocaleString()}
                    {results.monthlySavings < 0 ? ' (deficit)' : ''}
                  </p>
                </div>
                
                <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                  <p className="text-xs text-[#86868B] dark:text-[#98989D]">Projected Savings (after {timeframe} months)</p>
                  <p className="font-medium text-[#1D1D1F] dark:text-white">
                    ${Math.round(results.monthlyData[parseInt(timeframe)]?.savings || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results.monthlyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    name="Savings" 
                    stroke="#0A84FF" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    name="Income" 
                    stroke="#30D158" 
                    strokeDasharray="5 5"
                    strokeWidth={1.5} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Expenses" 
                    stroke="#FF453A" 
                    strokeDasharray="5 5"
                    strokeWidth={1.5} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="savings-goals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                    Savings Goal ($)
                  </label>
                  <Input
                    type="number"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                    Monthly Contribution ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[Math.max(0, results.monthlySavings)]} 
                      min={0} 
                      max={Math.max(2000, results.monthlySavings * 2)} 
                      step={50}
                      onValueChange={(value) => {
                        const newExpenses = currentIncome - value[0];
                        setExpenseChangePercent(Math.round((newExpenses / currentExpenses - 1) * 100));
                      }}
                      className="flex-1"
                    />
                    <span className="w-16 text-center text-sm">
                      ${Math.max(0, Math.round(results.monthlySavings))}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-1 block">
                    Timeframe (months)
                  </label>
                  <Select
                    value={timeframe}
                    onValueChange={setTimeframe}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="60">5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3 bg-[#F5F5F7] dark:bg-[#252525] p-4 rounded-lg">
                <h3 className="font-medium text-[#1D1D1F] dark:text-white">Goal Analysis</h3>
                
                <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                  <p className="text-xs text-[#86868B] dark:text-[#98989D]">Current Savings</p>
                  <p className="font-medium text-[#1D1D1F] dark:text-white">
                    ${currentSavings.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                  <p className="text-xs text-[#86868B] dark:text-[#98989D]">Months to Reach Goal</p>
                  <p className="font-medium text-[#1D1D1F] dark:text-white">
                    {results.monthlySavings <= 0 ? (
                      <span className="text-red-600 dark:text-red-500">
                        Not achievable (negative savings)
                      </span>
                    ) : results.monthsToGoal > 60 ? (
                      <span className="text-orange-600 dark:text-orange-500">
                        {results.monthsToGoal.toLocaleString()} months (~{Math.round(results.monthsToGoal / 12)} years)
                      </span>
                    ) : (
                      `${results.monthsToGoal} months (~${Math.round(results.monthsToGoal / 12 * 10) / 10} years)`
                    )}
                  </p>
                </div>
                
                <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                  <p className="text-xs text-[#86868B] dark:text-[#98989D]">Goal Status</p>
                  <p className={cn(
                    "font-medium",
                    results.willReachGoal 
                      ? "text-emerald-600 dark:text-emerald-500" 
                      : "text-orange-600 dark:text-orange-500"
                  )}>
                    {results.willReachGoal 
                      ? `Goal will be reached in ${results.monthsToGoal} months` 
                      : `Goal not reached within ${timeframe} months`}
                  </p>
                </div>
                
                <div className="bg-white/60 dark:bg-[#333333] p-2 rounded">
                  <p className="text-xs text-[#86868B] dark:text-[#98989D]">Expected Progress</p>
                  <div className="w-full bg-[#E5E5EA] dark:bg-[#333333] rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(
                          100, 
                          ((results.monthlyData[parseInt(timeframe)]?.savings || currentSavings) / savingsGoal) * 100
                        )}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-[#86868B] dark:text-[#98989D]">
                    {Math.round(((results.monthlyData[parseInt(timeframe)]?.savings || currentSavings) / savingsGoal) * 100)}% of goal
                  </p>
                </div>
              </div>
            </div>
            
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results.monthlyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    name="Projected Savings" 
                    stroke="#0A84FF" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="month" 
                    name="Goal" 
                    stroke="#FF9F0A" 
                    strokeWidth={0} 
                    dot={false}
                  />
                  {/* Add a horizontal line for the savings goal */}
                  {[...Array(parseInt(timeframe) + 1)].map((_, i) => (
                    <Line 
                      key={`goal-line-${i}`}
                      dataKey={() => savingsGoal}
                      name={i === 0 ? "Savings Goal" : ""}
                      stroke="#FF9F0A"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}