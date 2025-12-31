import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DashboardAlert } from '@/types/dashboard';

interface AlertsSectionProps {
  alerts: DashboardAlert[];
  loading?: boolean;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, loading }) => {
  // Transform backend links to match frontend routes
  const transformLink = (link?: string): string | undefined => {
    if (!link) return undefined;

    // Map backend routes to frontend routes
    const routeMap: Record<string, string> = {
      '/material-requests/pending': '/material-request',
      '/material-requests': '/material-request',
      '/raw-items/low-stock': '/items-management',
      '/raw-items': '/items-management',
    };

    // Check for exact match first
    if (routeMap[link]) {
      return routeMap[link];
    }

    // Check for partial match (e.g., /raw-items/low-stock?threshold=10)
    for (const [backendPath, frontendPath] of Object.entries(routeMap)) {
      if (link.startsWith(backendPath)) {
        // Keep query params if they exist
        const queryParams = link.split('?')[1];
        return queryParams ? `${frontendPath}?${queryParams}` : frontendPath;
      }
    }

    // Return original link if no mapping found
    return link;
  };

  if (loading) {
    return null; // Handled by DashboardSkeleton
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Alerts</h2>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">No alerts at this time</p>
              <p className="text-sm text-gray-500 mt-1">Your system is running smoothly</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAlertIcon = (severity: DashboardAlert['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertStyles = (severity: DashboardAlert['severity']) => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badgeVariant: 'destructive' as const,
          hoverBg: 'hover:bg-red-100',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badgeVariant: 'default' as const,
          hoverBg: 'hover:bg-amber-100',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badgeVariant: 'secondary' as const,
          hoverBg: 'hover:bg-blue-100',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badgeVariant: 'secondary' as const,
          hoverBg: 'hover:bg-blue-100',
        };
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Alerts {alerts.length > 0 && <span className="text-sm text-gray-500">({alerts.length})</span>}
      </h2>
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const styles = getAlertStyles(alert.severity);
              const transformedLink = transformLink(alert.link);

              const alertContent = (
                <div
                  className={cn(
                    'flex items-start justify-between p-4 rounded-lg border-2 transition-colors',
                    styles.bg,
                    styles.border,
                    transformedLink && cn(styles.hoverBg, 'cursor-pointer')
                  )}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={cn('font-medium', styles.text)}>
                          {alert.message}
                        </p>
                        {alert.count > 0 && (
                          <Badge variant={styles.badgeVariant} className="text-xs">
                            {alert.count}
                          </Badge>
                        )}
                      </div>

                      {/* Show low stock items if available */}
                      {alert.items && alert.items.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {alert.items.map((item) => (
                            <div
                              key={item.id}
                              className="text-sm text-gray-700 flex items-center justify-between bg-white/50 px-2 py-1 rounded"
                            >
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-gray-500">
                                Qty: {item.currentQty}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {alert.action && (
                        <p className="text-sm text-gray-600 mt-2 flex items-center">
                          <span className="font-medium">Action:</span>
                          <span className="ml-1">{alert.action}</span>
                          {transformedLink && (
                            <ChevronRight className="h-4 w-4 ml-1" />
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );

              return transformedLink ? (
                <Link key={index} href={transformedLink} className="block">
                  {alertContent}
                </Link>
              ) : (
                <div key={index}>
                  {alertContent}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
