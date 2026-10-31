import apiClient from './client';

const saveOwnerTokens = (data) => {
  const payload = data?.data ?? data;
  if (payload?.accessToken) localStorage.setItem('onbeat-owner-access-token', payload.accessToken);
  if (payload?.refreshToken) localStorage.setItem('onbeat-owner-refresh-token', payload.refreshToken);
  return payload;
};

const ownerConfig = () => {
  const token = localStorage.getItem('onbeat-owner-access-token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
};

export const ownerSignup = async (payload) => (await apiClient.post('/owners/signup', payload)).data;
export const ownerLogin = async (payload) => saveOwnerTokens((await apiClient.post('/owners/login', payload)).data);
export const ownerRefresh = async (refreshToken) => saveOwnerTokens((await apiClient.post('/owners/refresh', { refreshToken })).data);
export const ownerLogout = async (refreshToken) => {
  if (refreshToken) await apiClient.post('/owners/logout', { refreshToken });
  localStorage.removeItem('onbeat-owner-access-token');
  localStorage.removeItem('onbeat-owner-refresh-token');
};
export const getOwnerProfile = async () => (await apiClient.get('/owners/me', ownerConfig())).data;
export const updateOwnerProfile = async (payload) => (await apiClient.patch('/owners/me', payload, ownerConfig())).data;
