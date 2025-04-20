'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult, 
  DroppableProvided, 
  DraggableProvided 
} from '@hello-pangea/dnd';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Target, Trash2, DollarSign, Plus, PiggyBank, Info, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { 
  availableMainCategoriesArray, 
  getExpenseCategoryDetails,
  MainExpenseCategory,
  getFlatCategoryOptions
} from '@/config/expense-categories';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { CategorySelect } from '@/components/ui/category-select';

// Local storage keys
const LS_KEYS = {
  ZERO_BUDGET_TOTAL: 'zeroBudgetTotal',
  ZERO_BUDGET_ALLOCATIONS: 'zeroBudgetAllocations',
  MONTHLY_BUDGET: 'monthlyBudgetAmount',
};

// Types
interface BudgetAllocation {
  id: string;
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Define the structure for a single template allocation
interface TemplateAllocation {
  category: string;
  percentage: number;
}

// Define the structure for a single budget template
interface BudgetTemplate {
  name: string;
  description: string;
  allocations: TemplateAllocation[];
}

// Define the type for the keys of budgetTemplates
type BudgetTemplateKey = keyof typeof budgetTemplates;

// Budget Templates Definition
const budgetTemplates = {
  '50/30/20': {
    name: '50/30/20 Rule',
    description: 'Balances needs (50%), wants (30%), and savings/debt (20%).',
    allocations: [
      { category: 'Housing', percentage: 25 },
      { category: 'Utilities', percentage: 5 },
      { category: 'Food', percentage: 10 },
      { category: 'Transport', percentage: 10 }, // Needs = 50%
      { category: 'Entertainment', percentage: 10 },
      { category: 'Dining Out', percentage: 10 },
      { category: 'Shopping', percentage: 10 }, // Wants = 30%
      { category: 'Savings', percentage: 15 },
      { category: 'Debt Repayment', percentage: 5 }, // Savings/Debt = 20%
    ],
  },
  'student': {
    name: 'Student Budget',
    description: 'Focuses on essentials and minimizing discretionary spending.',
    allocations: [
      { category: 'Housing', percentage: 30 },
      { category: 'Food', percentage: 15 },
      { category: 'Tuition/Fees', percentage: 20 },
      { category: 'Books & Supplies', percentage: 5 },
      { category: 'Transport', percentage: 10 },
      { category: 'Utilities', percentage: 5 },
      { category: 'Personal Care', percentage: 5 },
      { category: 'Savings', percentage: 5 },
      { category: 'Entertainment', percentage: 5 },
    ],
  },
  'debt-reduction': {
    name: 'Debt Reduction Focus',
    description: 'Prioritizes paying down debt aggressively.',
    allocations: [
      { category: 'Housing', percentage: 25 },
      { category: 'Utilities', percentage: 5 },
      { category: 'Food', percentage: 10 },
      { category: 'Transport', percentage: 10 },
      { category: 'Debt Repayment', percentage: 30 }, // High debt focus
      { category: 'Savings', percentage: 10 }, // Still save something
      { category: 'Personal Care', percentage: 5 },
      { category: 'Entertainment', percentage: 5 }, // Minimal wants
    ],
  },
};

export default function ZeroBudgetPage() {
  // State
  const [income, setIncome] = useState<number>(0);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [unallocated, setUnallocated] = useState<number>(0);
  const [newCategory, setNewCategory] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  
  // Refs for animations
  const headerRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Helper function to assign refs to the array
  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[index] = el;
  };

  // Load saved data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to get existing budget first
      const savedBudget = localStorage.getItem(LS_KEYS.MONTHLY_BUDGET);
      const savedTotal = localStorage.getItem(LS_KEYS.ZERO_BUDGET_TOTAL);
      const savedAllocations = localStorage.getItem(LS_KEYS.ZERO_BUDGET_ALLOCATIONS);
      
      // Initialize the income/total budget
      if (savedTotal) {
        setIncome(parseFloat(savedTotal));
      } else if (savedBudget) {
        const parsed = parseFloat(savedBudget);
        if (!isNaN(parsed)) {
          setIncome(parsed);
          localStorage.setItem(LS_KEYS.ZERO_BUDGET_TOTAL, parsed.toString());
        }
      }
      
      // Initialize allocations
      if (savedAllocations) {
        try {
          const parsed = JSON.parse(savedAllocations) as BudgetAllocation[];
          setAllocations(parsed);
        } catch (error) {
          console.error('Failed to parse saved allocations', error);
        }
      }
      
