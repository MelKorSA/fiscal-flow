'use client';

import React from 'react';
import { AISpendingInsights } from '@/components/ai-spending-insights';
import { PredictiveCashFlow } from '@/components/predictive-cash-flow';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Placeholder data fetching function - replace with your actual data fetching logic
async function getAnalyticsData() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Replace with actual API calls to fetch expenses, income, balance, recurring transactions
  const expenses = [
    { id: '1', accountId: 'a1', amount: 50, category: 'Food', date: new Date(2025, 3, 15), description: 'Lunch' },
    { id: '2', accountId: 'a1', amount: 120, category: 'Transport', date: new Date(2025, 3, 10), description: 'Gas' },
    { id: '3', accountId: 'a2', amount: 800, category: 'Rent', date: new Date(2025, 3, 1), description: 'Monthly Rent' },
    { id: '4', accountId: 'a1', amount: 30, category: 'Entertainment', date: new Date(2025, 2, 20), description: 'Movie' },
  ];
  const income = [
    { id: 'i1', accountId: 'a1', amount: 2500, source: 'Salary', date: new Date(2025, 3, 1), description: 'April Salary' },
    { id: 'i2', accountId: 'a2', amount: 3000, source: 'Salary', date: new Date(2025, 2, 1), description: 'March Salary' },
  ];
  const currentBalance = 5000; // Example balance
  const recurringTransactions = [
    { frequency: 'monthly', amount: 800, type: 'expense', startDate: new Date(2024, 0, 1), dayOfMonth: 1, description: 'Rent' },
    { frequency: 'monthly', amount: 2500, type: 'income', startDate: new Date(2024, 0, 1), dayOfMonth: 1, description: 'Salary' },
    { frequency: 'weekly', amount: 50, type: 'expense', startDate: new Date(2024, 0, 1), dayOfWeek: 5, description: 'Groceries' }, // Friday
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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">Analytics Dashboard</h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[320px] rounded-2xl" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      ) : data ? (
        <div className="grid gap-6 md:grid-cols-2">
          <AISpendingInsights expenses={data.expenses} income={data.income} />
          <PredictiveCashFlow
            currentBalance={data.currentBalance}
            transactions={[...data.expenses, ...data.income]} // Combine for potential baseline analysis
            recurringTransactions={data.recurringTransactions}
          />
          {/* Add more analytics components here */}
        </div>
      ) : (
        <p className="text-center text-gray-500">Could not load analytics data.</p>
      )}
    </div>
  );
}
