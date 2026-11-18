import { saveTrack } from "../api/music";
import { createPlaybackSession, recordPlaybackEvent } from "../api/playback";
import { recordCommutePlaybackEvent } from "../api/commute";
import { getLocationOnce } from "./location";

const warn = (label) => (error) =>
  console.warn(`[재생 기록] ${label} 실패`, error);

// 곡 하나의 재생을 서버에 기록한다.
// 1) 곡 정보 등록 → 2) 재생 세션 시작(위치 포함) → 3) 끝날 때 완주/스킵 이벤트
// 기록이 실패해도 음악 재생은 계속되도록 에러는 콘솔 경고로만 남긴다.
export function startPlaybackReport(song, commuteSessionId) {
  if (!song?.itunesTrackId) return null;
  const trackId = String(song.itunesTrackId);

  const sessionPromise = (async () => {
    await saveTrack(trackId, {
      title: song.title,
      artistName: song.artist,
      previewUrl: song.previewUrl,
      externalUrl: null,
    });
    const location = await getLocationOnce(); // 위치를 거부해도 재생 기록은 보냄
    const sessionId = crypto.randomUUID();
    await createPlaybackSession({
      sessionId,
      trackId,
      startedAt: new Date().toISOString(),
      ...(location ? { location } : {}),
    });
    return sessionId;
  })().catch((error) => {
    warn("재생 시작")(error);
    return null;
  });

  const report = {
    finished: false,
    // completed: 미리듣기를 끝까지 들었는지 / playedSeconds: 들은 시간 / duration: 재생 길이
    finish({ completed, playedSeconds, duration }) {
      if (report.finished) return;
      report.finished = true;
      const playedRatio =
        duration > 0 ? Math.min(1, Math.max(0, playedSeconds / duration)) : 0;

      sessionPromise.then((sessionId) => {
        if (!sessionId) return;
        recordPlaybackEvent({
          eventId: crypto.randomUUID(),
          sessionId,
          // 팀 결정(29a06be): 30초 미리듣기를 끝까지 들어도 원곡 완주는 아니므로 SKIPPED로 보낸다
          eventType: "TRACK_SKIPPED",
          playedRatio: completed ? 1 : playedRatio,
          occurredAt: new Date().toISOString(),
        }).catch(warn("재생 종료"));
      });

      // 통근 중이면 통근 기록에도 남긴다
      if (commuteSessionId) {
        recordCommutePlaybackEvent(commuteSessionId, {
          eventId: crypto.randomUUID(),
          itunesTrackId: song.itunesTrackId,
          action: completed ? "PLAY" : "SKIP",
          playedSeconds: Math.round(playedSeconds),
        }).catch(warn("통근 재생"));
      }
    },
  };
  return report;
}
