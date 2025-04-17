'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, TrendingUp, PiggyBank } from 'lucide-react';
import { format, addMonths, isPast } from 'date-fns';
import type { Account } from '@/app/dashboard/page'; // Import Account type

interface FixedDepositListProps {
  accounts: Account[]; // Pass all accounts, we will filter for FDs
}

// Helper function to calculate maturity
const calculateMaturity = (principal: number, rate: number, tenureMonths: number, startDate: Date) => {
  const maturityDate = addMonths(startDate, tenureMonths);
  // Simple interest calculation for example: P * R * T / 100
  // Note: Real-world calculations might involve compounding (quarterly, etc.)
  // This is a simplified version.
  const annualRate = rate / 100;
  const years = tenureMonths / 12;
  const simpleInterest = principal * annualRate * years;
  const maturityAmount = principal + simpleInterest;
  return { maturityDate, maturityAmount };
};

export function FixedDepositList({ accounts }: FixedDepositListProps) {
  const fixedDeposits = accounts.filter(acc => acc.type === 'Fixed Deposit');

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
             <CalendarClock className="h-5 w-5 text-purple-600" />
             <CardTitle>Fixed Deposits</CardTitle>
        </div>
        <CardDescription>Overview of your fixed term investments.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60 w-full"> {/* Adjust height as needed */}
          {fixedDeposits.length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Maturity Date</TableHead>
                        <TableHead className="text-right">Maturity Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fixedDeposits.map((fd) => {
                        if (fd.balance === undefined || !fd.interestRate || !fd.tenureMonths || !fd.startDate) {
                             return <TableRow key={fd.id}><TableCell colSpan={5}>Invalid FD data</TableCell></TableRow>; // Skip if data is missing
                        }
                        const { maturityDate, maturityAmount } = calculateMaturity(
                            fd.balance, // Principal stored in balance
                            fd.interestRate,
                            fd.tenureMonths,
                            fd.startDate
                         );
                        const matured = isPast(maturityDate);

                        return (
                            <TableRow key={fd.id}>
                                <TableCell className="font-medium text-sm">{fd.name}</TableCell>
                                <TableCell>${fd.balance.toFixed(2)}</TableCell>
                                <TableCell>{fd.interestRate.toFixed(2)}%</TableCell>
                                <TableCell>
                                    {format(maturityDate, 'MMM d, yyyy')}
                                    {matured && <Badge variant="destructive" className="ml-2">Matured</Badge>}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    ${maturityAmount.toFixed(2)}
                                    <TrendingUp className="inline-block h-4 w-4 ml-1 text-green-600" />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
             </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <PiggyBank className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                    No fixed deposits added yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Add one using the 'Add New Account' form.
                 </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
