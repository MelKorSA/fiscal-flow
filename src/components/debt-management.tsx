'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "sonner";
import { CreditCard, Wallet, PlusCircle, Trash2, Edit, BadgeDollarSign, TrendingDown, LineChart } from 'lucide-react';

// Types and schemas
export type Debt = {
  id: string;
  name: string;
  type: 'Credit Card' | 'Loan' | 'Mortgage' | 'Student Loan' | 'Other';
  amount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: Date;
  paymentDate?: Date;
  remainingPayments?: number;
  isPaid?: boolean;
};

const debtFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(['Credit Card', 'Loan', 'Mortgage', 'Student Loan', 'Other']),
  amount: z.number().positive({ message: "Amount must be a positive number." }),
  interestRate: z.number().min(0, { message: "Interest rate must be a positive number." }),
  minimumPayment: z.number().positive({ message: "Minimum payment must be a positive number." }),
  dueDate: z.date().optional(),
  paymentDate: z.date().optional(),
  remainingPayments: z.number().int().positive().optional(),
});

// Component
export function DebtManagement() {
  // Local storage key
  const LS_KEY_DEBTS = 'budgetAppDebts';

  // State
  const [debts, setDebts] = useState<Debt[]>([]);
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  // Form
  const form = useForm<z.infer<typeof debtFormSchema>>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      name: '',
      type: 'Credit Card',
      amount: 0,
      interestRate: 0,
      minimumPayment: 0,
    },
  });

  // Load debts from local storage
  useEffect(() => {
    const loadDebts = () => {
      try {
        const storedDebts = localStorage.getItem(LS_KEY_DEBTS);
        if (storedDebts) {
          const parsedDebts = JSON.parse(storedDebts);
          // Convert date strings to Date objects
          const formattedDebts = parsedDebts.map((debt: any) => ({
            ...debt,
            dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
            paymentDate: debt.paymentDate ? new Date(debt.paymentDate) : undefined,
          }));
          setDebts(formattedDebts);
        }
      } catch (error) {
        console.error('Error loading debts from localStorage:', error);
        toast.error('Failed to load debt data.');
      }
    };

    loadDebts();
  }, []);

  // Save debts to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_DEBTS, JSON.stringify(debts));
    } catch (error) {
      console.error('Error saving debts to localStorage:', error);
    }
  }, [debts]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof debtFormSchema>) => {
    try {
      if (editingDebtId) {
        // Update existing debt
        const updatedDebts = debts.map(debt => 
          debt.id === editingDebtId ? { ...values, id: debt.id } : debt
        );
        setDebts(updatedDebts);
        toast.success('Debt updated successfully!');
      } else {
        // Add new debt
        const newDebt: Debt = {
          ...values,
          id: `debt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        };
        setDebts([...debts, newDebt]);
        toast.success('New debt added successfully!');
      }
      
      // Reset form
      form.reset({
        name: '',
        type: 'Credit Card',
        amount: 0,
        interestRate: 0,
        minimumPayment: 0,
      });
      setEditingDebtId(null);
    } catch (error) {
      console.error('Error saving debt:', error);
      toast.error('Failed to save debt.');
    }
  };

  // Handle debt deletion
  const handleDeleteDebt = (id: string) => {
    try {
      setDebts(debts.filter(debt => debt.id !== id));
      toast.success('Debt deleted successfully!');
      
      // If we're currently editing this debt, reset the form
      if (editingDebtId === id) {
        form.reset({
          name: '',
          type: 'Credit Card',
          amount: 0,
          interestRate: 0,
          minimumPayment: 0,
        });
        setEditingDebtId(null);
      }
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast.error('Failed to delete debt.');
    }
  };

  // Handle debt edit
  const handleEditDebt = (debt: Debt) => {
    setEditingDebtId(debt.id);
    form.reset({
      name: debt.name,
      type: debt.type,
      amount: debt.amount,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment,
      dueDate: debt.dueDate,
      paymentDate: debt.paymentDate,
      remainingPayments: debt.remainingPayments,
    });
  };

  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  
  // Calculate monthly payment total
  const monthlyPaymentTotal = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  // Sort debts by highest interest rate (debt avalanche method)
  const debtsByHighestInterest = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  // Sort debts by lowest amount (debt snowball method)
  const debtsByLowestAmount = [...debts].sort((a, b) => a.amount - b.amount);

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Debt</CardTitle>
            <div className="p-1.5 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full">
              <CreditCard className="h-5 w-5 text-[#FF3B30] dark:text-[#FF453A]" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">${totalDebt.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Across all debts</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Monthly Payments</CardTitle>
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Wallet className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">${monthlyPaymentTotal.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Monthly minimum payments</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Debt Count</CardTitle>
            <div className="p-1.5 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full">
              <BadgeDollarSign className="h-5 w-5 text-[#34C759] dark:text-[#30D158]" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{debts.length}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Active debt accounts</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Add/Edit Debt Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                {editingDebtId ? 'Edit Debt' : 'Add New Debt'}
              </CardTitle>
              <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
                {editingDebtId ? 'Update your debt information' : 'Track a new loan or credit card'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1D1D1F] dark:text-white">Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Chase Credit Card" 
                            {...field} 
                            className="border-[#E5E5EA] dark:border-[#38383A] focus:border-[#007AFF] dark:focus:border-[#0A84FF]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF3B30] dark:text-[#FF453A]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1D1D1F] dark:text-white">Debt Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#E5E5EA] dark:border-[#38383A] focus:border-[#007AFF] dark:focus:border-[#0A84FF]">
                              <SelectValue placeholder="Select a debt type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                            <SelectItem value="Loan">Personal Loan</SelectItem>
                            <SelectItem value="Mortgage">Mortgage</SelectItem>
                            <SelectItem value="Student Loan">Student Loan</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#FF3B30] dark:text-[#FF453A]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1D1D1F] dark:text-white">Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            className="border-[#E5E5EA] dark:border-[#38383A] focus:border-[#007AFF] dark:focus:border-[#0A84FF]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF3B30] dark:text-[#FF453A]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1D1D1F] dark:text-white">Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="border-[#E5E5EA] dark:border-[#38383A] focus:border-[#007AFF] dark:focus:border-[#0A84FF]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF3B30] dark:text-[#FF453A]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minimumPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1D1D1F] dark:text-white">Minimum Payment ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="border-[#E5E5EA] dark:border-[#38383A] focus:border-[#007AFF] dark:focus:border-[#0A84FF]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF3B30] dark:text-[#FF453A]" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    {editingDebtId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingDebtId(null);
                          form.reset({
                            name: '',
                            type: 'Credit Card',
                            amount: 0,
                            interestRate: 0,
                            minimumPayment: 0,
                          });
                        }}
                        className="border-[#E5E5EA] dark:border-[#38383A] text-[#86868B] dark:text-[#A1A1A6]"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="bg-[#007AFF] hover:bg-[#0063CC] text-white"
                    >
                      {editingDebtId ? 'Update Debt' : 'Add Debt'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Debt list and strategies */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                Your Debt Strategies
              </CardTitle>
              <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
                View and manage your debts using popular payoff methods
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="all-debts" className="w-full">
                <TabsList className="grid w-full grid-cols-3 p-1 mb-3 bg-[#F2F2F7] dark:bg-[#38383A] rounded-full">
                  <TabsTrigger 
                    value="all-debts" 
                    className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm"
                  >
                    All Debts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="avalanche" 
                    className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm"
                  >
                    Avalanche Method
                  </TabsTrigger>
                  <TabsTrigger 
                    value="snowball" 
                    className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm"
                  >
                    Snowball Method
                  </TabsTrigger>
                </TabsList>
                
                {/* All Debts Tab */}
                <TabsContent value="all-debts">
                  {debts.length > 0 ? (
                    <div className="rounded-lg overflow-hidden border border-[#E5E5EA] dark:border-[#38383A]">
                      <Table>
                        <TableHeader className="bg-[#F2F2F7] dark:bg-[#38383A]">
                          <TableRow>
                            <TableHead className="text-[#1D1D1F] dark:text-white font-medium">Name</TableHead>
                            <TableHead className="text-[#1D1D1F] dark:text-white font-medium">Type</TableHead>
                            <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Amount</TableHead>
                            <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Interest</TableHead>
                            <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Payment</TableHead>
                            <TableHead className="text-[#1D1D1F] dark:text-white font-medium w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {debts.map((debt) => (
                            <TableRow key={debt.id} className="hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]/50">
                              <TableCell className="font-medium">{debt.name}</TableCell>
                              <TableCell>{debt.type}</TableCell>
                              <TableCell className="text-right">${debt.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{debt.interestRate}%</TableCell>
                              <TableCell className="text-right">${debt.minimumPayment.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2 justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditDebt(debt)} 
                                    className="h-8 w-8 p-0 text-[#007AFF] dark:text-[#0A84FF]"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteDebt(debt.id)} 
                                    className="h-8 w-8 p-0 text-[#FF3B30] dark:text-[#FF453A]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#F2F2F7] dark:bg-[#38383A]/30 rounded-lg">
                      <CreditCard className="h-12 w-12 text-[#86868B] dark:text-[#A1A1A6] mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-[#1D1D1F] dark:text-white mb-1">No debts added yet</h3>
                      <p className="text-sm text-[#86868B] dark:text-[#A1A1A6] max-w-sm">
                        Start tracking your debts by adding your credit cards, loans, or other debts using the form.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Avalanche Method Tab */}
                <TabsContent value="avalanche">
                  {debtsByHighestInterest.length > 0 ? (
                    <>
                      <div className="p-4 mb-4 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-lg">
                        <h3 className="text-lg font-medium text-[#1D1D1F] dark:text-white mb-1 flex items-center">
                          <TrendingDown className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                          Debt Avalanche Method
                        </h3>
                        <p className="text-sm text-[#86868B] dark:text-[#A1A1A6]">
                          Pay minimum payments on all debts, then put extra money toward the debt with the highest interest rate. This method saves you the most money in interest over time.
                        </p>
                      </div>
                    
                      <div className="rounded-lg overflow-hidden border border-[#E5E5EA] dark:border-[#38383A]">
                        <Table>
                          <TableHeader className="bg-[#F2F2F7] dark:bg-[#38383A]">
                            <TableRow>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium">Priority</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium">Name</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Amount</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Interest</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Payment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {debtsByHighestInterest.map((debt, index) => (
                              <TableRow key={debt.id} className={index === 0 ? "bg-[#EDF4FE]/30 dark:bg-[#1C3049]/30" : ""}>
                                <TableCell className="font-medium">
                                  {index === 0 ? (
                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-[#007AFF] text-white text-xs font-medium">
                                      Focus
                                    </span>
                                  ) : (
                                    <span className="text-[#86868B] dark:text-[#A1A1A6] font-medium">
                                      {index + 1}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>{debt.name}</TableCell>
                                <TableCell className="text-right">${debt.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-medium">{debt.interestRate}%</TableCell>
                                <TableCell className="text-right">${debt.minimumPayment.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#F2F2F7] dark:bg-[#38383A]/30 rounded-lg">
                      <TrendingDown className="h-12 w-12 text-[#86868B] dark:text-[#A1A1A6] mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-[#1D1D1F] dark:text-white mb-1">No debts to display</h3>
                      <p className="text-sm text-[#86868B] dark:text-[#A1A1A6] max-w-sm">
                        Add your debts to see the avalanche payoff strategy.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Snowball Method Tab */}
                <TabsContent value="snowball">
                  {debtsByLowestAmount.length > 0 ? (
                    <>
                      <div className="p-4 mb-4 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-lg">
                        <h3 className="text-lg font-medium text-[#1D1D1F] dark:text-white mb-1 flex items-center">
                          <BadgeDollarSign className="mr-2 h-5 w-5 text-[#34C759] dark:text-[#30D158]" />
                          Debt Snowball Method
                        </h3>
                        <p className="text-sm text-[#86868B] dark:text-[#A1A1A6]">
                          Pay minimum payments on all debts, then put extra money toward the smallest debt first. This method helps build momentum through quick wins.
                        </p>
                      </div>
                    
                      <div className="rounded-lg overflow-hidden border border-[#E5E5EA] dark:border-[#38383A]">
                        <Table>
                          <TableHeader className="bg-[#F2F2F7] dark:bg-[#38383A]">
                            <TableRow>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium">Priority</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium">Name</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Amount</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Interest</TableHead>
                              <TableHead className="text-[#1D1D1F] dark:text-white font-medium text-right">Payment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {debtsByLowestAmount.map((debt, index) => (
                              <TableRow key={debt.id} className={index === 0 ? "bg-[#E5F8EF]/30 dark:bg-[#0C372A]/30" : ""}>
                                <TableCell className="font-medium">
                                  {index === 0 ? (
                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-[#34C759] text-white text-xs font-medium">
                                      Focus
                                    </span>
                                  ) : (
                                    <span className="text-[#86868B] dark:text-[#A1A1A6] font-medium">
                                      {index + 1}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>{debt.name}</TableCell>
                                <TableCell className="text-right font-medium">${debt.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{debt.interestRate}%</TableCell>
                                <TableCell className="text-right">${debt.minimumPayment.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#F2F2F7] dark:bg-[#38383A]/30 rounded-lg">
                      <BadgeDollarSign className="h-12 w-12 text-[#86868B] dark:text-[#A1A1A6] mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-[#1D1D1F] dark:text-white mb-1">No debts to display</h3>
                      <p className="text-sm text-[#86868B] dark:text-[#A1A1A6] max-w-sm">
                        Add your debts to see the snowball payoff strategy.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}