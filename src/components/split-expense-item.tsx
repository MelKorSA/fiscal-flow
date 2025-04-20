'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DollarSign, X, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategorySelect } from '@/components/ui/category-select';

export interface SplitItem {
  id: string;
  category: string;
  amount: number;
  merchant?: string; // Add merchant support to split items
}

interface SplitExpenseItemProps {
  item: SplitItem;
  index: number;
  totalAmount: number;
  remainingAmount: number;
  onUpdate: (id: string, field: 'category' | 'amount' | 'merchant', value: string | number) => void;
  onRemove: (id: string) => void;
  showMerchant?: boolean; // Flag to control merchant field visibility
}

export function SplitExpenseItem({ 
  item, 
  index, 
  totalAmount, 
  remainingAmount,
  onUpdate,
  onRemove,
  showMerchant = false
}: SplitExpenseItemProps) {
  return (
    <Card className="p-3 bg-[#F9F9FA] dark:bg-[#38383A] border-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
            Split {index + 1}
          </span>
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-[#FF3B30]/10 text-[#FF3B30] dark:text-[#FF453A] dark:hover:bg-[#FF453A]/10"
              onClick={() => onRemove(item.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <CategorySelect 
            value={item.category} 
            onValueChange={(value) => onUpdate(item.id, 'category', value)} 
            required={true}
          />
          
          {showMerchant && (
            <div className="relative">
              <Store className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6]" />
              <Input
                type="text"
                value={item.merchant || ''}
                onChange={(e) => onUpdate(item.id, 'merchant', e.target.value)}
                placeholder="Merchant (optional)"
                className="pl-9 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A]"
              />
            </div>
          )}
          
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B] dark:text-[#A1A1A6]" />
            <Input
              type="number"
              value={item.amount}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  onUpdate(item.id, 'amount', value);
                }
              }}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={item.amount + remainingAmount}
              className="pl-9 rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A]"
              required
            />
          </div>
        </div>
      </div>
    </Card>
  );
}