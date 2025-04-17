'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Expenses } from '@/components/expenses';
import { IncomeDisplay } from '@/components/income-display';
import { IncomeList } from '@/components/income-list';
import { AddExpenseForm } from '@/components/add-expense-form';
import { AddIncomeForm } from '@/components/add-income-form';
import { AISpendingInsights } from '@/components/ai-spending-insights';
import { AccountList } from '@/components/account-list';
import { AddAccountForm } from '@/components/add-account-form';
import { FixedDepositList } from '@/components/fixed-deposit-list';
import { Budget } from '@/components/budget'; // Import Budget component
// Import AI Query component later when created
// import { AIQuery } from '@/components/ai-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, LayoutGrid, Activity, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO } from 'date-fns';
import { toast } from "sonner";

// --- Local Storage Keys & Types ---
const LS_KEYS = {
  ACCOUNTS: 'budgetAppAccounts',
  EXPENSES: 'budgetAppExpenses',
  INCOME: 'budgetAppIncome',
};
type Transaction = { id: string; accountId: string; amount: number; date: Date; description: string; };
type Expense = Transaction & { category: string; };
type Income = Transaction & { source: string; };
export type Account = { id: string; name: string; type: 'Bank Account' | 'Cash' | 'Fixed Deposit'; balance?: number; startDate?: Date; tenureMonths?: number; interestRate?: number; };

// --- Default Initial Data ---
const defaultInitialAccounts: Account[] = [
  { id: 'acc1', name: 'Main Checking', type: 'Bank Account', balance: 1500.75 },
  { id: 'acc2', name: 'Wallet', type: 'Cash', balance: 85.50 },
  { id: 'fd1', name: 'Emergency FD', type: 'Fixed Deposit', balance: 5000, startDate: new Date(2023, 5, 1), tenureMonths: 12, interestRate: 4.5 }
];

// --- Placeholder Expense Categories & Income Sources ---
const availableExpenseCategories = [
  "Groceries", "Transport", "Entertainment", "Utilities", "Dining Out",
  "Shopping", "Healthcare", "Education", "Travel", "Rent/Mortgage", "Subscriptions", "Other"
];
const availableIncomeSources = ["Salary", "Freelance", "Investment", "Gift", "Bonus", "Interest", "Other"];

// --- Local Storage Helper Functions ---
const loadFromLocalStorage = <T,>(key: string, defaultValue: T, dateFields: string[] = []): T => { /* ... implementation ... */ 
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        return parsed.map((obj: any) => {
          dateFields.forEach(field => { if (obj[field] && typeof obj[field] === 'string') obj[field] = parseISO(obj[field]); });
          return obj;
        }) as T;
      } else if (typeof parsed === 'object' && parsed !== null) {
         dateFields.forEach(field => { if (parsed[field] && typeof parsed[field] === 'string') parsed[field] = parseISO(parsed[field]); });
         return parsed as T;
      }
      return parsed as T; 
    } else return defaultValue;
  } catch (error) { console.error(`Error reading localStorage key "${key}":`, error); return defaultValue; }
 };
const saveToLocalStorage = <T,>(key: string, value: T) => { /* ... implementation ... */ 
   if (typeof window === 'undefined') return;
   try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error(`Error setting localStorage key "${key}":`, error); }
 };

