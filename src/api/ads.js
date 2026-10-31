import apiClient from './client';

export const getAdBanners = async () => {
  const path = import.meta.env.VITE_AD_BANNERS_PATH?.trim();
  if (!path) return [];
  const response = await apiClient.get(path);
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.banners)) return data.banners;
  return [];
};

export const recordAdClick = async (bannerId) => {
  const response = await apiClient.post('/clicks', { notificationId: bannerId });
  return response.data;
};

export const normalizeAdBanner = (banner, index = 0) => ({
  id: banner.id ?? banner.bannerId ?? `banner-${index}`,
  title: banner.title ?? banner.name ?? '추천 프로모션',
  subtitle: banner.subtitle ?? banner.description ?? '',
  image: banner.imageUrl ?? banner.image ?? banner.bannerImageUrl ?? '',
  badge: banner.badge ?? 'SPONSORED',
  label: banner.label ?? 'RELEASE',
  targetUrl: banner.targetUrl ?? banner.linkUrl ?? '',
});
