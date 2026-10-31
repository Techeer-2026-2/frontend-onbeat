import apiClient, { memberParams } from './client';

const unwrap = (response) => response?.data ?? response;

async function postWithFallback(paths, memberId, payload) {
  const configuredPath = import.meta.env.VITE_PLAYBACK_EVENT_PATH?.trim();
  if (!configuredPath) return null;
  let lastError;
  for (const path of [configuredPath, ...paths]) {
    try {
      return unwrap(await apiClient.post(path, payload, { params: memberParams(memberId) }));
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) throw error;
    }
  }
  throw lastError;
}

export const recordPlaybackEvent = async (memberId, payload) => {
  return postWithFallback(['/music/playback', '/playback-events', '/music/playback-events'], memberId, payload);
};

export const recordListeningEvent = async (memberId, payload) => {
  return postWithFallback(['/music/listening', '/listening-events', '/music/listening-events'], memberId, payload);
};
