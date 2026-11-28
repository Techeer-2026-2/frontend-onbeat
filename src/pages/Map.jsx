import { useState } from "react";
import {
  MapPin,
  TrainFront,
  Map as MapIcon,
  Clock3,
  Plus,
  Minus,
  LocateFixed,
  Check,
} from "lucide-react";
import XpPanel from "../components/common/XpPanel";
import GlassButton from "../components/common/GlassButton";
import RouteManager from "../components/commute/RouteManager";
import { useOnBeat } from "../context/OnBeatContext";
import {
  useActiveCommuteSession,
  useCancelCommute,
  useCompleteCommute,
  useMainCommuteProfile,
  useStartCommute,
} from "../hooks/useCommute";
import { usePlaylists } from "../hooks/usePlaylists";
import { useNow } from "../hooks/useNow";
import { durationLabel } from "../utils/time";

const timeLabel = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// 진행 중인 통근의 진행률(%)과 남은 시간(분)
function commuteProgress(session, now) {
  const start = Date.parse(session.startedAt);
  const end = session.expectedArrivalAt
    ? Date.parse(session.expectedArrivalAt)
    : start + (session.expectedDurationMinutes ?? 0) * 60000;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return { progress: 0, remaining: null };
  return {
    progress: Math.min(
      100,
      Math.max(0, Math.round(((now - start) / (end - start)) * 100)),
    ),
    remaining: Math.max(0, Math.ceil((end - now) / 60000)),
  };
}

export default function Map() {
  const { setModal, setToast } = useOnBeat();
  const [zoom, setZoom] = useState(1);
  const now = useNow();
  const { profile, isLoading: profileLoading } = useMainCommuteProfile();
  const sessionQuery = useActiveCommuteSession();
  const session = sessionQuery.data ?? null;
  const { data: playlists = [] } = usePlaylists();
  const commutePlaylist = playlists
    .filter((p) => p.isCommute)
    .reduce((latest, p) => (!latest || p.id > latest.id ? p : latest), null);
  const startCommute = useStartCommute(),
    completeCommute = useCompleteCommute(),
    cancelCommute = useCancelCommute();
  const busy =
    startCommute.isPending ||
    completeCommute.isPending ||
    cancelCommute.isPending;
  const { progress, remaining } = session
    ? commuteProgress(session, now)
    : { progress: 0, remaining: null };
  const routeName = profile
    ? `${profile.departure?.placeName ?? "출발지"} → ${profile.arrival?.placeName ?? "도착지"}`
    : "등록된 통근 경로 없음";

  const openManager = () =>
    setModal({
      title: "내 통근 경로 관리",
      content: (
        <RouteManager profile={profile} onClose={() => setModal(null)} />
      ),
    });
  const start = () => {
    if (!profile) {
      openManager();
      return;
    }
    startCommute.mutate(
      { commuteProfileId: profile.id, playlistId: commutePlaylist?.id },
      {
        onSuccess: () =>
          setToast("통근을 시작했어요. 듣는 음악이 통근 기록에 남아요."),
        onError: (error) =>
          setToast(error?.message || "통근을 시작하지 못했어요."),
      },
    );
  };
  const complete = () =>
    completeCommute.mutate(session.id, {
      onSuccess: (summary) =>
        setToast(
          `통근 완료! ${summary?.playedTrackCount ?? 0}곡 · ${durationLabel(summary?.totalPlayedSeconds ?? 0)} 들었어요.`,
        ),
      onError: (error) => setToast(error?.message || "통근을 끝내지 못했어요."),
    });
  const cancel = () =>
    cancelCommute.mutate(session.id, {
      onSuccess: () => setToast("통근을 취소했어요."),
      onError: (error) =>
        setToast(error?.message || "통근을 취소하지 못했어요."),
    });

  return (
    <div className="page map-page">
      <XpPanel
        title="나의 통근 지도 ♫"
        icon={MapPin}
        className="map-main-panel"
      >
        <div className="map-canvas">
          <div
            className="map-image"
            style={{ transform: `scale(${zoom})` }}
            role="img"
            aria-label={`${routeName} 통근 경로를 표시한 지도`}
          ></div>
          <div className="map-zoom">
            <button
              onClick={() =>
                setZoom((z) => Math.min(1.65, +(z + 0.15).toFixed(2)))
              }
              aria-label="지도 확대"
            >
              <Plus size={23} />
            </button>
            <button
              onClick={() =>
                setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))
              }
              aria-label="지도 축소"
            >
              <Minus size={23} />
            </button>
            <button onClick={() => setZoom(1)} aria-label="지도 초기화">
              <LocateFixed size={23} />
            </button>
          </div>
        </div>
      </XpPanel>
      <XpPanel
        title="내 통근 경로"
        icon={TrainFront}
        className="saved-route-panel"
      >
        <div className="saved-route-content">
          <img src="/assets/albums/subway.webp" alt="지하철 노선" />
          <div>
            <h3>{profileLoading ? "불러오는 중..." : routeName}</h3>
            {profile ? (
              <>
                <p>
                  <TrainFront size={19} /> {profile.transport} · 예상 소요시간{" "}
                  {profile.averageMinutes ?? "-"}분
                </p>
                <span className="route-saved">
                  <Check size={18} /> 경로 저장 완료
                </span>
              </>
            ) : (
              !profileLoading && <p>출발지와 도착지를 등록해 주세요.</p>
            )}
          </div>
          <GlassButton onClick={openManager} className="route-manage-btn">
            <MapIcon size={19} /> {profile ? "경로 관리" : "경로 등록"}
          </GlassButton>
        </div>
      </XpPanel>
      <XpPanel
        title="현재 통근 상태 ♫"
        icon={TrainFront}
        className="status-panel"
      >
        {session ? (
          <>
            <div className="status-main">
              <img
                src="/assets/albums/subway-front.webp"
                alt="진행 중인 지하철"
              />
              <div className="status-copy">
                <h3>
                  <i className="live-dot" /> 현재 통근 중
                </h3>
                <strong>{routeName}</strong>
                <p>
                  <MapPin size={17} /> 출발: {timeLabel(session.startedAt)} ·
                  도착 예정: {timeLabel(session.expectedArrivalAt)}
                </p>
                <p>
                  <Clock3 size={17} /> 남은 시간: 약 {remaining ?? "-"}분
                </p>
              </div>
              <div className="progress-box">
                <span>진행률</span>
                <strong>{progress}%</strong>
              </div>
            </div>
            <div className="progress-track big-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="commute-session-actions">
              <GlassButton onClick={complete} disabled={busy} variant="green">
                ✓ 통근 완료
              </GlassButton>
              <GlassButton onClick={cancel} disabled={busy}>
                통근 취소
              </GlassButton>
            </div>
          </>
        ) : (
          <>
            <div className="status-main">
              <img src="/assets/albums/subway-front.webp" alt="지하철" />
              <div className="status-copy">
                <h3>
                  {sessionQuery.isLoading
                    ? "불러오는 중..."
                    : sessionQuery.isError
                      ? "통근 상태를 불러오지 못했어요"
                      : "지금은 통근 중이 아니에요"}
                </h3>
                <strong>{routeName}</strong>
                <p>
                  <Clock3 size={17} /> 통근을 시작하면 듣는 음악이 통근 기록에
                  남아요.
                </p>
              </div>
            </div>
            <div className="commute-session-actions">
              <GlassButton
                onClick={start}
                disabled={busy || sessionQuery.isLoading}
                variant="green"
              >
                ▶ 통근 시작
              </GlassButton>
            </div>
          </>
        )}
      </XpPanel>
    </div>
  );
}
