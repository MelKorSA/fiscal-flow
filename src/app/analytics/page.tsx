'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard-header'; 
import { AISpendingInsights } from '@/components/ai-spending-insights';
import { PredictiveCashFlow } from '@/components/predictive-cash-flow';
import { FinancialHealthScore } from '@/components/financial-health-score';
import { MerchantAnalytics } from '@/components/merchant-analytics';
import { WhatIfScenarios } from '@/components/what-if-scenarios';
import { Skeleton } from '@/components/ui/skeleton';
import { PageFeatureGuide } from '@/components/page-feature-guide';
import { TrendingUp, PieChart, BarChart3, CreditCard, Lightbulb } from 'lucide-react';

// Placeholder data fetching function - replace with your actual data fetching logic
async function getAnalyticsData() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Replace with actual API calls to fetch expenses, income, balance, recurring transactions
  const expenses = [
    { id: '1', accountId: 'a1', amount: 50, category: 'Food', date: new Date(2025, 3, 15), description: 'Cafe Luna - Lunch' },
    { id: '2', accountId: 'a1', amount: 120, category: 'Transport', date: new Date(2025, 3, 10), description: 'QuickFill - Gas' },
    { id: '3', accountId: 'a2', amount: 800, category: 'Housing', date: new Date(2025, 3, 1), description: 'Urban Properties - Monthly Rent' },
    { id: '4', accountId: 'a1', amount: 30, category: 'Entertainment', date: new Date(2025, 2, 20), description: 'CineStar - Movie' },
    { id: '5', accountId: 'a2', amount: 150, category: 'Debt Repayment', date: new Date(2025, 3, 5), description: 'First Bank - Credit Card' },
    { id: '6', accountId: 'a1', amount: 200, category: 'Savings', date: new Date(2025, 3, 2), description: 'Savings Account - Monthly Transfer' },
    { id: '7', accountId: 'a1', amount: 65, category: 'Food', date: new Date(2025, 3, 8), description: 'Cafe Luna - Dinner' },
    { id: '8', accountId: 'a1', amount: 110, category: 'Transport', date: new Date(2025, 2, 25), description: 'GasNGo - Fuel' },
    { id: '9', accountId: 'a2', amount: 45, category: 'Shopping', date: new Date(2025, 3, 12), description: 'Urban Market - Groceries' },
    { id: '10', accountId: 'a1', amount: 38, category: 'Food', date: new Date(2025, 2, 18), description: 'Fresh Bites - Lunch' },
    { id: '11', accountId: 'a1', amount: 70, category: 'Shopping', date: new Date(2025, 3, 7), description: 'Urban Market - Household items' },
    { id: '12', accountId: 'a2', amount: 125, category: 'Transport', date: new Date(2025, 2, 15), description: 'QuickFill - Gas and car wash' }
  ];
  const income = [
    { id: 'i1', accountId: 'a1', amount: 2500, source: 'Salary', date: new Date(2025, 3, 1), description: 'April Salary' },
    { id: 'i2', accountId: 'a2', amount: 3000, source: 'Salary', date: new Date(2025, 2, 1), description: 'March Salary' },
  ];
  const currentBalance = 5000; // Example balance
  const recurringTransactions = [
    { frequency: 'monthly', amount: 800, type: 'expense', startDate: new Date(2024, 0, 1), dayOfMonth: 1, description: 'Rent' },
    { frequency: 'monthly', amount: 2500, type: 'income', startDate: new Date(2024, 0, 1), dayOfMonth: 1, description: 'Salary' },
    { frequency: 'weekly', amount: 50, type: 'expense', startDate: new Date(2024, 0, 1), dayOfWeek: 5, description: 'Groceries' },
    { frequency: 'monthly', amount: 200, type: 'expense', startDate: new Date(2024, 0, 1), dayOfMonth: 2, description: 'Savings' },
    { frequency: 'monthly', amount: 150, type: 'expense', startDate: new Date(2024, 0, 1), dayOfMonth: 5, description: 'Debt Repayment' },
  ];

  return { expenses, income, currentBalance, recurringTransactions };
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const analyticsData = await getAnalyticsData();
      setData(analyticsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate derived values for financial health score
  const calculateDerivedValues = () => {
    if (!data) return null;
    
    // Calculate total income
    const totalIncome = data.income.reduce((sum: number, item: any) => sum + item.amount, 0);
    
    // Calculate total expenses
    const totalExpenses = data.expenses.reduce((sum: number, item: any) => sum + item.amount, 0);
    
    // Extract savings amount (simplified: any expense with category 'Savings')
    const savingsAmount = data.expenses
      .filter((expense: any) => expense.category === 'Savings')
      .reduce((sum: number, item: any) => sum + item.amount, 0);
    
    // Extract debt amount (simplified: any expense with category containing 'Debt')
    const debtAmount = data.expenses
      .filter((expense: any) => expense.category.includes('Debt'))
      .reduce((sum: number, item: any) => sum + item.amount, 0);
    
    // Calculate recurring expenses total
    const recurringExpenses = data.recurringTransactions
      .filter((item: any) => item.type === 'expense')
      .reduce((sum: number, item: any) => sum + item.amount, 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: data.currentBalance,
      savingsAmount,
      debtAmount,
      recurringExpenses,
      recurringTransactionsList: data.recurringTransactions
    };
  };
  
  // Get derived values
  const healthScoreProps = data ? calculateDerivedValues() : null;

  // Define analytics features for the guide
  // Assuming PageFeatureGuide expects the component type for the icon
  const analyticsFeatures = [
    {
      title: "AI Spending Insights",
      description: "Get AI-powered analysis of your spending patterns and personalized recommendations.",
      icon: PieChart // Pass the component type
    },
    {
      title: "Predictive Cash Flow",
      description: "View future cash flow projections based on your recurring transactions and spending habits.",
      icon: TrendingUp // Pass the component type
    },
    {
      title: "Financial Health Score",
      description: "Track your overall financial health with a comprehensive score and improvement tips.",
      icon: BarChart3 // Pass the component type
    },
    {
      title: "Merchant Analytics",
      description: "See where you spend the most and identify trends across different merchants.",
      icon: CreditCard // Pass the component type
    },
    {
      title: "What-If Scenarios",
      description: "Simulate financial decisions and see how they impact your long-term financial health.",
      icon: Lightbulb // Pass the component type
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white mb-6">Analytics Dashboard</h1>

        {/* Page Feature Guide */}
        <PageFeatureGuide
          title="Financial Analytics"
          description="Get deeper insights into your financial health with AI-powered analytics and predictive tools."
          features={analyticsFeatures}
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[320px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
            {/* Merchant Analytics skeleton - spans full width */}
            <Skeleton className="h-[320px] rounded-2xl md:col-span-2 lg:col-span-3" />
            {/* What-If Scenarios skeleton - spans full width */}
            <Skeleton className="h-[400px] rounded-2xl md:col-span-2 lg:col-span-3" />
          </div>
        ) : data ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AISpendingInsights expenses={data.expenses} income={data.income} />
            <PredictiveCashFlow
              currentBalance={data.currentBalance}
              transactions={[...data.expenses.map((e: any) => ({...e, type: 'expense'})), 
                             ...data.income.map((i: any) => ({...i, type: 'income'}))]} 
              recurringTransactions={data.recurringTransactions}
            />
            {healthScoreProps && (
              <FinancialHealthScore 
                income={healthScoreProps.income}
                expenses={healthScoreProps.expenses}
                balance={healthScoreProps.balance}
                savingsAmount={healthScoreProps.savingsAmount}
                debtAmount={healthScoreProps.debtAmount}
                recurringExpenses={healthScoreProps.recurringExpenses}
              />
            )}
            
            {/* Merchant Analytics - spans full width on larger screens */}
            <div className="md:col-span-2 lg:col-span-3">
              <MerchantAnalytics expenses={data.expenses} />
            </div>
            
            {/* What-If Scenarios - spans full width on larger screens */}
            {healthScoreProps && (
              <div className="md:col-span-2 lg:col-span-3 mt-2">
                <WhatIfScenarios
                  currentIncome={healthScoreProps.income}
                  currentExpenses={healthScoreProps.expenses}
                  currentSavings={healthScoreProps.balance}
                  recurringExpenses={healthScoreProps.recurringTransactionsList}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Could not load analytics data.</p>
        )}
      </main>
    </div>
  );
}
