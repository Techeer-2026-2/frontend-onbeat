import apiClient from './client';

const ownerConfig = (config = {}) => {
  const token = localStorage.getItem('onbeat-owner-access-token');
  return token ? { ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } } : config;
};

export const getCampaigns = async (params) => (await apiClient.get('/campaigns', ownerConfig({ params }))).data;
const campaignFormData = (request, image) => {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  if (image) formData.append('image', image);
  return formData;
};

export const createCampaign = async (request, image) => (
  await apiClient.post('/campaigns', campaignFormData(request, image), ownerConfig({ headers: { 'Content-Type': 'multipart/form-data' } }))
).data;
export const getCampaign = async (campaignId) => (await apiClient.get(`/campaigns/${campaignId}`, ownerConfig())).data;
export const updateCampaign = async (campaignId, request, image) => (
  await apiClient.patch(`/campaigns/${campaignId}`, campaignFormData(request, image), ownerConfig({ headers: { 'Content-Type': 'multipart/form-data' } }))
).data;
export const deleteCampaign = (campaignId) => apiClient.delete(`/campaigns/${campaignId}`, ownerConfig());
export const getCampaignHistory = async (params) => (await apiClient.get('/campaigns/history', ownerConfig({ params }))).data;
export const subscribeCampaignStats = async (campaignId, onMessage, onError) => {
  const controller = new AbortController();
  try {
    const token = localStorage.getItem('onbeat-owner-access-token');
    const response = await fetch(`${apiClient.defaults.baseURL}/campaigns/${campaignId}/stats/stream`, {
      headers: token ? { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' } : { Accept: 'text/event-stream' },
      signal: controller.signal,
    });
    if (!response.ok || !response.body) throw new Error(`통계 구독 요청 실패 (${response.status})`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const read = async () => {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      events.forEach((event) => {
        const data = event.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim();
        if (!data) return;
        try { onMessage(JSON.parse(data)); } catch { onMessage(data); }
      });
      await read();
    };
    read().catch((error) => { if (error.name !== 'AbortError') onError?.(error); });
  } catch (error) {
    onError?.(error);
  }
  return () => controller.abort();
};
