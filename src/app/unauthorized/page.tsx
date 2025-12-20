/* eslint-disable react/no-unescaped-entities */
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [previousPage, setPreviousPage] = useState<string>('');

  useEffect(() => {
    // Get the page user came from
    const referer = document.referrer;
    if (referer) {
      const url = new URL(referer);
      setPreviousPage(url.pathname);
    }
  }, []);

  // Get friendly name for the page
  const getPageName = (pathname: string) => {
    if (pathname.includes('/user-management')) return 'User Management';
    if (pathname.includes('/configurations')) return 'Configurations';
    if (pathname.includes('/production')) return 'Production';
    if (pathname.includes('/invoice')) return 'Invoices';
    if (pathname.includes('/material-request')) return 'Material Requests';
    if (pathname.includes('/items-management')) return 'Items Management';
    return 'Dashboard';
  };

  const getPagePath = (pathname: string): string => {
    if (pathname.includes('/user-management')) return '/user-management';
    if (pathname.includes('/configurations')) return '/configurations';
    if (pathname.includes('/production')) return '/production-management';
    if (pathname.includes('/invoice')) return '/invoice-management';
    if (pathname.includes('/material-request')) return '/material-request';
    if (pathname.includes('/items-management')) return '/items-management';
    return '/dashboard-overview';
  };

  const pageName = previousPage ? getPageName(previousPage) : 'Dashboard';
  const pagePath = previousPage ? getPagePath(previousPage) : '/dashboard-overview';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-destructive/10 p-6">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Access Denied</h1>

        <p className="mb-6 text-muted-foreground">
          You do not have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard-overview')}
          >
            Go to Dashboard
          </Button>
          <Button onClick={() => router.push(pagePath)}>
            Try {pageName}
          </Button>
        </div>

        <div className="mt-8 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Need access?</strong> Contact your system administrator to
            request the appropriate permissions for your role.
          </p>
        </div>
      </div>
    </div>
  );
}
