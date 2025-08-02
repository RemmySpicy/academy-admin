import { useCallback } from 'react';
import apiClient from '../services/apiClient';
import { ApiResponse } from '../types';

export default function useApiClient() {
  const get = useCallback(async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  }, []);

  const post = useCallback(async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  }, []);

  const put = useCallback(async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  }, []);

  const patch = useCallback(async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  }, []);

  const del = useCallback(async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  }, []);

  const setBaseURL = useCallback((url: string) => {
    apiClient.setBaseURL(url);
  }, []);

  const setProgramContext = useCallback(async (programId: string) => {
    await apiClient.setProgramContext(programId);
  }, []);

  const getProgramContext = useCallback(async () => {
    return apiClient.getProgramContext();
  }, []);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    setBaseURL,
    setProgramContext,
    getProgramContext,
    client: apiClient,
  };
}