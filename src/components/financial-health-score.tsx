'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { gsap } from 'gsap';
import { Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinancialHealthScoreProps {
  income: number;
  expenses: number;
  balance: number;
  savingsAmount: number;
  debtAmount: number;
  recurringExpenses: number;
}

export function FinancialHealthScore({
  income,
  expenses,
  balance,
  savingsAmount,
  debtAmount,
  recurringExpenses
}: FinancialHealthScoreProps) {
  const [score, setScore] = useState(0);
  const [scoreCategory, setScoreCategory] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  
  // Calculate financial health score
  useEffect(() => {
    // Proprietary algorithm for financial health score
    const calculateScore = () => {
      // Income to expense ratio (30% weight)
      const incomeExpenseRatio = income > 0 ? Math.min(2, (income / (expenses || 1))) : 0;
      const incomeScore = (incomeExpenseRatio / 2) * 30;
      
      // Savings rate (25% weight)
      const savingsRate = income > 0 ? Math.min(0.5, (savingsAmount / income)) : 0;
      const savingsScore = (savingsRate / 0.5) * 25;
      
      // Debt to income ratio (25% weight)
      const debtToIncomeRatio = income > 0 ? Math.min(1, (debtAmount / income)) : 1;
      const debtScore = (1 - debtToIncomeRatio) * 25;
      
      // Emergency fund (20% weight)
      // Measure if balance can cover recurring expenses for 6 months
      const emergencyFundRatio = recurringExpenses > 0 
        ? Math.min(6, (balance / recurringExpenses))
        : 0;
      const emergencyScore = (emergencyFundRatio / 6) * 20;
      
      // Total score out of 100
      const totalScore = Math.round(incomeScore + savingsScore + debtScore + emergencyScore);
      
      // Determine category
      let category = '';
      if (totalScore >= 90) category = 'Excellent';
      else if (totalScore >= 75) category = 'Very Good';
      else if (totalScore >= 60) category = 'Good';
      else if (totalScore >= 40) category = 'Fair';
      else category = 'Needs Attention';
      
      setScore(totalScore);
      setScoreCategory(category);
    };
    
    calculateScore();
  }, [income, expenses, balance, savingsAmount, debtAmount, recurringExpenses]);
  
  // Animate score when it changes
  useEffect(() => {
    if (scoreRef.current) {
      gsap.fromTo(
        scoreRef.current,
        { textContent: '0' },
        {
          textContent: score.toString(),
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate: function() {
            if (scoreRef.current) {
              scoreRef.current.textContent = Math.round(parseFloat(scoreRef.current.textContent || '0')).toString();
            }
          }
        }
      );
    }
    
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { width: '0%' },
        { width: `${score}%`, duration: 1.5, ease: "power2.out" }
      );
    }
  }, [score]);
  
  // Get score color
  const getScoreColor = () => {
    if (score >= 90) return "bg-gradient-to-r from-emerald-500 to-emerald-400";
    if (score >= 75) return "bg-gradient-to-r from-green-500 to-green-400";
    if (score >= 60) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    if (score >= 40) return "bg-gradient-to-r from-orange-500 to-orange-400";
    return "bg-gradient-to-r from-red-500 to-red-400";
  };
  
  // Get score text color
  const getScoreTextColor = () => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const scores = [
    { name: 'Income/Expense Ratio', score: Math.round((score >= 60 ? 3 : score >= 40 ? 2 : 1) * 10) / 10 },
    { name: 'Savings Rate', score: Math.round((savingsAmount / (income || 1) * 100)) },
    { name: 'Debt Management', score: Math.round((1 - debtAmount / (income || 1)) * 100) },
    { name: 'Emergency Fund', score: Math.round((balance / (recurringExpenses * 6 || 1)) * 100) },
  ];
  
  return (
    <Card className="border-0 shadow-sm overflow-hidden transition-all duration-300 
      bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md
      rounded-2xl hover:shadow-md relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Shield className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">
              Financial Health Score
            </CardTitle>
          </div>
          <div 
            className="cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="h-4 w-4 text-[#8E8E93] dark:text-[#98989D] hover:text-[#007AFF] dark:hover:text-[#0A84FF] transition-colors" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Circular progress background */}
            <div className="absolute w-full h-full rounded-full bg-[#F2F2F7] dark:bg-[#38383A]" />
            
            {/* Animated circular progress */}
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#F2F2F7" 
                strokeWidth="10" 
                className="dark:stroke-[#38383A]"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="url(#scoreGradient)" 
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray={`${score * 2.83} 283`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  {score >= 90 ? (
                    <>
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#10B981" />
                    </>
                  ) : score >= 75 ? (
                    <>
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#16A34A" />
                    </>
                  ) : score >= 60 ? (
                    <>
                      <stop offset="0%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#CA8A04" />
                    </>
                  ) : score >= 40 ? (
                    <>
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#EA580C" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </>
                  )}
                </linearGradient>
              </defs>
            </svg>
            
            <div className="z-10 flex flex-col items-center justify-center">
              <span ref={scoreRef} className={`text-5xl font-bold ${getScoreTextColor()}`}>
                {score}
              </span>
              <span className="text-xs font-medium text-[#8E8E93] dark:text-[#98989D]">
                / 100
              </span>
              <span className="mt-1 font-medium text-sm text-[#1D1D1F] dark:text-white">
                {scoreCategory}
              </span>
            </div>
          </div>
          
          <div className="w-full space-y-4">
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pb-4"
              >
                {scores.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">{item.name}</span>
                      <span className={`font-medium ${item.score >= 75 ? 'text-green-500' : item.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F2F2F7] dark:bg-[#38383A] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.score >= 75 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, item.score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            
            <div className="flex justify-between items-center text-xs text-[#8E8E93] dark:text-[#98989D]">
              <span>Needs Attention</span>
              <span>Excellent</span>
            </div>
            
            <div className="h-2 w-full bg-[#F2F2F7] dark:bg-[#38383A] rounded-full overflow-hidden">
              <div 
                ref={progressRef} 
                className={`h-full ${getScoreColor()}`}
                style={{ width: `${score}%` }}
              />
            </div>
            
            <div className="text-center mt-2">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs font-medium text-[#007AFF] dark:text-[#0A84FF] hover:underline"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}