import apiClient, { memberParams } from './client';

export const getTrack = async (trackId) => (await apiClient.get(`/music/tracks/${trackId}`)).data;
export const saveTrack = async (trackId, memberId, payload) => (
  await apiClient.put(`/music/tracks/${trackId}`, payload, { params: memberParams(memberId) })
).data;
