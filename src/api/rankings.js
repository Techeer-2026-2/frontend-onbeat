import apiClient from './client';

export const getMusicRankings = async ({ scope = 'NEARBY', limit = 50, lat, lng } = {}) => {
  const path = scope === 'GLOBAL' ? '/rankings/tracks/global' : '/rankings/tracks/nearby';
  const response = await apiClient.get(path, { params: scope === 'GLOBAL' ? { limit } : { lat, lng, limit } });
  const data = response.data;
  const payload = data?.data ?? data;
  const items = Array.isArray(payload) ? payload : payload?.items ?? payload?.rankings ?? [];
  return { items, locationLabel: payload?.locationLabel ?? '' };
};

export const normalizeRankingTrack = (track, index) => ({
  id: Number(track.rank ?? track.ranking ?? index + 1),
  title: track.track?.title ?? track.title ?? track.trackName ?? track.name ?? '제목 없는 곡',
  artist: track.track?.artistName ?? track.artist ?? track.artistName ?? track.artistNames ?? '아티스트 정보 없음',
  image: track.track?.externalUrl ?? track.track?.artworkUrl ?? track.image ?? track.artworkUrl ?? track.artworkUrl100 ?? track.coverImageUrl ?? '',
  listeners: Number(track.uniqueListenerCount ?? track.listeners ?? track.listenCount ?? track.playCount ?? track.count ?? 0),
} );
