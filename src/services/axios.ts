/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiVersionPath, baseUrl, Endpoint } from './api';
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  clearAccessToken,
  clearRefreshToken,
  clearUserData,
  clearUserRoleDetail
} from '@/utils/storage';

const axiosInstance = axios.create({
  baseURL: `${baseUrl}${apiVersionPath ? `/${apiVersionPath}` : ''}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add Bearer token
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor - Handle 401 and 403 errors
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 403 (Forbidden/Permission Denied), redirect to unauthorized page
    if (error.response?.status === 403) {
      // Skip 403 redirect for logout endpoint
      if (originalRequest.url?.includes('/auth/logout')) {
        return Promise.reject(error);
      }

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/unauthorized')) {
        window.location.replace('/unauthorized');
        // Return a promise that never resolves to prevent error UI
        return new Promise(() => {});
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for login, logout, and refresh endpoints
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/logout') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the token to be refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token - redirect to login
        clearAccessToken();
        clearRefreshToken();
        clearUserData();
        clearUserRoleDetail();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
          window.location.href = '/sign-in';
        }
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint
        const response = await axios.post(`${baseUrl}${apiVersionPath ? `/${apiVersionPath}` : ''}/${Endpoint.REFRESH_TOKEN}`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        saveAccessToken(accessToken);
        if (newRefreshToken) {
          saveRefreshToken(newRefreshToken);
        }

        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        // Refresh failed - clear storage and redirect to login
        clearAccessToken();
        clearRefreshToken();
        clearUserData();
        clearUserRoleDetail();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
          window.location.href = '/sign-in';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
