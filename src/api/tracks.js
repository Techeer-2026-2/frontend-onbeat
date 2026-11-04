import apiClient, { memberParams } from './client';
import { withMockFallback } from './mockFallback';
import { mockSongs } from '../mocks';

export const getTrack = async (trackId) => withMockFallback(
  async () => (await apiClient.get(`/music/tracks/${trackId}`)).data,
  () => mockSongs.find((song) => String(song.id) === String(trackId) || String(song.itunesTrackId) === String(trackId)) ?? mockSongs[0],
  (track) => track == null,
);
export const saveTrack = async (trackId, memberId, payload) => (
  await apiClient.put(`/music/tracks/${trackId}`, payload, { params: memberParams(memberId) })
).data;
