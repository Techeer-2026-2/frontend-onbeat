import client from "./client";

// ── 통근 프로필 (출발지·도착지·교통수단) ──
export const getCommuteProfiles = () =>
  client.get("/commute-profiles");

// body: { commuteType, transportMode, frequentRouteName?, departure, arrival }
export const createCommuteProfile = (body) =>
  client.post("/commute-profiles", body);

export const updateCommuteProfile = (profileId, body) =>
  client.patch(`/commute-profiles/${profileId}`, body);

// ── 장소 검색 · 소요시간 ──
export const searchPlaces = (keyword) =>
  client.get("/places/search", { params: { keyword } });

// body: { startLatitude, startLongitude, endLatitude, endLongitude, transportMode }
export const estimateRoute = (body) => client.post("/routes/estimate", body);

// ── 통근 세션 (지금 통근 중인지) ──
export const getActiveCommuteSession = () =>
  client.get("/commute-sessions/active");

// body: { commuteProfileId, playlistId? }
export const startCommuteSession = (body) =>
  client.post("/commute-sessions", body);

export const completeCommuteSession = (sessionId) =>
  client.post(`/commute-sessions/${sessionId}/complete`);

export const cancelCommuteSession = (sessionId) =>
  client.post(`/commute-sessions/${sessionId}/cancel`);

// 통근 중 재생 기록: { eventId, itunesTrackId, action: PLAY|SKIP|REPEAT, playedSeconds }
export const recordCommutePlaybackEvent = (sessionId, body) =>
  client.post(`/commute-sessions/${sessionId}/playback-events`, body);
