'use client';

import React from 'react';
import { X, DollarSign, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getExpenseCategoryDetails, formatCategoryDisplay } from '@/config/expense-categories';
import { CategorySelect } from './ui/category-select';

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
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.valueAsNumber || 0;
    // Ensure the amount doesn't exceed the total available amount
    const maxAllowedAmount = item.amount + remainingAmount;
    const validAmount = Math.min(newAmount, maxAllowedAmount);
    onUpdate(item.id, 'amount', validAmount);
  };

  const handleCategoryChange = (category: string) => {
    onUpdate(item.id, 'category', category);
  };

  // Calculate the percentage of the total amount
  const percentage = totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;

  return (
    <div className="bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md rounded-xl p-4 mb-3 border border-[#F2F2F7] dark:border-[#48484A] hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-opacity-20" style={{ backgroundColor: `var(--${color.replace('text-', '')}-100)` }}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <span className="font-medium text-sm text-[#1D1D1F] dark:text-white">
            Split #{index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] p-0"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4 text-[#FF3B30] dark:text-[#FF453A]" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {/* Using our new CategorySelect component */}
          <CategorySelect 
            value={item.category} 
            onValueChange={handleCategoryChange} 
            placeholder="Select category"
          />
        </div>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6]" />
          <Input
            type="number"
            value={item.amount ? item.amount : ''}
            onChange={handleAmountChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            max={item.amount + remainingAmount}
            className="pl-9 rounded-lg bg-white/80 dark:bg-[#2C2C2E]/80 border-[#DADADC] dark:border-[#48484A]"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs text-[#86868B] dark:text-[#98989D] px-1">
        <span>{percentage}% of total</span>
        <span>${item.amount.toFixed(2)}</span>
      </div>
    </div>
  );
}