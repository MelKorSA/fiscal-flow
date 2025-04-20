'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronRight,
  PlusCircle,
  X,
  Save,
  Download,
  Upload,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

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

const LOCAL_STORAGE_KEY = "freelance_income_data";

// Available platforms
const PLATFORMS = [
  "Upwork",
  "Fiverr",
  "Freelancer",
  "Toptal",
  "Direct",
  "LinkedIn",
  "PeoplePerHour",
  "Guru",
  "99designs",
  "Other"
];

// Available categories
const CATEGORIES = [
  "Web Development",
  "Design",
  "Marketing",
  "Writing",
  "Translation",
  "Video Production",
  "Audio Production",
  "Consulting",
  "Data Entry",
  "Virtual Assistance",
  "Programming",
  "Mobile Development",
  "Other"
];

// Available currencies
const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "INR",
  "Other"
];

export function FreelanceDashboard() {
  const [activeView, setActiveView] = useState('platforms');
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [sampleDataUsed, setSampleDataUsed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Form state for new income entry
  const [newIncome, setNewIncome] = useState<Omit<FreelanceIncome, 'id' | 'hourlyRate'>>({
    platform: '',
    client: '',
    project: '',
    amount: 0,
    currency: 'USD',
    date: new Date(),
    paymentStatus: 'paid',
    category: '',
    hoursWorked: 0
  });
  
  // Add state for viewing details of an income entry
  const [viewingIncome, setViewingIncome] = useState<FreelanceIncome | null>(null);
  
  // State for freelance income data
  const [freelanceIncomes, setFreelanceIncomes] = useState<FreelanceIncome[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Convert date strings back to Date objects
          const processedData = parsedData.map((income: any) => ({
            ...income,
            date: new Date(income.date),
            hourlyRate: income.amount / income.hoursWorked
          }));
          setFreelanceIncomes(processedData);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error loading freelance data:", error);
        return false;
      }
    };
    
    const hasData = loadData();
    // Show instructions if first visit
    const hasSeenInstructions = localStorage.getItem("freelance_instructions_seen");
    if (!hasSeenInstructions) {
      setShowInstructions(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (freelanceIncomes.length > 0 && !sampleDataUsed) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freelanceIncomes));
      } catch (error) {
        console.error("Error saving freelance data:", error);
      }
    }
  }, [freelanceIncomes, sampleDataUsed]);

  // Handler for input changes
  const handleInputChange = (field: string, value: any) => {
    setNewIncome(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new income entry
  const handleAddIncome = () => {
    // Validation
    if (!newIncome.platform || !newIncome.client || !newIncome.project || 
        newIncome.amount <= 0 || !newIncome.category || newIncome.hoursWorked <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Calculate hourly rate
    const hourlyRate = newIncome.amount / newIncome.hoursWorked;

    // Create new income entry
    const incomeEntry: FreelanceIncome = {
      ...newIncome,
      id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      hourlyRate
    };

    // Add to state
    setFreelanceIncomes(prev => [...prev, incomeEntry]);
    toast.success("Income entry added successfully!");

    // Reset form
    setNewIncome({
      platform: '',
      client: '',
      project: '',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      paymentStatus: 'paid',
      category: '',
      hoursWorked: 0
    });
    setIsAddingIncome(false);
  };

  // Delete a specific income entry
  const handleDeleteIncome = (id: string) => {
    if (confirm("Are you sure you want to delete this income entry? This cannot be undone.")) {
      setFreelanceIncomes(prev => prev.filter(income => income.id !== id));
      setViewingIncome(null); // Close details if open
      toast.success("Income entry deleted successfully");
    }
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleData: FreelanceIncome[] = [
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
    ];

    setFreelanceIncomes(sampleData);
    setSampleDataUsed(true);
    toast.success("Sample data loaded successfully!");
  };

  // Clear all data
  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all your freelance income data? This cannot be undone.")) {
      setFreelanceIncomes([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSampleDataUsed(false);
      toast.success("All data cleared successfully");
    }
  };

  // Export data as JSON
  const exportData = () => {
    const dataStr = JSON.stringify(freelanceIncomes, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `freelance_income_${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Data exported successfully!");
  };

  // Import data from JSON
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the data structure
        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid data format");
        }
        
        // Process dates
        const processedData = jsonData.map((income: any) => ({
          ...income,
          date: new Date(income.date),
          hourlyRate: income.amount / income.hoursWorked
        }));
        
        setFreelanceIncomes(processedData);
        setSampleDataUsed(false);
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Error importing data. Please check the file format.");
        console.error("Error importing data:", error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Mark instructions as seen
  const dismissInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem("freelance_instructions_seen", "true");
  };
  
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
      const maxRate = Math.max(...Array.from(clientMap.values()).map(c => c.averageRate), 1);
      const maxIncome = Math.max(...Array.from(clientMap.values()).map(c => c.totalIncome), 1);
      
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

  // Instructions content for each tab
  const tabInstructions = {
    platforms: "Track income across different freelance platforms. Add your income entries to see which platforms are most profitable after fees.",
    clients: "Analyze which clients provide the most value based on hourly rate and total income. Higher profitability score means better ROI.",
    time: "Optimize your hourly rates by seeing which categories and clients provide the best return for your time investment.",
    passive: "Get ideas for turning your freelance skills into passive income streams based on your strongest categories. Click on any opportunity card to see detailed implementation advice."
  };

  return (
    <div className="space-y-6">
      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to Freelance Income Tracker</DialogTitle>
            <DialogDescription className="text-base pt-2">
              This tool helps you track and analyze your freelance income across different platforms, clients, and projects.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h3 className="font-medium text-[#1D1D1F] dark:text-white">Getting Started:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Add your income entries using the <span className="font-medium">+ Add Income Entry</span> button</li>
                <li>Track performance across platforms, clients, and time</li>
                <li>Analyze your data to maximize earnings</li>
                <li>Export your data anytime for backup</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-[#1D1D1F] dark:text-white">Available Tabs:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><span className="font-medium">Platforms:</span> {tabInstructions.platforms}</li>
                <li><span className="font-medium">Clients:</span> {tabInstructions.clients}</li>
                <li><span className="font-medium">Time:</span> {tabInstructions.time}</li>
                <li><span className="font-medium">Passive:</span> {tabInstructions.passive}</li>
              </ul>
            </div>
            
            {freelanceIncomes.length === 0 && (
              <div className="bg-[#EDF4FE] dark:bg-[#1C3049] rounded-lg p-3 text-sm">
                <p className="font-medium text-[#007AFF] dark:text-[#0A84FF] mb-1">No data yet? Try these options:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Add your first income entry manually</li>
                  <li>Load sample data to see how the dashboard works</li>
                  <li>Import existing data from a JSON file</li>
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => loadSampleData()}>
              Load Sample Data
            </Button>
            <Button onClick={dismissInstructions}>Got It</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Income Entry Details Dialog */}
      <Dialog open={!!viewingIncome} onOpenChange={(open) => !open && setViewingIncome(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Income Entry Details</DialogTitle>
            <DialogDescription>
              View and manage your income entry information
            </DialogDescription>
          </DialogHeader>
          
          {viewingIncome && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Platform</Label>
                  <p className="font-medium text-sm">{viewingIncome.platform}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Category</Label>
                  <p className="font-medium text-sm">{viewingIncome.category}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Client</Label>
                <p className="font-medium text-sm">{viewingIncome.client}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Project</Label>
                <p className="font-medium text-sm">{viewingIncome.project}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Amount</Label>
                  <p className="font-medium text-sm">{viewingIncome.currency} {viewingIncome.amount.toFixed(2)}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Date</Label>
                  <p className="font-medium text-sm">
                    {format(new Date(viewingIncome.date), "PPP")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Hours Worked</Label>
                  <p className="font-medium text-sm">{viewingIncome.hoursWorked} hours</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Hourly Rate</Label>
                  <p className="font-medium text-sm">{viewingIncome.currency} {(viewingIncome.amount / viewingIncome.hoursWorked).toFixed(2)}/hr</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-[#86868B] dark:text-[#98989D]">Payment Status</Label>
                <Badge className={
                  viewingIncome.paymentStatus === 'paid' ? 'bg-[#E5F8EF] text-[#34C759]' :
                  viewingIncome.paymentStatus === 'pending' ? 'bg-[#FEF4E8] text-[#FF9500]' :
                  'bg-[#FCF2F1] text-[#FF3B30]'
                }>
                  {viewingIncome.paymentStatus.charAt(0).toUpperCase() + viewingIncome.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => viewingIncome && handleDeleteIncome(viewingIncome.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Entry
            </Button>
            <Button onClick={() => setViewingIncome(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Income Dialog */}
      <Dialog open={isAddingIncome} onOpenChange={setIsAddingIncome}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Income Entry</DialogTitle>
            <DialogDescription>
              Add details about your freelance income to track and analyze performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  onValueChange={(value) => handleInputChange('platform', value)}
                  value={newIncome.platform}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  onValueChange={(value) => handleInputChange('category', value)}
                  value={newIncome.category}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Client Name *</Label>
              <Input 
                id="client" 
                value={newIncome.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="Client name" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Project Name *</Label>
              <Input 
                id="project"
                value={newIncome.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                placeholder="Project description" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input 
                  id="amount" 
                  type="number"
                  value={newIncome.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => handleInputChange('currency', value)}
                  value={newIncome.currency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newIncome.date && "text-muted-foreground"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {newIncome.date ? format(new Date(newIncome.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(newIncome.date)}
                      onSelect={(date) => handleInputChange('date', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Hours Worked *</Label>
                <Input 
                  id="hoursWorked" 
                  type="number"
                  value={newIncome.hoursWorked || ''}
                  onChange={(e) => handleInputChange('hoursWorked', parseFloat(e.target.value))}
                  placeholder="0"
                  min="0.1"
                  step="0.1"
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                onValueChange={(value) => handleInputChange('paymentStatus', value as 'paid' | 'pending' | 'overdue')}
                value={newIncome.paymentStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingIncome(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIncome}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Income Overview Cards */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">Freelance Income Dashboard</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium">How to use this dashboard</h3>
                <p className="text-sm text-muted-foreground">{tabInstructions[activeView as keyof typeof tabInstructions]}</p>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowInstructions(true)}>
                  Show Full Instructions
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-4 w-4 mr-1" />
                <span>Data</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => loadSampleData()}>
                  <Download className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                
                <div className="w-full">
                  <Label htmlFor="import-file" className="w-full">
                    <div className="flex items-center justify-start px-3 py-1.5 text-sm bg-background border rounded-md hover:bg-accent hover:text-accent-foreground">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </div>
                    <Input 
                      id="import-file" 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={importData}
                    />
                  </Label>
                </div>
                
                <Button variant="destructive" size="sm" className="w-full justify-start" onClick={clearAllData}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => setIsAddingIncome(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Income Entry
          </Button>
        </div>
      </div>
      
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
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">{totalHoursWorked.toFixed(1)}</div>
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
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text:white">${averageHourlyRate.toFixed(2)}</div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1.5">Per hour earnings</p>
          </CardContent>
        </Card>
      </div>
      
      {/* No data state */}
      {freelanceIncomes.length === 0 && (
        <div className="bg-[#F9F9FB] dark:bg-[#28282A] rounded-xl p-8 text-center mb-8">
          <div className="p-3 rounded-full bg-[#F2F2F7] dark:bg-[#38383A] inline-flex mb-4">
            <Briefcase className="h-8 w-8 text-[#8E8E93] dark:text-[#98989D]" />
          </div>
          <h3 className="text-xl font-medium text-[#1D1D1F] dark:text:white mb-2">No income entries yet</h3>
          <p className="text-[#86868B] dark:text-[#98989D] max-w-md mx-auto mb-6">
            Add your freelance income entries to see analytics and track your performance across platforms, clients, and time.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => setIsAddingIncome(true)} className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Add First Entry
            </Button>
            <Button variant="outline" onClick={loadSampleData}>
              Load Sample Data
            </Button>
          </div>
        </div>
      )}
      
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
            onViewIncome={setViewingIncome}
          />
        </TabsContent>
        
        {/* Client Profitability Tab */}
        <TabsContent value="clients">
          <ClientProfitability 
            clients={clients} 
            incomes={freelanceIncomes} 
            onViewIncome={setViewingIncome}
          />
        </TabsContent>
        
        {/* Time Tracking Tab */}
        <TabsContent value="time">
          <TimeTracking 
            incomes={freelanceIncomes} 
            onViewIncome={setViewingIncome}
          />
        </TabsContent>
        
        {/* Passive Income Suggestions Tab */}
        <TabsContent value="passive">
          <div className="mb-4 bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg p-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#FEF4E8] dark:bg-[#382D1E] rounded-full shrink-0">
                <Lightbulb className="h-5 w-5 text-[#FF9500] dark:text-[#FF9F0A]" />
              </div>
              <div>
                <h4 className="text-base font-medium text-[#1D1D1F] dark:text:white mb-1">How to use Passive Income Suggestions</h4>
                <p className="text-[#86868B] dark:text-[#98989D] mb-2">
                  This section analyzes your freelance skills and work history to suggest personalized passive income opportunities.
                </p>
                <ul className="list-disc pl-5 text-[#86868B] dark:text-[#98989D] space-y-1">
                  <li>Add more income entries to improve personalized suggestions</li>
                  <li>Click on any card to view detailed implementation advice</li>
                  <li>Filter ideas by type or effort required</li>
                  <li>Match percentage shows compatibility with your current skills</li>
                </ul>
              </div>
            </div>
          </div>
          <PassiveIncomeSuggestions 
            incomes={freelanceIncomes} 
            skills={[...new Set(freelanceIncomes.map(income => income.category))]} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}