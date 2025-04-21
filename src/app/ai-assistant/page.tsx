'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AIAssistant } from '@/components/ai-assistant/ai-assistant';
import { DashboardHeader } from '@/components/dashboard-header';
import { toast } from "sonner";

interface AIAssistantPageProps {}

export default function AIAssistantPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Add effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAIQuery = async (query: string): Promise<string> => {
    toast.info("Processing your question...");
    setIsLoading(true);

    try {
      // Fetch required financial data from API endpoints
      const [accountsResponse, expensesResponse, incomeResponse] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/expenses'),
        fetch('/api/income')
      ]);

      // Check if any API calls failed
      if (!accountsResponse.ok || !expensesResponse.ok || !incomeResponse.ok) {
        throw new Error("Failed to fetch required financial data");
      }

      // Parse the responses
      const accounts = await accountsResponse.json();
      const expenses = await expensesResponse.json();
      const income = await incomeResponse.json();

      // Call the AI query endpoint with all required data
      const response = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          accounts, 
          expenses, 
          income 
        }),
      });

      // Log full response for debugging
      console.log(`API Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText} (${response.status})`;
        const contentType = response.headers.get('content-type');

        try {
          // Try to parse as JSON regardless of content type for debugging
          const errorText = await response.text();
          console.error("Raw API Error Response:", errorText);
          
          // Attempt to parse the response as JSON if it looks like JSON
          if (errorText && (errorText.startsWith('{') || errorText.startsWith('['))) {
            try {
              const errorData = JSON.parse(errorText);
              errorMsg = `Error: ${errorData.error || response.statusText}`;
              if (errorData.details) {
                errorMsg += ` - ${errorData.details}`;
              }
              console.error("Parsed API Error Response:", errorData);
            } catch (jsonError) {
              console.error("Failed to parse error response as JSON:", jsonError);
            }
          }
        } catch (textError) {
          console.error("Failed to read error response text:", textError);
        }

        toast.error(errorMsg);
        setIsLoading(false);
        return `Sorry, I encountered an error processing your request: ${errorMsg}`;
      }

      // If response is OK, proceed to parse JSON
      const responseText = await response.text();
      console.log("Raw API Success Response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse successful response as JSON:", parseError);
        toast.error("Failed to parse response from server");
        setIsLoading(false);
        return "Sorry, I received an invalid response. Please try again.";
      }
      
      toast.dismiss(); // Dismiss the "Processing..." toast
      
      if (!result.response) {
        toast.error("Received empty response from AI service");
        setIsLoading(false);
        return "Sorry, I received an empty response. Please try again.";
      }
      
      if (result.mode === "demo") {
        toast.warning("Running in demo mode (no API key configured)");
      }
      
      setIsLoading(false);
      return result.response;

    } catch (error) {
      console.error("Network or other error calling API:", error);
      toast.error(`Failed to connect to the AI service: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
      return `Sorry, I couldn't connect to the AI service: ${error instanceof Error ? error.message : String(error)}`;
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