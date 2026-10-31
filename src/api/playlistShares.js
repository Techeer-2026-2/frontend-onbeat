import apiClient, { memberParams } from './client';

export const createPlaylistShare = async (playlistId, memberId) => {
  const response = await apiClient.post(`/playlists/${playlistId}/share-links`, undefined, {
    params: memberParams(memberId),
  });
  return response.data;
};

export const revokePlaylistShare = (playlistId, memberId) => apiClient.delete(`/playlists/${playlistId}/share-links`, { params: memberParams(memberId) });

export const getSharedPlaylist = async (shareToken) => (await apiClient.get(`/shared/playlists/${shareToken}`)).data;

export const getActiveSharedListeners = async (shareToken, memberId, location) => (
  await apiClient.get(`/shared/playlists/${shareToken}/active-listeners`, {
    params: { ...memberParams(memberId), ...location },
  })
).data;

export const sendListeningHeartbeat = async (shareToken, memberId, payload) => (
  await apiClient.put(`/shared/playlists/${shareToken}/listening`, payload, { params: memberParams(memberId) })
).data;

export const stopSharedListening = (shareToken, memberId) => apiClient.delete(`/shared/playlists/${shareToken}/listening`, { params: memberParams(memberId) });
