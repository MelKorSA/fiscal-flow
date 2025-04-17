'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Target, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { toast } from "sonner";

interface BudgetProps {
  totalExpenses: number;
}

// Local storage key for the budget amount
const BUDGET_LS_KEY = 'monthlyBudgetAmount';

export function Budget({ totalExpenses }: BudgetProps) {
  const [budget, setBudget] = useState<number>(5000);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(budget.toString());
  
  // Animation refs
  const progressBarRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Load budget from local storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  
  // Animate progress bar when percentage changes
  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${percentageSpent}%`,
        duration: 1,
        ease: "power2.out"
      });
    }
    
    // Pulse animation for remaining amount if low
    if (remainingRef.current && remaining < budget * 0.2 && remaining > 0) {
      gsap.to(remainingRef.current, {
        color: "#FF3B30",
        scale: 1.05,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });
    }
  }, [totalExpenses, budget]);
  
  // Animate card on mount
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" }
      );
    }
  }, []);

  const handleSetBudget = () => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      const oldBudget = budget;
      setBudget(numericValue);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(BUDGET_LS_KEY, numericValue.toString());
      }
      
      setIsEditing(false);
      toast.success(`Budget updated to $${numericValue.toFixed(2)}`);
      
      // Animate the budget amount change
      if (amountRef.current) {
        // First flash green or red based on increase or decrease
        const color = numericValue > oldBudget ? "#34C759" : "#FF3B30";
        gsap.fromTo(
          amountRef.current,
          { color, scale: 1.1 },
          { color: "inherit", scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }
        );
      }
    } else {
      console.error("Invalid budget amount");
      setEditValue(budget.toString());
      toast.error("Please enter a valid budget amount.");
      
      // Shake animation for error
      if (amountRef.current) {
        gsap.fromTo(
          amountRef.current,
          { x: -10 },
          { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
        );
      }
    }
  };

  const spent = totalExpenses;
  const remaining = budget > 0 ? budget - spent : 0;
  const percentageSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  // Determine progress bar color based on percentage
  const getProgressColor = () => {
    if (percentageSpent > 90) return "bg-red-500 dark:bg-red-600";
    if (percentageSpent > 75) return "bg-orange-500 dark:bg-orange-600";
    if (percentageSpent > 50) return "bg-yellow-500 dark:bg-yellow-600";
    return "bg-green-500 dark:bg-green-600";
  };

  return (
    <Card 
      ref={cardRef}
      className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden h-full"
    > 
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Target className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Monthly Budget</CardTitle>
          </div>
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" 
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 text-[#86868B] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white" />
            </Button>
          )}
        </div>
        {!isEditing ? (
          <div ref={amountRef} className="text-2xl font-semibold text-[#1D1D1F] dark:text-white pt-1">
            ${budget.toFixed(2)}
          </div>
        ) : (
          <div className="flex items-center space-x-2 pt-2">
            <Label htmlFor="budget-input" className="sr-only">Set Budget</Label>
            <Input 
              id="budget-input"
              type="number" 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Set Budget"
              className="h-8 text-base bg-[#F2F2F7] dark:bg-[#38383A] border-0 focus-visible:ring-1 focus-visible:ring-[#007AFF]"
              min="0.01" 
              step="0.01"
              autoFocus
            />
            <Button 
              size="icon" 
              className="h-8 w-8 flex-shrink-0 rounded-full bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3]" 
              onClick={handleSetBudget}
            >
              <Check className="h-5 w-5 text-white" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#86868B] dark:text-[#98989D]">Spent:</span>
            <span className="font-medium text-[#1D1D1F] dark:text-white">${spent.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#86868B] dark:text-[#98989D]">Remaining:</span>
            <span 
              ref={remainingRef}
              className={`font-medium ${
                remaining < 0 
                  ? 'text-[#FF3B30] dark:text-[#FF453A]' 
                  : remaining < budget * 0.2 
                    ? 'text-[#FF9500] dark:text-[#FF9F0A]' 
                    : 'text-[#1D1D1F] dark:text-white'
              }`}
            >
              ${remaining.toFixed(2)}
            </span>
          </div>
          <div className="h-2 w-full bg-[#F2F2F7] dark:bg-[#38383A] rounded-full overflow-hidden">
            <div 
              ref={progressBarRef}
              className={cn("h-full rounded-full", getProgressColor())}
              style={{ width: `${percentageSpent}%` }}
            />
          </div>
          <p className="text-xs text-[#86868B] dark:text-[#98989D] text-center pt-1">
            {percentageSpent.toFixed(1)}% of budget used
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
