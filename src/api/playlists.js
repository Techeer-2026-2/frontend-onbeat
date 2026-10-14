import apiClient from "./client";

// 사용자 직접 플레이리스트 생성
export const generateCustomPlaylist = async (payload) => {
  const response = await apiClient.post(
    "/playlists",
    payload
  );

  return response.data;
};

// 서버 추천 플레이리스트 생성
export const generateRecommendedPlaylist = async (payload) => {
  const response = await apiClient.post(
    "/playlists/generate",
    payload
  );

  return response.data;
};

// 내 플레이리스트 목록 조회
export const getPlaylists = async () => {
  const response = await apiClient.get("/playlists");
  
  return response.data;
};

// 플레이리스트 상세 조회
export const getPlaylistDetail = async (playlistId, memberId) => {
  const response = await apiClient.get(
    `/playlists/${playlistId}`,
    {
      params: { memberId },
    }
  );

  return response.data;
};