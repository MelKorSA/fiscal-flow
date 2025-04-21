'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target, PlusCircle, Edit2, Trash2, PieChart, Banknote, 
  TrendingUp, Calendar, AlertCircle, CheckCircle2, Trophy 
} from 'lucide-react';
import { gsap } from 'gsap';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { format, addMonths, differenceInMonths, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// Local storage key
const LS_KEY_GOALS = 'fiscalFlowFinancialGoals';

// Goal category options
const goalCategories = [
  { value: 'emergency', label: 'Emergency Fund', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'retirement', label: 'Retirement', icon: Calendar, color: 'text-blue-500' },
  { value: 'saving', label: 'Saving', icon: PieChart, color: 'text-green-500' },
  { value: 'debt', label: 'Debt Payoff', icon: TrendingUp, color: 'text-red-500' },
  { value: 'purchase', label: 'Major Purchase', icon: Banknote, color: 'text-purple-500' },
  { value: 'other', label: 'Other', icon: Target, color: 'text-gray-500' }
];

export interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface FinancialGoalsProps {
  // Optional initialGoals prop for testing or demonstration purposes
  initialGoals?: FinancialGoal[];
  // Current savings amount to suggest goals
  currentSavings?: number;
}

export function FinancialGoals({ initialGoals, currentSavings = 0 }: FinancialGoalsProps) {
  // State
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: '',
    category: 'saving',
    targetAmount: 0,
    currentAmount: 0,
    priority: 'medium'
  });

  // Refs for animations
  const progressRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Load goals from localStorage
  useEffect(() => {
    if (initialGoals) {
      setGoals(initialGoals);
      return;
    }

    try {
      const savedGoals = localStorage.getItem(LS_KEY_GOALS);
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        
        // Convert date strings to Date objects
        const formattedGoals = parsedGoals.map((goal: any) => ({
          ...goal,
          deadline: goal.deadline ? new Date(goal.deadline) : undefined,
          createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date()
        }));
        
        setGoals(formattedGoals);
      } else if (currentSavings > 0) {
        // Suggest an initial emergency fund goal if user has savings but no goals
        const emergencyGoal: FinancialGoal = {
          id: `goal_${Date.now()}_emergency`,
          name: 'Emergency Fund',
          category: 'emergency',
          targetAmount: currentSavings * 3, // Suggest 3x current savings
          currentAmount: currentSavings,
          priority: 'high',
          createdAt: new Date()
        };
        setGoals([emergencyGoal]);
      }
    } catch (error) {
      console.error('Error loading goals from localStorage:', error);
    }
  }, [initialGoals, currentSavings]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0) {
      try {
        localStorage.setItem(LS_KEY_GOALS, JSON.stringify(goals));
      } catch (error) {
        console.error('Error saving goals to localStorage:', error);
      }
    }
  }, [goals]);

  // Add animation effect for progress bars
  useEffect(() => {
    goals.forEach(goal => {
      const progressRef = progressRefs.current[goal.id];
      if (progressRef) {
        const progressPercentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
        gsap.fromTo(
          progressRef,
          { width: '0%' },
          { 
            width: `${progressPercentage}%`, 
            duration: 1.2, 
            ease: "power2.out",
            delay: 0.2
          }
        );
      }
    });
  }, [goals]);

  // Animate container on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  // Handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoal.name) {
      toast.error('Please enter a goal name');
      return;
    }

    if (!newGoal.targetAmount || newGoal.targetAmount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    const goal: FinancialGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: newGoal.name,
      category: newGoal.category || 'saving',
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      deadline: newGoal.deadline,
      priority: newGoal.priority as 'low' | 'medium' | 'high',
      createdAt: new Date()
    };

    setGoals(prev => [...prev, goal]);
    setIsAddDialogOpen(false);
    setNewGoal({
      name: '',
      category: 'saving',
      targetAmount: 0,
      currentAmount: 0,
      priority: 'medium'
    });
    toast.success('Financial goal added successfully!');
  };

  // Handle updating a goal
  const handleUpdateGoal = () => {
    if (!editingGoal) return;

    setGoals(prev => 
      prev.map(g => g.id === editingGoal.id ? editingGoal : g)
    );
    setEditingGoal(null);
    toast.success('Goal updated successfully!');
  };

  // Handle deleting a goal
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal removed successfully!');
  };

  // Function to get goal category details
  const getGoalCategory = (categoryId: string) => {
    return goalCategories.find(cat => cat.value === categoryId) || goalCategories[5]; // Default to "Other"
  };

  // Filter goals based on completion status
  const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);
  const displayedGoals = showCompletedGoals ? completedGoals : activeGoals;

  // Calculate time remaining for a goal
  const getTimeRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const months = differenceInMonths(deadline, now);
    
    if (months <= 0) return 'Overdue';
    if (months === 1) return '1 month left';
    return `${months} months left`;
  };

  // Get progress color based on percentage
  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-1.5 bg-[#FCF8EE] dark:bg-[#3B3928] rounded-full mr-2">
                <Trophy className="h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
              </div>
              <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text:white">
                Financial Goals
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompletedGoals(!showCompletedGoals)}
                className={cn(
                  "text-xs h-8 px-3", 
                  showCompletedGoals 
                    ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30" 
                    : "text-gray-500"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {showCompletedGoals ? 'Showing Completed' : 'Show Completed'}
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text-white">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Financial Goal</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        className="col-span-3"
                        placeholder="Vacation Fund"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select 
                        value={newGoal.category} 
                        onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {goalCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center">
                                <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="target" className="text-right">
                        Target ($)
                      </Label>
                      <Input
                        id="target"
                        type="number"
                        value={newGoal.targetAmount || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="1000.00"
                        min="0"
                        step="10"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="current" className="text-right">
                        Current ($)
                      </Label>
                      <Input
                        id="current"
                        type="number"
                        value={newGoal.currentAmount || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                        placeholder="0.00"
                        min="0"
                        step="10"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="deadline" className="text-right">
                        Deadline
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline ? format(new Date(newGoal.deadline), 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setNewGoal({ ...newGoal, deadline: date });
                        }}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal({ ...newGoal, priority: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddGoal}>Add Goal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {displayedGoals.length > 0 ? (
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4 py-2">
                {displayedGoals.map((goal) => {
                  const category = getGoalCategory(goal.category);
                  const CategoryIcon = category.icon;
                  const progressPercentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                  const isCompleted = progressPercentage >= 100;
                  const timeRemaining = getTimeRemaining(goal.deadline);
                  
                  return (
                    <div 
                      key={goal.id}
                      className="bg-white dark:bg-[#2C2C2E] rounded-xl p-4 shadow-sm border border-[#F2F2F7] dark:border-[#3A3A3C]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${category.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
                            <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                          </div>
                          <div className="ml-2">
                            <h3 className="font-medium text-[#1D1D1F] dark:text-white">{goal.name}</h3>
                            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6]">{category.label}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                          </span>
                          
                          {/* Edit Goal Dialog */}
                          <Dialog open={!!editingGoal && editingGoal.id === goal.id} onOpenChange={() => setEditingGoal(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingGoal(goal)} 
                                className="ml-2 h-8 w-8 p-0 text-[#007AFF] dark:text-[#0A84FF]"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {editingGoal && editingGoal.id === goal.id && (
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Goal</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-2">
                                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingGoal.name}
                                      onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-2">
                                    <Label htmlFor="edit-category" className="text-right">Category</Label>
                                    <Select 
                                      value={editingGoal.category} 
                                      onValueChange={(value) => setEditingGoal({ ...editingGoal, category: value })}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {goalCategories.map((category) => (
                                          <SelectItem key={category.value} value={category.value}>
                                            <div className="flex items-center">
                                              <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
                                              <span>{category.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-2">
                                    <Label htmlFor="edit-target" className="text-right">Target ($)</Label>
                                    <Input
                                      id="edit-target"
                                      type="number"
                                      value={editingGoal.targetAmount}
                                      onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                                      className="col-span-3"
                                      min="0"
                                      step="10"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-2">
                                    <Label htmlFor="edit-current" className="text-right">Current ($)</Label>
                                    <Input
                                      id="edit-current"
                                      type="number"
                                      value={editingGoal.currentAmount}
                                      onChange={(e) => setEditingGoal({ ...editingGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                                      className="col-span-3"
                                      min="0"
                                      step="10"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-2">
                                    <Label htmlFor="edit-deadline" className="text-right">Deadline</Label>
                                    <Input
                                      id="edit-deadline"
                                      type="date"
                                      value={editingGoal.deadline ? format(new Date(editingGoal.deadline), 'yyyy-MM-dd') : ''}
                                      onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : undefined;
                                        setEditingGoal({ ...editingGoal, deadline: date });
                                      }}
                                      className="col-span-3"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-2">
                                    <Label htmlFor="edit-priority" className="text-right">Priority</Label>
                                    <Select
                                      value={editingGoal.priority}
                                      onValueChange={(value: 'low' | 'medium' | 'high') => setEditingGoal({ ...editingGoal, priority: value })}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                      handleDeleteGoal(editingGoal.id);
                                      setEditingGoal(null);
                                    }}
                                    className="mr-auto"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </Button>
                                  <Button variant="outline" onClick={() => setEditingGoal(null)}>Cancel</Button>
                                  <Button onClick={handleUpdateGoal}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)} 
                            className="h-8 w-8 p-0 text-[#FF3B30] dark:text-[#FF453A]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-[#86868B] dark:text-[#A1A1A6] font-medium">
                            ${goal.currentAmount.toFixed(2)}
                            <span className="text-xs ml-1 opacity-60">of ${goal.targetAmount.toFixed(2)}</span>
                          </div>
                          <div className={`text-sm font-medium ${isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#007AFF] dark:text-[#0A84FF]'}`}>
                            {isCompleted ? 'Completed!' : `${Math.round(progressPercentage)}%`}
                          </div>
                        </div>
                        
                        <div className="h-2 w-full bg-[#F2F2F7] dark:bg-[#38383A] rounded-full overflow-hidden">
                          <div 
                            ref={(elem) => {
                              if (elem) progressRefs.current[goal.id] = elem;
                            }}
                            className={`h-full rounded-full ${getProgressColor(goal.currentAmount, goal.targetAmount)}`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-[#86868B] dark:text-[#A1A1A6]">
                          {isCompleted ? (
                            <span className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mr-1" /> 
                              Goal achieved
                            </span>
                          ) : (
                            <span>
                              ${(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining
                            </span>
                          )}
                          {timeRemaining && (
                            <span className={timeRemaining === 'Overdue' ? 'text-red-500' : ''}>
                              {timeRemaining}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="min-h-[240px] flex flex-col items-center justify-center text-center p-6 my-2">
              <div className="h-12 w-12 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-[#8E8E93] dark:text-[#98989D]" />
              </div>
              <h3 className="text-lg font-medium text-[#1D1D1F] dark:text-white mb-1">
                {showCompletedGoals ? 'No completed goals yet' : 'No financial goals yet'}
              </h3>
              <p className="text-sm text-[#8E8E93] dark:text-[#98989D] max-w-xs mb-4">
                {showCompletedGoals
                  ? 'Start by completing some of your active financial goals!'
                  : 'Set up financial goals to track your progress and stay motivated!'}
              </p>
              {!showCompletedGoals && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3]"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Goal
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}