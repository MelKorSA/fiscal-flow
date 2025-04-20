import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DebtManagementLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <DashboardHeader
        title="Debt Management"
        description="Track and optimize your debts with multiple payoff strategies"
      />
      
      {/* Overview cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent className="pt-2">
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Form skeleton */}
        <div className="lg:col-span-4">
          <Card className="border-0 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Tables skeleton */}
        <div className="lg:col-span-8">
          <Card className="border-0 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}