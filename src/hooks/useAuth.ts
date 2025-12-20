/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchPost, fetchGet, fetchPatch } from '@/services/fetcher';
import { saveAccessToken, saveRefreshToken, saveUserData, saveUserRoleDetail, saveUserPermissions, clearAccessToken, clearRefreshToken, clearUserData, clearUserRoleDetail, clearUserPermissions, getAccessToken } from '@/utils/storage';
import { toast } from 'sonner';

// Types for authentication
export interface LoginRequest {
  profileCode: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    profileCode: string;
    staffName: string;
    email: string;
    role: {
      id: number;
      name: string;
      description: string;
    };
    permissions: string[];
  };
}

export interface RegisterRequest {
  staffId: number;
  profileCode: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

// Query keys
export const authKeys = {
  profile: ['auth', 'profile'] as const,
  me: ['auth', 'me'] as const,
};

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await fetchPost<LoginResponse, LoginRequest>(
        Endpoint.LOGIN,
        data
      );
      return response;
    },
    onSuccess: (data) => {
      // Store tokens and user data
      saveAccessToken(data.accessToken);
      if (data.refreshToken) {
        saveRefreshToken(data.refreshToken);
      }

      // Store user data in the format expected by existing code
      saveUserData({
        data: {
          email: data.user.email,
          phoneNumber: '', // Not returned by new API
          staffName: data.user.staffName,
        },
      });

      // Store role details
      saveUserRoleDetail(data.user.role as any);

      // Store user permissions
      saveUserPermissions(data.user.permissions || []);

      toast.success('Login successful');
    },
    onError: (error: any) => {
      const message = error?.message || 'Login failed';
      toast.error(message);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await fetchPost<any, RegisterRequest>(
        Endpoint.REGISTER,
        data
      );
      return response;
    },
    onSuccess: () => {
      toast.success('User registered successfully');
      // Invalidate staff queries if needed
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error: any) => {
      const message = error?.message || 'Registration failed';
      toast.error(message);
    },
  });
};

// Get profile query
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      try {
        const response = await fetchGet<any>(Endpoint.GET_PROFILE);
        return response;
      } catch (error: any) {
        // If we get a 401, clear auth and redirect to login
        if (error?.response?.status === 401) {
          clearAccessToken();
          clearRefreshToken();
          clearUserData();
          clearUserRoleDetail();

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
            window.location.href = '/sign-in';
          }
        }
        throw error;
      }
    },
    enabled: !!getAccessToken(), // Only fetch if logged in
    retry: false, // Don't retry profile requests
  });
};

// Get current user (lightweight)
export const useMe = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const response = await fetchGet<any>(Endpoint.GET_ME);
        return response;
      } catch (error: any) {
        // If we get a 401, clear auth and redirect to login
        if (error?.response?.status === 401) {
          clearAccessToken();
          clearRefreshToken();
          clearUserData();
          clearUserRoleDetail();

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
            window.location.href = '/sign-in';
          }
        }
        throw error;
      }
    },
    enabled: !!getAccessToken(), // Only fetch if logged in
    retry: false, // Don't retry auth requests
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await fetchPost<{ message: string }, ChangePasswordRequest>(
        Endpoint.CHANGE_PASSWORD,
        data
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Password change failed';
      toast.error(message);
    },
  });
};

// Reset password mutation (admin function)
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ staffId, newPassword }: { staffId: number; newPassword: string }) => {
      const endpoint = typeof Endpoint.RESET_PASSWORD === 'function'
        ? Endpoint.RESET_PASSWORD(staffId)
        : Endpoint.RESET_PASSWORD;

      const response = await fetchPost<{ message: string }, ResetPasswordRequest>(
        endpoint,
        { newPassword }
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Password reset failed';
      toast.error(message);
    },
  });
};

// Activate account mutation (admin function)
export const useActivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: number) => {
      const endpoint = typeof Endpoint.ACTIVATE_ACCOUNT === 'function'
        ? Endpoint.ACTIVATE_ACCOUNT(staffId)
        : Endpoint.ACTIVATE_ACCOUNT;

      const response = await fetchPatch<{ message: string }, {}>(endpoint, {});
      return response;
    },
    onSuccess: () => {
      toast.success('Account activated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error: any) => {
      const message = error?.message || 'Account activation failed';
      toast.error(message);
    },
  });
};

// Deactivate account mutation (admin function)
export const useDeactivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: number) => {
      const endpoint = typeof Endpoint.DEACTIVATE_ACCOUNT === 'function'
        ? Endpoint.DEACTIVATE_ACCOUNT(staffId)
        : Endpoint.DEACTIVATE_ACCOUNT;

      const response = await fetchPatch<{ message: string }, {}>(endpoint, {});
      return response;
    },
    onSuccess: () => {
      toast.success('Account deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error: any) => {
      const message = error?.message || 'Account deactivation failed';
      toast.error(message);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await fetchPost<{ message: string }, {}>(Endpoint.LOGOUT, {});
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
      }
    },
    onSuccess: () => {
      // Clear all stored auth data
      clearAccessToken();
      clearRefreshToken();
      clearUserData();
      clearUserRoleDetail();
      clearUserPermissions();

      // Clear all queries
      queryClient.clear();

      toast.success('Logged out successfully');

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    },
  });
};
