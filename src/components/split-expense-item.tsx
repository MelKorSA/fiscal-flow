'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, DollarSign } from "lucide-react";
import { getExpenseCategoryDetails } from '@/config/expense-categories';
import { CategorySelect } from './ui/category-select';
import { gsap } from 'gsap';

export interface SplitItem {
  id: string;
  category: string;
  amount: number;
}

interface SplitExpenseItemProps {
  item: SplitItem;
  index: number;
  categories: string[];
  totalAmount: number;
  remainingAmount: number;
  onUpdate: (id: string, field: 'category' | 'amount', value: string | number) => void;
  onRemove: (id: string) => void;
}

export function SplitExpenseItem({
  item,
  index,
  categories,
  totalAmount,
  remainingAmount,
  onUpdate,
  onRemove
}: SplitExpenseItemProps) {
  const { icon: Icon, color } = getExpenseCategoryDetails(item.category);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Calculate the percentage of the total amount
  const percentage = totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;

  // Animation for component mount
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { 
          opacity: 0, 
          y: 20,
          scale: 0.95 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.3, 
          delay: index * 0.1,
          ease: "back.out(1.4)"
        }
      );
    }
  }, [index]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.valueAsNumber || 0;
    // Ensure the amount doesn't exceed the total available amount
    const maxAllowedAmount = item.amount + remainingAmount;
    const validAmount = Math.min(newAmount, maxAllowedAmount);
    
    // Animate the input on change
    if (cardRef.current) {
      const amountInput = cardRef.current.querySelector('.amount-input');
      gsap.fromTo(
        amountInput,
        { scale: 0.95 },
        { scale: 1, duration: 0.2, ease: "back.out(1.2)" }
      );
    }
    
    onUpdate(item.id, 'amount', validAmount);
  };

  const handleCategoryChange = (category: string) => {
    // Add animation for category change
    if (cardRef.current) {
      const categoryIcon = cardRef.current.querySelector('.category-icon');
      if (categoryIcon) {
        gsap.fromTo(
          categoryIcon,
          { rotate: -15, scale: 0.8 },
          { rotate: 0, scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" }
        );
      }
    }
    
    onUpdate(item.id, 'category', category);
  };

  const handleRemove = () => {
    if (cardRef.current) {
      // Animate removal
      gsap.to(cardRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.2,
        onComplete: () => onRemove(item.id)
      });
    } else {
      onRemove(item.id);
    }
  };

  return (
    <div 
      ref={cardRef} 
      className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md rounded-xl p-4 mb-3 border border-[#F2F2F7] dark:border-[#48484A] hover:shadow-sm transition-all split-expense-item"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 category-icon">
          {Icon && (
            <div className={`p-1.5 rounded-full ${color} bg-opacity-15`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <span className="font-medium text-sm text-[#1D1D1F] dark:text-white">Split Item {index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] p-0 transition-all hover:scale-110"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4 text-[#FF3B30] dark:text-[#FF453A]" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <CategorySelect 
            value={item.category} 
            onValueChange={handleCategoryChange}
            placeholder="Select category"
          />
        </div>
        <div className="relative amount-input">
          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6] pointer-events-none" />
          <Input
            type="number"
            value={item.amount || ''}
            onChange={handleAmountChange}
            className="pl-9 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3 text-xs text-[#86868B] dark:text-[#98989D] px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-full bg-[#F2F2F7] dark:bg-[#38383A] rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                percentage >= 75 ? 'bg-[#FF3B30] dark:bg-[#FF453A]' : 
                percentage >= 50 ? 'bg-[#FF9500] dark:bg-[#FF9F0A]' : 
                'bg-[#34C759] dark:bg-[#30D158]'
              } transition-all duration-300 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div>
          <span className="font-medium">${item.amount?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  );
}