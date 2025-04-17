'use client';

import React from 'react';
import {
    ShoppingCart, Bus, Film, Zap, UtensilsCrossed,
    Shirt, HeartPulse, GraduationCap, Plane, Home,
    Receipt, Coffee, BookOpen, Gift, HelpCircle // Add more as needed
} from 'lucide-react';

export type ExpenseCategory = 
    | "Groceries" | "Transport" | "Entertainment" | "Utilities" | "Dining Out"
    | "Shopping" | "Healthcare" | "Education" | "Travel" | "Rent/Mortgage"
    | "Subscriptions" | "Coffee" | "Books" | "Gifts" | "Other";

// Map categories to icons and colors (tailwind classes)
const categoryConfig: Record<ExpenseCategory, { icon: React.ElementType, color: string }> = {
    "Groceries": { icon: ShoppingCart, color: "text-green-500" },
    "Transport": { icon: Bus, color: "text-blue-500" },
    "Entertainment": { icon: Film, color: "text-purple-500" },
    "Utilities": { icon: Zap, color: "text-yellow-500" },
    "Dining Out": { icon: UtensilsCrossed, color: "text-orange-500" },
    "Shopping": { icon: Shirt, color: "text-pink-500" },
    "Healthcare": { icon: HeartPulse, color: "text-red-500" },
    "Education": { icon: GraduationCap, color: "text-indigo-500" },
    "Travel": { icon: Plane, color: "text-cyan-500" },
    "Rent/Mortgage": { icon: Home, color: "text-teal-500" },
    "Subscriptions": { icon: Receipt, color: "text-gray-500" },
    "Coffee": { icon: Coffee, color: "text-amber-700" }, // Example: Brown for Coffee
    "Books": { icon: BookOpen, color: "text-sky-600" },
    "Gifts": { icon: Gift, color: "text-rose-500" },
    "Other": { icon: HelpCircle, color: "text-slate-500" },
};

export const getExpenseCategoryDetails = (category: string | ExpenseCategory) => {
    return categoryConfig[category as ExpenseCategory] || categoryConfig["Other"];
};

// You might want to export the categories array as well if forms need it
export const availableExpenseCategoriesArray: ExpenseCategory[] = Object.keys(categoryConfig) as ExpenseCategory[];

