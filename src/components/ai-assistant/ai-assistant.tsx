'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Bot, Send, Loader2, SearchIcon, ChevronDown, RefreshCw, Trash2, User, Sparkles, Brain, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Categories for suggested questions
const CATEGORIES = {
  EXPENSES: 'expenses',
  INCOME: 'income',
  BUDGET: 'budget',
  INSIGHTS: 'insights',
  SAVINGS: 'savings',
  RECOMMENDATIONS: 'recommendations',
  INVESTING: 'investing',
  PLANNING: 'planning',
  GOALS: 'goals'
};

interface AIAssistantProps {
  onQuerySubmit: (query: string) => Promise<string>;
}

interface Conversation {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  group?: Conversation[];
  isLoading?: boolean;
}

interface SuggestedQuestion {
  text: string;
  category: string;
}

export function AIAssistant({ onQuerySubmit }: AIAssistantProps) {
  // State management
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [responseAnimationComplete, setResponseAnimationComplete] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState<number>(0);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [activeConversation, setActiveConversation] = useState<Conversation[]>([]);

  // References
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef<HTMLDivElement>(null);

  // Modern AI-focused suggested questions with categories
  const suggestedQuestions: SuggestedQuestion[] = [
    { text: "Analyze my spending patterns this month", category: CATEGORIES.INSIGHTS },
    { text: "Create a budget plan based on my income", category: CATEGORIES.BUDGET },
    { text: "What investment strategies suit my profile?", category: CATEGORIES.INVESTING },
    { text: "How can I reduce my monthly expenses?", category: CATEGORIES.SAVINGS },
    { text: "Predict my financial health next quarter", category: CATEGORIES.PLANNING },
    { text: "Recommend ways to boost my retirement savings", category: CATEGORIES.RECOMMENDATIONS },
    { text: "Compare my spending with similar households", category: CATEGORIES.INSIGHTS },
    { text: "Analyze the impact of my recent purchases", category: CATEGORIES.INSIGHTS },
    { text: "Help me set up a savings plan for a home", category: CATEGORIES.GOALS },
    { text: "Find tax optimization opportunities", category: CATEGORIES.PLANNING }
  ];

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('aiAssistantConversations');
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        // Convert string dates back to Date objects (recursively for nested groups)
        const withDates = parsed.map((conv: any) => {
          // Convert top-level timestamp
          const updatedConv = {
            ...conv,
            timestamp: new Date(conv.timestamp)
          };
          
          // Handle group conversations if they exist
          if (updatedConv.group && Array.isArray(updatedConv.group)) {
            updatedConv.group = updatedConv.group.map((groupMsg: any) => ({
              ...groupMsg,
              timestamp: new Date(groupMsg.timestamp)
            }));
          }
          
          return updatedConv;
        });
        
        setConversations(withDates);
        
        // Initialize with most recent conversation if it exists
        if (withDates.length > 0) {
          const latestConversation = withDates[0];
          // Ensure we're working with an array of messages
          const latestConversationGroup = latestConversation.group && Array.isArray(latestConversation.group) 
            ? latestConversation.group 
            : [latestConversation];
          
          setActiveConversation(latestConversationGroup);
          setShowWelcomeScreen(false);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('aiAssistantConversations', JSON.stringify(conversations));
      setShowWelcomeScreen(false);
    } else {
      setShowWelcomeScreen(true);
    }
  }, [conversations]);

  // Cycle through example questions for the placeholder
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentExampleIndex((prevIndex) => (prevIndex + 1) % suggestedQuestions.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [suggestedQuestions.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation]);

  // Handle animation completion
  useEffect(() => {
    if (responseAnimationComplete && responseRef.current) {
      setTimeout(() => setResponseAnimationComplete(true), 500);
    }
  }, [responseAnimationComplete]);

  // After receiving response
  useEffect(() => {
    if (activeConversation.length > 0 && activeConversation[activeConversation.length - 1].response.includes("AI service is currently in demo mode")) {
      toast.info(
        "AI Assistant is running in demo mode. To enable full functionality, configure the GOOGLE_GENAI_API_KEY environment variable.",
        { duration: 10000 }
      );
    }
  }, [activeConversation]);

  // Handle query submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const currentQuery = query;
    setQuery('');
    setIsLoading(true);
    setResponseAnimationComplete(false);
    
    // Clear the welcome screen immediately when submitting a question
    if (showWelcomeScreen) {
      setShowWelcomeScreen(false);
    }

    // Create a temporary message with loading state
    const tempMessageId = `temp_${Date.now()}`;
    const newTempMessage = {
      id: tempMessageId,
      query: currentQuery,
      response: "",
      timestamp: new Date(),
      isLoading: true
    };
    
    // Add the temporary message to show user query and loading state
    setActiveConversation(prev => [...prev, newTempMessage]);
      
    try {
      // Get AI response
      const aiResponse = await onQuerySubmit(currentQuery);

      // Update conversation with actual response by replacing the temporary message
      setActiveConversation(prev => {
        const updatedConversation = prev.map(msg => 
          msg.id === tempMessageId ? 
          { ...msg, response: aiResponse, isLoading: false } : 
          msg
        );
        return updatedConversation;
      });
      
      // Update conversation history
      setConversations(prev => {
        // Create a new conversation group for this exchange
        const newConversationGroup = {
          id: `group_${Date.now()}`,
          query: currentQuery,
          response: aiResponse,
          timestamp: new Date(),
          group: [
            {
              id: `user_${Date.now()}`,
              query: currentQuery,
              response: aiResponse,
              timestamp: new Date()
            }
          ]
        };
        
        return [newConversationGroup, ...prev];
      });
      
      // Set current conversation ID
      setCurrentConversationId(`group_${Date.now()}`);
      
    } catch (error) {
      const errorResponse = "Sorry, I couldn't process your query at this time.";
      
      // Update the temporary message with error response
      setActiveConversation(prev => {
        const updatedConversation = prev.map(msg => 
          msg.id === tempMessageId ? 
          { ...msg, response: errorResponse, isLoading: false } : 
          msg
        );
        return updatedConversation;
      });
      
      console.error("Error querying AI:", error);
    } finally {
      setIsLoading(false);
      setResponseAnimationComplete(true);
      
      // Scroll to bottom after response
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Start a new conversation
  const startNewConversation = () => {
    setQuery('');
    setActiveConversation([]);
    setCurrentConversationId(null);
    setResponseAnimationComplete(false);
    setShowWelcomeScreen(true);
    setShowHistory(false); // Hide history when starting a new conversation
    
    // Add a small delay to ensure UI updates before focusing
    setTimeout(() => {
      inputRef.current?.focus();
      // Scroll to top when creating a new conversation
      window.scrollTo(0, 0);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // Load a conversation from history
  const loadConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      const conversationGroup = conversation.group || [conversation];
      setActiveConversation(conversationGroup);
      setQuery('');
      setCurrentConversationId(id);
      setResponseAnimationComplete(true);
      setShowWelcomeScreen(false);
      setShowHistory(false);
      
      // Scroll to top when loading a conversation
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
    }
  };

  // Clear all conversation history
  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      setConversations([]);
      localStorage.removeItem('aiAssistantConversations');
      setShowHistory(false);
      startNewConversation();
    }
  };

  // Format timestamp to friendly string
  const formatTimestamp = (date: Date) => {
    if (!(date instanceof Date)) {
      return 'Just now';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  // Get category styling based on the question category
  const getCategoryStyle = (category: string) => {
    switch(category) {
      case CATEGORIES.EXPENSES:
        return 'bg-[#FF453A]/10 text-[#FF453A] dark:bg-[#FF453A]/20 dark:text-[#FF453A]';
      case CATEGORIES.INCOME:
        return 'bg-[#30D158]/10 text-[#30D158] dark:bg-[#30D158]/20 dark:text-[#30D158]';
      case CATEGORIES.BUDGET:
        return 'bg-[#0A84FF]/10 text-[#0A84FF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF]';
      case CATEGORIES.SAVINGS:
        return 'bg-[#5E5CE6]/10 text-[#5E5CE6] dark:bg-[#5E5CE6]/20 dark:text-[#5E5CE6]';
      case CATEGORIES.INSIGHTS:
        return 'bg-[#FFD60A]/10 text-[#FFD60A] dark:bg-[#FFD60A]/20 dark:text-[#FFD60A]';
      case CATEGORIES.RECOMMENDATIONS:
        return 'bg-[#BF5AF2]/10 text-[#BF5AF2] dark:bg-[#BF5AF2]/20 dark:text-[#BF5AF2]';
      case CATEGORIES.INVESTING:
        return 'bg-[#FF9F0A]/10 text-[#FF9F0A] dark:bg-[#FF9F0A]/20 dark:text-[#FF9F0A]';
      case CATEGORIES.PLANNING:
        return 'bg-[#64D2FF]/10 text-[#64D2FF] dark:bg-[#64D2FF]/20 dark:text-[#64D2FF]';
      case CATEGORIES.GOALS:
        return 'bg-[#FF375F]/10 text-[#FF375F] dark:bg-[#FF375F]/20 dark:text-[#FF375F]';
      default:
        return 'bg-[#8E8E93]/10 text-[#8E8E93] dark:bg-[#98989D]/20 dark:text-[#98989D]';
    }
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden rounded-3xl border-0 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          {/* Header with new conversation button */}
          <div className="flex items-center justify-between border-b border-[#F2F2F7] dark:border-[#38383A] px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0A84FF] to-[#30D158] rounded-full flex items-center justify-center shadow-sm">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">Financial AI Assistant</h2>
            </div>
            
            <div className="flex items-center gap-2">
              {(activeConversation.length > 0 || conversations.length > 0) && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={startNewConversation}
                    variant="outline"
                    size="sm"
                    className="text-xs font-medium bg-[#F2F2F7]/80 dark:bg-[#38383A]/80 text-[#007AFF] dark:text-[#0A84FF] border-[#E5E5EA] dark:border-[#48484A] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] rounded-full"
                  >
                    <SearchIcon className="h-3.5 w-3.5 mr-1.5" />
                    New Conversation
                  </Button>
                </motion.div>
              )}
              
              {conversations.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setShowHistory(!showHistory)}
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-[#F2F2F7]/80 dark:bg-[#38383A]/80 hover:bg-[#E5E5EA] dark:hover:bg-[#48484A]"
                  >
                    <ChevronDown className={`h-4 w-4 text-[#8E8E93] dark:text-[#98989D] transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Conversation history drawer */}
          <AnimatePresence>
            {showHistory && conversations.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-b border-[#F2F2F7] dark:border-[#38383A]"
              >
                <div ref={conversationsRef} className="max-h-64 overflow-y-auto p-4 space-y-2 bg-[#F9F9FA] dark:bg-[#2C2C2E]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1D1D1F] dark:text-white">Conversation History</h3>
                    <Button
                      onClick={clearHistory}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF453A]/10 rounded-full"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  {conversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        currentConversationId === conv.id 
                          ? 'bg-[#E5E5EA] dark:bg-[#48484A]' 
                          : 'hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]'
                      }`}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm text-[#1D1D1F] dark:text-white truncate max-w-[80%]">
                          {conv.query}
                        </p>
                        <span className="text-[10px] text-[#8E8E93] dark:text-[#98989D]">
                          {formatTimestamp(conv.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8E93] dark:text-[#98989D] truncate mt-1">
                        <Bot className="h-3 w-3 inline-block mr-1 relative -top-[1px]" />
                        {conv.response.substring(0, 50)}...
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]"
          >
            {/* Chat messages area */}
            <div className="flex-grow overflow-y-auto p-6">
              {/* Welcome message when no conversation */}
              {showWelcomeScreen && (
                <div className="h-full flex flex-col items-center justify-center">
                  <motion.div 
                    className="mb-8 relative"
                    animate={{ 
                      y: [0, -15, 0],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 3,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-[#0A84FF] to-[#30D158] rounded-full flex items-center justify-center shadow-lg">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-8 h-8 bg-[#FFD60A] rounded-full flex items-center justify-center shadow-md border-4 border-white dark:border-[#1C1C1E]"
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        duration: 2,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                    </motion.div>
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text:white mb-3">
                    Your Financial Intelligence Partner
                  </h2>
                  <p className="text-[#86868B] dark:text-[#A1A1A6] text-center max-w-md mb-8">
                    Ask me anything about your finances. I can analyze spending patterns, suggest budgeting strategies, and provide personalized financial insights.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mb-4">
                    {suggestedQuestions.slice(0, 6).map((question, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setQuery(question.text);
                          setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
                        }}
                        className={`py-3 px-4 rounded-xl text-left text-sm font-medium shadow-sm border border-[#E5E5EA] dark:border-[#38383A] backdrop-blur-sm transition-all ${getCategoryStyle(question.category)}`}
                      >
                        <div className="flex items-center">
                          <span>{question.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation history */}
              <AnimatePresence mode="wait">
                {!showWelcomeScreen && (
                  <motion.div
                    key="conversation-history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Display active conversation */}
                    <div className="space-y-6">
                      {activeConversation.map((message, index) => (
                        <React.Fragment key={message.id || index}>
                          {/* User query bubble */}
                          <div className="flex justify-end">
                            <div className="flex items-start gap-2 max-w-[80%]">
                              <div className="bg-gradient-to-br from-[#007AFF] to-[#0A84FF] text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                                <p className="text-sm">{message.query}</p>
                              </div>
                              <div className="bg-[#F2F2F7] dark:bg-[#48484A] rounded-full h-8 w-8 flex items-center justify-center mt-1 shadow-sm">
                                <User className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                              </div>
                            </div>
                          </div>

                          {/* AI response bubble */}
                          <div className="flex items-start gap-2">
                            <motion.div 
                              className="bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full h-8 w-8 flex items-center justify-center mt-1 shadow-sm"
                              animate={(message.isLoading) ? 
                                { rotate: 360 } : 
                                { rotate: 0 }
                              }
                              transition={{ 
                                repeat: (message.isLoading) ? Infinity : 0, 
                                duration: 2, 
                                ease: "linear" 
                              }}
                            >
                              <Bot className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                            </motion.div>
                            <div ref={index === activeConversation.length - 1 ? responseRef : null} 
                                 className="px-4 py-3 bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                              {message.isLoading ? (
                                <div className="flex gap-1.5 items-center py-1.5 min-w-[40px]">
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
                                <p className="text-sm whitespace-pre-line">{message.response}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Fixed timestamp rendering with safe checks */}
                          {(index === activeConversation.length - 1 || 
                           (activeConversation[index + 1] && 
                            activeConversation[index + 1].timestamp instanceof Date &&
                            message.timestamp instanceof Date &&
                            (activeConversation[index + 1].timestamp.getTime() - message.timestamp.getTime() > 120000))) && (
                            <div className="flex justify-center">
                              <span className="text-xs text-[#8E8E93] dark:text-[#98989D]">
                                {message.timestamp instanceof Date ? formatTimestamp(message.timestamp) : 'Just now'}
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                      
                      {/* Add loading state if we're waiting for a response and there are no messages yet */}
                      {isLoading && activeConversation.length === 0 && (
                        <div className="space-y-6">
                          {/* User query bubble for initial loading state */}
                          <div className="flex justify-end">
                            <div className="flex items-start gap-2 max-w-[80%]">
                              <div className="bg-gradient-to-br from-[#007AFF] to-[#0A84FF] text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                                <p className="text-sm">{query}</p>
                              </div>
                              <div className="bg-[#F2F2F7] dark:bg-[#48484A] rounded-full h-8 w-8 flex items-center justify-center mt-1 shadow-sm">
                                <User className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D]" />
                              </div>
                            </div>
                          </div>

                          {/* AI loading response bubble for initial state */}
                          <div className="flex items-start gap-2">
                            <motion.div 
                              className="bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full h-8 w-8 flex items-center justify-center mt-1 shadow-sm"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                              <Bot className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                            </motion.div>
                            <div className="px-4 py-3 bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                              <div className="flex gap-1.5 items-center py-1.5 min-w-[40px]">
                                <motion.div 
                                  animate={{ y: [-2, 2, -2] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full" 
                                />
                                <motion.div 
                                  animate={{ y: [-2, 2, -2] }}
                                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                  className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full" 
                                />
                                <motion.div 
                                  animate={{ y: [-2, 2, -2] }}
                                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                  className="h-2 w-2 bg-[#8E8E93] dark:bg-[#98989D] rounded-full" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Show suggested follow-up questions */}
                    {responseAnimationComplete && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="flex flex-wrap gap-2 pt-2"
                      >
                        <div className="w-full">
                          <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mb-2">Suggested follow-up questions:</p>
                        </div>
                        {suggestedQuestions.slice(0, 3).map((question, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setQuery(question.text);
                              setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
                            }}
                            className="py-2 px-3 rounded-full text-xs font-medium bg-[#F2F2F7] dark:bg-[#38383A] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-all"
                          >
                            {question.text}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {/* Action buttons */}
                    {responseAnimationComplete && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="flex justify-end items-center pt-3"
                      >
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              const currentConv = conversations.find(c => c.id === currentConversationId);
                              if (currentConv) {
                                setQuery(currentConv.query);
                                setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/10 rounded-full"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Regenerate
                          </Button>
                          
                          <Button 
                            onClick={startNewConversation}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 dark:hover:bg-[#0A84FF]/10 rounded-full"
                          >
                            <SearchIcon className="h-3.5 w-3.5 mr-1.5" />
                            New Question
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-[#F2F2F7] dark:border-[#38383A] p-4 bg:white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="flex items-center relative">
                <div className={`
                  flex-1 flex items-center bg-[#F2F2F7]/80 dark:bg-[#38383A]/80 
                  rounded-2xl transition-all duration-200 backdrop-blur-md shadow-sm
                  border-2 ${isFocused 
                    ? 'border-[#007AFF] dark:border-[#0A84FF] ring-2 ring-[#007AFF]/20 dark:ring-[#0A84FF]/20' 
                    : 'border-transparent'
                  }
                `}>
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`e.g., ${suggestedQuestions[currentExampleIndex].text}`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-[#1D1D1F] dark:text:white placeholder:text-[#86868B] dark:placeholder:text-[#8E8E93] py-6 rounded-xl"
                    suppressHydrationWarning={true}
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
                        <Send className="h-4 w-4 text:white" />
                      )}
                      <span className="sr-only">Send query</span>
                    </Button>
                  </motion.div>
                </div>
              </form>
              <div className="text-xs mt-2 flex items-center justify-center text-[#8E8E93] dark:text-[#98989D]">
                <Lightbulb className="h-3 w-3 mr-1" /> 
                <span>Powered by AI. Ask about spending patterns, budget optimization, or financial insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}