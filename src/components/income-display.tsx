'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign } from 'lucide-react'; // Example Icon

interface IncomeDisplayProps {
  totalIncome: number;
}

export function IncomeDisplay({ totalIncome }: IncomeDisplayProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">
          Based on recorded income transactions.
        </p>
      </CardContent>
    </Card>
  );
}
