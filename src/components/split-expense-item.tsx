'use client';

import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CategorySelect } from '@/components/ui/category-select';

export type SplitItem = {
  id: string;
  category: string;
  amount: number;
};

interface SplitExpenseItemProps {
  item: SplitItem;
  index: number;
  totalAmount: number;
  remainingAmount: number;
  onUpdate: (id: string, field: 'category' | 'amount', value: string | number) => void;
  onRemove: (id: string) => void;
}

export function SplitExpenseItem({ 
  item, 
  index, 
  totalAmount, 
  remainingAmount,
  onUpdate, 
  onRemove 
}: SplitExpenseItemProps) {
  const incrementAmount = () => {
    if (remainingAmount > 0) {
      const increment = Math.min(1, remainingAmount);
      onUpdate(item.id, 'amount', (item.amount || 0) + increment);
    }
  };
  
  const decrementAmount = () => {
    const amount = item.amount || 0;
    if (amount > 1) {
      onUpdate(item.id, 'amount', amount - 1);
    }
  };
  
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl
      ${index === 0 ? 'bg-[#F2F2F7] dark:bg-[#2C2C2E]' : 'bg-[#F9F9FA] dark:bg-[#38383A]'}
    `}>
      <div className="flex-1">
        <CategorySelect
          value={item.category}
          onValueChange={(value) => onUpdate(item.id, 'category', value)}
          placeholder="Select category"
        />
      </div>
      <div className="w-32 flex items-center">
        <button
          type="button"
          onClick={decrementAmount}
          disabled={!item.amount || item.amount <= 1}
          className="p-1 rounded-md text-[#8E8E93] dark:text-[#98989D] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 mx-1">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={item.amount?.toString() || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              onUpdate(item.id, 'amount', isNaN(value) ? 0 : value);
            }}
            className="h-8 px-2 text-center bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-sm border-[#DADADC] dark:border-[#48484A] rounded-lg"
          />
        </div>
        <button
          type="button"
          onClick={incrementAmount}
          disabled={remainingAmount <= 0}
          className="p-1 rounded-md text-[#8E8E93] dark:text-[#98989D] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1.5 rounded-full bg-[#FF3B30]/10 dark:bg-[#FF453A]/20 text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/20 dark:hover:bg-[#FF453A]/30 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}