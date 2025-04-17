'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Search, ArrowUpCircle, Activity, Filter } from 'lucide-react'
import { Badge } from '../ui/badge'
import { format } from 'date-fns'
import { ScrollArea } from '../ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { AnimatePresence, motion } from 'framer-motion'

type Transaction = { 
  id: string; 
  accountId: string; 
  amount: number; 
  date: Date; 
  description: string; 
};

type Expense = Transaction & { category: string; };
type Income = Transaction & { source: string; };
type Account = { 
  id: string; 
  name: string; 
  type: 'Bank Account' | 'Cash' | 'Fixed Deposit'; 
  balance?: number; 
  startDate?: Date; 
  tenureMonths?: number; 
  interestRate?: number; 
};

interface SearchResultsProps {
  query: string;
  expenses: Expense[];
  income: Income[];
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
}

export function SearchResults({ query, expenses, income, accounts, isOpen, onClose }: SearchResultsProps) {
  if (!isOpen || !query) return null;

  const lowerQuery = query.toLowerCase();
  
  // Filter expenses by query
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(lowerQuery) ||
    expense.category.toLowerCase().includes(lowerQuery) ||
    `$${expense.amount}`.includes(lowerQuery) ||
    (accounts.find(acc => acc.id === expense.accountId)?.name || '').toLowerCase().includes(lowerQuery)
  );
  
  // Filter income by query
  const filteredIncome = income.filter(inc => 
    inc.description.toLowerCase().includes(lowerQuery) ||
    inc.source.toLowerCase().includes(lowerQuery) ||
    `$${inc.amount}`.includes(lowerQuery) ||
    (accounts.find(acc => acc.id === inc.accountId)?.name || '').toLowerCase().includes(lowerQuery)
  );
  
  // Get account names for lookups
  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-16 left-0 right-0 mx-auto max-w-3xl z-50 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#F2F2F7] dark:border-[#38383A]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
                    <Search className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                  </div>
                  <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">
                    Search Results for "{query}"
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-[#F2F2F7] dark:bg-[#38383A] text-xs">
                  {filteredExpenses.length + filteredIncome.length} results
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="all" className="w-full">
                  <div className="px-4 pt-3">
                    <TabsList className="grid w-full grid-cols-3 p-1 mb-2 bg-[#F2F2F7] dark:bg-[#38383A] rounded-full">
                      <TabsTrigger 
                        value="all" 
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text-white transition-all text-xs"
                      >
                        All Results
                      </TabsTrigger>
                      <TabsTrigger 
                        value="expenses" 
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text-white transition-all text-xs"
                      >
                        Expenses ({filteredExpenses.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="income" 
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text-white transition-all text-xs"
                      >
                        Income ({filteredIncome.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    <TabsContent value="all" className="p-0 m-0">
                      {filteredExpenses.length === 0 && filteredIncome.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Filter className="h-10 w-10 text-[#C7C7CC] dark:text-[#48484A] mb-2" />
                          <p className="text-[#8A8A8E] dark:text-[#8E8E93] text-sm">No matching transactions found</p>
                          <p className="text-[#8A8A8E] dark:text-[#8E8E93] text-xs mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
                          {filteredExpenses.map((expense) => (
                            <div key={expense.id} className="px-4 py-3 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center">
                                    <div className="p-1 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full mr-2">
                                      <Activity className="h-3 w-3 text-[#FF3B30] dark:text-[#FF453A]" />
                                    </div>
                                    <p className="font-medium text-sm text-[#1D1D1F] dark:text-white">
                                      {expense.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-[#F2F2F7]/50 dark:bg-[#38383A]/50">
                                      {expense.category}
                                    </Badge>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {getAccountName(expense.accountId)}
                                    </span>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {format(new Date(expense.date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                                  -${expense.amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {filteredIncome.map((inc) => (
                            <div key={inc.id} className="px-4 py-3 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center">
                                    <div className="p-1 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full mr-2">
                                      <ArrowUpCircle className="h-3 w-3 text-[#34C759] dark:text-[#30D158]" />
                                    </div>
                                    <p className="font-medium text-sm text-[#1D1D1F] dark:text-white">
                                      {inc.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-[#F2F2F7]/50 dark:bg-[#38383A]/50">
                                      {inc.source}
                                    </Badge>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {getAccountName(inc.accountId)}
                                    </span>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {format(new Date(inc.date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-semibold text-[#34C759] dark:text-[#30D158]">
                                  +${inc.amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="expenses" className="p-0 m-0">
                      {filteredExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Filter className="h-10 w-10 text-[#C7C7CC] dark:text-[#48484A] mb-2" />
                          <p className="text-[#8A8A8E] dark:text-[#8E8E93] text-sm">No matching expenses found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
                          {filteredExpenses.map((expense) => (
                            <div key={expense.id} className="px-4 py-3 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center">
                                    <div className="p-1 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full mr-2">
                                      <Activity className="h-3 w-3 text-[#FF3B30] dark:text-[#FF453A]" />
                                    </div>
                                    <p className="font-medium text-sm text-[#1D1D1F] dark:text-white">
                                      {expense.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-[#F2F2F7]/50 dark:bg-[#38383A]/50">
                                      {expense.category}
                                    </Badge>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {getAccountName(expense.accountId)}
                                    </span>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {format(new Date(expense.date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                                  -${expense.amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="income" className="p-0 m-0">
                      {filteredIncome.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Filter className="h-10 w-10 text-[#C7C7CC] dark:text-[#48484A] mb-2" />
                          <p className="text-[#8A8A8E] dark:text-[#8E8E93] text-sm">No matching income found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#F2F2F7] dark:divide-[#38383A]">
                          {filteredIncome.map((inc) => (
                            <div key={inc.id} className="px-4 py-3 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50 transition-colors">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center">
                                    <div className="p-1 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full mr-2">
                                      <ArrowUpCircle className="h-3 w-3 text-[#34C759] dark:text-[#30D158]" />
                                    </div>
                                    <p className="font-medium text-sm text-[#1D1D1F] dark:text-white">
                                      {inc.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-[#F2F2F7]/50 dark:bg-[#38383A]/50">
                                      {inc.source}
                                    </Badge>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {getAccountName(inc.accountId)}
                                    </span>
                                    <span className="text-xs text-[#8A8A8E] dark:text-[#8E8E93]">
                                      {format(new Date(inc.date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-semibold text-[#34C759] dark:text-[#30D158]">
                                  +${inc.amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}