'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FreelanceIncome } from './freelance-dashboard';
import { 
  Lightbulb, 
  ArrowUpRight, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  BarChart3, 
  Layers, 
  Star,
  BookOpen,
  Code,
  PenTool,
  Repeat,
  MonitorSmartphone,
  Building2,
  Store
} from 'lucide-react';

interface PassiveIncomeSuggestionsProps {
  incomes: FreelanceIncome[];
  skills: string[];
}

interface PassiveIncomeIdea {
  id: string;
  title: string;
  description: string;
  monthlyPotential: [number, number]; // Min and max potential
  timeCommitment: 'Low' | 'Medium' | 'High';
  initialEffort: 'Low' | 'Medium' | 'High';
  matchScore: number; // 1-100 match score based on skills
  category: 'Product' | 'Content' | 'Service' | 'Platform';
  skills: string[];
  icon: React.ElementType;
}

export function PassiveIncomeSuggestions({ incomes, skills }: PassiveIncomeSuggestionsProps) {
  const [selectedIdea, setSelectedIdea] = useState<PassiveIncomeIdea | null>(null);
  const [filter, setFilter] = useState<'all' | 'product' | 'content' | 'service' | 'platform'>('all');
  const [effort, setEffort] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Generate suggestions based on existing skills and work
  const passiveIncomeIdeas = useMemo((): PassiveIncomeIdea[] => {
    // Identify what categories the freelancer works in
    const categories = [...new Set(incomes.map(income => income.category))];
    
    // Generate base suggestions
    const ideas: PassiveIncomeIdea[] = [
      {
        id: 'digital-products',
        title: 'Digital Templates & Tools',
        description: 'Create and sell templates, UI kits, or tools based on your client work experience.',
        monthlyPotential: [200, 2000],
        timeCommitment: 'Low',
        initialEffort: 'Medium',
        matchScore: 0, // Calculated below
        category: 'Product',
        skills: ['Web Development', 'Design'],
        icon: Layers
      },
      {
        id: 'course-creation',
        title: 'Online Course Creation',
        description: 'Package your knowledge into structured courses for beginners and intermediates.',
        monthlyPotential: [500, 5000],
        timeCommitment: 'Low',
        initialEffort: 'High',
        matchScore: 0,
        category: 'Content',
        skills: ['Web Development', 'Design', 'Marketing'],
        icon: BookOpen
      },
      {
        id: 'code-marketplace',
        title: 'Code & Asset Marketplaces',
        description: 'Sell reusable components, plugins, or themes on marketplaces like ThemeForest or CodeCanyon.',
        monthlyPotential: [300, 3000],
        timeCommitment: 'Low',
        initialEffort: 'Medium',
        matchScore: 0,
        category: 'Product',
        skills: ['Web Development'],
        icon: Code
      },
      {
        id: 'saas-idea',
        title: 'Mini SaaS Product',
        description: 'Develop a specialized tool solving a specific problem in your industry.',
        monthlyPotential: [1000, 10000],
        timeCommitment: 'Medium',
        initialEffort: 'High',
        matchScore: 0,
        category: 'Product',
        skills: ['Web Development'],
        icon: MonitorSmartphone
      },
      {
        id: 'stock-content',
        title: 'Stock Graphics & Photos',
        description: 'Create and sell illustrations, icons, or photos on stock platforms.',
        monthlyPotential: [200, 1500],
        timeCommitment: 'Low',
        initialEffort: 'Medium',
        matchScore: 0,
        category: 'Content',
        skills: ['Design'],
        icon: PenTool
      },
      {
        id: 'ebook-guides',
        title: 'eBooks & PDF Guides',
        description: 'Write comprehensive guides on specialized topics in your field.',
        monthlyPotential: [200, 2000],
        timeCommitment: 'Low',
        initialEffort: 'Medium',
        matchScore: 0,
        category: 'Content',
        skills: ['Marketing', 'Web Development', 'Design'],
        icon: BookOpen
      },
      {
        id: 'membership-site',
        title: 'Membership Community',
        description: 'Create a paid community offering ongoing access to resources, advice, and networking.',
        monthlyPotential: [500, 5000],
        timeCommitment: 'Medium',
        initialEffort: 'Medium',
        matchScore: 0,
        category: 'Service',
        skills: ['Marketing', 'Web Development'],
        icon: Building2
      },
      {
        id: 'automated-service',
        title: 'Automated Service',
        description: 'Set up systems to deliver standardized services with minimal intervention.',
        monthlyPotential: [300, 3000],
        timeCommitment: 'Low',
        initialEffort: 'High',
        matchScore: 0,
        category: 'Service',
        skills: ['Web Development', 'Marketing'],
        icon: Repeat
      },
      {
        id: 'affiliate-marketing',
        title: 'Affiliate Marketing',
        description: 'Recommend tools and products you use with affiliate commissions.',
        monthlyPotential: [100, 2000],
        timeCommitment: 'Low',
        initialEffort: 'Low',
        matchScore: 0,
        category: 'Platform',
        skills: ['Marketing'],
        icon: Store
      },
      {
        id: 'youtube-tutorial',
        title: 'YouTube Tutorials',
        description: 'Create tutorial videos showcasing your expertise with ad or sponsorship revenue.',
        monthlyPotential: [100, 3000],
        timeCommitment: 'Medium',
        initialEffort: 'Medium',
        matchScore: 0,
        category: 'Content',
        skills: ['Web Development', 'Design', 'Marketing'],
        icon: BookOpen
      }
    ];
    
    // Calculate match score based on skill overlap
    return ideas.map(idea => {
      // Calculate match score based on skill overlap
      const skillOverlap = skills.filter(skill => idea.skills.includes(skill)).length;
      const matchPercentage = Math.min(100, Math.round((skillOverlap / idea.skills.length) * 100));
      
      // Boost score for ideas matching categories the freelancer already works in
      const categoryBoost = idea.skills.some(skill => categories.includes(skill)) ? 20 : 0;
      
      // Combine everything (cap at 100)
      const finalScore = Math.min(100, matchPercentage + categoryBoost);
      
      return {
        ...idea,
        matchScore: finalScore
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score
  }, [incomes, skills]);

  // Apply filters to ideas
  const filteredIdeas = useMemo(() => {
    return passiveIncomeIdeas.filter(idea => {
      const categoryMatch = filter === 'all' || 
        (filter === 'product' && idea.category === 'Product') ||
        (filter === 'content' && idea.category === 'Content') ||
        (filter === 'service' && idea.category === 'Service') ||
        (filter === 'platform' && idea.category === 'Platform');
        
      const effortMatch = effort === 'all' || 
        (effort === 'low' && idea.initialEffort === 'Low') ||
        (effort === 'medium' && idea.initialEffort === 'Medium') ||
        (effort === 'high' && idea.initialEffort === 'High');
      
      return categoryMatch && effortMatch;
    });
  }, [passiveIncomeIdeas, filter, effort]);

  // Get effort color
  const getEffortColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'Low': return 'text-[#34C759] dark:text-[#30D158]';
      case 'Medium': return 'text-[#FF9500] dark:text-[#FF9F0A]';
      case 'High': return 'text-[#FF3B30] dark:text-[#FF453A]';
      default: return 'text-[#86868B] dark:text-[#98989D]';
    }
  };

  // Get match score color
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-[#E5F8EF]/50 text-[#34C759] border-[#34C759]/20';
    if (score >= 60) return 'bg-[#FEF4E8]/50 text-[#FF9500] border-[#FF9500]/20';
    return 'bg-[#EDF4FE]/50 text-[#007AFF] border-[#007AFF]/20';
  };

  // Format currency range
  const formatCurrencyRange = (range: [number, number]) => {
    return `$${range[0]}-$${range[1]}/mo`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">Passive Income Opportunities</h2>
          <p className="text-sm text-[#86868B] dark:text-[#98989D]">
            Leverage your skills to create recurring income streams
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex text-xs bg-[#F2F2F7] dark:bg-[#38383A] rounded-lg p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md ${
                filter === 'all' 
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('product')}
              className={`px-3 py-1.5 rounded-md ${
                filter === 'product'
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setFilter('content')}
              className={`px-3 py-1.5 rounded-md ${
                filter === 'content' 
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setFilter('service')}
              className={`px-3 py-1.5 rounded-md ${
                filter === 'service' 
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              Services
            </button>
          </div>
          
          <div className="flex text-xs bg-[#F2F2F7] dark:bg-[#38383A] rounded-lg p-0.5">
            <button
              onClick={() => setEffort('all')}
              className={`px-3 py-1.5 rounded-md ${
                effort === 'all' 
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              Any Effort
            </button>
            <button
              onClick={() => setEffort('low')}
              className={`px-3 py-1.5 rounded-md ${
                effort === 'low' 
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              Low Effort
            </button>
            <button
              onClick={() => setEffort('high')}
              className={`px-3 py-1.5 rounded-md ${
                effort === 'high' 
                  ? 'bg-white dark:bg-[#48484A] shadow-sm text-[#1D1D1F] dark:text-white' 
                  : 'text-[#86868B] dark:text-[#98989D]'
              }`}
            >
              High Potential
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Ideas Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIdeas.map((idea) => (
              <Card 
                key={idea.id} 
                className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] duration-300"
                onClick={() => setSelectedIdea(idea)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full mr-2">
                        <idea.icon className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                      </div>
                      <CardTitle className="text-base font-medium text-[#1D1D1F] dark:text-white">
                        {idea.title}
                      </CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getMatchColor(idea.matchScore)}`}
                    >
                      {idea.matchScore}% match
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-[#86868B] dark:text-[#98989D] mt-2">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Potential</div>
                      <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                        {formatCurrencyRange(idea.monthlyPotential)}
                      </div>
                    </div>
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Setup Effort</div>
                      <div className={`font-medium mt-1 ${getEffortColor(idea.initialEffort)}`}>
                        {idea.initialEffort}
                      </div>
                    </div>
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Maintenance</div>
                      <div className={`font-medium mt-1 ${getEffortColor(idea.timeCommitment)}`}>
                        {idea.timeCommitment}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs w-full text-[#007AFF] dark:text-[#0A84FF] hover:text-[#007AFF] dark:hover:text-[#0A84FF] hover:bg-[#EDF4FE]/50 dark:hover:bg-[#1C3049]/30"
                  >
                    View Details
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {filteredIdeas.length === 0 && (
              <div className="col-span-full p-8 text-center bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg">
                <Lightbulb className="h-8 w-8 text-[#8E8E93] dark:text-[#98989D] mx-auto mb-3" />
                <p className="text-[#1D1D1F] dark:text-white text-sm font-medium">No matching ideas found</p>
                <p className="text-[#86868B] dark:text-[#98989D] text-xs mt-1">Try changing your filters</p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setFilter('all');
                    setEffort('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Selected Idea or Skills Overview */}
        <div className="lg:col-span-4">
          {selectedIdea ? (
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden sticky top-20">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">
                      {selectedIdea.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                      {selectedIdea.category} Opportunity
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getMatchColor(selectedIdea.matchScore)}`}
                  >
                    {selectedIdea.matchScore}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg mb-4">
                  <p className="text-sm text-[#1D1D1F] dark:text-white">
                    {selectedIdea.description}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedIdea.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-[#86868B] dark:text-[#98989D] flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                        Monthly Potential
                      </div>
                      <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                        {formatCurrencyRange(selectedIdea.monthlyPotential)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg">
                      <div className="text-xs text-[#86868B] dark:text-[#98989D] flex items-center">
                        <Layers className="h-3.5 w-3.5 mr-1.5" />
                        Initial Effort
                      </div>
                      <div className={`text-sm font-medium mt-1 ${getEffortColor(selectedIdea.initialEffort)}`}>
                        {selectedIdea.initialEffort}
                      </div>
                    </div>

                    <div className="bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 p-3 rounded-lg">
                      <div className="text-xs text-[#86868B] dark:text-[#98989D] flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Maintenance
                      </div>
                      <div className={`text-sm font-medium mt-1 ${getEffortColor(selectedIdea.timeCommitment)}`}>
                        {selectedIdea.timeCommitment}
                      </div>
                    </div>
                  </div>

                  {/* Implementation Advice */}
                  <div className="border-t border-[#F2F2F7] dark:border-[#38383A] pt-4 mt-4">
                    <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-2">
                      Implementation Advice
                    </h4>

                    {selectedIdea.id === 'digital-products' && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Start with assets you've already created for client work</li>
                        <li>Sell on Gumroad, Etsy, or Creative Market</li>
                        <li>Create bundles to increase average order value</li>
                      </ul>
                    )}

                    {selectedIdea.id === 'course-creation' && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Start with a mini-course based on your most requested client skills</li>
                        <li>Use platforms like Udemy before creating your own platform</li>
                        <li>Create supplementary materials to increase value</li>
                      </ul>
                    )}

                    {selectedIdea.id === 'code-marketplace' && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Research the most requested items in your niche</li>
                        <li>Create quality documentation to stand out</li>
                        <li>Build a reputation through initial sales and reviews</li>
                      </ul>
                    )}

                    {selectedIdea.id === 'saas-idea' && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Start with a very specific problem you've solved before</li>
                        <li>Launch with a minimal viable product to test market</li>
                        <li>Consider starting with lifetime deals to fund development</li>
                      </ul>
                    )}
                    
                    {selectedIdea.id === 'stock-content' && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Focus on a specific niche where demand is high</li>
                        <li>Create collections rather than random assets</li>
                        <li>List on multiple marketplaces to maximize exposure</li>
                      </ul>
                    )}
                    
                    {['ebook-guides', 'youtube-tutorial'].includes(selectedIdea.id) && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Focus on solving one specific problem thoroughly</li>
                        <li>Break content into digestible, actionable steps</li>
                        <li>Include examples from your own client work (anonymized)</li>
                      </ul>
                    )}
                    
                    {['membership-site', 'automated-service'].includes(selectedIdea.id) && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Start with a small group of founding members</li>
                        <li>Create systems and templates to reduce ongoing work</li>
                        <li>Consider using no-code tools to reduce development time</li>
                      </ul>
                    )}
                    
                    {selectedIdea.id === 'affiliate-marketing' && (
                      <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4 list-disc">
                        <li>Only recommend tools you genuinely use and trust</li>
                        <li>Create honest comparison content between alternatives</li>
                        <li>Offer bonuses to incentivize using your affiliate links</li>
                      </ul>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-dashed"
                    onClick={() => setSelectedIdea(null)}
                  >
                    View All Ideas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
                  Your Skills Profile
                </CardTitle>
                <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                  Passive income ideas matched to your skill set
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map(skill => (
                    <Badge key={skill} className="text-xs bg-[#EDF4FE] dark:bg-[#1C3049] text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#EDF4FE] dark:hover:bg-[#1C3049]">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-[#F9F9FB] dark:bg-[#28282A]">
                  <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-2">How This Works</h4>
                  <p className="text-xs text-[#86868B] dark:text-[#98989D] mb-3">
                    We analyze your skills and work history to suggest passive income opportunities that:
                  </p>
                  <ul className="text-xs text-[#86868B] dark:text-[#98989D] space-y-2 pl-4">
                    <li className="flex items-start">
                      <Star className="h-3.5 w-3.5 text-[#FF9500] dark:text-[#FF9F0A] mr-1.5 mt-0.5 shrink-0" />
                      <span>Match your existing skills and expertise</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-3.5 w-3.5 text-[#FF9500] dark:text-[#FF9F0A] mr-1.5 mt-0.5 shrink-0" />
                      <span>Provide realistic income potential estimates</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-3.5 w-3.5 text-[#FF9500] dark:text-[#FF9F0A] mr-1.5 mt-0.5 shrink-0" />
                      <span>Require different levels of initial and ongoing effort</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-2">Best Opportunities</h4>
                  <div className="space-y-3">
                    {passiveIncomeIdeas.slice(0, 3).map((idea) => (
                      <div 
                        key={idea.id}
                        className="flex items-center justify-between p-3 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg cursor-pointer hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#EDF4FE] dark:bg-[#1C3049] mr-2.5">
                            <idea.icon className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">{idea.title}</div>
                            <div className="text-xs text-[#86868B] dark:text-[#98989D]">
                              {formatCurrencyRange(idea.monthlyPotential)} • {idea.initialEffort} effort
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getMatchColor(idea.matchScore)}`}
                        >
                          {idea.matchScore}%
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="outline"
                    size="sm" 
                    className="w-full mt-3 text-xs"
                    onClick={() => setSelectedIdea(passiveIncomeIdeas[0])}
                  >
                    Explore All Ideas
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}