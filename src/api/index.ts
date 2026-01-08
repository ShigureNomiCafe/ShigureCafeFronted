import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getErrorMessage } from '../utils/errorMessages';

// Define a custom instance type that reflects the unwrapped data from the response interceptor
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'delete' | 'post' | 'put' | 'patch'> {
  get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = T, D = any>(url: string, data?: any, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = T, D = any>(url: string, data?: any, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = T, D = any>(url: string, data?: any, config?: AxiosRequestConfig<D>): Promise<R>;
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
}) as CustomAxiosInstance;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Return standard data directly
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Handle structured error response
    if (error.response?.data && error.response.data.code) {
      const { code, metadata } = error.response.data;
      error.message = getErrorMessage(code, metadata);
    } else if (error.response?.status === 403) {
      error.message = getErrorMessage('FORBIDDEN');
    } else if (error.response?.status === 401) {
      error.message = getErrorMessage('UNAUTHORIZED');
    }

    return Promise.reject(error);
  }
);

export default api;