export default function Dashboard() {
  // --- State Initialization ---
  const [accounts, setAccounts] = useState<Account[]>(() => loadFromLocalStorage(LS_KEYS.ACCOUNTS, defaultInitialAccounts, ['startDate']));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromLocalStorage(LS_KEYS.EXPENSES, [], ['date']));
  const [income, setIncome] = useState<Income[]>(() => loadFromLocalStorage(LS_KEYS.INCOME, [], ['date']));

  // --- Effects for Saving State ---
  useEffect(() => { saveToLocalStorage(LS_KEYS.ACCOUNTS, accounts); }, [accounts]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.INCOME, income); }, [income]);

  // --- State Update Handlers with Toasts ---
  const handleAddAccount = (newAccountData: Omit<Account, 'id'>) => { /* ... Implementation ... */ 
    try {
      const accountToAdd: Account = { ...newAccountData, id: `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`, ...(newAccountData.startDate && { startDate: new Date(newAccountData.startDate) }) };
      setAccounts(prev => [...prev, accountToAdd]);
      toast.success(`Account "${accountToAdd.name}" added successfully!`);
    } catch (error) { console.error("Error adding account:", error); toast.error("Failed to add account."); }
  };
  const handleAddExpense = (data: { accountId: string; amount: number; category: string; date: Date; description: string }) => { /* ... Implementation ... */ 
    try {
      const newExpense: Expense = { ...data, id: `exp_${Date.now()}`, date: new Date(data.date) };
      setExpenses(prev => [...prev, newExpense]);
      setAccounts(prevAccounts => prevAccounts.map(acc => { if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { return { ...acc, balance: acc.balance - data.amount }; } return acc; }));
      toast.success(`Expense of $${data.amount.toFixed(2)} added.`);
     } catch (error) { console.error("Error adding expense:", error); toast.error("Failed to add expense."); }
  };
  const handleAddIncome = (data: { accountId: string; amount: number; source: string; date: Date; description: string }) => { /* ... Implementation ... */ 
     try {
        const newIncome: Income = { ...data, id: `inc_${Date.now()}`, date: new Date(data.date) };
        setIncome(prev => [...prev, newIncome]);
        setAccounts(prevAccounts => prevAccounts.map(acc => { if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { return { ...acc, balance: acc.balance + data.amount }; } return acc; }));
        toast.success(`Income of $${data.amount.toFixed(2)} added.`);
    } catch (error) { console.error("Error adding income:", error); toast.error("Failed to add income."); }
  };

  // --- Memoized Calculations ---
  const nonFdAccounts = useMemo(() => accounts.filter(acc => acc.type !== 'Fixed Deposit'), [accounts]);
  const fdAccounts = useMemo(() => accounts.filter(acc => acc.type === 'Fixed Deposit'), [accounts]);
  const totalIncome = useMemo(() => income.reduce((sum, item) => sum + item.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const currentLiquidBalance = useMemo(() => nonFdAccounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0), [nonFdAccounts]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:to-slate-800">
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Financial Dashboard</h1>

        {/* Key Metrics Row - Pass required prop to Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <IncomeDisplay totalIncome={totalIncome} />
             <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg h-full"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900 dark:text-gray-50">${totalExpenses.toFixed(2)}</div><p className="text-xs text-muted-foreground">Tracked across accounts</p></CardContent></Card>
            <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg h-full"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Liquid Balance</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className={`text-2xl font-bold ${currentLiquidBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${currentLiquidBalance.toFixed(2)}</div><p className="text-xs text-muted-foreground">Sum of Bank & Cash accounts</p></CardContent></Card>
            {/* Pass totalExpenses to Budget */}
            <Budget totalExpenses={totalExpenses} /> 
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Column 1: Accounts & Add Transactions --- */}
          <div className="lg:col-span-1 space-y-6">
             <AccountList accounts={accounts} />
             <AddAccountForm onAddAccount={handleAddAccount} />
             <Card className="shadow-sm bg-white dark:bg-gray-800 rounded-lg">
               <CardContent className="p-4">
                  <Tabs defaultValue="expense" className="w-full">
                   <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="expense" className="text-xs sm:text-sm"><PlusCircle className="mr-1.5 h-4 w-4"/>Expense</TabsTrigger>
                     <TabsTrigger value="income" className="text-xs sm:text-sm"><PlusCircle className="mr-1.5 h-4 w-4"/>Income</TabsTrigger>
                   </TabsList>
                   <TabsContent value="expense" className="mt-4"><AddExpenseForm accounts={nonFdAccounts} onAddExpense={handleAddExpense} categories={availableExpenseCategories} /></TabsContent>
                   <TabsContent value="income" className="mt-4"><AddIncomeForm accounts={nonFdAccounts} onAddIncome={handleAddIncome} incomeSources={availableIncomeSources} /></TabsContent>
                 </Tabs>
               </CardContent>
             </Card>
          </div>

          {/* --- Column 2 & 3: Data Display & Insights --- */}
          <div className="lg:col-span-2 space-y-6">
               {/* Add AIQuery component placeholder here later */} 
               {/* <AIQuery onQuerySubmit={handleAIQuery}/> */} 
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                    <Expenses expenses={expenses} accounts={accounts} />
                    <IncomeList income={income} accounts={accounts} /> 
                     <div className="md:col-span-2">
                          <FixedDepositList accounts={fdAccounts}/>
                     </div>
                      <div className="md:col-span-2">
                          {/* Pass income prop to AISpendingInsights */}
                          <AISpendingInsights expenses={expenses} income={income} />
                      </div>
                </div>
          </div>
        </div>
      </main>
    </div>
  );
}
