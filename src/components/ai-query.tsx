'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bot, Send, Loader2, Sparkles, SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIQueryProps {
  onQuerySubmit: (query: string) => Promise<string>; // Function to call with the query
}

export function AIQuery({ onQuerySubmit }: AIQueryProps) {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [responseAnimationComplete, setResponseAnimationComplete] = useState<boolean>(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Array of example questions
  const exampleQuestions = [
    "How much did I spend on groceries?",
    "What's my total income?",
    "What's my current balance?",
    "How am I doing financially this month?"
  ];
  
  const [currentExampleIndex, setCurrentExampleIndex] = useState<number>(0);
  
  // Cycle through example questions for the placeholder
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentExampleIndex((prevIndex) => (prevIndex + 1) % exampleQuestions.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    setResponse(null);
    setResponseAnimationComplete(false);
    
    try {
      const aiResponse = await onQuerySubmit(query);
      setResponse(aiResponse);
    } catch (error) {
      setResponse("Sorry, I couldn't process your query at this time.");
      console.error("Error querying AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animate scroll to the bottom when new response comes in
  useEffect(() => {
    if (response && responseRef.current) {
      setTimeout(() => setResponseAnimationComplete(true), 500);
    }
  }, [response]);

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
            <Sparkles className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">Ask AI</CardTitle>
        </div>
        <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
          Get insights from your financial data
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-5">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`
            flex items-center bg-[#F2F2F7] dark:bg-[#38383A] 
            rounded-lg transition-all duration-200
            ${isFocused ? 'ring-2 ring-[#007AFF]/20 dark:ring-[#0A84FF]/20' : ''}
          `}>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`e.g., ${exampleQuestions[currentExampleIndex]}`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="border-0 bg-transparent focus-visible:ring-0 text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] dark:placeholder:text-[#8E8E93]"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="pr-2"
            >
              <Button 
                type="submit" 
                size="sm" 
                disabled={isLoading || !query.trim()}
                className={`
                  rounded-full w-8 h-8 p-0 flex items-center justify-center 
                  ${isLoading 
                    ? 'bg-[#E5E5EA] dark:bg-[#48484A] cursor-not-allowed' 
                    : 'bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A7AEF]'
                  }
                `}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-[#8E8E93] dark:text-[#98989D]" />
                ) : (
                  <Send className="h-3 w-3 text-white" />
                )}
                <span className="sr-only">Send query</span>
              </Button>
            </motion.div>
          </div>
        </form>
        
        <AnimatePresence mode="wait">
          {!response && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex flex-col space-y-2"
            >
              <h4 className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">Try asking about:</h4>
              <div className="grid grid-cols-2 gap-2">
                {exampleQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setQuery(question);
                      inputRef.current?.focus();
                    }}
                    className="text-xs text-left px-3 py-2 bg-[#F2F2F7] dark:bg-[#38383A]/70 rounded-lg text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          {(response || isLoading) && (
            <motion.div
              ref={responseRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-lg bg-[#F2F2F7] dark:bg-[#38383A] p-3"
            >
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full mt-0.5 shrink-0">
                  <Bot className="h-3 w-3 text-[#007AFF] dark:text-[#0A84FF]" />
                </div>
                <div className="flex-1 min-h-[2rem] text-[#1D1D1F] dark:text-white text-sm">
                  {isLoading ? (
                    <div className="flex gap-1 items-center">
                      <div className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {response && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          {response}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {responseAnimationComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              className="mt-3 flex justify-end"
            >
              <Button 
                onClick={() => {
                  setResponse(null);
                  setQuery('');
                  inputRef.current?.focus();
                }}
                size="sm"
                variant="ghost"
                className="text-xs text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
              >
                <SearchIcon className="h-3 w-3 mr-1" />
                New question
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
