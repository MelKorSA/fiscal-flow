'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bot, Send, Loader2, Sparkles, SearchIcon, ChevronDown, ChevronUp, CornerDownLeft, RefreshCw, Trash2, User, Wand2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface AIQueryProps {
  onQuerySubmit: (query: string) => Promise<string>; // Function to call with the query
}

interface Conversation {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
}

export function AIQuery({ onQuerySubmit }: AIQueryProps) {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showResponses, setShowResponses] = useState<boolean>(true);
  const [responseAnimationComplete, setResponseAnimationComplete] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  
  const controls = useAnimation();
  
  // Array of example questions with categories
  const exampleQuestions = [
    { text: "How much did I spend on groceries?", category: "spending" },
    { text: "What's my total income this month?", category: "income" },
    { text: "What's my current balance?", category: "balance" },
    { text: "How much did I save this year?", category: "savings" },
    { text: "Show my spending by category", category: "insights" },
    { text: "Compare my income vs expenses", category: "analysis" }
  ];
  
  const [currentExampleIndex, setCurrentExampleIndex] = useState<number>(0);
  
  // Load previous conversations from localStorage
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('aiQueryConversations');
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        // Convert string dates back to Date objects
        const withDates = parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp)
        }));
        setConversations(withDates);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);
  
  // Save conversations to localStorage when updated
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('aiQueryConversations', JSON.stringify(conversations));
    }
  }, [conversations]);
  
  // Cycle through example questions for the placeholder
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentExampleIndex((prevIndex) => (prevIndex + 1) % exampleQuestions.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle conversation history toggling with animation
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
    
    if (historyRef.current) {
      if (!showHistory) {
        // Opening history
        controls.start({
          height: 'auto',
          opacity: 1,
          transition: { duration: 0.4, ease: "anticipate" }
        });
      } else {
        // Closing history
        controls.start({
          height: 0,
          opacity: 0,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    setResponse(null);
    setResponseAnimationComplete(false);
    
    try {
      const aiResponse = await onQuerySubmit(query);
      setResponse(aiResponse);
      
      // Save to conversation history
      const newConversation = {
        id: Date.now().toString(),
        query,
        response: aiResponse,
        timestamp: new Date()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      
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
  
  // Load conversation from history
  const loadConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setQuery(conversation.query);
      setResponse(conversation.response);
      setCurrentConversationId(id);
    }
  };
  
  // Clear all history
  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      setConversations([]);
      localStorage.removeItem('aiQueryConversations');
      setShowHistory(false);
    }
  };
  
  // Format timestamp to friendly string
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };
  
  // Get category color based on category
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'spending':
        return { bg: 'bg-[#FF3B30]/10 dark:bg-[#FF453A]/10', text: 'text-[#FF3B30] dark:text-[#FF453A]' };
      case 'income':
        return { bg: 'bg-[#34C759]/10 dark:bg-[#30D158]/10', text: 'text-[#34C759] dark:text-[#30D158]' };
      case 'balance':
        return { bg: 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/10', text: 'text-[#007AFF] dark:text-[#0A84FF]' };
      case 'savings':
        return { bg: 'bg-[#5856D6]/10 dark:bg-[#5E5CE6]/10', text: 'text-[#5856D6] dark:text-[#5E5CE6]' };
      case 'insights':
        return { bg: 'bg-[#FF9500]/10 dark:bg-[#FF9F0A]/10', text: 'text-[#FF9500] dark:text-[#FF9F0A]' };
      case 'analysis':
        return { bg: 'bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/10', text: 'text-[#AF52DE] dark:text-[#BF5AF2]' };
      default:
        return { bg: 'bg-[#8E8E93]/10 dark:bg-[#98989D]/10', text: 'text-[#8E8E93] dark:text-[#98989D]' };
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 border-b border-[#F2F2F7] dark:border-[#38383A]">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Wand2 className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">Financial Assistant</CardTitle>
          </div>
          
          {conversations.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: showHistory ? -90 : 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleHistory}
                className="h-8 w-8 p-0 rounded-full hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
              >
                {showHistory ? (
                  <ChevronUp className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                )}
                <span className="sr-only">Toggle history</span>
              </Button>
            </motion.div>
          )}
        </div>
        <CardDescription className="text-[#86868B] dark:text-[#A1A1A6] text-sm">
          Ask questions about your financial data and get AI-powered insights
        </CardDescription>
      </CardHeader>
      
      {/* History section with animation */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            ref={historyRef}
            initial={{ height: 0, opacity: 0 }}
            animate={controls}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#F9F9FA] dark:bg-[#2C2C2E] border-b border-[#F2F2F7] dark:border-[#38383A]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[#1D1D1F] dark:text-white">Conversation History</h3>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearHistory}
                    className="h-7 px-2.5 text-xs text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF453A]/10 rounded-full"
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    Clear All
                  </Button>
                </motion.div>
              </div>
              
              <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                      currentConversationId === conv.id 
                        ? 'bg-[#E5E5EA] dark:bg-[#48484A]' 
                        : 'hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#1D1D1F] dark:text-white truncate max-w-[80%]">
                        {conv.query}
                      </span>
                      <span className="text-[#8E8E93] dark:text-[#98989D] text-[10px]">
                        {formatTimestamp(conv.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-[#8E8E93] dark:text-[#98989D] truncate">
                      <span className="inline-block mr-1">
                        <Bot className="h-2.5 w-2.5 inline-block mr-1 relative -top-[1px]" />
                      </span>
                      {conv.response.length > 80 ? conv.response.substring(0, 80) + "..." : conv.response}
                    </div>
                  </motion.button>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-5 text-xs text-[#8E8E93] dark:text-[#98989D]">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    <p>No conversation history yet</p>
                    <p className="mt-1 opacity-70 text-[10px]">Your conversations will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CardContent className="p-4 pt-5">
        {/* Main interaction area */}
        <AnimatePresence mode="wait">
          {(response || isLoading) ? (
            <motion.div
              ref={responseRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
              key="response"
            >
              <div className="flex flex-col space-y-4">
                {/* User query bubble */}
                <motion.div 
                  className="self-end max-w-[80%]"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-2 justify-end">
                    <div className="px-4 py-2.5 bg-gradient-to-br from-[#007AFF] to-[#0A84FF] text-white rounded-2xl rounded-tr-sm shadow-sm">
                      <p className="text-sm">{query}</p>
                    </div>
                    <div className="bg-[#F2F2F7] dark:bg-[#48484A] rounded-full h-8 w-8 flex items-center justify-center mt-1 shadow-sm">
                      <User className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                    </div>
                  </div>
                </motion.div>
                
                {/* AI response bubble */}
                <motion.div 
                  className="self-start max-w-[80%]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex items-start gap-2">
                    <motion.div 
                      className="bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full h-8 w-8 flex items-center justify-center mt-1 shadow-sm"
                      initial={{ rotate: 0 }}
                      animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ 
                        repeat: isLoading ? Infinity : 0, 
                        duration: 2, 
                        ease: "linear" 
                      }}
                    >
                      <Bot className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                    </motion.div>
                    <div className="px-4 py-2.5 bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white rounded-2xl rounded-tl-sm shadow-sm">
                      {isLoading ? (
                        <div className="flex gap-1.5 items-center py-1">
                          <motion.div 
                            initial={{ y: 0 }}
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full" 
                          />
                          <motion.div 
                            initial={{ y: 0 }}
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                            className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full" 
                          />
                          <motion.div 
                            initial={{ y: 0 }}
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                            className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full" 
                          />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-line">{response}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {responseAnimationComplete && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                  className="flex justify-end mt-3 gap-2"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => {
                        setQuery(query);
                        setResponse(null);
                        inputRef.current?.focus();
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/10 px-2.5 rounded-full"
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Ask Again
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => {
                        setQuery('');
                        setResponse(null);
                        inputRef.current?.focus();
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/10 px-2.5 rounded-full"
                    >
                      <SearchIcon className="h-3 w-3 mr-1.5" />
                      New Question
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 space-y-4"
              key="empty-state"
            >
              <motion.div 
                className="flex items-center justify-center"
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 4,
                  ease: "easeInOut"
                }}
              >
                <div className="p-4 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full shadow-sm">
                  <Bot className="h-7 w-7 text-[#007AFF] dark:text-[#0A84FF]" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <h4 className="text-base font-medium text-[#1D1D1F] dark:text-white text-center">
                  Ask me about your finances
                </h4>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] text-center mt-1">
                  I can analyze your spending patterns, track your budget, and help you understand your financial health.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3"
              >
                {exampleQuestions.map((question, index) => {
                  const { bg, text } = getCategoryColor(question.category);
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.4 + (index * 0.1), 
                        duration: 0.3,
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                      onClick={() => {
                        setQuery(question.text);
                        inputRef.current?.focus();
                      }}
                      onMouseEnter={() => setHoverCategory(question.category)}
                      onMouseLeave={() => setHoverCategory(null)}
                      className={`text-xs text-left px-3.5 py-3 bg-white/60 dark:bg-[#2C2C2E]/60 rounded-xl text-[#007AFF] dark:text-[#0A84FF] hover:${bg} shadow-sm transition-all border border-[#E5E5EA] dark:border-[#38383A] backdrop-blur-sm`}
                    >
                      <div className="flex items-center">
                        <span>{question.text}</span>
                        <div className="ml-auto pl-2">
                          <motion.div
                            animate={{ 
                              x: hoverCategory === question.category ? 3 : 0,
                              opacity: hoverCategory === question.category ? 1 : 0.6
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <CornerDownLeft className={`h-3 w-3 ${hoverCategory === question.category ? text : ''}`} />
                          </motion.div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Query input with send button */}
        <motion.div 
          layout 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className={`
              flex items-center bg-[#F2F2F7]/80 dark:bg-[#38383A]/80 
              rounded-xl transition-all duration-200 backdrop-blur-md shadow-sm
              border ${isFocused 
                ? 'border-[#007AFF] dark:border-[#0A84FF] ring-2 ring-[#007AFF]/20 dark:ring-[#0A84FF]/20' 
                : 'border-[#E5E5EA] dark:border-[#48484A]'}
            `}>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`e.g., ${exampleQuestions[currentExampleIndex].text}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="border-0 bg-transparent focus-visible:ring-0 text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] dark:placeholder:text-[#8E8E93] py-6 rounded-xl"
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
                    rounded-xl w-10 h-10 p-0 flex items-center justify-center shadow-sm
                    ${isLoading 
                      ? 'bg-[#E5E5EA] dark:bg-[#48484A] cursor-not-allowed' 
                      : query.trim() 
                        ? 'bg-gradient-to-r from-[#007AFF] to-[#0A84FF] hover:from-[#0071E3] hover:to-[#0A7AEF]'
                        : 'bg-[#E5E5EA] dark:bg-[#48484A] cursor-not-allowed opacity-70'
                    }
                  `}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#8E8E93] dark:text-[#98989D]" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                  <span className="sr-only">Send query</span>
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </CardContent>
    </Card>
  );
}
