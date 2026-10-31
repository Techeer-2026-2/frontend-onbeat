import apiClient, { memberParams } from "./client";

// 사용자 직접 플레이리스트 생성 (memberId는 필수 query 파라미터)
export const generateCustomPlaylist = async (memberId, payload) => {
  const response = await apiClient.post("/playlists", payload, {
    params: memberParams(memberId),
  });
  return response.data;
};

// 플레이리스트 정보 수정
export const updatePlaylist = async (playlistId, memberId, payload) => {
  const response = await apiClient.patch(`/playlists/${playlistId}`, payload, {
    params: memberParams(memberId),
  });
  return response.data;
};

// 플레이리스트에 곡 추가 (성공 시 204 No Content)
export const addTracksToPlaylist = async (playlistId, memberId, tracks) => {
  const response = await apiClient.post(`/playlists/${playlistId}/tracks`, tracks, {
    params: memberParams(memberId),
  });
  return response;
};

// 플레이리스트에서 곡 삭제 (성공 시 204 No Content)
export const deleteTrackFromPlaylist = async (playlistId, trackId, memberId) => {
  return apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`, {
    params: memberParams(memberId),
  });
};

export const updatePlaylistTrackOrder = async (playlistId, memberId, trackIds) => {
  const response = await apiClient.put(`/playlists/${playlistId}/tracks/order`, { playlistTrackIds: trackIds }, {
    params: memberParams(memberId),
  });
  return response.data;
};

// 플레이리스트 삭제 (성공 시 204 No Content)
export const deletePlaylist = async (playlistId, memberId) => {
  return apiClient.delete(`/playlists/${playlistId}`, {
    params: memberParams(memberId),
  });
};

// 서버 추천 플레이리스트 생성: 통근 프로필 연동(Issue 후속) 시 payload 구성 확인 필요
export const generateRecommendedPlaylist = async (memberId, payload) => {
  const response = await apiClient.post("/playlists/generate", payload, {
    params: memberParams(memberId),
  });
  return response.data;
};

// 내 플레이리스트 목록 조회
export const getPlaylists = async (memberId) => {
  const response = await apiClient.get("/playlists", {
    params: memberParams(memberId),
  });
  return response.data;
};

// 플레이리스트 상세 조회
export const getPlaylistDetail = async (playlistId, memberId) => {
  const response = await apiClient.get(`/playlists/${playlistId}`, {
    params: memberParams(memberId),
  });
  return response.data;
};
