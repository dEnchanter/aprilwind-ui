'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRoleDetail, getAccessToken } from '@/utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component for role-based access control
 *
 * Usage:
 * <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
 *   <YourComponent />
 * </ProtectedRoute>
 *
 * If allowedRoles is not provided, only authentication is checked
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const router = useRouter();
  const token = getAccessToken();
  const role = getUserRoleDetail();

  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      router.push('/sign-in');
      return;
    }

    // If allowedRoles is specified, check authorization
    if (allowedRoles && allowedRoles.length > 0) {
      if (!role) {
        router.push('/sign-in');
        return;
      }

      if (!allowedRoles.includes(role.name)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [token, role, allowedRoles, router]);

  // Don't render anything while checking authentication
  if (!token || (allowedRoles && allowedRoles.length > 0 && !role)) {
    return null;
  }

  // If allowedRoles specified and user doesn't have permission
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role.name)) {
    return null;
  }

  return <>{children}</>;
};
