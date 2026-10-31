import apiClient, { memberParams } from './client';

const unwrap = (response) => response?.data ?? response;

export const startCommuteSession = async (memberId, payload) => {
  const response = await apiClient.post('/commute-sessions', payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const getActiveCommuteSession = async (memberId) => {
  const response = await apiClient.get('/commute-sessions/active', { params: memberParams(memberId) });
  return unwrap(response);
};

export const getCommuteSessionSummary = async (sessionId, memberId) => {
  const response = await apiClient.get(`/commute-sessions/${sessionId}/summary`, { params: memberParams(memberId) });
  return unwrap(response);
};

export const recordCommutePlaybackEvent = async (sessionId, memberId, payload) => {
  const response = await apiClient.post(`/commute-sessions/${sessionId}/playback-events`, payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const completeCommuteSession = async (sessionId, memberId) => {
  const response = await apiClient.post(`/commute-sessions/${sessionId}/complete`, undefined, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const cancelCommuteSession = async (sessionId, memberId) => {
  const response = await apiClient.post(`/commute-sessions/${sessionId}/cancel`, undefined, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};
