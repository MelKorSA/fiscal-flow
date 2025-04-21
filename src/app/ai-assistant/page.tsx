'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AIAssistant } from '@/components/ai-assistant/ai-assistant';
import { DashboardHeader } from '@/components/dashboard-header';
import { toast } from "sonner";

interface AIAssistantPageProps {}

export default function AIAssistantPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAIQuery = async (query: string): Promise<string> => {
    toast.info("Processing your question...");

    try {
      const response = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText} (${response.status})`;
        const contentType = response.headers.get('content-type');

        // Check if the response is likely JSON before trying to parse
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMsg = `Error: ${errorData.error || response.statusText}`;
            console.error("API Error Response (JSON):", errorData);
          } catch (parseError) {
            console.error("API Error: Failed to parse JSON error response.", parseError);
            // Fallback to status text if JSON parsing fails
          }
        } else {
          // Handle non-JSON responses (likely HTML error page)
          const errorText = await response.text();
          console.error("API Error Response (Non-JSON):", errorText.substring(0, 500)); // Log first 500 chars
          errorMsg = `Server error (${response.status}). Check console for details.`;
        }

        toast.error(errorMsg);
        return `Sorry, I encountered an error processing your request (${response.status}). Please check the console for details.`;
      }

      // If response is OK, proceed to parse JSON
      const result = await response.json();
      toast.dismiss(); // Dismiss the "Processing..." toast
      return result.response;

    } catch (error) {
      console.error("Network or other error calling API:", error);
      toast.error("Failed to connect to the AI service.");
      return "Sorry, I couldn't connect to the AI service right now.";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#1A1A1A] dark:to-[#121212]">
      <DashboardHeader onSearch={() => {}} />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 px-5 md:px-8 lg:px-12 py-8 w-full"
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

        <div className="w-full">
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
            Our AI assistant analyzes your spending patterns, tracks your budget, and helps you understand your financial health with personalized recommendations based on your PostgreSQL database.
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}