import React from 'react';
import { DebtManagement } from '@/components/debt-management';
import { DashboardHeader } from '@/components/dashboard-header';

export default function DebtManagementPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <DashboardHeader
        title="Debt Management"
        description="Track and optimize your debts with multiple payoff strategies"
      />
      <DebtManagement />
    </div>
  );
}