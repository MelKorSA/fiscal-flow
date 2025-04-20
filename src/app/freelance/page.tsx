import React from 'react';
import { Metadata } from 'next';
import { FreelanceDashboard } from '@/components/freelance/freelance-dashboard';
import { DashboardHeader } from '@/components/dashboard-header';

export const metadata: Metadata = {
  title: 'Freelance Income Tracking',
  description: 'Track and analyze your freelance income across different platforms and clients',
};

export default function FreelancePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-start justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-4">Freelance Income</h1>
        </div>
        <div className="grid gap-6">
          <FreelanceDashboard />
        </div>
      </div>
    </div>
  );
}