'use client';

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformIncome } from './platform-income';
import { ClientProfitability } from './client-profitability';
import { TimeTracking } from './time-tracking';
import { PassiveIncomeSuggestions } from './passive-income-suggestions';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Lightbulb, 
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';

// Types for income tracking
export interface FreelanceIncome {
  id: string;
  platform: string;
  client: string;
  project: string;
  amount: number;
  currency: string;
  date: Date | string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  category: string;
  hoursWorked: number;
  hourlyRate?: number; // Calculated field
}

export interface Client {
  id: string;
  name: string;
  totalIncome: number;
  hoursWorked: number;
  averageRate: number;
  projects: number;
  profitabilityScore?: number; // Calculated field
}

export interface Platform {
  id: string;
  name: string;
  income: number;
  transactions: number;
  fees: number;
  netIncome: number;
}

export function FreelanceDashboard() {
  const [activeView, setActiveView] = useState('platforms');
  
  // Sample data for demo purposes - in a real app, this would come from an API or database
  const freelanceIncomes: FreelanceIncome[] = useMemo(() => [
    {
      id: 'inc_1',
      platform: 'Upwork',
      client: 'TechCorp',
      project: 'Website Development',
      amount: 850,
      currency: 'USD',
      date: new Date('2025-04-10'),
      paymentStatus: 'paid',
      category: 'Web Development',
      hoursWorked: 12,
      hourlyRate: 70.83
    },
    {
      id: 'inc_2',
      platform: 'Fiverr',
      client: 'DesignHub',
      project: 'Logo Design',
      amount: 150,
      currency: 'USD',
      date: new Date('2025-04-05'),
      paymentStatus: 'paid',
      category: 'Design',
      hoursWorked: 3,
      hourlyRate: 50
    },
    {
      id: 'inc_3',
      platform: 'Freelancer',
      client: 'EduLearn',
      project: 'LMS Integration',
      amount: 1200,
      currency: 'USD',
      date: new Date('2025-04-15'),
      paymentStatus: 'pending',
      category: 'Web Development',
      hoursWorked: 16,
      hourlyRate: 75
    },
    {
      id: 'inc_4',
      platform: 'Direct',
      client: 'MarketingPro',
      project: 'SEO Optimization',
      amount: 600,
      currency: 'USD',
      date: new Date('2025-04-18'),
      paymentStatus: 'paid',
      category: 'Marketing',
      hoursWorked: 8,
      hourlyRate: 75
    },
    {
      id: 'inc_5',
      platform: 'Upwork',
      client: 'TechCorp',
      project: 'Bug Fixes',
      amount: 350,
      currency: 'USD',
      date: new Date('2025-04-12'),
      paymentStatus: 'paid',
      category: 'Web Development',
      hoursWorked: 5,
      hourlyRate: 70
    },
    {
      id: 'inc_6',
      platform: 'Toptal',
      client: 'FinanceApp',
      project: 'Dashboard Development',
      amount: 2000,
      currency: 'USD',
      date: new Date('2025-04-02'),
      paymentStatus: 'paid',
      category: 'Web Development',
      hoursWorked: 25,
      hourlyRate: 80
    },
    {
      id: 'inc_7',
      platform: 'Direct',
      client: 'LocalBusiness',
      project: 'Website Redesign',
      amount: 1500,
      currency: 'USD',
      date: new Date('2025-04-08'),
      paymentStatus: 'overdue',
      category: 'Web Development',
      hoursWorked: 20,
      hourlyRate: 75
    },
  ], []);
  
  // Calculate total income and details
  const totalIncome = useMemo(() => 
    freelanceIncomes.reduce((sum, income) => sum + income.amount, 0)
  , [freelanceIncomes]);
  
  const totalHoursWorked = useMemo(() => 
    freelanceIncomes.reduce((sum, income) => sum + income.hoursWorked, 0)
  , [freelanceIncomes]);
  
  const averageHourlyRate = useMemo(() => 
    totalHoursWorked > 0 ? totalIncome / totalHoursWorked : 0
  , [totalIncome, totalHoursWorked]);
  
  // Calculate platform metrics
  const platforms: Platform[] = useMemo(() => {
    const platformMap = new Map<string, Platform>();
    
    freelanceIncomes.forEach(income => {
      const platformName = income.platform;
      const existing = platformMap.get(platformName);
      
      if (existing) {
        existing.income += income.amount;
        existing.transactions += 1;
        // Calculate approximate fees based on platform
        const feeRate = platformName === 'Direct' ? 0 : 
                      platformName === 'Upwork' ? 0.1 : 
                      platformName === 'Fiverr' ? 0.2 : 
                      platformName === 'Freelancer' ? 0.15 : 
                      platformName === 'Toptal' ? 0.05 : 0.1;
                      
        existing.fees += income.amount * feeRate;
        existing.netIncome = existing.income - existing.fees;
      } else {
        const feeRate = platformName === 'Direct' ? 0 : 
                      platformName === 'Upwork' ? 0.1 : 
                      platformName === 'Fiverr' ? 0.2 : 
                      platformName === 'Freelancer' ? 0.15 : 
                      platformName === 'Toptal' ? 0.05 : 0.1;
        const fees = income.amount * feeRate;
        
        platformMap.set(platformName, {
          id: `platform_${platformMap.size + 1}`,
          name: platformName,
          income: income.amount,
          transactions: 1,
          fees: fees,
          netIncome: income.amount - fees
        });
      }
    });
    
    return Array.from(platformMap.values());
  }, [freelanceIncomes]);
  
  // Calculate client metrics
  const clients: Client[] = useMemo(() => {
    const clientMap = new Map<string, Client>();
    
    freelanceIncomes.forEach(income => {
      const clientName = income.client;
      const existing = clientMap.get(clientName);
      
      if (existing) {
        existing.totalIncome += income.amount;
        existing.hoursWorked += income.hoursWorked;
        existing.averageRate = existing.totalIncome / existing.hoursWorked;
        existing.projects += 1;
      } else {
        clientMap.set(clientName, {
          id: `client_${clientMap.size + 1}`,
          name: clientName,
          totalIncome: income.amount,
          hoursWorked: income.hoursWorked,
          averageRate: income.amount / income.hoursWorked,
          projects: 1,
        });
      }
    });
    
    // Calculate profitability score (0-100) based on rate and volume
    return Array.from(clientMap.values()).map(client => {
      // Use a weighted formula to calculate profitability
      // Higher hourly rate and higher total income = more profitable
      const rateWeight = 0.6; // 60% weight on hourly rate
      const volumeWeight = 0.4; // 40% weight on volume
      
      // Get max values for normalization
      const maxRate = Math.max(...Array.from(clientMap.values()).map(c => c.averageRate));
      const maxIncome = Math.max(...Array.from(clientMap.values()).map(c => c.totalIncome));
      
      // Normalize values to 0-100 scale
      const normalizedRate = (client.averageRate / maxRate) * 100;
      const normalizedVolume = (client.totalIncome / maxIncome) * 100;
      
      // Calculate final score
      const profitabilityScore = Math.round(
        (normalizedRate * rateWeight) + (normalizedVolume * volumeWeight)
      );
      
      return {
        ...client,
        profitabilityScore
      };
    });
  }, [freelanceIncomes]);

  return (
    <div className="space-y-6">
      {/* Income Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Freelance Income</CardTitle>
            <div className="p-1.5 bg-[#E5F8EF] dark:bg-[#0C372A] rounded-full">
              <Briefcase className="h-5 w-5 text-[#34C759] dark:text-[#30D158]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Across all platforms</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Client Count</CardTitle>
            <div className="p-1.5 bg-[#FCF2F1] dark:bg-[#3A281E] rounded-full">
              <TrendingUp className="h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{clients.length}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Active clients</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Hours Worked</CardTitle>
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Clock className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{totalHoursWorked}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Total billable hours</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#86868B] dark:text-[#A1A1A6]">Avg. Hourly Rate</CardTitle>
            <div className="p-1.5 bg-[#FEF4E8] dark:bg-[#382D1E] rounded-full">
              <Lightbulb className="h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">${averageHourlyRate.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Per hour earnings</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Tabbed Content */}
      <Tabs defaultValue="platforms" className="w-full" value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4 p-1 mb-6 bg-[#F2F2F7] dark:bg-[#38383A] rounded-full max-w-2xl mx-auto">
          <TabsTrigger 
            value="platforms" 
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
          >
            Platforms
          </TabsTrigger>
          <TabsTrigger 
            value="clients" 
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
          >
            Clients
          </TabsTrigger>
          <TabsTrigger 
            value="time" 
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
          >
            Time
          </TabsTrigger>
          <TabsTrigger 
            value="passive" 
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#48484A] data-[state=active]:shadow-sm text-[#86868B] dark:text-[#A1A1A6] data-[state=active]:text-[#1D1D1F] dark:data-[state=active]:text:white transition-all"
          >
            Passive
          </TabsTrigger>
        </TabsList>

        {/* Platform Income Tab */}
        <TabsContent value="platforms">
          <PlatformIncome 
            platforms={platforms} 
            incomes={freelanceIncomes} 
          />
        </TabsContent>
        
        {/* Client Profitability Tab */}
        <TabsContent value="clients">
          <ClientProfitability 
            clients={clients} 
            incomes={freelanceIncomes} 
          />
        </TabsContent>
        
        {/* Time Tracking Tab */}
        <TabsContent value="time">
          <TimeTracking 
            incomes={freelanceIncomes} 
          />
        </TabsContent>
        
        {/* Passive Income Suggestions Tab */}
        <TabsContent value="passive">
          <PassiveIncomeSuggestions 
            incomes={freelanceIncomes} 
            skills={['Web Development', 'Design', 'Marketing']} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}