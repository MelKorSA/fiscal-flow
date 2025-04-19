'use client';

import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CalendarIcon, Repeat, DollarSign, CreditCard, 
  CalendarDays, Clock, ArrowRight, RotateCw, 
  CheckCircle, Calendar as CalendarIcon2
} from "lucide-react";
import { format } from "date-fns";
import { gsap } from "gsap";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RecurrenceFrequency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExpenseCategory } from "@/config/expense-categories";
import { CategorySelect } from "@/components/ui/category-select";

export type Account = {
  id: string;
  name: string;
};

type AddRecurringTransactionFormProps = {
  accounts: Account[];
  categories: ExpenseCategory[];
  incomeSources: string[];
  onAddRecurringTransaction?: (data: any) => void;
};

const recurringTransactionSchema = z.object({
  accountId: z.string({ required_error: "Account is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"], { 
    required_error: "Frequency is required" 
  }),
  endType: z.enum(["never", "after", "on"], { required_error: "End type is required" }),
  occurrences: z.coerce.number().int().positive().optional(),
  endDate: z.date().optional(),
  type: z.enum(["expense", "income"], { required_error: "Type is required" }),
  category: z.string().optional(),
  source: z.string().optional(),
});

// Helper function to get icon and color for frequency
const getFrequencyDetails = (frequency: RecurrenceFrequency) => {
  switch(frequency) {
    case 'daily':
      return { icon: <CalendarDays className="h-4 w-4" />, color: 'text-purple-500 dark:text-purple-400' };
    case 'weekly':
      return { icon: <Calendar className="h-4 w-4" />, color: 'text-blue-500 dark:text-blue-400' };
    case 'bi-weekly':
      return { icon: <CalendarIcon2 className="h-4 w-4" />, color: 'text-cyan-500 dark:text-cyan-400' };
    case 'monthly':
      return { icon: <CalendarIcon className="h-4 w-4" />, color: 'text-indigo-500 dark:text-indigo-400' };
    case 'quarterly':
      return { icon: <Clock className="h-4 w-4" />, color: 'text-emerald-500 dark:text-emerald-400' };
    case 'yearly':
      return { icon: <RotateCw className="h-4 w-4" />, color: 'text-amber-500 dark:text-amber-400' };
    default:
      return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-500 dark:text-gray-400' };
  }
};

