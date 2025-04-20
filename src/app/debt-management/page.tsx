import React from 'react';
import { DebtManagement } from '@/components/debt-management';
import { DashboardHeader } from '@/components/dashboard-header';

export default function DebtManagementPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <DashboardHeader
        title="Debt Management"
        description="Track and optimize your debts with multiple payoff strategies"
      />
      <main className="flex-1 p-6 md:p-8">
        <DebtManagement />
      </main>
    </div>
  );
}