import apiClient, { memberParams } from './client';

const unwrap = (response) => response?.data ?? response;

export const recordPlaybackEvent = async (memberId, payload) => {
  const response = await apiClient.post('/music/playback-events', payload, { params: memberParams(memberId) });
  return unwrap(response);
};

export const recordListeningEvent = async (memberId, payload) => {
  const response = await apiClient.post('/music/listening-events', payload, { params: memberParams(memberId) });
  return unwrap(response);
};
