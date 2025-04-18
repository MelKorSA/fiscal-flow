'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
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
  parseCategoryValue,
  MainExpenseCategory
} from "@/config/expense-categories";
import { FixedSizeList as List } from 'react-window';
import { 
  motion, 
  AnimatePresence, 
  useAnimation, 
  Variants 
} from 'framer-motion';
import { gsap } from 'gsap';
import { Search, ChevronDown, X, ArrowRight, ChevronRight } from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Animations variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      ease: "easeOut"
    } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const searchVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

export function CategorySelect({ value, onValueChange, disabled = false, placeholder = "Select a category" }: CategorySelectProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<MainExpenseCategory | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showRecents, setShowRecents] = useState(true);
  
  // Refs
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  
  // Controls
  const controls = useAnimation();
  
  // Recently used categories (could be persisted in localStorage in a real app)
  const [recentCategories, setRecentCategories] = useState<string[]>([
    "main-Groceries", 
    "sub-Transport-Gas", 
    "main-Coffee"
  ]);

  // Process and organize category data
  const processedCategories = useMemo(() => {
    const result: {
      id: string;
      mainCategory: MainExpenseCategory;
      icon: React.ElementType;
      color: string;
      subcategories: {
        id: string;
        name: string;
        value: string;
      }[];
    }[] = [];
    
    availableMainCategoriesArray.forEach(mainCategory => {
      if (mainCategory === 'Split Transaction') return;
      
      const { icon, color } = getExpenseCategoryDetails(mainCategory);
      const mainCategoryValue = `main-${mainCategory}`;
      
      const subcategories = getSubcategories(mainCategory).map(subCategory => ({
        id: `${mainCategory}-${subCategory}`,
        name: subCategory,
        value: `sub-${mainCategory}-${subCategory}`
      }));
      
      result.push({
        id: mainCategory,
        mainCategory,
        icon,
        color,
        subcategories
      });
    });
    
    return result;
  }, []);
  
  // Filter categories based on search value
  const filteredCategories = useMemo(() => {
    if (!searchValue.trim()) return processedCategories;
    
    const lowercaseSearch = searchValue.toLowerCase();
    return processedCategories
      .map(category => {
        const matchingSubcategories = category.subcategories.filter(
          sub => sub.name.toLowerCase().includes(lowercaseSearch)
        );
        
        const mainCategoryMatches = category.mainCategory.toLowerCase().includes(lowercaseSearch);
        
        if (mainCategoryMatches || matchingSubcategories.length > 0) {
          return {
            ...category,
            subcategories: mainCategoryMatches 
              ? category.subcategories 
              : matchingSubcategories
          };
        }
        return null;
      })
      .filter(Boolean) as typeof processedCategories;
  }, [processedCategories, searchValue]);
  
  // Find details for the selected category
  const selectedDetails = useMemo(() => {
    if (!value) return null;
    
    // Check if it's a main category
    if (value.startsWith('main-')) {
      const mainCategory = value.substring(5) as MainExpenseCategory;
      const categoryInfo = processedCategories.find(c => c.mainCategory === mainCategory);
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
        const categoryInfo = processedCategories.find(c => c.mainCategory === mainCategory);
        
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
  }, [value, processedCategories]);
  
  // Handle dropdown open/close
  useEffect(() => {
    if (isOpen) {
      controls.start("visible");
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      controls.start("hidden");
      setActiveCategory(null);
      setSearchValue("");
    }
  }, [isOpen, controls]);
  
  // Entrance animation
  useEffect(() => {
    if (triggerRef.current) {
      gsap.fromTo(
        triggerRef.current,
        { y: 5, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'elastic.out(1, 0.8)' }
      );
    }
  }, []);

  // Add some custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ios-scrollbars::-webkit-scrollbar {
        width: 6px;
      }
      
      .ios-scrollbars::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .ios-scrollbars::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
        border-radius: 3px;
      }
      
      .dark .ios-scrollbars::-webkit-scrollbar-thumb {
        background-color: rgba(255,255,255,0.1);
      }
      
      @media (hover: hover) {
        .ios-scrollbars::-webkit-scrollbar-thumb {
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .ios-scrollbars:hover::-webkit-scrollbar-thumb {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function to remove the style when the component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle category selection
  const handleCategorySelect = (categoryValue: string) => {
    // Add haptic feedback (vibration) if supported
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
    
    // Add to recent categories
    setRecentCategories(prev => {
      const newRecents = prev.filter(c => c !== categoryValue);
      return [categoryValue, ...newRecents].slice(0, 5);
    });
    
    // Close dropdown and update value
    setIsOpen(false);
    onValueChange(categoryValue);
  };
  
  // Handle subcategory display
  const handleCategoryClick = (category: MainExpenseCategory) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
      // Scroll to show subcategories if using a virtualized list
      if (listRef.current) {
        const index = processedCategories.findIndex(c => c.mainCategory === category);
        if (index !== -1) {
          listRef.current.scrollToItem(index, 'center');
        }
      }
    }
  };

  // Handle direct selection (either select main category or show subcategories)
  const handleDirectSelection = (category: MainExpenseCategory, directSelect = false) => {
    if (directSelect) {
      handleCategorySelect(`main-${category}`);
    } else {
      handleCategoryClick(category);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchValue("");
    searchInputRef.current?.focus();
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative ios-category-select">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        disabled={disabled}
        onClick={toggleDropdown}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5 
          bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-xl
          rounded-xl border border-[#E5E5EA] dark:border-[#38383A]
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'}
        `}
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
          ${isOpen ? 'rotate-180' : ''}
        `} />
      </button>
      
      {/* Custom dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className={`
              absolute z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] right-0
              bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl
              rounded-xl border border-[#E5E5EA] dark:border-[#38383A]
              p-3 shadow-xl overflow-hidden
            `}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Search box */}
            <motion.div 
              className="mb-2" 
              variants={searchVariants}
            >
              <div className="relative">
                <div className={`
                  absolute left-3 top-1/2 transform -translate-y-1/2 
                  transition-all duration-200
                  ${isSearchFocused ? 'text-[#007AFF] dark:text-[#0A84FF]' : 'text-[#8E8E93] dark:text-[#98989D]'}
                `}>
                  <Search className="h-4 w-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search categories..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`
                    w-full h-10 pl-10 pr-10 py-2
                    bg-[#F2F2F7] dark:bg-[#2C2C2E] 
                    rounded-xl text-[#1D1D1F] dark:text-white
                    placeholder:text-[#8E8E93] dark:placeholder:text-[#98989D]
                    outline-none ring-0 border-2 border-transparent
                    transition-all duration-200
                    ${isSearchFocused ? 'border-[#007AFF] dark:border-[#0A84FF]' : ''}
                  `}
                />
                <AnimatePresence>
                  {searchValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93] dark:text-[#98989D] hover:text-[#FF3B30] dark:hover:text-[#FF453A] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Recent categories */}
            <AnimatePresence>
              {showRecents && searchValue === "" && recentCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider">Recent</h3>
                    <button 
                      onClick={() => setShowRecents(false)}
                      className="text-xs text-[#007AFF] dark:text-[#0A84FF]"
                    >
                      Hide
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {recentCategories.map(recentValue => {
                      const details = (() => {
                        if (recentValue.startsWith('main-')) {
                          const mainCategory = recentValue.substring(5) as MainExpenseCategory;
                          const categoryInfo = processedCategories.find(c => c.mainCategory === mainCategory);
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
                            const categoryInfo = processedCategories.find(c => c.mainCategory === mainCategory);
                            
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
                        <motion.button
                          key={recentValue}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCategorySelect(recentValue)}
                          className={`
                            flex items-center gap-1.5 px-3 py-1.5
                            bg-[#F2F2F7] dark:bg-[#2C2C2E]
                            rounded-full hover:shadow-sm
                            transition-all duration-200
                          `}
                        >
                          <details.icon className={`h-3.5 w-3.5 ${details.color}`} />
                          <span className="text-xs text-[#1D1D1F] dark:text-white truncate max-w-[100px]">
                            {details.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories list */}
            <div className="max-h-[300px] overflow-y-auto ios-scrollbars">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1"
              >
                {filteredCategories.map((category) => (
                  <div key={category.id}>
                    {/* Main category */}
                    <motion.div 
                      variants={itemVariants}
                      className="relative"
                    >
                      <motion.button
                        onClick={() => handleDirectSelection(category.mainCategory)}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-2
                          rounded-lg text-left group
                          ${activeCategory === category.mainCategory ? 'bg-[#F2F2F7] dark:bg-[#2C2C2E]' : 'hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E]'}
                          transition-colors duration-150
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center
                              ${category.color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('700', '100')}
                              dark:bg-opacity-30 group-hover:scale-110 transition-transform duration-200
                            `}
                            whileTap={{ scale: 0.9 }}
                          >
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                          </motion.div>
                          <span className="font-medium text-[#1D1D1F] dark:text-white">
                            {category.mainCategory}
                          </span>
                        </div>
                        
                        {category.subcategories.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {/* Changed button to div to avoid nesting */}
                            <div
                              role="button" // Add role for accessibility
                              tabIndex={0} // Make it focusable
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent button's onClick
                                handleCategorySelect(`main-${category.mainCategory}`);
                              }}
                              onKeyDown={(e) => { // Add keyboard interaction
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  handleCategorySelect(`main-${category.mainCategory}`);
                                }
                              }}
                              className="text-xs bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 text-[#007AFF] dark:text-[#0A84FF] px-2 py-0.5 rounded-full hover:bg-[#007AFF]/20 dark:hover:bg-[#0A84FF]/30 transition-colors cursor-pointer" // Added cursor-pointer
                            >
                              Select
                            </div>
                            <ChevronRight 
                              className={`
                                h-4 w-4 text-[#8E8E93] dark:text-[#98989D]
                                transition-transform duration-200
                                ${activeCategory === category.mainCategory ? 'rotate-90' : ''}
                              `}
                            />
                          </div>
                        ) : (
                          <ArrowRight className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D] opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </motion.button>
                    </motion.div>
                    
                    {/* Subcategories */}
                    <AnimatePresence>
                      {activeCategory === category.mainCategory && category.subcategories.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-10 space-y-0.5 overflow-hidden"
                        >
                          {category.subcategories.map((subcategory) => (
                            <motion.button
                              key={subcategory.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCategorySelect(subcategory.value)}
                              className={`
                                w-full flex items-center justify-between gap-2 px-3 py-2
                                rounded-lg text-left
                                hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E]
                                transition-colors duration-150
                              `}
                            >
                              <span className="text-[#1D1D1F] dark:text-white">
                                {subcategory.name}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-[#8E8E93] dark:text-[#98989D] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                
                {filteredCategories.length === 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="py-10 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 mb-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center">
                      <Search className="h-5 w-5 text-[#8E8E93] dark:text-[#98989D]" />
                    </div>
                    <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                      No categories found
                    </p>
                    <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                      Try a different search term
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden Select for form compatibility */}
      <div className="hidden">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {processedCategories.map(category => (
              <React.Fragment key={category.id}>
                <SelectItem value={`main-${category.mainCategory}`}>
                  {category.mainCategory}
                </SelectItem>
                {category.subcategories.map(subcategory => (
                  <SelectItem key={subcategory.id} value={subcategory.value}>
                    {subcategory.name}
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