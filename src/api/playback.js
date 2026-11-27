import client from "./client";

// 재생 시작 기록 (랭킹 집계용)
// body: { sessionId(uuid), trackId, startedAt, location? }
export const createPlaybackSession = (body) =>
  client.post("/playback/sessions", body);

// 재생 종료 기록 (완주 / 스킵)
// body: { eventId(uuid), sessionId, eventType, playedRatio, occurredAt }
export const recordPlaybackEvent = (body) =>
  client.post("/playback/events", body);

// 사용자의 최신 위치 저장
// location: { lat, lng, accuracyMeters, recordedAt }
export const saveLocation = (location) =>
  client.post("/locations", { location });
