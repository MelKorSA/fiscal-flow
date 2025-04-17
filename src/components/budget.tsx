'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Target, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn utility

interface BudgetProps {
  totalExpenses: number; // Receive total expenses from dashboard
}

// Local storage key for the budget amount
const BUDGET_LS_KEY = 'monthlyBudgetAmount';

export function Budget({ totalExpenses }: BudgetProps) {
  const [budget, setBudget] = useState<number>(5000); // Default budget
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(budget.toString());

  // Load budget from local storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure runs only on client
        const savedBudget = localStorage.getItem(BUDGET_LS_KEY);
        if (savedBudget) {
        const numericBudget = parseFloat(savedBudget);
        if (!isNaN(numericBudget)) {
            setBudget(numericBudget);
            setEditValue(numericBudget.toString());
        }
        }
    }
  }, []);

  const handleSetBudget = () => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setBudget(numericValue);
       if (typeof window !== 'undefined') {
          localStorage.setItem(BUDGET_LS_KEY, numericValue.toString());
      }
      setIsEditing(false);
      // Optionally add a toast notification here
      // toast.success(`Budget updated to $${numericValue.toFixed(2)}`);
    } else {
      console.error("Invalid budget amount");
      setEditValue(budget.toString()); // Reset edit value
       // Optionally add an error toast notification here
      // toast.error("Please enter a valid budget amount.");
    }
  };

  const spent = totalExpenses;
  const remaining = budget > 0 ? budget - spent : 0;
  const percentageSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0; // Cap at 100%

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg h-full"> 
      <CardHeader className="pb-4">
         <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Monthly Budget</CardTitle>
             </div>
             {!isEditing && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                 </Button>
             )}
         </div>
          {!isEditing ? (
            <CardDescription className="text-2xl font-bold pt-1 text-gray-800 dark:text-gray-100">${budget.toFixed(2)}</CardDescription>
          ) : (
              <div className="flex items-center space-x-2 pt-2">
                <Label htmlFor="budget-input" className="sr-only">Set Budget</Label>
                <Input 
                  id="budget-input"
                  type="number" 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Set Budget"
                  className="h-8 text-base"
                  min="0.01" 
                  step="0.01"
                  autoFocus
                />
                <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleSetBudget}>
                    <Check className="h-5 w-5" />
                 </Button>
              </div>
          )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent:</span>
            <span className="font-medium">${spent.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining:</span>
            <span className={`font-medium ${remaining < 0 ? 'text-red-600 dark:text-red-500' : ''}`}>
              ${remaining.toFixed(2)}
            </span>
          </div>
           {/* Remove indicatorClassName, use cn for conditional styling if needed */}
          <Progress 
            value={percentageSpent} 
            className={cn(
                "h-2",
                // Apply color classes directly to Progress or its internal structure if possible,
                // otherwise, rely on default styling or wrap with a div for background color.
                // This example uses default styling.
            )}
           />
          <p className="text-xs text-muted-foreground text-center pt-1">{percentageSpent.toFixed(1)}% of budget used</p>
        </div>
      </CardContent>
    </Card>
  );
}
