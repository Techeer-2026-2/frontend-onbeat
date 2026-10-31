import apiClient from './client';

export const getMyProfile = async () => (await apiClient.get('/me')).data;
export const updateMyProfile = async (payload) => (await apiClient.patch('/me', payload)).data;
