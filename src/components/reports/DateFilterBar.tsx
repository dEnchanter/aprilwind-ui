import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { datePresetOptions, type DatePreset, getDateRangeForPreset } from '@/utils/datePresets';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateFilterBarProps {
  onDateRangeChange: (startDate: string, endDate: string, preset: string) => void;
  activePreset: DatePreset;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  onDateRangeChange,
  activePreset
}) => {
  const handlePresetClick = (preset: DatePreset) => {
    const range = getDateRangeForPreset(preset);
    onDateRangeChange(range.startDate, range.endDate, preset);
  };

  const currentRange = getDateRangeForPreset(activePreset);

  const formatDateRange = () => {
    if (!currentRange.startDate || !currentRange.endDate) {
      return 'All Time';
    }
    try {
      const start = format(new Date(currentRange.startDate), 'MMM d, yyyy');
      const end = format(new Date(currentRange.endDate), 'MMM d, yyyy');
      return `${start} - ${end}`;
    } catch {
      return currentRange.label;
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {datePresetOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handlePresetClick(option.value)}
                variant={activePreset === option.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'transition-all',
                  activePreset === option.value && 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Current Date Range Display */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDateRange()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
