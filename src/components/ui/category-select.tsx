'use client';

import React, { useState } from 'react';
import { 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  Command 
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getExpenseCategoryDetails, 
  MainExpenseCategory, 
  isMainCategory,
  getSubcategories,
  getParentCategory,
  availableMainCategoriesArray
} from "@/config/expense-categories";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelect({ 
  value, 
  onValueChange,
  disabled = false,
  placeholder = "Select a category"
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewingCategory, setViewingCategory] = useState<MainExpenseCategory | null>(null);

  // Get the display name for the current value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    if (isMainCategory(value)) {
      return value;
    }
    
    // If it's a subcategory, format it with parent
    const parent = getParentCategory(value);
    return parent ? `${parent} › ${value}` : value;
  };

  // Handle selection of a category or subcategory
  const handleSelect = (selectedValue: string) => {
    if (isMainCategory(selectedValue)) {
      // If a main category has subcategories, show them
      const subcategories = getSubcategories(selectedValue as MainExpenseCategory);
      if (subcategories.length > 0) {
        setViewingCategory(selectedValue as MainExpenseCategory);
        return;
      }
    }
    
    // Otherwise select the value
    onValueChange(selectedValue);
    setOpen(false);
  };

  // Go back to main categories view
  const goBackToMainCategories = () => {
    setViewingCategory(null);
    setSearch("");
  };

  // Get the icon and color for a category
  const getCategoryIcon = (category: string) => {
    const { icon: Icon, color } = getExpenseCategoryDetails(category);
    return (
      <div className="p-1 rounded-full bg-opacity-20" style={{ backgroundColor: `var(--${color.replace('text-', '')}-100)` }}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-xl bg-white/60 dark:bg-[#3A3A3C]/60 backdrop-blur-md shadow-sm border-[0.5px] border-[#DADADC] dark:border-[#48484A]",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {value && getCategoryIcon(value)}
            <span className="truncate">{getDisplayValue()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 min-w-[240px] max-w-[400px] max-h-[400px]">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search categories..." 
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            
            {/* Show Back button when viewing subcategories */}
            {viewingCategory && (
              <CommandGroup>
                <CommandItem
                  onSelect={goBackToMainCategories}
                  className="flex items-center gap-2 py-2"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Back to main categories</span>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Main categories view */}
            {!viewingCategory && (
              <CommandGroup heading="Main Categories">
                {availableMainCategoriesArray
                  .filter(cat => cat.toLowerCase().includes(search.toLowerCase()))
                  .map((category) => {
                    const subcategories = getSubcategories(category);
                    const hasSubcategories = subcategories.length > 0;
                    
                    return (
                      <CommandItem
                        key={category}
                        onSelect={() => handleSelect(category)}
                        value={category}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span>{category}</span>
                        </div>
                        <div className="flex items-center">
                          {value === category && <Check className="h-4 w-4 mr-2" />}
                          {hasSubcategories && <ChevronRight className="h-4 w-4 opacity-50" />}
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            )}
            
            {/* Subcategories view */}
            {viewingCategory && (
              <CommandGroup heading={`${viewingCategory} Subcategories`}>
                {/* First show the parent category itself */}
                <CommandItem
                  key={viewingCategory}
                  onSelect={() => handleSelect(viewingCategory)}
                  value={viewingCategory}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(viewingCategory)}
                    <span>{viewingCategory} (General)</span>
                  </div>
                  {value === viewingCategory && <Check className="h-4 w-4" />}
                </CommandItem>
                
                {/* Then show all subcategories */}
                {getSubcategories(viewingCategory)
                  .filter(subcat => subcat.toLowerCase().includes(search.toLowerCase()))
                  .map((subcategory) => (
                    <CommandItem
                      key={subcategory}
                      onSelect={() => handleSelect(subcategory)}
                      value={subcategory}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2 ml-6">
                        <span>{subcategory}</span>
                      </div>
                      {value === subcategory && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
            
            {/* If search is active and viewing category, show other matching categories */}
            {search && viewingCategory && (
              <CommandGroup heading="Other Matching Categories">
                {availableMainCategoriesArray
                  .filter(cat => 
                    cat !== viewingCategory && 
                    cat.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((category) => (
                    <CommandItem
                      key={category}
                      onSelect={() => handleSelect(category)}
                      value={category}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <span>{category}</span>
                      </div>
                      <div className="flex items-center">
                        {value === category && <Check className="h-4 w-4 mr-2" />}
                        {getSubcategories(category as MainExpenseCategory).length > 0 && (
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}