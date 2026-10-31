import apiClient from './client';

const saveTokens = (data) => {
  const payload = data?.data ?? data;
  const userId = payload?.userId ?? payload?.memberId ?? payload?.user?.userId ?? payload?.user?.id;
  if (userId != null) localStorage.setItem('onbeat-member-id', String(userId));
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

export const logout = async (refreshToken = localStorage.getItem('onbeat-refresh-token')) => {
  if (refreshToken) await apiClient.post('/auth/logout', { refreshToken });
  localStorage.removeItem('onbeat-access-token');
  localStorage.removeItem('onbeat-refresh-token');
  localStorage.removeItem('onbeat-member-id');
};