export function AddRecurringTransactionForm({
  accounts,
  categories,
  incomeSources,
  onAddRecurringTransaction = () => {},
}: AddRecurringTransactionFormProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof recurringTransactionSchema>>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      amount: 0,
      type: "expense",
      startDate: new Date(),
      frequency: "monthly",
      endType: "never",
    },
  });

  const transactionType = form.watch("type");
  const endType = form.watch("endType");
  const frequency = form.watch("frequency");
  
  // Animation when dialog opens
  useEffect(() => {
    if (open && dialogContentRef.current) {
      // Animate dialog content
      gsap.fromTo(
        dialogContentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [open]);

  // Animation for form sections
  useEffect(() => {
    if (open && formRef.current) {
      // Staggered animation for form fields
      gsap.fromTo(
        formRef.current.querySelectorAll('.form-field'),
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.05, 
          ease: "power1.out",
          delay: 0.2
        }
      );
    }
  }, [open]);

  const onSubmit = (data: z.infer<typeof recurringTransactionSchema>) => {
    // Show submit animation
    if (formRef.current) {
      gsap.to(formRef.current, { 
        scale: 0.98, 
        opacity: 0.8, 
        duration: 0.2,
        onComplete: () => {
          // Prepare data for submission
          const recurringTransaction = {
            ...data,
            status: "active" as const,
            nextOccurrence: data.startDate,
          };
          
          onAddRecurringTransaction(recurringTransaction);
          form.reset();
          setOpen(false);
        }
      });
    } else {
      // Fallback if ref not available
      const recurringTransaction = {
        ...data,
        status: "active" as const,
        nextOccurrence: data.startDate,
      };
      
      onAddRecurringTransaction(recurringTransaction);
      form.reset();
      setOpen(false);
    }
  };

  const { icon: FrequencyIcon, color: frequencyColor } = getFrequencyDetails(frequency as RecurrenceFrequency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-gradient-to-r from-[#F8F8FA]/80 to-white/70 dark:from-[#2C2C2E]/80 dark:to-[#3A3A3C]/70 hover:shadow-md transition-all hover:-translate-y-[1px] backdrop-blur-md border-[#DADADC] dark:border-[#48484A]"
        >
          <Repeat className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
          <span>Add Recurring</span>
        </Button>
      </DialogTrigger>
      <DialogContent 
        ref={dialogContentRef} 
        className="max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] shadow-xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-[#E5F8EF] dark:bg-[#0C372A] text-[#34C759] dark:text-[#30D158]">
              <Repeat className="h-4 w-4" />
            </div>
            <span>Add Recurring Transaction</span>
          </DialogTitle>
          <DialogDescription className="text-[#86868B] dark:text-[#98989D]">
            Create a transaction that repeats automatically at your chosen frequency
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-field">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">Transaction Type</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 dark:text-red-400">-</span>
                            <span>Expense</span>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-1">
                            <span className="text-green-500 dark:text-green-400">+</span>
                            <span>Income</span>
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />
            </div>

            <div className="form-field">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Account</span>
                      </div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] rounded-xl">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg">
                        {accounts.map((account) => (
                          <SelectItem 
                            key={account.id} 
                            value={account.id} 
                            className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]"
                          >
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-field">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Amount</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6]" />
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          className="pl-9 bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] rounded-xl"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-field">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Description" 
                        {...field}
                        className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] rounded-xl" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-field">
              {transactionType === "expense" ? (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#86868B] dark:text-[#98989D]">Category</FormLabel>
                      <FormControl>
                        <CategorySelect 
                          value={field.value || ''} 
                          onValueChange={field.onChange} 
                          disabled={form.formState.isSubmitting}
                          placeholder="Select category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#86868B] dark:text-[#98989D]">Source</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Income source" 
                          {...field}
                          className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="form-field">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>Start Date</span>
                      </div>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] rounded-xl pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="rounded-md border-[#DADADC] dark:border-[#48484A]"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-field">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">
                      <div className="flex items-center gap-1.5">
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Frequency</span>
                      </div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md border-[#DADADC] dark:border-[#48484A] rounded-xl">
                          <SelectValue placeholder="Select frequency">
                            <div className="flex items-center gap-1.5">
                              <span className={frequencyColor}>{FrequencyIcon}</span>
                              <span>{field.value.charAt(0).toUpperCase() + field.value.slice(1)}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg">
                        <SelectItem value="daily" className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                            <span>Daily</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="weekly" className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span>Weekly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bi-weekly" className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                            <span>Bi-Weekly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="monthly" className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                            <span>Monthly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="quarterly" className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            <span>Quarterly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="yearly" className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A]">
                          <div className="flex items-center gap-1.5">
                            <RotateCw className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            <span>Yearly</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-field pt-2">
              <FormField
                control={form.control}
                name="endType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[#86868B] dark:text-[#98989D]">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Ends</span>
                      </div>
                    </FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3 border border-[#DADADC] dark:border-[#48484A] rounded-xl p-3 bg-white/40 dark:bg-[#3A3A3C]/40 backdrop-blur-sm"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="never" className="border-[#007AFF] dark:border-[#0A84FF]" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-1.5">
                            <RotateCw className="h-3.5 w-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                            <span>Never (continues indefinitely)</span>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="after" className="border-[#007AFF] dark:border-[#0A84FF]" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                            <span>After</span>
                          </div>
                        </FormLabel>
                        {endType === "after" && (
                          <div className="flex items-center gap-2 ml-2">
                            <FormField
                              control={form.control}
                              name="occurrences"
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-8 w-20 bg-white/60 dark:bg-[#3A3A3C]/60 border-[#DADADC] dark:border-[#48484A] rounded-lg"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                  />
                                </FormControl>
                              )}
                            />
                            <span className="text-[#86868B] dark:text-[#98989D]">occurrences</span>
                          </div>
                        )}
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="on" className="border-[#007AFF] dark:border-[#0A84FF]" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                            <span>On date</span>
                          </div>
                        </FormLabel>
                        {endType === "on" && (
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className="ml-2 h-8 pl-3 text-left font-normal bg-white/60 dark:bg-[#3A3A3C]/60 border-[#DADADC] dark:border-[#48484A] rounded-lg"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className="border-[#DADADC] dark:border-[#48484A]"
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                          />
                        )}
                      </FormItem>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-2 form-field">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#007AFF] to-[#0071E3] hover:from-[#0077ED] hover:to-[#006DD8] dark:from-[#0A84FF] dark:to-[#0079E0] dark:hover:from-[#0A7FF5] dark:hover:to-[#0074D5] text-white rounded-xl py-2 px-4 font-medium transition-all hover:-translate-y-[1px] hover:shadow-md disabled:opacity-70"
              >
                <span>Add Recurring Transaction</span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}