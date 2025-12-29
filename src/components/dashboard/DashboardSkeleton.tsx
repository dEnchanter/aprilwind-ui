import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grouped Metric Cards Skeleton (2x2 grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={`grouped-${i}`} className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={`metric-${j}`} className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section Skeleton */}
      <div className="mt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={`alert-${i}`} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities Skeleton */}
      <div className="mt-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={`activity-${i}`} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
