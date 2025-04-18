'use client';

import React from 'react';
import { 
    ShoppingCart, Bus, Film, Zap, UtensilsCrossed,
    Shirt, HeartPulse, GraduationCap, Plane, Home,
    Receipt, Coffee, BookOpen, Gift, HelpCircle, 
    Scissors, ChevronRight
} from 'lucide-react';

// Base main categories
export type MainExpenseCategory = 
    | "Groceries" | "Transport" | "Entertainment" | "Utilities" | "Dining Out"
    | "Shopping" | "Healthcare" | "Education" | "Travel" | "Rent/Mortgage"
    | "Subscriptions" | "Coffee" | "Books" | "Gifts" | "Other"
    | "Split Transaction";

// Type for subcategories with their parent category
export type Subcategory = {
    name: string;
    parent: MainExpenseCategory;
};

// Combined type for any category reference
export type ExpenseCategory = MainExpenseCategory | string;

// Interface defining the category configuration
interface CategoryConfigItem {
    icon: React.ElementType;
    color: string;
    subcategories?: string[];
}

// Map categories to icons, colors, and their subcategories
const categoryConfig: Record<MainExpenseCategory, CategoryConfigItem> = {
    "Groceries": { 
        icon: ShoppingCart, 
        color: "text-green-500",
        subcategories: ["Supermarket", "Farmer's Market", "Bakery", "Butcher", "Health Foods"]
    },
    "Transport": { 
        icon: Bus, 
        color: "text-blue-500",
        subcategories: ["Public Transit", "Taxi/Rideshare", "Gas", "Parking", "Car Maintenance"]
    },
    "Entertainment": { 
        icon: Film, 
        color: "text-purple-500",
        subcategories: ["Movies", "Concerts", "Games", "Streaming Services", "Sports Events"]
    },
    "Utilities": { 
        icon: Zap, 
        color: "text-yellow-500",
        subcategories: ["Electricity", "Water", "Internet", "Phone", "Gas"]
    },
    "Dining Out": { 
        icon: UtensilsCrossed, 
        color: "text-orange-500",
        subcategories: ["Restaurants", "Fast Food", "Cafe", "Food Delivery", "Bars"]
    },
    "Shopping": { 
        icon: Shirt, 
        color: "text-pink-500",
        subcategories: ["Clothing", "Electronics", "Home Goods", "Personal Care", "Online Shopping"]
    },
    "Healthcare": { 
        icon: HeartPulse, 
        color: "text-red-500",
        subcategories: ["Doctor", "Pharmacy", "Dental", "Vision", "Insurance"]
    },
    "Education": { 
        icon: GraduationCap, 
        color: "text-indigo-500",
        subcategories: ["Tuition", "Books", "Courses", "School Supplies", "Professional Development"]
    },
    "Travel": { 
        icon: Plane, 
        color: "text-cyan-500",
        subcategories: ["Flights", "Hotels", "Car Rental", "Tours", "Vacation Packages"]
    },
    "Rent/Mortgage": { 
        icon: Home, 
        color: "text-teal-500",
        subcategories: ["Rent", "Mortgage", "Insurance", "Property Tax", "HOA Fees"]
    },
    "Subscriptions": { 
        icon: Receipt, 
        color: "text-gray-500",
        subcategories: ["Streaming", "Software", "Membership Fees", "News/Magazines", "Digital Services"]
    },
    "Coffee": { 
        icon: Coffee, 
        color: "text-amber-700",
        subcategories: ["Cafe Coffee", "Coffee Beans", "Coffee Equipment"]
    },
    "Books": { 
        icon: BookOpen, 
        color: "text-sky-600",
        subcategories: ["Fiction", "Non-Fiction", "Audiobooks", "E-Books", "Magazines"]
    },
    "Gifts": { 
        icon: Gift, 
        color: "text-rose-500",
        subcategories: ["Birthday", "Holiday", "Wedding", "Anniversary", "Charity"]
    },
    "Other": { 
        icon: HelpCircle, 
        color: "text-slate-500",
        subcategories: ["Miscellaneous", "Unplanned Expenses"]
    },
    "Split Transaction": { 
        icon: Scissors, 
        color: "text-blue-500"
    }
};

