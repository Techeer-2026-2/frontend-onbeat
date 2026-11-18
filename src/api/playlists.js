import client from "./client";
import { memberParams } from "./member";

// 내 플레이리스트 목록
export const getPlaylists = () =>
  client.get("/playlists", { params: memberParams() });

// 플레이리스트 상세 (곡 목록 포함)
export const getPlaylist = (playlistId) =>
  client.get(`/playlists/${playlistId}`, { params: memberParams() });

// 플레이리스트 생성 (서버는 이름만 받음)
export const createPlaylist = (name) =>
  client.post("/playlists", { name }, { params: memberParams() });

// 플레이리스트 정보 수정: { name?, description?, isPublic? }
export const updatePlaylist = (playlistId, body) =>
  client.patch(`/playlists/${playlistId}`, body, { params: memberParams() });

// 플레이리스트 삭제
export const deletePlaylist = (playlistId) =>
  client.delete(`/playlists/${playlistId}`, { params: memberParams() });

// 곡 여러 개 추가: tracks = PlaylistTrackAddRequest 배열
export const addPlaylistTracks = (playlistId, tracks) =>
  client.post(`/playlists/${playlistId}/tracks`, tracks, {
    params: memberParams(),
  });

// 곡 하나 삭제: playlistTrackId = 플레이리스트 안에서의 곡 번호
export const deletePlaylistTrack = (playlistId, playlistTrackId) =>
  client.delete(`/playlists/${playlistId}/tracks/${playlistTrackId}`, {
    params: memberParams(),
  });

// 날씨·시간대 기반 통근 플레이리스트 자동 생성
// body: { commuteProfileId, name?, size?, latitude?, longitude? }
export const generatePlaylist = (body) =>
  client.post("/playlists/generate", body, { params: memberParams() });
