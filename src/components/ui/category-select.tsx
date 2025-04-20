'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight, Search, X, Sparkles } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  availableMainCategoriesArray,
  getSubcategories,
  formatCategoryDisplay,
  getExpenseCategoryDetails,
  parseCategoryValue,
  MainExpenseCategory
} from "@/config/expense-categories";

export interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  aiSuggestion?: { category: string; confidence: number } | null;
  isCategorizing?: boolean;
  description?: string;
  required?: boolean;
}

export function CategorySelect({ 
  value, 
  onValueChange, 
  disabled = false, 
  placeholder = "Select a category",
  aiSuggestion = null,
  isCategorizing = false,
  description = "",
  required = false
}: CategorySelectProps) {
  // State
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [recentCategories, setRecentCategories] = useState<string[]>([
    "main-Groceries", 
    "sub-Transport-Gas", 
    "main-Coffee"
  ]);
  
  // Get details of the selected category
  const selectedDetails = React.useMemo(() => {
    if (!value) return null;

    // Check if it's a main category
    if (value.startsWith('main-')) {
      const mainCategory = value.substring(5) as MainExpenseCategory;
      const categoryInfo = getExpenseCategoryDetails(mainCategory);
      if (categoryInfo) {
        return {
          name: mainCategory,
          icon: categoryInfo.icon,
          color: categoryInfo.color,
          isSubcategory: false,
          parent: null
        };
      }
    }
    
    // Check if it's a subcategory
    if (value.startsWith('sub-')) {
      const parts = value.split('-');
      if (parts.length >= 3) {
        const mainCategory = parts[1] as MainExpenseCategory;
        const subcategory = parts.slice(2).join('-');
        const categoryInfo = getExpenseCategoryDetails(mainCategory);
        
        if (categoryInfo) {
          return {
            name: subcategory,
            icon: categoryInfo.icon,
            color: categoryInfo.color,
            isSubcategory: true,
            parent: mainCategory
          };
        }
      }
    }
    
    return null;
  }, [value]);

  // Filter categories based on search value
  const filteredCategories = React.useMemo(() => {
    return availableMainCategoriesArray.filter(category => {
      if (!searchValue) return true;
      
      const lowerSearch = searchValue.toLowerCase();
      if (category.toLowerCase().includes(lowerSearch)) return true;
      
      // Also check subcategories
      const subCategories = getSubcategories(category);
      return subCategories.some(sub => sub.toLowerCase().includes(lowerSearch));
    });
  }, [searchValue]);

  const handleCategorySelect = (categoryValue: string) => {
    // Add to recent categories
    setRecentCategories(prev => {
      const newRecents = prev.filter(c => c !== categoryValue);
      return [categoryValue, ...newRecents].slice(0, 5);
    });
    
    onValueChange(categoryValue);
    setOpen(false);
    setSearchValue("");
  };

  // Log when dropdown is opened/closed to help debug
  useEffect(() => {
    if (open) {
      console.log("CategorySelect dropdown opened");
    } else {
      console.log("CategorySelect dropdown closed");
    }
  }, [open]);

  return (
    <div className="relative">
      {/* Main DropdownMenu Replacement */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        {/* Trigger Button */}
        <DropdownMenuTrigger 
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2 px-4 py-2.5 
            bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-xl
            rounded-xl border border-[#E5E5EA] dark:border-[#38383A]
            transition-all duration-200
            ${required && !value ? 'ring-2 ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'}
          `}
          onClick={() => console.log("Dropdown trigger clicked")}  // Debug log
        >
          {selectedDetails ? (
            <div className="flex items-center gap-2 flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${selectedDetails.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100')}
                dark:bg-opacity-30
              `}>
                <selectedDetails.icon className={`h-4 w-4 ${selectedDetails.color}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1D1D1F] dark:text-white">
                  {selectedDetails.name}
                </div>
                {selectedDetails.isSubcategory && (
                  <div className="text-xs text-[#8E8E93] dark:text-[#98989D]">
                    {selectedDetails.parent}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-[#8E8E93] dark:text-[#98989D] text-left flex-1">{placeholder}</span>
          )}
          <ChevronDown className={`
            h-4 w-4 text-[#8E8E93] dark:text-[#98989D] 
            transition-transform duration-300
            ${open ? 'rotate-180' : ''}
          `} />
        </DropdownMenuTrigger>

        {/* Dropdown Content */}
        <DropdownMenuContent 
          className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[400px] overflow-y-auto p-2"
          align="start"
          sideOffset={5}
        >
          {/* Search Input */}
          <div className="sticky top-0 pb-2 bg-background z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search categories..."
                className="pl-10 pr-8"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Recent Categories */}
          {!searchValue && recentCategories.length > 0 && (
            <>
              <DropdownMenuLabel>Recent</DropdownMenuLabel>
              <div className="flex flex-wrap gap-1 mb-2 px-2">
                {recentCategories.map(recentValue => {
                  const details = (() => {
                    if (recentValue.startsWith('main-')) {
                      const mainCategory = recentValue.substring(5) as MainExpenseCategory;
                      const categoryInfo = getExpenseCategoryDetails(mainCategory);
                      if (categoryInfo) {
                        return {
                          name: mainCategory,
                          icon: categoryInfo.icon,
                          color: categoryInfo.color
                        };
                      }
                    } else if (recentValue.startsWith('sub-')) {
                      const parts = recentValue.split('-');
                      if (parts.length >= 3) {
                        const mainCategory = parts[1] as MainExpenseCategory;
                        const subcategory = parts.slice(2).join('-');
                        const categoryInfo = getExpenseCategoryDetails(mainCategory);
                        
                        if (categoryInfo) {
                          return {
                            name: subcategory,
                            icon: categoryInfo.icon,
                            color: categoryInfo.color
                          };
                        }
                      }
                    }
                    return null;
                  })();

                  if (!details) return null;

                  return (
                    <button
                      key={recentValue}
                      onClick={() => handleCategorySelect(recentValue)}
                      className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs"
                    >
                      <details.icon className={`h-3 w-3 ${details.color}`} />
                      <span className="truncate max-w-[80px]">{details.name}</span>
                    </button>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Categories and Subcategories */}
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const categoryDetails = getExpenseCategoryDetails(category);
              const subCategories = getSubcategories(category);
              
              if (subCategories.length === 0) {
                // Simple category without subcategories
                return (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => handleCategorySelect(`main-${category}`)}
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center mr-2
                      ${categoryDetails.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100')}
                      dark:bg-opacity-30
                    `}>
                      <categoryDetails.icon className={`h-3.5 w-3.5 ${categoryDetails.color}`} />
                    </div>
                    {category}
                  </DropdownMenuItem>
                );
              }
              
              // Category with subcategories
              return (
                <DropdownMenuSub key={category}>
                  <DropdownMenuSubTrigger>
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center mr-2
                      ${categoryDetails.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100')}
                      dark:bg-opacity-30
                    `}>
                      <categoryDetails.icon className={`h-3.5 w-3.5 ${categoryDetails.color}`} />
                    </div>
                    <span className="flex-1">{category}</span>
                  </DropdownMenuSubTrigger>
                  
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                      className="min-w-[160px] max-h-[300px] overflow-y-auto"
                      sideOffset={2}
                      alignOffset={-5}
                    >
                      <DropdownMenuItem
                        onClick={() => handleCategorySelect(`main-${category}`)}
                      >
                        <span className="font-medium">{category}</span>
                        <Check className={`ml-auto h-4 w-4 ${value === `main-${category}` ? 'opacity-100' : 'opacity-0'}`} />
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {subCategories.map((subCategory) => (
                        <DropdownMenuItem
                          key={`${category}-${subCategory}`}
                          onClick={() => handleCategorySelect(`sub-${category}-${subCategory}`)}
                        >
                          {subCategory}
                          <Check 
                            className={`ml-auto h-4 w-4 ${value === `sub-${category}-${subCategory}` ? 'opacity-100' : 'opacity-0'}`} 
                          />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            })
          ) : (
            <div className="py-6 text-center">
              <Search className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No categories found</p>
              <p className="text-xs text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* AI Suggestion Indicator */}
      {(aiSuggestion || isCategorizing) && description && (
        <div className={`
          absolute top-0 right-1 -mt-6 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs
          ${aiSuggestion ? 'bg-[#E5F8EF]/80 dark:bg-[#0C372A]/80 text-[#34C759] dark:text-[#30D158]' : ''}
          ${isCategorizing ? 'bg-[#F2F2F7]/80 dark:bg-[#2C2C2E]/80 text-[#8E8E93] dark:text-[#98989D]' : ''}
          backdrop-blur-sm
        `}>
          {isCategorizing ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
              <span>AI analyzing...</span>
            </>
          ) : aiSuggestion ? (
            <>
              <Sparkles className="h-3 w-3" />
              <span 
                className="cursor-pointer hover:underline"
                onClick={() => onValueChange(aiSuggestion.category)}
              >
                AI suggests: {parseCategoryValue(aiSuggestion.category)}
              </span>
            </>
          ) : null}
        </div>
      )}
      
      {/* Hidden Select for form compatibility */}
      <div className="hidden">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {availableMainCategoriesArray.map(category => (
              <React.Fragment key={category}>
                <SelectItem value={`main-${category}`}>
                  {category}
                </SelectItem>
                {getSubcategories(category).map(subcategory => (
                  <SelectItem key={`${category}-${subcategory}`} value={`sub-${category}-${subcategory}`}>
                    {subcategory}
                  </SelectItem>
                ))}
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}