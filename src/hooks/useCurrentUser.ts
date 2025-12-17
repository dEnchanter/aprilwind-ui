/* eslint-disable @typescript-eslint/no-explicit-any */
import { useProfile } from './useAuth';
import { getUserRoleDetail } from '@/utils/storage';

export interface CurrentUser {
  staffId: number | null;
  staffName: string | null;
  email: string | null;
  role: {
    id: number;
    name: string;
    description?: string;
  } | null;
  canSelectOtherRequesters: boolean;
}

// Roles that can create requests on behalf of others
const SUPERVISOR_ROLES = ['Administrator', 'Manager', 'Supervisor', 'Team Lead'];

export const useCurrentUser = (): CurrentUser => {
  const { data: profileData } = useProfile();
  const roleData = getUserRoleDetail();

  // Extract staff information from profile
  const staffId = profileData?.staff?.id || profileData?.id || null;
  const staffName = profileData?.staff?.staffName || profileData?.staffName || null;
  const email = profileData?.staff?.email || profileData?.email || null;
  const role = roleData || profileData?.staff?.role || profileData?.role || null;

  // Check if user can select other requesters (supervisors/managers can)
  const canSelectOtherRequesters = role ? SUPERVISOR_ROLES.includes(role.name) : false;

  return {
    staffId,
    staffName,
    email,
    role,
    canSelectOtherRequesters,
  };
};
