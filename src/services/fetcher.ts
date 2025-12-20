/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAccessToken } from '@/utils/storage';
import { baseUrl, apiVersionPath } from './api';  // Adjust the path as necessary

// Ensure proper URL construction with trailing slash
const fullApiUrl = apiVersionPath
  ? `${baseUrl}/${apiVersionPath}`
  : baseUrl;

const createHeaders = (extraHeaders?: Record<string, string>) => {
  const headers = new Headers({
    'Content-Type': 'application/json'
  });

  const token = getAccessToken();
  if (token) {
    // Use Bearer token format as per new backend
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.append(key, value);
    }
  }

  return headers;
};

const setToken = (extraHeaders?: Record<string, string>) => {
  const headers = new Headers();

  const token = getAccessToken();
  if (token) {
    // Use Bearer token format as per new backend
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.append(key, value);
    }
  }

  return headers;
};

// Custom error class to preserve response status
class FetchError extends Error {
  response: { status: number; data: any };

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'FetchError';
    this.response = { status, data };
  }
}

// Define a generic type for handling responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // Handle 403 Forbidden - redirect to unauthorized page
    if (response.status === 403) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/unauthorized')) {
        window.location.replace('/unauthorized');
        // Return a promise that never resolves to prevent showing error UI
        return new Promise<T>(() => {});
      }
    }

    const errorData = await response.json();
    let errorMessage = 'Something went wrong';

    if (errorData.message && Array.isArray(errorData.message) && errorData.message.length >= 2) {
      // If 'message' is an array and has at least two elements, use the second one
      errorMessage = errorData.message[1];
    } else if (errorData.message) {
      // If 'message' is a string, use it directly
      errorMessage = errorData.message;
    }

    // Throw custom error with status code
    throw new FetchError(errorMessage, response.status, errorData);
  }
  return response.json() as Promise<T>;
}

export const fetchGet = async <T>(endpoint: string, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(extraHeaders),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchGet2 = async <T>(endpoint: string, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `https://fetspay.fetswallet.com/vas/api/v1/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(extraHeaders),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchPost = async <T, U>(endpoint: string, data: U, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchPost2 = async <T, U>(endpoint: string, data: U, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `https://fetspay.fetswallet.com/vas/api/v1/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchPostMultipart = async <T, U>(endpoint: string, data: U, files: Record<string, File>, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  const formData = new FormData();

  // Append regular fields to form data
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      formData.append(key, (data as any)[key]);
    }
  }

  // Append files to form data
  for (const key in files) {
    if (Object.prototype.hasOwnProperty.call(files, key)) {
      formData.append(key, files[key]);
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: setToken(extraHeaders),
      body: formData,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const fetchPostMultipart2 = async <T, U>(
  endpoint: string,
  data: U,
  files: Record<string, File>,
  extraHeaders?: Record<string, string>
): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  const formData = new FormData();

  // Append files to form data
  for (const key in files) {
    if (Object.prototype.hasOwnProperty.call(files, key)) {
      formData.append(key, files[key]);
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: setToken(extraHeaders),
      body: formData,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const fetchPut = async <T, U>(endpoint: string, data: U, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchPatch = async <T, U>(endpoint: string, data: U, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: createHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchDelete = async <T>(endpoint: string, extraHeaders?: Record<string, string>): Promise<T> => {
  const url = `${fullApiUrl}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(extraHeaders),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
