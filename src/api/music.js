import apiClient from './client';
import { withMockFallback } from './mockFallback';
import { findMockSongs } from '../mocks';

const unwrapMusicResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

// Swagger: GET /api/v1/music/search?term={term}
export const searchMusic = async (term) => {
  const normalizedTerm = String(term ?? '').trim();
  if (!normalizedTerm) return [];

  // An empty search result is meaningful, so only request failures use mocks.
  return withMockFallback(
    async () => unwrapMusicResponse((await apiClient.get('/music/search', { params: { term: normalizedTerm } })).data),
    () => findMockSongs(normalizedTerm),
  );
};

// iTunes 응답을 화면/플레이리스트 요청에서 공통으로 사용할 곡 모델로 변환한다.
export const normalizeMusicTrack = (track, index = 0) => ({
  id: String(track.id ?? track.trackId ?? track.itunesTrackId ?? `music-${index}`),
  itunesTrackId: track.itunesTrackId ?? track.trackId ?? track.id ?? null,
  title: track.title ?? track.trackName ?? '제목 없는 곡',
  artist: track.artist ?? track.artistName ?? '아티스트 정보 없음',
  image: track.image ?? track.artworkUrl ?? track.artworkUrl100 ?? '',
  collectionName: track.collectionName ?? '',
  previewUrl: track.previewUrl ?? '',
  trackTimeMillis: Number(track.trackTimeMillis ?? 0),
  genre: track.genre ?? track.primaryGenreName ?? 'Unknown',
});

