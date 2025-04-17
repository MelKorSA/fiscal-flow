'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bot, Send, Loader2, Sparkles, SearchIcon } from 'lucide-react';

interface AIQueryProps {
  onQuerySubmit: (query: string) => Promise<string>; // Function to call with the query
}

export function AIQuery({ onQuerySubmit }: AIQueryProps) {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(''); // Clear previous response
    try {
      const aiResponse = await onQuerySubmit(query);
      setResponse(aiResponse);
    } catch (error) { 
      console.error("Error fetching AI response:", error);
      setResponse("Sorry, something went wrong while getting your answer.");
    } finally {
      setIsLoading(false);
      // Optionally clear query after submit: setQuery(''); 
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
            <Bot className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#1D1D1F] dark:text-white">Ask AI</CardTitle>
        </div>
        <CardDescription className="text-xs text-[#8E8E93] dark:text-[#98989D]">
          Ask questions about your finances like "How much did I spend last month?" or "What's my current balance?"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
            <Input 
              type="text"
              placeholder="Type your question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="pl-9 rounded-xl bg-[#F2F2F7]/60 dark:bg-[#38383A]/60 backdrop-blur-md shadow-sm border-0 focus-visible:ring-[#007AFF] dark:focus-visible:ring-[#0A84FF] focus-visible:ring-opacity-30"
              suppressHydrationWarning={true}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()} 
            className="rounded-full bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0A7AEF] h-10 w-10 p-0 flex items-center justify-center"
          >
            {isLoading ? 
              <Loader2 className="h-4 w-4 animate-spin text-white" /> : 
              <Send className="h-4 w-4 text-white" />
            }
            <span className="sr-only">Send Query</span>
          </Button>
        </form>
        
        {(isLoading || response) && (
          <div className={`rounded-xl p-4 ${response ? "bg-[#F2F2F7]/60 dark:bg-[#38383A]/60" : "bg-white/30 dark:bg-[#2C2C2E]/30"} backdrop-blur-md min-h-[60px] transition-all duration-200`}>
            {isLoading && (
              <div className="flex items-center gap-2 text-[#8E8E93] dark:text-[#98989D]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">Processing your question...</p>
              </div>
            )} 
            {response && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                  <p className="text-sm font-medium text-[#8E8E93] dark:text-[#98989D]">AI Response</p>
                </div>
                <p className="text-sm text-[#1D1D1F] dark:text-white leading-relaxed">{response}</p>
              </div>
            )} 
          </div>
        )}

        {!isLoading && !response && (
          <div className="pt-2 pb-2">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setQuery("How much did I spend on groceries?")}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
              >
                Spending on groceries
              </button>
              <button 
                onClick={() => setQuery("What's my current balance?")}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
              >
                Current balance
              </button>
              <button 
                onClick={() => setQuery("How much have I spent this month?")}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
              >
                Monthly spending
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
