'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import {
  availableMainCategoriesArray,
  getSubcategories,          
  formatCategoryDisplay,
  getExpenseCategoryDetails,
  parseCategoryValue
} from "@/config/expense-categories";
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create a grouped list of options
  const categoriesGrouped = useMemo(() => {
    const groups: {
      mainCategory: string;
      mainCategoryValue: string;
      icon: React.ElementType;
      color: string;
      subcategories: {
        name: string;
        value: string;
        originalCategory: string;
      }[];
    }[] = [];

    availableMainCategoriesArray.forEach((mainCategory) => {
      // Skip 'Split Transaction'
      if (mainCategory === 'Split Transaction') return;
      
      const { icon, color } = getExpenseCategoryDetails(mainCategory);
      const mainCategoryValue = `main-${mainCategory}`;
      const subcategories = getSubcategories(mainCategory).map(subCategory => ({
        name: subCategory,
        value: `sub-${mainCategory}-${subCategory}`,
        originalCategory: subCategory
      }));
      
      groups.push({
        mainCategory,
        mainCategoryValue,
        icon,
        color,
        subcategories
      });
    });
    
    return groups;
  }, []);
  
  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categoriesGrouped;
    
    return categoriesGrouped
      .map(group => {
        // Filter subcategories
        const filteredSubs = group.subcategories.filter(sub => 
          sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Include main category if it matches or has matching subcategories
        if (group.mainCategory.toLowerCase().includes(searchTerm.toLowerCase()) || filteredSubs.length > 0) {
          return {
            ...group,
            subcategories: filteredSubs
          };
        }
        return null;
      })
      .filter(Boolean) as typeof categoriesGrouped;
  }, [categoriesGrouped, searchTerm]);

  // Get the selected value's info
  const selectedOption = useMemo(() => {
    if (!value) return null;

    // Try to find a main category first
    for (const group of categoriesGrouped) {
      if (group.mainCategoryValue === value) {
        return {
          display: group.mainCategory,
          icon: group.icon,
          color: group.color,
          isMain: true
        };
      }
      
      // Try to find in subcategories
      for (const sub of group.subcategories) {
        if (sub.value === value) {
          const { display } = formatCategoryDisplay(sub.name);
          return {
            display,
            icon: group.icon,
            color: group.color,
            isMain: false
          };
        }
      }
    }
    
    return null;
  }, [value, categoriesGrouped]);
  
  // Trigger entrance animation on mount
  useEffect(() => {
    if (triggerRef.current) {
      gsap.fromTo(
        triggerRef.current,
        { scale: 0.95, opacity: 0.7 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.4, 
          ease: 'elastic.out(1, 0.5)'
        }
      );
    }
  }, []);
  
  // Handle dropdown open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setSearchTerm('');

    // Animation for opening/closing the dropdown
    if (contentRef.current) {
      if (open) {
        // Reset search and opacity for items
        gsap.set(contentRef.current.querySelectorAll('.category-group'), { 
          opacity: 0, 
          y: 10
        });
        
        // Special attention animation for search box
        gsap.fromTo(
          contentRef.current.querySelector('.search-container'), 
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        
        // Animate groups with stagger
        gsap.to(contentRef.current.querySelectorAll('.category-group'), {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.3,
          ease: 'power2.out',
          delay: 0.15
        });
      } else {
        // Close animation
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -5,
          duration: 0.2
        });
      }
    }
  };
  
  // Calculate estimated width for dropdown
  const minDropdownWidth = useMemo(() => {
    const baseWidth = 280;
    return Math.max(baseWidth, triggerRef.current?.offsetWidth || baseWidth);
  }, [isOpen]);
  
  // Handle category item press animation
  const handleCategoryPress = (categoryValue: string) => {
    // Add "press" effect
    if (contentRef.current) {
      const item = Array.from(contentRef.current.querySelectorAll('.category-item'))
        .find(el => (el as HTMLElement).dataset.value === categoryValue);
      
      if (item) {
        gsap.timeline()
          .to(item, { scale: 0.95, duration: 0.1 })
          .to(item, { 
            scale: 1, 
            duration: 0.3, 
            ease: 'elastic.out(1.2, 0.5)',
            onComplete: () => onValueChange(categoryValue)
          });
      } else {
        onValueChange(categoryValue);
      }
    } else {
      onValueChange(categoryValue);
    }
  };

  return (
    <div className="relative">
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
        onOpenChange={handleOpenChange}
        open={isOpen}
      >
        <SelectTrigger 
          ref={triggerRef}
          disabled={disabled} 
          className="relative overflow-hidden rounded-xl h-11 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-md shadow-sm border border-[#E5E5EA] dark:border-[#3A3A3C] focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] focus:ring-opacity-30 dark:focus:ring-opacity-30 transition-all hover:shadow-md group"
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center rounded-full w-8 h-8 ${selectedOption.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100')} dark:bg-opacity-20 transition-all group-hover:scale-110`}>
                  {selectedOption.icon && <selectedOption.icon className={`h-4 w-4 ${selectedOption.color}`} />}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{selectedOption.isMain ? selectedOption.display : selectedOption.display.split(' › ')[1]}</span>
                  {!selectedOption.isMain && (
                    <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">{selectedOption.display.split(' › ')[0]}</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-[#8E8E93] dark:text-[#98989D]">{placeholder}</span>
            )}
          </SelectValue>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className={`h-4 w-4 text-[#8E8E93] dark:text-[#98989D] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 dark:from-black/5 dark:to-black/10 pointer-events-none" />
        </SelectTrigger>
        
        <SelectContent 
          ref={contentRef}
          className="bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-lg rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-lg overflow-hidden"
          style={{ minWidth: `${minDropdownWidth}px` }}
          align="center"
        >
          <div className="search-container p-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 py-2 pr-3 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] transition-all"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto px-1 pb-1">
            {filteredCategories.map((group, groupIndex) => (
              <div key={group.mainCategory} className="category-group">
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-lg pt-1 pb-0.5 px-2">
                  <div className="flex items-center gap-2 py-2">
                    <div className={`flex items-center justify-center rounded-full w-6 h-6 ${group.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100')} dark:bg-opacity-20`}>
                      {<group.icon className={`h-3 w-3 ${group.color}`} />}
                    </div>
                    <span className="text-sm font-semibold">{group.mainCategory}</span>
                  </div>
                </div>
                
                <div className="px-1 py-0.5">
                  <SelectItem 
                    key={group.mainCategoryValue}
                    value={group.mainCategoryValue}
                    className="category-item group flex items-center rounded-lg my-0.5 transition-all hover:bg-[#F2F2F7] dark:hover:bg-[#3A3A3C] focus:bg-[#F2F2F7] dark:focus:bg-[#3A3A3C] pl-10 relative overflow-hidden"
                    data-value={group.mainCategoryValue}
                    onMouseDown={() => handleCategoryPress(group.mainCategoryValue)}
                  >
                    <motion.div
                      className="absolute left-2 flex items-center justify-center rounded-full w-6 h-6 bg-[#E5F1FF] dark:bg-[#0A3060] group-hover:scale-110 transition-transform"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {<group.icon className={`h-3.5 w-3.5 ${group.color}`} />}
                    </motion.div>
                    <div>
                      <span className="font-medium">{group.mainCategory}</span>
                      <span className="ml-2 text-xs text-[#007AFF] dark:text-[#0A84FF]">(Main)</span>
                    </div>
                    
                    {/* iOS-style highlight overlay when active */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/0 via-[#007AFF]/0 to-[#007AFF]/0 pointer-events-none group-hover:from-[#007AFF]/5 group-hover:via-[#007AFF]/5 group-hover:to-[#007AFF]/0 dark:group-hover:from-[#0A84FF]/10 dark:group-hover:via-[#0A84FF]/5 dark:group-hover:to-[#0A84FF]/0" />
                  </SelectItem>

                  {/* Subcategories */}
                  <div className="pl-8 space-y-0.5">
                    {group.subcategories.map((sub) => (
                      <SelectItem 
                        key={sub.value}
                        value={sub.value}
                        className="category-item group flex items-center rounded-lg my-0.5 transition-all hover:bg-[#F2F2F7] dark:hover:bg-[#3A3A3C] focus:bg-[#F2F2F7] dark:focus:bg-[#3A3A3C] relative overflow-hidden"
                        data-value={sub.value}
                        onMouseDown={() => handleCategoryPress(sub.value)}
                      >
                        <div className="pl-2 py-1">
                          <span>{sub.name}</span>
                        </div>
                        
                        {/* iOS-style highlight overlay when active */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/0 via-[#007AFF]/0 to-[#007AFF]/0 pointer-events-none group-hover:from-[#007AFF]/5 group-hover:via-[#007AFF]/5 group-hover:to-[#007AFF]/0 dark:group-hover:from-[#0A84FF]/10 dark:group-hover:via-[#0A84FF]/5 dark:group-hover:to-[#0A84FF]/0" />
                      </SelectItem>
                    ))}
                  </div>
                </div>
                
                {groupIndex < filteredCategories.length - 1 && (
                  <div className="px-3 py-1">
                    <div className="border-t border-[#E5E5EA] dark:border-[#3A3A3C]"></div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center text-[#8E8E93] dark:text-[#98989D]">
                <div className="rounded-full bg-[#F2F2F7] dark:bg-[#3A3A3C] p-3 mb-2">
                  <Search className="h-5 w-5" />
                </div>
                <p className="text-sm">No categories found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}