'use client';

import React, { useMemo } from 'react';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  availableMainCategoriesArray,
  getSubcategories,          
  formatCategoryDisplay,
} from "@/config/expense-categories";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelect({ value, onValueChange, disabled = false, placeholder = "Select a category" }: CategorySelectProps) {

  // Create a flattened list of options with unique values and display text
  const flatOptions = useMemo(() => {
    const options: { value: string; display: string }[] = [];

    availableMainCategoriesArray.forEach((mainCategory) => {
      // Skip 'Split Transaction'
      if (mainCategory === 'Split Transaction') return;

      const { display: mainDisplay } = formatCategoryDisplay(mainCategory);
      const mainCategoryValue = `main-${mainCategory}`;
      
      // Add main category option
      options.push({ value: mainCategoryValue, display: `${mainDisplay} (Main)` });

      // Add subcategory options
      const subcategories = getSubcategories(mainCategory);
      subcategories.forEach((subCategory) => {
        const { display: subDisplay } = formatCategoryDisplay(subCategory);
        const subCategoryValue = `sub-${mainCategory}-${subCategory}`;
        options.push({ value: subCategoryValue, display: subDisplay });
      });
    });

    return options;
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger disabled={disabled} className="rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30 dark:focus:ring-opacity-30">
        {/* Find the display text for the currently selected value */}
        <SelectValue placeholder={placeholder}>
          {flatOptions.find(opt => opt.value === value)?.display || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white/90 dark:bg-[#3A3A3C]/90 backdrop-blur-md rounded-lg border-[#DADADC] dark:border-[#48484A]">
        {/* Map over the flat list */}
        {flatOptions.map((option) => (
          <SelectItem 
            key={option.value} // Use unique value as key
            value={option.value} // Use unique value as value
            className="focus:bg-[#F2F2F7] dark:focus:bg-[#48484A] rounded-md"
          >
            {option.display}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}