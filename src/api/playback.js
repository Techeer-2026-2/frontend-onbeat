import apiClient, { memberParams } from './client';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const createPlaybackSession = async (memberId, payload) => {
  const response = await apiClient.post('/playback/sessions', payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const recordPlaybackEvent = async (memberId, payload) => {
  const response = await apiClient.post('/playback/events', payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};
