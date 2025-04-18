'use client';

import React, { useMemo, useRef, useEffect } from 'react';
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
  getExpenseCategoryDetails,
  parseCategoryValue
} from "@/config/expense-categories";
import { gsap } from 'gsap';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelect({ value, onValueChange, disabled = false, placeholder = "Select a category" }: CategorySelectProps) {
  // Refs for animations
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Create a flattened list of options with unique values and display text
  const flatOptions = useMemo(() => {
    const options: { 
      value: string; 
      display: string; 
      isParent: boolean; 
      parentCategory?: string;
      originalCategory: string;
    }[] = [];

    availableMainCategoriesArray.forEach((mainCategory) => {
      // Skip 'Split Transaction'
      if (mainCategory === 'Split Transaction') return;

      const { display: mainDisplay } = formatCategoryDisplay(mainCategory);
      const mainCategoryValue = `main-${mainCategory}`;
      
      // Add main category option
      options.push({ 
        value: mainCategoryValue, 
        display: mainDisplay,
        isParent: true,
        originalCategory: mainCategory
      });

      // Add subcategory options
      const subcategories = getSubcategories(mainCategory);
      subcategories.forEach((subCategory) => {
        const { display: subDisplay } = formatCategoryDisplay(subCategory);
        const subCategoryValue = `sub-${mainCategory}-${subCategory}`;
        options.push({ 
          value: subCategoryValue, 
          display: subDisplay,
          isParent: false,
          parentCategory: mainCategory,
          originalCategory: subCategory
        });
      });
    });

    return options;
  }, []);

  // Trigger animation on mount
  useEffect(() => {
    if (triggerRef.current) {
      gsap.fromTo(
        triggerRef.current,
        { scale: 0.97, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  // Animation for when content opens
  const handleContentOpen = (open: boolean) => {
    if (open && contentRef.current) {
      // Reset opacity and scale for items
      gsap.set(contentRef.current.querySelectorAll('.category-item'), { 
        opacity: 0, 
        y: 10
      });
      
      // Animate items with stagger
      gsap.to(contentRef.current.querySelectorAll('.category-item'), {
        opacity: 1,
        y: 0,
        stagger: 0.03,
        duration: 0.2,
        ease: 'power2.out',
        delay: 0.1
      });
    }
  };

  // Get the selected value's display
  const selectedOption = value ? flatOptions.find(opt => opt.value === value) : undefined;
  const selectedDisplayText = selectedOption?.display || placeholder;
  
  // Get icon for selected value if available
  const selectedOriginalCategory = selectedOption?.originalCategory || '';
  const { icon: SelectedIcon, color: selectedColor } = getExpenseCategoryDetails(selectedOriginalCategory);

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange} 
      disabled={disabled}
      onOpenChange={handleContentOpen}
    >
      <SelectTrigger 
        ref={triggerRef}
        disabled={disabled} 
        className="rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A] focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30 dark:focus:ring-opacity-30 transition-all hover:shadow-md"
      >
        <SelectValue placeholder={placeholder}>
          <div className="flex items-center gap-2">
            {value && (
              <div className={`flex items-center justify-center rounded-full p-1 ${selectedColor ? selectedColor : 'text-gray-500'} bg-opacity-20`}>
                {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              </div>
            )}
            <span className="truncate">{selectedDisplayText}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent 
        ref={contentRef}
        className="bg-white/95 dark:bg-[#3A3A3C]/95 backdrop-blur-md rounded-lg border-[#DADADC] dark:border-[#48484A] max-h-[60vh] overflow-auto shadow-lg"
      >
        <div className="p-1">
          {flatOptions.map((option) => {
            // Get icon and color for each category
            const originalCategory = option.originalCategory;
            const { icon: Icon, color } = getExpenseCategoryDetails(originalCategory);
            
            return (
              <SelectItem 
                key={option.value}
                value={option.value}
                className={`category-item focus:bg-[#F2F2F7] dark:focus:bg-[#48484A] rounded-md my-1 transition-all ${option.isParent ? 'font-medium' : 'pl-8'}`}
              >
                <div className="flex items-center gap-2 py-1">
                  <div className={`flex items-center justify-center rounded-full p-1 ${color} bg-opacity-20`}>
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <span className="truncate">{option.display}</span>
                </div>
              </SelectItem>
            );
          })}
        </div>
      </SelectContent>
    </Select>
  );
}