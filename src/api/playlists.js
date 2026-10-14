import apiClient from "./client";

// 사용자 직접 플레이리스트 생성
export const generateCustomPlaylist = async (payload) => {
  const response = await apiClient.post("/playlists", payload);
  return response.data;
};

// 플레이리스트에 곡 추가 (성공 시 204 No Content)
export const addTracksToPlaylist = async (playlistId, memberId, tracks) => {
  const response = await apiClient.post(`/playlists/${playlistId}/tracks`, tracks, {
    params: { memberId },
  });
  return response;
};

// 플레이리스트에서 곡 삭제 (성공 시 204 No Content)
export const deleteTrackFromPlaylist = async (playlistId, trackId, memberId) => {
  return apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`, {
    params: { memberId },
  });
};

// 플레이리스트 삭제 (성공 시 204 No Content)
export const deletePlaylist = async (playlistId, memberId) => {
  return apiClient.delete(`/playlists/${playlistId}`, {
    params: { memberId },
  });
};

// 서버 추천 플레이리스트 생성
// 백엔드 API 구현 후 연동
export const generateRecommendedPlaylist = async (payload) => {
  const response = await apiClient.post("/playlists/generate", payload);
  return response.data;
};

// 내 플레이리스트 목록 조회
export const getPlaylists = async () => {
  const response = await apiClient.get("/playlists");
  return response.data;
};

// 플레이리스트 상세 조회
export const getPlaylistDetail = async (playlistId) => {
  const response = await apiClient.get(`/playlists/${playlistId}`);
  return response.data;
};

