'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AIAssistant } from '@/components/ai-assistant/ai-assistant';
import { DashboardHeader } from '@/components/dashboard-header';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface AIAssistantPageProps {}

export default function AIAssistantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAIQuery = async (query: string): Promise<string> => {
    toast.info("Processing your question...");
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const lowerQuery = query.toLowerCase();
    
    // Basic examples - in a full implementation, these would be connected to your actual data
    if (lowerQuery.includes("total expense")) { 
      return `Your total recorded expenses are $2,345.50.`; 
    }
    if (lowerQuery.includes("total income")) { 
      return `Your total recorded income is $3,750.00.`; 
    }
    if (lowerQuery.match(/how much.*spent on (\w+)/)) { 
      const match = lowerQuery.match(/spent on (\w+)/); 
      const category = match ? match[1] : null;
      if (category) { 
        return `You spent $185.75 on ${category} this month. This is about 12% of your total monthly expenses.`; 
      }
    }
    if (lowerQuery.includes("balance")) { 
      return `Your current liquid balance across all accounts is $8,670.25.`; 
    }
    if (lowerQuery.includes("saving")) { 
      return `Your current savings rate is 15% of your income. Based on your spending patterns, you could potentially increase this to 22% by reducing restaurant expenses.`; 
    }
    if (lowerQuery.includes("budget")) { 
      return `You're currently under budget in most categories. However, your grocery spending is 15% over budget this month. Would you like me to suggest some ways to reduce this?`; 
    }
    if (lowerQuery.includes("recommend") || lowerQuery.includes("suggestion")) { 
      return `Based on your spending habits, I recommend setting up an automatic transfer of $200 to your savings account each month. This could help you reach your yearly savings goal by October.`; 
    }
    
    return "I'm your financial assistant. Try asking about your expenses, income, budget, or savings. For example, 'How much did I spend on groceries?' or 'What's my current balance?'";
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#1A1A1A] dark:to-[#121212]">
      <DashboardHeader onSearch={() => {}} />
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 px-5 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto w-full"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center text-[#1D1D1F] dark:text-white mb-4"
          >
            Financial AI Assistant
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-center text-[#86868B] dark:text-[#A1A1A6] max-w-2xl"
          >
            Ask questions about your financial data and get personalized insights and recommendations
          </motion.p>
        </div>
        
        <div className="max-w-4xl mx-auto w-full">
          <AIAssistant onQuerySubmit={handleAIQuery} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 mb-8 text-center"
        >
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white mb-4">
            Powered by Advanced Financial Analytics
          </h2>
          <p className="text-[#86868B] dark:text-[#A1A1A6] max-w-2xl mx-auto">
            Our AI assistant analyzes your spending patterns, tracks your budget, and helps you understand your financial health with personalized recommendations.
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}