// Helper to check if a string is a main category
export const isMainCategory = (category: string): boolean => {
    return Object.keys(categoryConfig).includes(category);
};

// Get the parent category for a subcategory
export const getParentCategory = (subcategory: string): MainExpenseCategory | null => {
    for (const [parent, config] of Object.entries(categoryConfig)) {
        if (config.subcategories?.includes(subcategory)) {
            return parent as MainExpenseCategory;
        }
    }
    return null;
};

// Get category details (icon, color) for any category or subcategory
export const getExpenseCategoryDetails = (category: string | ExpenseCategory) => {
    if (isMainCategory(category as string)) {
        return categoryConfig[category as MainExpenseCategory];
    }
    
    // For subcategories, find and return the parent's icon/color
    const parent = getParentCategory(category as string);
    return parent ? categoryConfig[parent] : categoryConfig["Other"];
};

// Get subcategories for a main category
export const getSubcategories = (mainCategory: MainExpenseCategory): string[] => {
    return categoryConfig[mainCategory]?.subcategories || [];
};

// Get all available main categories as an array
export const availableMainCategoriesArray: MainExpenseCategory[] = Object.keys(categoryConfig) as MainExpenseCategory[];

// Helper to get all categories and subcategories flattened
export const getAllCategoriesFlat = (): string[] => {
    const categories: string[] = [...availableMainCategoriesArray];
    
    // Add all subcategories
    for (const category of availableMainCategoriesArray) {
        const subcats = getSubcategories(category);
        if (subcats.length > 0) {
            categories.push(...subcats);
        }
    }
    
    return categories;
};

// Get all categories with their subcategories (for UI presentation)
export const getCategoriesWithSubcategories = (): Record<MainExpenseCategory, string[]> => {
    const result: Partial<Record<MainExpenseCategory, string[]>> = {};
    
    for (const category of availableMainCategoriesArray) {
        result[category] = getSubcategories(category);
    }
    
    return result as Record<MainExpenseCategory, string[]>;
};

// Function to get a flat list of category options for a simple Select component
export const getFlatCategoryOptions = (): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  availableMainCategoriesArray.forEach(mainCategory => {
    if (mainCategory === 'Split Transaction') return; // Exclude Split Transaction itself

    const mainValue = `main-${mainCategory}`;
    options.push({ value: mainValue, label: mainCategory });

    const subcategories = getSubcategories(mainCategory);
    subcategories.forEach(subCategory => {
      const subValue = `sub-${mainCategory}-${subCategory}`;
      // Use a slightly indented label for subcategories for clarity
      options.push({ value: subValue, label: `  ${subCategory}` }); 
    });
  });
  return options;
};

// For backward compatibility
export const availableExpenseCategoriesArray: string[] = getAllCategoriesFlat();

// Function to format a category display with parent if it's a subcategory
export const formatCategoryDisplay = (category: string): { display: string, isSubcategory: boolean } => {
    const parent = getParentCategory(category);
    if (parent) {
        return { 
            display: `${parent} › ${category}`, 
            isSubcategory: true 
        };
    }
    return { display: category, isSubcategory: false };
};

// Function to parse the prefixed value (e.g., "main-Books", "sub-Transport-Gas") back to the original category name
export const parseCategoryValue = (value: string): string => {
  if (value.startsWith('main-')) {
    return value.substring(5); // Remove 'main-'
  }
  if (value.startsWith('sub-')) {
    // Find the last hyphen, the part after it is the subcategory name
    const lastHyphenIndex = value.lastIndexOf('-');
    if (lastHyphenIndex > 3) { // Ensure it's not the hyphen after 'sub'
      return value.substring(lastHyphenIndex + 1);
    }
  }
  // If no prefix or invalid format, return the value as is (fallback)
  return value;
};

