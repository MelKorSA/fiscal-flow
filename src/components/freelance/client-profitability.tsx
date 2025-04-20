'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { format } from 'date-fns';
import { FreelanceIncome, Client } from './freelance-dashboard';
import { Users, TrendingUp, Clock, DollarSign, Info, ArrowUpRight, Percent } from 'lucide-react';

interface ClientProfitabilityProps {
  clients: Client[];
  incomes: FreelanceIncome[];
  onViewIncome?: (income: FreelanceIncome) => void;
}

// Chart config for styling
const chartConfig = {
  client: {
    color: '#007AFF'
  },
  profitability: {
    theme: {
      light: 'rgba(52, 199, 89, 0.6)',
      dark: 'rgba(48, 209, 88, 0.6)'
    }
  }
};

export function ClientProfitability({ clients, incomes, onViewIncome }: ClientProfitabilityProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Sort clients by profitability score
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => (b.profitabilityScore || 0) - (a.profitabilityScore || 0));
  }, [clients]);

  // Calculate totals
  const totalEarnings = useMemo(() => {
    return clients.reduce((sum, client) => sum + client.totalIncome, 0);
  }, [clients]);

  // Get client color based on profitability score
  const getClientColor = (score?: number) => {
    if (!score) return '#8E8E93';
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#30B0C7';
    if (score >= 40) return '#007AFF';
    if (score >= 20) return '#FF9500';
    return '#FF3B30';
  };

  // Get client transactions
  const getClientTransactions = (clientName: string) => {
    return incomes
      .filter((income) => income.client === clientName)
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      });
  };

  // Format date values
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  };

  // Data for scatter chart
  const scatterData = useMemo(() => {
    return sortedClients.map((client) => ({
      x: client.totalIncome, // Total income on x-axis
      y: client.averageRate, // Hourly rate on y-axis
      z: client.hoursWorked, // Size based on hours worked
      name: client.name,
      profitabilityScore: client.profitabilityScore,
      color: getClientColor(client.profitabilityScore),
    }));
  }, [sortedClients]);

  // Generate client profitability breakdown
  const profitabilityFactors = useMemo(() => {
    if (!selectedClient) return null;

    const hourlyRateScore = Math.min(100, (selectedClient.averageRate / 100) * 100);
    const volumeScore = Math.min(100, (selectedClient.totalIncome / 5000) * 100);
    const projectCountScore = Math.min(100, (selectedClient.projects / 5) * 100);

    return [
      {
        name: 'Hourly Rate',
        score: hourlyRateScore,
        description: `$${selectedClient.averageRate.toFixed(2)} per hour`,
      },
      {
        name: 'Revenue Volume',
        score: volumeScore,
        description: `$${selectedClient.totalIncome.toFixed(2)} total`,
      },
      {
        name: 'Project Count',
        score: projectCountScore,
        description: `${selectedClient.projects} project${selectedClient.projects !== 1 ? 's' : ''}`,
      },
    ];
  }, [selectedClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">Client Profitability Analysis</h2>
          <p className="text-sm text-[#86868B] dark:text-[#98989D]">
            Identify your most valuable clients based on rate and volume
          </p>
        </div>
      </div>

      <div className="p-4 bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg text-xs">
        <div className="flex items-start mb-3">
          <Info className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF] mr-2 mt-0.5" />
          <div>
            <span className="font-medium text-[#1D1D1F] dark:text-white">Data Privacy Notice:</span>
            <p className="mt-1 text-[#86868B] dark:text-[#98989D]">
              All client data displayed here is securely managed and used solely for profitability analysis purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  Client Profitability Matrix
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                Rate vs. Volume - Bubble size indicates hours worked
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full p-4">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Total Income"
                        unit="$"
                        label={{
                          value: 'Total Income ($)',
                          position: 'insideBottom',
                          offset: -10,
                          fontSize: 12,
                          fill: '#8E8E93',
                        }}
                        domain={['auto', 'auto']}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Hourly Rate"
                        unit="$/hr"
                        label={{
                          value: 'Hourly Rate ($/hr)',
                          position: 'insideLeft',
                          angle: -90,
                          offset: -10,
                          fontSize: 12,
                          fill: '#8E8E93',
                        }}
                        domain={['auto', 'auto']}
                      />
                      <ZAxis type="number" dataKey="z" range={[50, 400]} />
                      <RechartsTooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-[#2C2C2E] shadow-lg rounded-lg p-2 border border-[#E5E5EA] dark:border-[#48484A] text-xs">
                                <p className="font-medium text-[#1D1D1F] dark:text-white mb-1">{data.name}</p>
                                <p className="text-[#007AFF] dark:text-[#0A84FF]">
                                  Total Income: ${data.x.toFixed(2)}
                                </p>
                                <p className="text-[#34C759] dark:text-[#30D158]">
                                  Hourly Rate: ${data.y.toFixed(2)}/hr
                                </p>
                                <p className="text-[#FF9500] dark:text-[#FF9F0A]">
                                  Hours Worked: {data.z} hrs
                                </p>
                                <p className="mt-1.5 font-medium flex items-center">
                                  <span
                                    className="w-2 h-2 rounded-full inline-block mr-1"
                                    style={{ backgroundColor: data.color }}
                                  ></span>
                                  Profitability: {data.profitabilityScore}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Clients" data={scatterData} onClick={(data) => setSelectedClient(clients.find(c => c.name === data.name) || null)}>
                        {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="px-4 pb-4">
                <div className="p-4 bg-[#F9F9FB] dark:bg-[#28282A] rounded-lg text-xs">
                  <div className="flex items-start mb-3">
                    <Info className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF] mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium text-[#1D1D1F] dark:text-white">How to read this chart:</span>
                      <ul className="mt-1 text-[#86868B] dark:text-[#98989D] space-y-1">
                        <li>• X-axis shows total income from each client</li>
                        <li>• Y-axis shows hourly rate for each client</li>
                        <li>• Bubble size represents total hours worked</li>
                        <li>• Colors indicate profitability (green = most profitable)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-[#86868B] dark:text-[#98989D]">Click on any bubble to see client details.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          {selectedClient ? (
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white">
                      {selectedClient.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                      Client Profitability Analysis
                    </CardDescription>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    backgroundColor: getClientColor(selectedClient.profitabilityScore)
                  }}>
                    <Percent className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-[#F2F2F7] dark:bg-[#38383A] rounded-lg mb-4">
                  <div className="text-sm font-semibold text-center text-[#1D1D1F] dark:text-white mb-1">
                    Profitability Score
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold" style={{
                      color: getClientColor(selectedClient.profitabilityScore)
                    }}>
                      {selectedClient.profitabilityScore}%
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-[#86868B] dark:text-[#98989D]">
                    Based on hourly rate, total revenue, and project count
                  </div>
                </div>

                <div className="space-y-4">
                  {profitabilityFactors?.map((factor) => (
                    <div key={factor.name}>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-[#1D1D1F] dark:text-white font-medium">{factor.name}</span>
                        <span className="text-[#86868B] dark:text-[#98989D]">{factor.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={factor.score} className="h-2" />
                        <span className="text-xs font-medium text-[#007AFF] dark:text-[#0A84FF]">
                          {Math.round(factor.score)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[#E5E5EA] dark:border-[#38383A] pt-4">
                  <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-white mb-2">
                    Client Key Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Total Revenue</div>
                      <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                        ${selectedClient.totalIncome.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Hours Worked</div>
                      <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                        {selectedClient.hoursWorked} hrs
                      </div>
                    </div>
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Avg. Hourly Rate</div>
                      <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                        ${selectedClient.averageRate.toFixed(2)}/hr
                      </div>
                    </div>
                    <div className="p-2 bg-[#F2F2F7]/80 dark:bg-[#38383A]/50 rounded-lg">
                      <div className="text-[#86868B] dark:text-[#98989D]">Projects</div>
                      <div className="text-[#1D1D1F] dark:text-white font-medium mt-1">
                        {selectedClient.projects}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full border-dashed text-xs" 
                  onClick={() => setSelectedClient(null)}
                >
                  Close Client Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F] dark:text-white flex items-center">
                  <Users className="mr-2 h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
                  Client Rankings
                </CardTitle>
                <CardDescription className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                  Sorted by calculated profitability score
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  <div className="px-4 py-2">
                    {sortedClients.map((client, index) => (
                      <div 
                        key={client.id}
                        className="p-3 border-b border-[#F2F2F7] dark:border-[#38383A] last:border-0 cursor-pointer transition-colors hover:bg-[#F2F2F7]/50 dark:hover:bg-[#38383A]/50"
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className="bg-[#F2F2F7] dark:bg-[#38383A] text-[#1D1D1F] dark:text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold mr-2">
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm text-[#1D1D1F] dark:text-white">{client.name}</span>
                          </div>
                          <Badge style={{
                            backgroundColor: getClientColor(client.profitabilityScore) + '20',
                            color: getClientColor(client.profitabilityScore)
                          }}>
                            {client.profitabilityScore}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-[#86868B] dark:text-[#98989D]">
                          <span>${client.totalIncome.toFixed(2)}</span>
                          <span>•</span>
                          <span>${client.averageRate.toFixed(2)}/hr</span>
                          <span>•</span>
                          <span>{client.hoursWorked} hrs</span>
                          <span>•</span>
                          <span>{client.projects} project{client.projects !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}