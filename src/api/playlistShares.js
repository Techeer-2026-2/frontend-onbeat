import apiClient, { memberParams } from './client';

export const createPlaylistShare = async (playlistId, memberId) => {
  const response = await apiClient.post(`/playlists/${playlistId}/share-links`, {}, {
    params: memberParams(memberId),
  });
  return response.data;
};