      // Simulate loading state for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  }, []);
  
  // Calculate unallocated amount whenever income or allocations change
  useEffect(() => {
    const allocated = allocations.reduce((sum, item) => sum + item.amount, 0);
    setUnallocated(Math.max(0, income - allocated));
    
    // Update percentages when income changes
    if (income > 0) {
      const updatedAllocations = allocations.map(item => ({
        ...item,
        percentage: (item.amount / income) * 100
      }));
      
      if (JSON.stringify(updatedAllocations) !== JSON.stringify(allocations)) {
        setAllocations(updatedAllocations);
      }
    }
  }, [income, allocations]);
  
  // Save allocations whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      localStorage.setItem(LS_KEYS.ZERO_BUDGET_ALLOCATIONS, JSON.stringify(allocations));
    }
  }, [allocations, isLoading]);
  
  // Setup animations after loading
  useEffect(() => {
    if (!isLoading) {
      // Animate header
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }
      
      // Animate cards with stagger
      if (cardRefs.current.length > 0) {
        gsap.fromTo(
          cardRefs.current.filter(el => el !== null),
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'back.out(1.2)' 
          }
        );
      }
    }
  }, [isLoading]);
  
  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(allocations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setAllocations(items);
  };
  
  // Update income/budget total
  const handleUpdateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('income') as HTMLInputElement;
    const value = parseFloat(input.value);
    
    if (!isNaN(value) && value > 0) {
      setIncome(value);
      localStorage.setItem(LS_KEYS.ZERO_BUDGET_TOTAL, value.toString());
      localStorage.setItem(LS_KEYS.MONTHLY_BUDGET, value.toString());
      toast.success(`Budget total updated to $${value.toFixed(2)}`);
    } else {
      toast.error('Please enter a valid budget amount');
    }
  };
  
  // Add new allocation
  const handleAddAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory) {
      toast.error('Please select a category');
      return;
    }
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > unallocated) {
      toast.error(`Amount exceeds unallocated budget ($${unallocated.toFixed(2)})`);
      return;
    }
    
    // Check if category already exists
    const existingIndex = allocations.findIndex(a => a.category === newCategory);
    
    if (existingIndex >= 0) {
      // Update existing allocation
      const newAllocations = [...allocations];
      newAllocations[existingIndex].amount += amount;
      newAllocations[existingIndex].percentage = (newAllocations[existingIndex].amount / income) * 100;
      setAllocations(newAllocations);
      toast.success(`Added $${amount.toFixed(2)} to ${newCategory}`);
    } else {
      // Create new allocation
      const categoryDetails = getExpenseCategoryDetails(newCategory as MainExpenseCategory);
      const colorHex = categoryDetails.color.includes('text-')
        ? categoryDetails.color.replace('text-', 'bg-')
        : categoryDetails.color;
      
      const newAllocation: BudgetAllocation = {
        id: `alloc_${Date.now()}`,
        category: newCategory,
        amount,
        percentage: (amount / income) * 100,
        color: colorHex,
      };
      
      setAllocations([...allocations, newAllocation]);
      toast.success(`Added ${newCategory} allocation`);
    }
    
    // Reset form
    setNewAmount('');
  };
  
  // Delete allocation
  const handleDeleteAllocation = (id: string) => {
    const updated = allocations.filter(item => item.id !== id);
    setAllocations(updated);
    toast.success('Allocation removed');
  };
  
  // Update allocation amount
  const handleUpdateAllocation = (id: string, newAmount: number) => {
    if (isNaN(newAmount) || newAmount < 0) return;
    
    const totalAllocatedExcludingThis = allocations.reduce((sum, item) => {
      return item.id === id ? sum : sum + item.amount;
    }, 0);
    
    if (totalAllocatedExcludingThis + newAmount > income) {
      toast.error('Total allocations cannot exceed budget');
      return;
    }
    
    const updated = allocations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          amount: newAmount,
          percentage: (newAmount / income) * 100
        };
      }
      return item;
    });
    
    setAllocations(updated);
  };
  
  // Apply Budget Template
  const handleApplyTemplate = () => {
    if (!pendingTemplate || !(pendingTemplate in budgetTemplates)) return; // Check if key exists
    if (income <= 0) {
      toast.error('Please set your Total Budget before applying a template.');
      setShowTemplateConfirm(false);
      setPendingTemplate(null);
      return;
    }

    const templateKey = pendingTemplate as BudgetTemplateKey; // Cast to the key type
    const template = budgetTemplates[templateKey];
    const newAllocations: BudgetAllocation[] = template.allocations
      .map((alloc: TemplateAllocation, index: number) => { // Add types for alloc and index
        const categoryExists = availableMainCategoriesArray.includes(alloc.category as MainExpenseCategory);
        if (!categoryExists) {
          console.warn(`Template category "${alloc.category}" not found in available categories. Skipping.`);
          return null;
        }
        
        const amount = (alloc.percentage / 100) * income;
        const categoryDetails = getExpenseCategoryDetails(alloc.category as MainExpenseCategory);
        const colorHex = categoryDetails.color.includes('text-')
          ? categoryDetails.color.replace('text-', 'bg-')
          : categoryDetails.color;

        return {
          id: `alloc_template_${templateKey}_${index}`, // Use templateKey
          category: alloc.category,
          amount: parseFloat(amount.toFixed(2)),
          percentage: alloc.percentage,
          color: colorHex,
        };
      })
      .filter((alloc): alloc is BudgetAllocation => alloc !== null);

    const totalAmount = newAllocations.reduce((sum, a) => sum + a.amount, 0);
    const remainder = income - totalAmount;
    if (Math.abs(remainder) > 0.01 && newAllocations.length > 0) {
      const miscCategory = 'Miscellaneous';
      const miscIndex = newAllocations.findIndex(a => a.category === miscCategory);
      if (miscIndex !== -1) {
        newAllocations[miscIndex].amount += remainder;
        newAllocations[miscIndex].percentage = (newAllocations[miscIndex].amount / income) * 100;
      } else if (availableMainCategoriesArray.includes(miscCategory as MainExpenseCategory)) {
         const categoryDetails = getExpenseCategoryDetails(miscCategory as MainExpenseCategory);
         const colorHex = categoryDetails.color.includes('text-') ? categoryDetails.color.replace('text-', 'bg-') : categoryDetails.color;
         newAllocations.push({
           id: `alloc_template_${templateKey}_misc`, // Use templateKey
           category: miscCategory,
           amount: parseFloat(remainder.toFixed(2)),
           percentage: (remainder / income) * 100,
           color: colorHex,
         });
      }
    }

    setAllocations(newAllocations);
    toast.success(`Applied "${template.name}" template.`);
    setShowTemplateConfirm(false);
    setPendingTemplate(null);
    setSelectedTemplate('');
  };

  const confirmApplyTemplate = (templateKey: string) => {
    if (!templateKey || !(templateKey in budgetTemplates)) return; // Check if key exists
    setPendingTemplate(templateKey);
    setShowTemplateConfirm(true);
  };

  // Generate chart data from allocations
  const chartData = [
    ...allocations,
    ...(unallocated > 0 ? [{
      id: 'unallocated',
      category: 'Unallocated',
      amount: unallocated,
      percentage: (unallocated / income) * 100,
      color: 'bg-gray-300 dark:bg-gray-700'
    }] : [])
  ];
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F5F7] dark:bg-[#1A1A1A]">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-[#007AFF] dark:border-t-[#0A84FF] border-[#E5E5EA] dark:border-[#48484A] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <DashboardHeader onSearch={() => {}} />
      
      <main className="flex-1 p-5 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 
            ref={headerRef}
            className="text-3xl font-semibold text-[#1D1D1F] dark:text-white mb-2"
          >
            Zero-Based Budgeting
          </h1>
          <p className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
            Allocate every dollar of your income to specific categories
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Budget Overview Card */}
            <Card
              ref={setCardRef(0)}
              className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
                    <Target className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">
                    Budget Overview
                  </CardTitle>
                </div>
                <CardDescription className="text-[#86868B] dark:text-[#98989D] text-sm">
                  Set your total budget and track allocations
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <form onSubmit={handleUpdateIncome} className="p-4 bg-[#F2F2F7] dark:bg-[#38383A] rounded-xl">
                    <Label htmlFor="income" className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                      Total Budget
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                        <Input 
                          id="income"
                          name="income"
                          type="number"
                          placeholder="0.00"
                          defaultValue={income}
                          step="0.01"
                          min="0.01"
                          className="pl-9 bg-white/70 dark:bg-[#2C2C2E]/70 border-0"
                          required
                        />
                      </div>
                      <Button type="submit" className="bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text-white">
                        Update
                      </Button>
                    </div>
                  </form>
                  
                  <div className="p-4 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-xl">
                    <div className="text-xs font-medium text-[#34C759] dark:text-[#30D158]">
                      Allocated Budget
                    </div>
                    <div className="mt-1.5 text-2xl font-semibold text-[#1D1D1F] dark:text-white">
                      ${(income - unallocated).toFixed(2)}
                      <span className="text-sm text-[#8E8E93] dark:text-[#98989D] ml-1">
                        ({income > 0 ? ((income - unallocated) / income * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#FFEBD4] dark:bg-[#3A2A16] rounded-xl">
                    <div className="text-xs font-medium text-[#FF9500] dark:text-[#FF9F0A]">
                      Unallocated Budget
                    </div>
                    <div className="mt-1.5 text-2xl font-semibold text-[#1D1D1F] dark:text:white">
                      ${unallocated.toFixed(2)}
                      <span className="text-sm text-[#8E8E93] dark:text-[#98989D] ml-1">
                        ({income > 0 ? (unallocated / income * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Budget visualization */}
                <div className="h-[300px] mb-4">
                  {income > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          dataKey="amount"
                          nameKey="category"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color.includes('bg-') 
                                ? entry.color.replace('bg-', 'var(--')
                                    .replace('/', '-')
                                    .replace(/\[|\]/g, '') + ')'
                                : '#ccc'
                              } 
                            />
                          ))}
                        </Pie>
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#8E8E93] dark:text-[#98989D]">
                      <PieChart className="h-10 w-10 mb-2" />
                      <p className="text-center">Set your budget total to see the allocation visualization</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Allocations Card */}
            <Card
              ref={setCardRef(1)}
              className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#FFEBD4] dark:bg-[#3A2A16] rounded-full">
                    <DollarSign className="h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white">
                    Budget Allocations
                  </CardTitle>
                </div>
                <CardDescription className="text-[#86868B] dark:text-[#98989D] text-sm">
                  Drag and drop to prioritize your allocations
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Allocations Container */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="allocations">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 mb-6"
                      >
                        {allocations.length === 0 ? (
                          <div className="p-8 text-center border border-dashed border-[#E5E5EA] dark:border-[#48484A] rounded-xl">
                            <PiggyBank className="h-10 w-10 mx-auto mb-4 text-[#8E8E93] dark:text-[#98989D]" />
                            <p className="text-[#1D1D1F] dark:text:white font-medium mb-1">
                              No budget allocations yet
                            </p>
                            <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">
                              Add categories below to start budgeting
                            </p>
                          </div>
                        ) : (
                          allocations.map((item, index) => {
                            const categoryDetails = getExpenseCategoryDetails(item.category as MainExpenseCategory);
                            return (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided: DraggableProvided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-[#F2F2F7] dark:bg-[#38383A] p-3 rounded-xl"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                        categoryDetails.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100'),
                                        "dark:bg-opacity-30"
                                      )}>
                                        <categoryDetails.icon className={`h-4 w-4 ${categoryDetails.color}`} />
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[#1D1D1F] dark:text:white truncate">
                                          {item.category}
                                        </div>
                                        <div className="text-xs text-[#8E8E93] dark:text-[#98989D]">
                                          {item.percentage.toFixed(1)}% of total budget
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center">
                                        <div className="relative mr-2">
                                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                                          <Input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => handleUpdateAllocation(
                                              item.id, 
                                              parseFloat(e.target.value) || 0
                                            )}
                                            step="0.01"
                                            min="0"
                                            className="w-24 pl-9 py-1 h-9 bg:white/70 dark:bg-[#2C2C2E]/70 border-0"
                                          />
                                        </div>
                                        
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteAllocation(item.id)}
                                          className="h-9 w-9 rounded-lg text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FEF1F0] dark:hover:bg-[#3A1D1B]"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                {/* Add Allocation Form */}
                <div className="bg-[#F9F9FB] dark:bg-[#252527] p-4 rounded-xl">
                  <h3 className="text-sm font-medium text-[#1D1D1F] dark:text:white mb-3">
                    Add Budget Allocation
                  </h3>
                  
                  <form onSubmit={handleAddAllocation} className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    <div className="md:col-span-3">
                      <Label htmlFor="category" className="sr-only">Category</Label>
                      <CategorySelect 
                        value={newCategory} 
                        onValueChange={setNewCategory} 
                        placeholder="Select category"
                        required={true}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="amount" className="sr-only">Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                        <Input
                          id="amount"
                          type="number"
                          value={newAmount}
                          onChange={(e) => setNewAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          max={unallocated}
                          className="pl-9 bg:white dark:bg-[#3A3A3C] border-[#E5E5EA] dark:border-[#48484A]"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Button 
                        type="submit"
                        className="w-full bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text:white"
                        disabled={unallocated <= 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Allocation
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Budget Templates Card */}
            <Card
              ref={setCardRef(4)}
              className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#D4E7FE] dark:bg-[#162A41] rounded-full">
                    <FileText className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white">
                    Budget Templates
                  </CardTitle>
                </div>
                <CardDescription className="text-[#86868B] dark:text-[#98989D] text-sm">
                  Apply a template to kickstart your budget.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedTemplate} onValueChange={confirmApplyTemplate}>
                    <SelectTrigger className="w-full bg-white/70 dark:bg-[#3A3A3C]/70 border-[#E5E5EA] dark:border-[#48484A]">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(budgetTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span>{template.name}</span>
                            <span className="text-xs text-muted-foreground">{template.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card
              ref={setCardRef(2)}
              className="border-0 shadow-sm bg:white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#FEFCD4] dark:bg-[#413200] rounded-full">
                    <Info className="h-5 w-5 text-[#FFD60A] dark:text-[#FFD60A]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white">
                    Zero-Based Budgeting Tips
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">1</div>
                    <p className="text-sm text-[#1D1D1F] dark:text:white">
                      <span className="font-medium">Start with your income:</span> Begin by setting your total monthly budget or income at the top.
                    </p>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">2</div>
                    <p className="text-sm text-[#1D1D1F] dark:text:white">
                      <span className="font-medium">Allocate every dollar:</span> In zero-based budgeting, your total allocations should equal your income.
                    </p>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">3</div>
                    <p className="text-sm text-[#1D1D1F] dark:text:white">
                      <span className="font-medium">Prioritize needs first:</span> Start with essentials like housing, food, and utilities.
                    </p>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">4</div>
                    <p className="text-sm text-[#1D1D1F] dark:text:white">
                      <span className="font-medium">Remember savings:</span> Allocate funds for savings goals, emergency funds, and investments.
                    </p>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">5</div>
                    <p className="text-sm text-[#1D1D1F] dark:text:white">
                      <span className="font-medium">Drag to reorder:</span> Rearrange your allocations by dragging to reflect your priorities.
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Budget Summary Card */}
            <Card
              ref={setCardRef(3)}
              className="border-0 shadow-sm bg:white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full">
                    <PiggyBank className="h-5 w-5 text-[#34C759] dark:text-[#30D158]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white">
                    Budget Summary
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#8E8E93] dark:text-[#98989D]">
                        Total Budget:
                      </span>
                      <span className="font-semibold text-[#1D1D1F] dark:text:white">
                        ${income.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#8E8E93] dark:text-[#98989D]">
                        Allocated:
                      </span>
                      <span className="font-semibold text-[#34C759] dark:text-[#30D158]">
                        ${(income - unallocated).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#8E8E93] dark:text-[#98989D]">
                        Unallocated:
                      </span>
                      <span className="font-semibold text-[#FF9500] dark:text-[#FF9F0A]">
                        ${unallocated.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-[#F2F2F7] dark:bg-[#38383A] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#34C759] dark:bg-[#30D158] rounded-full"
                      style={{ width: `${income > 0 ? ((income - unallocated) / income) * 100 : 0}%` }}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">
                      {income > 0 
                        ? `${((income - unallocated) / income * 100).toFixed(1)}% of budget allocated` 
                        : 'Set your budget to start planning'}
                    </span>
                  </div>
                  
                  {/* Top Categories */}
                  {allocations.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider mb-3">
                        Top Allocations
                      </h4>
                      
                      <div className="space-y-2">
                        {[...allocations]
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 4)
                          .map(item => {
                            const categoryDetails = getExpenseCategoryDetails(item.category as MainExpenseCategory);
                            return (
                              <div key={item.id} className="flex items-center gap-2">
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                  categoryDetails.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100'),
                                  "dark:bg-opacity-30"
                                )}>
                                  <categoryDetails.icon className={`h-3.5 w-3.5 ${categoryDetails.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-[#1D1D1F] dark:text:white truncate">
                                    {item.category}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-[#1D1D1F] dark:text:white">
                                  ${item.amount.toFixed(2)}
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Template Confirmation Dialog */}
      <AlertDialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Budget Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Applying the "{pendingTemplate && (pendingTemplate in budgetTemplates) ? budgetTemplates[pendingTemplate as BudgetTemplateKey]?.name : ''}" template will replace your current budget allocations. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingTemplate(null); setSelectedTemplate(''); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyTemplate} className="bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text-white">
              Apply Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}