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
import { Budget } from '@/components/budget';
import { AIQuery } from '@/components/ai-query'; // Import AI Query component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, LayoutGrid, Activity, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO, isValid } from 'date-fns'; // Import isValid
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
const loadFromLocalStorage = <T,>(key: string, defaultValue: T, dateFields: string[] = []): T => { 
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        return parsed.map((obj: any) => {
          dateFields.forEach(field => { 
              if (obj[field] && typeof obj[field] === 'string') { 
                  const parsedDate = parseISO(obj[field]);
                  // Only assign if the parsed date is valid
                  if (isValid(parsedDate)) {
                      obj[field] = parsedDate;
                  } else {
                      // Handle invalid date string - maybe log or set to null
                      console.warn(`Invalid date string found in LS for key ${key}, field ${field}: ${obj[field]}`);
                      obj[field] = null; // Or keep original string, or set default
                  }
              }
            });
          return obj;
        }) as T;
      } else if (typeof parsed === 'object' && parsed !== null) {
         dateFields.forEach(field => { 
             if (parsed[field] && typeof parsed[field] === 'string') { 
                 const parsedDate = parseISO(parsed[field]);
                  if (isValid(parsedDate)) {
                     parsed[field] = parsedDate;
                  } else {
                      console.warn(`Invalid date string found in LS for key ${key}, field ${field}: ${parsed[field]}`);
                      parsed[field] = null;
                  }
              }
            });
         return parsed as T;
      }
      return parsed as T; 
    } else return defaultValue;
  } catch (error) { console.error(`Error reading localStorage key "${key}":`, error); return defaultValue; }
 };
const saveToLocalStorage = <T,>(key: string, value: T) => { 
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
  const handleAddAccount = (newAccountData: Omit<Account, 'id'>) => {
    try {
      let dateToAdd = newAccountData.startDate;
      // Ensure date is a Date object before adding
      if (newAccountData.startDate && !(newAccountData.startDate instanceof Date)) {
           const parsed = parseISO(newAccountData.startDate as any as string);
           if (isValid(parsed)) dateToAdd = parsed; else dateToAdd = undefined; // Set to undefined if parse fails
      }
      const accountToAdd: Account = { 
          ...newAccountData, 
          startDate: dateToAdd, // Use potentially parsed date
          id: `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`
      };
      setAccounts(prev => [...prev, accountToAdd]);
      toast.success(`Account "${accountToAdd.name}" added successfully!`);
    } catch (error) { console.error("Error adding account:", error); toast.error("Failed to add account."); }
  };
  const handleAddExpense = (data: { accountId: string; amount: number; category: string; date: Date; description: string }) => {
    try {
      let dateToAdd = data.date;
      if (data.date && !(data.date instanceof Date)) {
           const parsed = parseISO(data.date as any as string);
           if (isValid(parsed)) dateToAdd = parsed; 
           else { toast.error("Invalid expense date."); return; } // Stop if date invalid
      }
      const newExpense: Expense = { ...data, id: `exp_${Date.now()}`, date: dateToAdd };
      setExpenses(prev => [...prev, newExpense]);
      setAccounts(prevAccounts => prevAccounts.map(acc => { if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { return { ...acc, balance: acc.balance - data.amount }; } return acc; }));
      toast.success(`Expense of $${data.amount.toFixed(2)} added.`);
     } catch (error) { console.error("Error adding expense:", error); toast.error("Failed to add expense."); }
  };
  const handleAddIncome = (data: { accountId: string; amount: number; source: string; date: Date; description: string }) => {
     try {
       let dateToAdd = data.date;
        if (data.date && !(data.date instanceof Date)) {
           const parsed = parseISO(data.date as any as string);
           if (isValid(parsed)) dateToAdd = parsed; 
           else { toast.error("Invalid income date."); return; } // Stop if date invalid
        }
        const newIncome: Income = { ...data, id: `inc_${Date.now()}`, date: dateToAdd };
        setIncome(prev => [...prev, newIncome]);
        setAccounts(prevAccounts => prevAccounts.map(acc => { if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { return { ...acc, balance: acc.balance + data.amount }; } return acc; }));
        toast.success(`Income of $${data.amount.toFixed(2)} added.`);
    } catch (error) { console.error("Error adding income:", error); toast.error("Failed to add income."); }
  };

   // --- AI Query Handler (Placeholder) ---
   const handleAIQuery = async (query: string): Promise<string> => {
     console.log("AI Query Received:", query);
     const context = { /* ... data summary ... */ };
     console.log("Sending context to AI (placeholder):", context);
     toast.info("Asking AI... (Placeholder)");
     await new Promise(resolve => setTimeout(resolve, 1500)); 
     const lowerQuery = query.toLowerCase();
     if (lowerQuery.includes("total expense")) { return `Your total recorded expenses are $${totalExpenses.toFixed(2)}.`; }
     if (lowerQuery.includes("total income")) { return `Your total recorded income is $${totalIncome.toFixed(2)}.`; }
     if (lowerQuery.match(/how much.*spent on (\w+)/)) { /* ... category logic ... */ 
        const match = lowerQuery.match(/spent on (\w+)/); const category = match ? match[1] : null;
        if (category) { const categoryExpenses = expenses.filter(e => e.category.toLowerCase() === category); const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0); if (categoryTotal > 0) { return `You spent $${categoryTotal.toFixed(2)} on ${category}.`; } else { return `You haven't recorded any spending for the category: ${category}.`; } } else { return "Please specify a category (e.g., 'spent on groceries')."; }
     }
     if (lowerQuery.includes("balance")) { return `Your current liquid balance (Bank + Cash) is $${currentLiquidBalance.toFixed(2)}.`; }
     return "Sorry, I couldn't understand that question. Try asking about total income/expenses, spending on a category, or your balance."; 
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

        {/* Key Metrics Row */} 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
           <IncomeDisplay totalIncome={totalIncome} />
           <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg h-full"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900 dark:text-gray-50">${totalExpenses.toFixed(2)}</div><p className="text-xs text-muted-foreground">Tracked across accounts</p></CardContent></Card>
           <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg h-full"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Liquid Balance</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className={`text-2xl font-bold ${currentLiquidBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${currentLiquidBalance.toFixed(2)}</div><p className="text-xs text-muted-foreground">Sum of Bank & Cash accounts</p></CardContent></Card>
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
                {/* Add AI Query component */}
                <AIQuery onQuerySubmit={handleAIQuery}/> 
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                    <Expenses expenses={expenses} accounts={accounts} />
                    <IncomeList income={income} accounts={accounts} /> 
                     <div className="md:col-span-2">
                          <FixedDepositList accounts={fdAccounts}/>
                     </div>
                      <div className="md:col-span-2">
                          <AISpendingInsights expenses={expenses} income={income} />
                      </div>
                </div>
          </div>
        </div>
      </main>
    </div>
  );
}
