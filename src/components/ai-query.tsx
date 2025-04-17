'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Bot, Send, Loader2 } from 'lucide-react';

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
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg">
      <CardHeader>
          <div className="flex items-center space-x-2">
             <Bot className="h-5 w-5 text-purple-600" />
             <CardTitle>Ask AI</CardTitle>
          </div>
         <CardDescription>Ask questions about your finances (e.g., "How much did I spend on groceries?", "What was my total income last month?").</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input 
            type="text"
            placeholder="Type your question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !query.trim()} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
             <span className="sr-only">Send Query</span>
          </Button>
        </form>
         {/* Response Area */} 
        {(isLoading || response) && (
            <div className="p-3 bg-muted/50 dark:bg-muted/30 rounded-md text-sm min-h-[40px]">
                {isLoading && <p className="text-muted-foreground italic flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Thinking...</p>} 
                {response && <p className="text-foreground">{response}</p>} 
            </div>
         )}
      </CardContent>
    </Card>
  );
}
