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
import { FinancialGoals } from '@/components/financial-goals';
import { DashboardHeader } from '@/components/dashboard-header';
import { SearchResults } from '@/components/search-results/search-results';
import { RecurringTransactionsList } from '@/components/recurring-transactions-list';
import { AddRecurringTransactionForm } from '@/components/add-recurring-transaction-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, LayoutGrid, Activity, Banknote, ChevronDown, BarChart3, 
  CreditCard, ArrowUpCircle, Repeat, BrainCircuit, Target, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseISO, isValid, format } from 'date-fns';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { availableMainCategoriesArray } from '@/config/expense-categories';
import DashboardLoading from './loading';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Transaction = { id: string; accountId: string; amount: number; date: Date; description: string; };
type Expense = Transaction & { category: string; };
type Income = Transaction & { source: string; };
export type Account = { id: string; name: string; type: 'Bank Account' | 'Cash' | 'Fixed Deposit'; balance?: number; startDate?: Date; tenureMonths?: number; interestRate?: number; };

// --- Income Sources ---
const availableIncomeSources = ["Salary", "Freelance", "Investment", "Gift", "Bonus", "Interest", "Other"];

function DashboardContent() {
  // --- State Initialization ---
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showAITooltip, setShowAITooltip] = useState(false);
  const [activeTab, setActiveTab] = useState('goals-overview');
  
  // Animation refs
  const contentRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const columnOneRef = useRef<HTMLDivElement>(null);
  const columnTwoRef = useRef<HTMLDivElement>(null);
  const goalsSectionRef = useRef<HTMLDivElement>(null);
  
  // Fetch data from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const accountsWithDates = data.map((account: any) => ({
            ...account,
            startDate: account.startDate ? new Date(account.startDate) : undefined,
          }));
          setAccounts(accountsWithDates);
        } else {
          console.error('Failed to fetch accounts');
          toast.error('Failed to load accounts');
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        toast.error('Error loading accounts');
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const expensesWithDates = data.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          }));
          setExpenses(expensesWithDates);
        } else {
          console.error('Failed to fetch expenses');
          toast.error('Failed to load expenses');
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        toast.error('Error loading expenses');
      }
    };

    const fetchIncome = async () => {
      try {
        const response = await fetch('/api/income');
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const incomeWithDates = data.map((inc: any) => ({
            ...inc,
            date: new Date(inc.date),
          }));
          setIncome(incomeWithDates);
        } else {
          console.error('Failed to fetch income');
          toast.error('Failed to load income');
        }
      } catch (error) {
        console.error('Error fetching income:', error);
        toast.error('Error loading income');
      }
    };

    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAccounts(), fetchExpenses(), fetchIncome()]);
      setIsLoading(false);
    };

    loadAllData();
  }, []);
  
  // Setup content animations after loading
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      // Animate goals section first
      if (goalsSectionRef.current) {
        gsap.fromTo(
          goalsSectionRef.current,
          { opacity: 0, y: -20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            ease: 'power2.out',
            onComplete: () => {
              // After goals animation, animate other sections
              // Stagger animation for main content sections
              gsap.fromTo(
                contentRef.current!,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
              );
            }
          }
        );
      }
      
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
            delay: 0.5,
            ease: 'back.out(1.2)',
          }
        );
      }
      
      // Animate columns with slight delay
      gsap.fromTo(
        columnOneRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.7, ease: 'power2.out' }
      );
      
      gsap.fromTo(
        columnTwoRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.9, ease: 'power2.out' }
      );
    }
  }, [isLoading]);

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

  // --- State Update Handlers with API calls ---
  const handleAddAccount = async (newAccountData: Omit<Account, 'id'>) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountData),
      });

      if (!response.ok) {
        throw new Error('Failed to add account');
      }

      const newAccount = await response.json();
      
      // Update local state with the new account
      setAccounts(prev => [...prev, {
        ...newAccount,
        startDate: newAccount.startDate ? new Date(newAccount.startDate) : undefined,
      }]);
      
      toast.success(`Account "${newAccount.name}" added successfully!`);
    } catch (error) {
      console.error("Error adding account:", error);
      toast.error("Failed to add account");
    }
  };

  const handleAddExpense = async (data: { 
    accountId: string; 
    amount: number; 
    category: string; 
    date: Date; 
    description: string;
    splitItems?: Array<{id: string; category: string; amount: number}>; 
  }) => {
    try {
      if (data.splitItems && data.splitItems.length > 0) {
        // Handle split transactions
        const promises = data.splitItems.map(splitItem => 
          fetch('/api/expenses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accountId: data.accountId,
              amount: splitItem.amount,
              category: splitItem.category,
              date: data.date,
              description: `${data.description || 'Split transaction'} (${splitItem.category})`,
            }),
          })
        );

        await Promise.all(promises);
        
        // Refresh expenses data
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const updatedExpenses = await response.json();
          setExpenses(updatedExpenses.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          })));
          
          // Refresh accounts to get updated balances
          const accountsResponse = await fetch('/api/accounts');
          if (accountsResponse.ok) {
            const updatedAccounts = await accountsResponse.json();
            setAccounts(updatedAccounts.map((account: any) => ({
              ...account,
              startDate: account.startDate ? new Date(account.startDate) : undefined,
            })));
          }
          
          toast.success(`Split expense of $${data.amount.toFixed(2)} added across ${data.splitItems.length} categories.`);
        }
      } else {
        // Handle regular expense
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to add expense');
        }

        const newExpense = await response.json();
        
        // Update local state with the new expense
        setExpenses(prev => [...prev, {
          ...newExpense,
          date: new Date(newExpense.date),
        }]);
        
        // Fetch updated account balances
        const accountsResponse = await fetch('/api/accounts');
        if (accountsResponse.ok) {
          const updatedAccounts = await accountsResponse.json();
          setAccounts(updatedAccounts.map((account: any) => ({
            ...account,
            startDate: account.startDate ? new Date(account.startDate) : undefined,
          })));
        }
        
        toast.success(`Expense of $${data.amount.toFixed(2)} added.`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const handleAddIncome = async (data: { 
    accountId: string; 
    amount: number; 
    source: string; 
    date: Date; 
    description: string 
  }) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add income');
      }

      const newIncome = await response.json();
      
      // Update local state with the new income
      setIncome(prev => [...prev, {
        ...newIncome,
        date: new Date(newIncome.date),
      }]);
      
      // Fetch updated account balances
      const accountsResponse = await fetch('/api/accounts');
      if (accountsResponse.ok) {
        const updatedAccounts = await accountsResponse.json();
        setAccounts(updatedAccounts.map((account: any) => ({
          ...account,
          startDate: account.startDate ? new Date(account.startDate) : undefined,
        })));
      }
      
      toast.success(`Income of $${data.amount.toFixed(2)} added.`);
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to add income");
    }
  };

  // --- AI Query Handler ---
  const handleAIQuery = async (query: string): Promise<string> => {
    toast.info("Processing your question...");
    
    try {
      const response = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          accounts,
          expenses,
          income,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process AI query');
      }

      const data = await response.json();
      return data.response || "I couldn't find an answer to that question.";
    } catch (error) {
      console.error("Error with AI query:", error);
      return "I'm having trouble processing your question. Please try again.";
    }
  };

  // --- Memoized Calculations ---
  const nonFdAccounts = useMemo(() => accounts.filter(acc => acc.type !== 'Fixed Deposit'), [accounts]);
  const fdAccounts = useMemo(() => accounts.filter(acc => acc.type === 'Fixed Deposit'), [accounts]);
  const totalIncome = useMemo(() => income.reduce((sum, item) => sum + item.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const currentLiquidBalance = useMemo(() => nonFdAccounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0), [nonFdAccounts]);
  const currentDate = useMemo(() => format(new Date(), 'MMMM d, yyyy'), []);
  const currentSavings = useMemo(() => {
    // Calculate savings from income and expenses
    return Math.max(0, totalIncome - totalExpenses);
  }, [totalIncome, totalExpenses]);

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
      
      {/* Goals Section - Positioned at the top */}
      <div 
        ref={goalsSectionRef} 
        className="px-5 md:px-6 lg:px-8 pt-5 md:pt-6 lg:pt-8" 
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
          <div>
            <h1 className="text-3xl font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Financial Dashboard
            </h1>
            <p className="text-[#86868B] dark:text-[#A1A1A6] text-sm font-medium">
              Track your financial goals and progress
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <div className="bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
              <span className="text-sm text-[#86868B] dark:text-[#A1A1A6] font-medium">{currentDate}</span>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation for Goals and Overview */}
        <Tabs defaultValue="goals-overview" className="w-full mb-5" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-2">
            <TabsTrigger value="goals-overview">
              <Target className="h-4 w-4 mr-2" />
              Goals Overview
            </TabsTrigger>
            <TabsTrigger value="financial-metrics">
              <Activity className="h-4 w-4 mr-2" />
              Financial Metrics
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Goals View */}
        {activeTab === 'goals-overview' && (
          <FinancialGoals currentSavings={currentSavings} />
        )}
        
        {/* Financial Metrics View - Similar to the original dashboard key metrics */}
        {activeTab === 'financial-metrics' && (
          <div ref={metricsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        )}
        
        {/* Finances Quick Links */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">
            Manage Your Finances
          </h2>
          
          <div className="flex gap-2">
            <Link href="/debt-management">
              <Button variant="outline" size="sm" className="flex items-center gap-1 h-9">
                <span>Debt Management</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/zero-budget">
              <Button variant="outline" size="sm" className="flex items-center gap-1 h-9">
                <span>Zero Budgeting</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <main ref={contentRef} className="flex-1 overflow-y-auto px-5 md:px-6 lg:px-8 pb-8 w-full">
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
                      categories={availableMainCategoriesArray}
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
                      categories={availableMainCategoriesArray}
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
