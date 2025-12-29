import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
}

interface GroupedMetricCardProps {
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  metrics: Metric[];
  loading?: boolean;
  index?: number;
}

export const GroupedMetricCard: React.FC<GroupedMetricCardProps> = ({
  title,
  icon: Icon,
  iconBgColor,
  iconColor,
  metrics,
  loading = false,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-md hover:shadow-lg transition-all h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {title}
            </CardTitle>
            <div className={cn('p-3 rounded-xl', iconBgColor)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
              <div
                key={idx}
                className="space-y-1"
              >
                <p className="text-xs font-medium text-gray-500">
                  {metric.label}
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <div className="flex items-center space-x-2">
                    {metric.icon && (
                      <metric.icon
                        className={cn('h-4 w-4', metric.iconColor || 'text-gray-400')}
                      />
                    )}
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
