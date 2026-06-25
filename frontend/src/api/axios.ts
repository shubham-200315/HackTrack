import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('hacktrack_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const errorResponse = error.response;
    
    // Auto-clear invalid/expired token and redirect on 401 Unauthorized
    if (errorResponse && errorResponse.status === 401) {
      localStorage.removeItem('hacktrack_auth_token');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/showcase') {
        window.location.href = '/login';
      }
    }
    
    // Centralized logging
    console.error('[API Connection Error]:', {
      url: error.config?.url,
      method: error.config?.method,
      status: errorResponse?.status,
      data: errorResponse?.data,
      message: error.message,
    });

    let friendlyMessage = 'An unexpected network error occurred. Please check if your server is running.';

    if (errorResponse) {
      const responseData = errorResponse.data as any;
      if (responseData && responseData.message) {
        friendlyMessage = responseData.message;
        
        // Append validation errors if present
        if (responseData.errors && Array.isArray(responseData.errors)) {
          const validationDetails = responseData.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(' | ');
          friendlyMessage += ` (${validationDetails})`;
        }
      } else {
        friendlyMessage = `Server error: ${errorResponse.statusText} (${errorResponse.status})`;
      }
    } else if (error.request) {
      friendlyMessage = 'Could not establish connection to the server. Please verify your backend server is online.';
    }

    // Wrap in a custom error object for easy handling by components
    const customError = new Error(friendlyMessage);
    (customError as any).status = errorResponse?.status;
    (customError as any).details = errorResponse?.data;
    (customError as any).isAxiosError = true;

    return Promise.reject(customError);
  }
);

export default apiClient;
