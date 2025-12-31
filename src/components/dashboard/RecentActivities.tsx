import React from 'react';
import {
  Activity,
  FileText,
  Package,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { DashboardActivity } from '@/types/dashboard';

interface RecentActivitiesProps {
  activities: DashboardActivity[];
  loading?: boolean;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  loading
}) => {
  if (loading) {
    return null; // Handled by DashboardSkeleton
  }

  const getActivityIcon = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('production')) {
      return <Package className="h-5 w-5 text-blue-600" />;
    } else if (lowerType.includes('invoice')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else if (lowerType.includes('material')) {
      return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    } else if (lowerType.includes('stock')) {
      return <TrendingUp className="h-5 w-5 text-purple-600" />;
    } else if (lowerType.includes('user') || lowerType.includes('staff') || lowerType.includes('customer')) {
      return <Users className="h-5 w-5 text-indigo-600" />;
    } else if (lowerType.includes('config') || lowerType.includes('setting')) {
      return <Settings className="h-5 w-5 text-gray-600" />;
    } else {
      return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDetails = (activity: DashboardActivity) => {
    const { details } = activity;

    // Production details
    if (details.productionCode) {
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500">Code:</span>
            <span className="text-xs font-mono text-gray-900">{details.productionCode}</span>
          </div>
          {details.stage && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">Stage:</span>
              <Badge variant="outline" className="text-xs">
                {details.stage}
              </Badge>
            </div>
          )}
        </div>
      );
    }

    // Material request details
    if (details.requestId) {
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500">Request ID:</span>
            <span className="text-xs font-mono text-gray-900">#{details.requestId}</span>
          </div>
          {details.status && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <Badge
                variant={details.status === 'approved' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {details.status}
              </Badge>
            </div>
          )}
        </div>
      );
    }

    // Generic details - show key-value pairs
    const entries = Object.entries(details).filter(([key]) => key !== 'notes');
    if (entries.length > 0) {
      return (
        <div className="space-y-1">
          {entries.slice(0, 2).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-xs text-gray-900">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-xs text-gray-500">-</span>;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No recent activities</p>
              <p className="text-sm text-gray-500 mt-1">Activities will appear here as they occur</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Activities
      </h2>
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Details
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Performed By
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((activity, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-sm text-gray-900 capitalize">
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">
                        {activity.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {formatDetails(activity)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {activity.performedBy}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.timestamp)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {activity.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {activity.action}
                    </p>
                    <div className="mb-2">
                      {formatDetails(activity)}
                    </div>
                    <p className="text-xs text-gray-600">
                      By: {activity.performedBy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
