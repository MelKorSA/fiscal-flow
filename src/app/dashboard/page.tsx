'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { gsap } from 'gsap';
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
import { AIQuery } from '@/components/ai-query';
import { DashboardHeader } from '@/components/dashboard-header';
import { SearchResults } from '@/components/search-results/search-results';
import { RecurringTransactionsList } from '@/components/recurring-transactions-list';
import { AddRecurringTransactionForm } from '@/components/add-recurring-transaction-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, LayoutGrid, Activity, Banknote, ChevronDown, BarChart3, CreditCard, ArrowUpCircle, Repeat, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO, isValid, format } from 'date-fns';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { availableExpenseCategoriesArray } from '@/config/expense-categories';
import DashboardLoading from './loading';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

// --- Income Sources ---
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
                  if (isValid(parsedDate)) {
                      obj[field] = parsedDate;
                  } else {
                      console.warn(`Invalid date string found in LS for key ${key}, field ${field}: ${obj[field]}`);
                      obj[field] = null;
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

function DashboardContent() {
  // --- State Initialization ---
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>(() => loadFromLocalStorage(LS_KEYS.ACCOUNTS, defaultInitialAccounts, ['startDate']));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromLocalStorage(LS_KEYS.EXPENSES, [], ['date']));
  const [income, setIncome] = useState<Income[]>(() => loadFromLocalStorage(LS_KEYS.INCOME, [], ['date']));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showAITooltip, setShowAITooltip] = useState(false);
  
  // Animation refs
  const contentRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const columnOneRef = useRef<HTMLDivElement>(null);
  const columnTwoRef = useRef<HTMLDivElement>(null);
  
  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Setup content animations after loading
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      // Stagger animation for main content sections
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
      
      // Animate metrics cards with stagger
      if (metricsRef.current) {
        const cards = metricsRef.current.querySelectorAll('.metric-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 15, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'back.out(1.2)',
          }
        );
      }
      
      // Animate columns with slight delay
      gsap.fromTo(
        columnOneRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' }
      );
      
      gsap.fromTo(
        columnTwoRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' }
      );
    }
  }, [isLoading]);

  // --- Effects for Saving State ---
  useEffect(() => { saveToLocalStorage(LS_KEYS.ACCOUNTS, accounts); }, [accounts]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.INCOME, income); }, [income]);

  // --- Search Handler ---
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearchModalOpen(true);
    } else {
      setIsSearchModalOpen(false);
    }
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // --- State Update Handlers with Toasts ---
  const handleAddAccount = (newAccountData: Omit<Account, 'id'>) => {
    try {
      let dateToAdd = newAccountData.startDate;
      if (newAccountData.startDate && !(newAccountData.startDate instanceof Date)) {
           const parsed = parseISO(newAccountData.startDate as any as string);
           if (isValid(parsed)) dateToAdd = parsed; else dateToAdd = undefined;
      }
      const accountToAdd: Account = { 
          ...newAccountData, 
          startDate: dateToAdd,
          id: `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`
      };
      setAccounts(prev => [...prev, accountToAdd]);
      toast.success(`Account "${accountToAdd.name}" added successfully!`);
    } catch (error) { console.error("Error adding account:", error); toast.error("Failed to add account."); }
  };

  const handleAddExpense = (data: { 
    accountId: string; 
    amount: number; 
    category: string; 
    date: Date; 
    description: string;
    splitItems?: Array<{id: string; category: string; amount: number}>; 
  }) => {
     try {
       let dateToAdd = data.date;
        if (data.date && !(data.date instanceof Date)) {
           const parsed = parseISO(data.date as any as string);
           if (isValid(parsed)) dateToAdd = parsed; 
           else { toast.error("Invalid expense date."); return; }
        }

        if (data.splitItems && data.splitItems.length > 0) {
          // Handle split transaction: create multiple expense entries
          const splitTransactions = data.splitItems.map(splitItem => ({
            id: `exp_${Date.now()}_${splitItem.id}`,
            accountId: data.accountId,
            amount: splitItem.amount,
            category: splitItem.category,
            date: dateToAdd,
            description: `${data.description || 'Split transaction'} (${splitItem.category})`,
          }));

          // Add all split transactions to expenses
          setExpenses(prev => [...prev, ...splitTransactions]);
          
          // Only deduct the total amount once from the account
          setAccounts(prevAccounts => prevAccounts.map(acc => { 
            if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { 
              return { ...acc, balance: acc.balance - data.amount }; 
            } 
            return acc; 
          }));
          
          toast.success(`Split expense of $${data.amount.toFixed(2)} added across ${splitTransactions.length} categories.`);
        } else {
          // Handle regular expense
          const newExpense: Expense = { ...data, id: `exp_${Date.now()}`, date: dateToAdd };
          setExpenses(prev => [...prev, newExpense]);
          setAccounts(prevAccounts => prevAccounts.map(acc => { 
            if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { 
              return { ...acc, balance: acc.balance - data.amount }; 
            } 
            return acc; 
          }));
          toast.success(`Expense of $${data.amount.toFixed(2)} added.`);
        }
     } catch (error) { console.error("Error adding expense:", error); toast.error("Failed to add expense."); }
  };

  const handleAddIncome = (data: { accountId: string; amount: number; source: string; date: Date; description: string }) => {
     try {
       let dateToAdd = data.date;
        if (data.date && !(data.date instanceof Date)) {
           const parsed = parseISO(data.date as any as string);
           if (isValid(parsed)) dateToAdd = parsed; 
           else { toast.error("Invalid income date."); return; }
        }
        const newIncome: Income = { ...data, id: `inc_${Date.now()}`, date: dateToAdd };
        setIncome(prev => [...prev, newIncome]);
        setAccounts(prevAccounts => prevAccounts.map(acc => { 
          if (acc.id === data.accountId && acc.type !== 'Fixed Deposit' && acc.balance !== undefined) { 
            return { ...acc, balance: acc.balance + data.amount }; 
          } 
          return acc; 
        }));
        toast.success(`Income of $${data.amount.toFixed(2)} added.`);
    } catch (error) { console.error("Error adding income:", error); toast.error("Failed to add income."); }
  };

  // --- AI Query Handler ---
  const handleAIQuery = async (query: string): Promise<string> => {
     toast.info("Processing your question...");
     await new Promise(resolve => setTimeout(resolve, 1500)); 
     const lowerQuery = query.toLowerCase();
     if (lowerQuery.includes("total expense")) { return `Your total recorded expenses are $${totalExpenses.toFixed(2)}.`; }
     if (lowerQuery.includes("total income")) { return `Your total recorded income is $${totalIncome.toFixed(2)}.`; }
     if (lowerQuery.match(/how much.*spent on (\w+)/)) { 
        const match = lowerQuery.match(/spent on (\w+)/); 
        const category = match ? match[1] : null;
        if (category) { 
          const categoryExpenses = expenses.filter(e => e.category.toLowerCase().includes(category.toLowerCase())); 
          const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0); 
          if (categoryTotal > 0) { 
            return `You spent $${categoryTotal.toFixed(2)} on ${category}.`; 
          } else { 
            return `You haven't recorded any spending for the category: ${category}.`; 
          } 
        } else { 
          return "Please specify a category (e.g., 'spent on groceries')."; 
        }
     }
     if (lowerQuery.includes("balance")) { return `Your current liquid balance (Bank + Cash) is $${currentLiquidBalance.toFixed(2)}.`; }
     return "I'm still learning! Try asking about your total income/expenses, spending on a specific category, or your current balance."; 
   };

  // --- Memoized Calculations ---
  const nonFdAccounts = useMemo(() => accounts.filter(acc => acc.type !== 'Fixed Deposit'), [accounts]);
  const fdAccounts = useMemo(() => accounts.filter(acc => acc.type === 'Fixed Deposit'), [accounts]);
  const totalIncome = useMemo(() => income.reduce((sum, item) => sum + item.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const currentLiquidBalance = useMemo(() => nonFdAccounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0), [nonFdAccounts]);
  const currentDate = useMemo(() => format(new Date(), 'MMMM d, yyyy'), []);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <DashboardHeader onSearch={handleSearch} />
      <SearchResults
        query={searchQuery}
        expenses={expenses}
        income={income}
        accounts={accounts}
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
      />
      <main ref={contentRef} className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Financial Dashboard
            </h1>
            <p className="text-[#86868B] dark:text-[#A1A1A6] text-sm font-medium">
              Track, analyze, and manage your finances
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center">
            <div className="bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
              <span className="text-sm text-[#86868B] dark:text-[#A1A1A6] font-medium">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */} 
        <div ref={metricsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="metric-card border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Income</CardTitle>
              <div className="p-1.5 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full">
                <ArrowUpCircle className="h-5 w-5 text-[#34C759] dark:text-[#30D158]" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Across all income sources</p>
            </CardContent>
          </Card>
          
          <Card className="metric-card border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Expenses</CardTitle>
              <div className="p-1.5 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full">
                <Activity className="h-5 w-5 text-[#FF3B30] dark:text-[#FF453A]" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Tracked across accounts</p>
            </CardContent>
          </Card>
          
          <Card className="metric-card border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Liquid Balance</CardTitle>
              <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
                <CreditCard className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-2xl font-semibold ${currentLiquidBalance >= 0 ? 'text-[#1D1D1F] dark:text-white' : 'text-[#FF3B30] dark:text-[#FF453A]'}`}>
                ${currentLiquidBalance.toFixed(2)}
              </div>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Sum of Bank & Cash accounts</p>
            </CardContent>
          </Card>
          
          <div className="metric-card">
            <Budget totalExpenses={totalExpenses} /> 
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Accounts & Transaction Forms */}
          <div ref={columnOneRef} className="lg:col-span-4 space-y-6">
            <AccountList accounts={accounts} />
            
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  Add Transaction
                </CardTitle>
                <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
                  Record new expenses or income
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs defaultValue="expense" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 p-1 mb-3 bg-[#F2F2F7] dark:bg-[#38383A] rounded-full">
                    <TabsTrigger 
                      value="expense" 
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
                    >
                      Expense
                    </TabsTrigger>
                    <TabsTrigger 
                      value="income"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
                    >
                      Income
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recurring"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
                    >
                      Recurring
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="expense" className="space-y-4 mt-0">
                    <AddExpenseForm 
                      accounts={accounts} 
                      categories={availableExpenseCategoriesArray}
                      onAddExpense={handleAddExpense} 
                    />
                  </TabsContent>
                  <TabsContent value="income" className="space-y-4 mt-0">
                    <AddIncomeForm 
                      accounts={nonFdAccounts} 
                      incomeSources={availableIncomeSources} 
                      onAddIncome={handleAddIncome}
                    />
                  </TabsContent>
                  <TabsContent value="recurring" className="space-y-4 mt-0">
                    <AddRecurringTransactionForm 
                      accounts={nonFdAccounts} 
                      categories={availableExpenseCategoriesArray}
                      incomeSources={availableIncomeSources}
                      onAddRecurringTransaction={() => {}}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <AddAccountForm onAddAccount={handleAddAccount} />
          </div>

          {/* Middle Column: Recent Transactions */}
          <div ref={columnTwoRef} className="lg:col-span-5 space-y-6">
            {/* Recent Expenses */}
            <Expenses expenses={expenses} accounts={accounts} />
            
            {/* Income List */}
            <IncomeList income={income} accounts={accounts} />
            
            {/* Recurring Transactions */}
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white flex items-center">
                  <Repeat className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  Recurring Transactions
                </CardTitle>
                <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
                  Manage your recurring expenses and income
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <RecurringTransactionsList 
                  recurringTransactions={[]} 
                  onUpdateStatus={() => {}}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Insights & Fixed Deposits */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Query */}
            <AIQuery onQuerySubmit={handleAIQuery} />
            
            {/* Income Display Card */}
            <IncomeDisplay totalIncome={totalIncome} />
            
            {/* Fixed Deposits */}
            <FixedDepositList accounts={fdAccounts} />
            
            {/* AI Spending Insights */}
            <AISpendingInsights expenses={expenses} income={income} />
          </div>
        </div>
      </main>

      {/* Floating AI Assistant Button */}
      <motion.div 
        className="fixed z-30 bottom-6 right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          delay: 1,
          stiffness: 260, 
          damping: 20 
        }}
        onMouseEnter={() => setShowAITooltip(true)}
        onMouseLeave={() => setShowAITooltip(false)}
      >
        <AnimatePresence>
          {showAITooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 right-0 bg-white dark:bg-[#2C2C2E] rounded-lg px-3 py-2 text-sm font-medium shadow-lg whitespace-nowrap"
            >
              <div className="text-[#1D1D1F] dark:text-white">Open AI Assistant</div>
              <div className="absolute bottom-0 right-5 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-[#2C2C2E]"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Link href="/ai-assistant">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#007AFF] to-[#0A84FF] hover:from-[#0063CC] hover:to-[#006EDB] h-14 w-14 rounded-full flex items-center justify-center shadow-lg"
          >
            <BrainCircuit className="h-6 w-6 text-white" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

// Main component to properly handle Suspense for loading states
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
