import apiClient, { getMemberId } from './client';

export const getAdBanners = async (targetUserId = getMemberId()) => {
  const response = await apiClient.get('/banners/match', { params: { targetUserId } });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.banners)) return data.banners;
  if (data?.data && typeof data.data === 'object') return [data.data];
  return data && typeof data === 'object' ? [data] : [];
};

export const recordAdClick = async (bannerId) => {
  const response = await apiClient.post('/clicks', { notificationId: bannerId });
  return response.data;
};

export const normalizeAdBanner = (banner, index = 0) => ({
  id: banner.campaignId ?? banner.id ?? banner.bannerId ?? `banner-${index}`,
  notificationId: banner.notificationId ?? '',
  title: banner.title ?? banner.name ?? '추천 프로모션',
  subtitle: banner.body ?? banner.subtitle ?? banner.description ?? '',
  image: banner.imageUrl ?? banner.image ?? banner.bannerImageUrl ?? '',
  badge: banner.badge ?? 'SPONSORED',
  label: banner.label ?? 'RELEASE',
  targetUrl: banner.targetUrl ?? banner.linkUrl ?? '',
});
