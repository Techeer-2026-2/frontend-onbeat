import apiClient, { memberParams } from './client';

const unwrap = (response) => response?.data ?? response;

export const startCommuteSession = async (memberId, payload) => {
  const response = await apiClient.post('/commute-sessions/start', payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const updateCommuteSessionProgress = async (sessionId, memberId, payload) => {
  const response = await apiClient.patch(`/commute-sessions/${sessionId}/progress`, payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const completeCommuteSession = async (sessionId, memberId, payload = {}) => {
  const response = await apiClient.post(`/commute-sessions/${sessionId}/complete`, payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};

export const cancelCommuteSession = async (sessionId, memberId, payload = {}) => {
  const response = await apiClient.post(`/commute-sessions/${sessionId}/cancel`, payload, {
    params: memberParams(memberId),
  });
  return unwrap(response);
};
