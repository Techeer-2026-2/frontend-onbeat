import apiClient from './client';

const saveTokens = (data) => {
  const payload = data?.data ?? data;
  if (payload?.accessToken) localStorage.setItem('onbeat-access-token', payload.accessToken);
  if (payload?.refreshToken) localStorage.setItem('onbeat-refresh-token', payload.refreshToken);
  return payload;
};

export const login = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return saveTokens(response.data);
};

export const signup = async (payload) => {
  const response = await apiClient.post('/auth/signup', payload);
  return saveTokens(response.data);
};

export const refreshAccessToken = async (refreshToken = localStorage.getItem('onbeat-refresh-token')) => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return saveTokens(response.data);
};

export const logout = () => {
  localStorage.removeItem('onbeat-access-token');
  localStorage.removeItem('onbeat-refresh-token');
};
