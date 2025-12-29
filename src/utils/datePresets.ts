import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  format
} from 'date-fns';

export type DatePreset =
  | 'this-week'
  | 'this-month'
  | 'last-30-days'
  | 'last-90-days'
  | 'this-quarter'
  | 'this-year'
  | 'all-time';

export interface DateRange {
  startDate: string;  // ISO format YYYY-MM-DD
  endDate: string;    // ISO format YYYY-MM-DD
  label: string;      // Human readable label
}

export const getDateRangeForPreset = (preset: DatePreset): DateRange => {
  const today = new Date();

  switch (preset) {
    case 'this-week':
      return {
        startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        label: 'This Week'
      };

    case 'this-month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        label: 'This Month'
      };

    case 'last-30-days':
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        label: 'Last 30 Days'
      };

    case 'last-90-days':
      return {
        startDate: format(subDays(today, 90), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        label: 'Last 90 Days'
      };

    case 'this-quarter':
      return {
        startDate: format(startOfQuarter(today), 'yyyy-MM-dd'),
        endDate: format(endOfQuarter(today), 'yyyy-MM-dd'),
        label: 'This Quarter'
      };

    case 'this-year':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(endOfYear(today), 'yyyy-MM-dd'),
        label: 'This Year'
      };

    case 'all-time':
      return {
        startDate: '',
        endDate: '',
        label: 'All Time'
      };

    default:
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        label: 'This Month'
      };
  }
};

export const datePresetOptions = [
  { value: 'this-week' as DatePreset, label: 'This Week' },
  { value: 'this-month' as DatePreset, label: 'This Month' },
  { value: 'last-30-days' as DatePreset, label: 'Last 30 Days' },
  { value: 'last-90-days' as DatePreset, label: 'Last 90 Days' },
  { value: 'this-quarter' as DatePreset, label: 'This Quarter' },
  { value: 'this-year' as DatePreset, label: 'This Year' },
  { value: 'all-time' as DatePreset, label: 'All Time' },
] as const;
