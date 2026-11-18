import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  TrainFront,
  Music2,
  Globe2,
  MapPin,
  Play,
  Plus,
} from "lucide-react";
import XpPanel from "../components/common/XpPanel";
import { useOnBeat } from "../context/OnBeatContext";
import { useGlobalChart, useNearbyChart } from "../hooks/useCharts";
import { useCurrentPosition } from "../hooks/useCurrentPosition";
import { useLoadPlaylistSongs, usePlaylists } from "../hooks/usePlaylists";
import { useMainCommuteProfile } from "../hooks/useCommute";
import { saveLocation } from "../api/playback";
import { durationLabel } from "../utils/time";

const HOME_TOP_COUNT = 3; // 홈 미리보기에 보여줄 곡 수

// songs: 곡 객체 배열 / errorMessage: 보여줄 에러 문장 (없으면 "")
function TopList({ songs, isLoading = false, errorMessage = "" }) {
  const { playSong } = useOnBeat();
  if (isLoading) return <div className="empty-state">불러오는 중...</div>;
  if (errorMessage) return <div className="empty-state">{errorMessage}</div>;
  if (!songs.length) {
    return <div className="empty-state">아직 집계된 차트가 없어요.</div>;
  }
  return (
    <div className="top-list">
      {songs.map((song, index) => {
        return (
          <div className="top-row" key={song.id}>
            <b>{song.rank ?? index + 1}</b>
            <img src={song.cover} alt="" />
            <div className="top-song">
              <strong>{song.title}</strong>
              <span>{song.artist}</span>
            </div>
            <button
              className="round-play"
              aria-label={`${song.title} 재생`}
              onClick={() => playSong(song)}
            >
              <Play size={19} fill="#087fdd" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
export default function Home() {
  const nav = useNavigate(),
    { playCollection, setToast } = useOnBeat();

  // 오늘의 출근길: 가장 최근에 만든 통근 플레이리스트 + 대표 통근 프로필
  const { data: playlists = [] } = usePlaylists();
  const commutePlaylist = playlists
    .filter((p) => p.isCommute)
    .reduce((latest, p) => (!latest || p.id > latest.id ? p : latest), null);
  const { profile } = useMainCommuteProfile();
  const loadPlaylistSongs = useLoadPlaylistSongs();
  const playCommute = async () => {
    if (!commutePlaylist) {
      nav("/playlist/commute/create");
      return;
    }
    try {
      playCollection(await loadPlaylistSongs(commutePlaylist.id));
    } catch {
      setToast("플레이리스트를 불러오지 못했어요.");
    }
  };

  // 전체 인기곡: API (차트 화면과 같은 훅이라 캐시도 공유)
  const globalChart = useGlobalChart();
  const globalTop = (globalChart.data ?? []).slice(0, HOME_TOP_COUNT);

  // 주변 인기곡: 홈에 들어오면 바로 위치를 받아서 API 요청
  const { position, error: positionError } = useCurrentPosition(true);
  const nearbyChart = useNearbyChart(position);
  const nearbyTop = (nearbyChart.data ?? []).slice(0, HOME_TOP_COUNT);
  const nearbyLoading = nearbyChart.isLoading || (!position && !positionError); // 위치를 기다리는 동안도 로딩
  const nearbyError =
    positionError ?? (nearbyChart.isError ? "차트를 불러오지 못했어요." : "");

  // 위치를 받으면 서버에 최신 위치로 저장 (주변 랭킹·청취 인원 계산용)
  useEffect(() => {
    if (position) saveLocation(position).catch(() => {});
  }, [position]);

  return (
    <div className="page home-page">
      <button
        className="home-search glossy-field"
        onClick={() => nav("/search")}
      >
        <Search size={26} />
        <span>노래, 아티스트, 플레이리스트 검색</span>
        <b className="search-submit">
          <ArrowRight size={23} />
        </b>
      </button>
      <XpPanel
        title="오늘의 출근길 ♫"
        icon={TrainFront}
        className="commute-home-panel"
      >
        <div className="hero-playlist-card">
          <img
            src="/assets/albums/headphones-meadow.webp"
            alt="푸른 하늘과 헤드폰"
          />
          <div className="hero-playlist-info">
            <h2>{commutePlaylist?.name ?? "출근 맞춤 플레이리스트"}</h2>
            <p>
              {profile
                ? `${profile.transport} · 예상 소요시간 ${profile.averageMinutes ?? "-"}분`
                : "통근 경로를 등록해 주세요"}
            </p>
            <div className="divider-light" />
            <span>
              <Music2 size={19} />{" "}
              {commutePlaylist
                ? `${commutePlaylist.trackCount}곡 · ${durationLabel(commutePlaylist.totalDurationSec)}`
                : "아직 통근 플레이리스트가 없어요"}
            </span>
            <div className="equalizer">
              {[9, 15, 29, 20, 37, 23, 13, 33, 17, 30, 42, 18].map((n, i) => (
                <i key={i} style={{ height: n }} />
              ))}
            </div>
          </div>
          <button
            className="big-play"
            onClick={playCommute}
            aria-label={
              commutePlaylist
                ? "출근길 플레이리스트 재생"
                : "통근 플레이리스트 만들기"
            }
          >
            {commutePlaylist ? (
              <Play size={38} strokeWidth={1.9} fill="#a7ed14" />
            ) : (
              <Plus size={38} strokeWidth={2.4} />
            )}
          </button>
        </div>
      </XpPanel>
      <div className="top-panels">
        <XpPanel title="전체 인기곡 TOP 100" icon={Globe2}>
          <TopList
            songs={globalTop}
            isLoading={globalChart.isLoading}
            errorMessage={
              globalChart.isError ? "차트를 불러오지 못했어요." : ""
            }
          />
        </XpPanel>
        <XpPanel title="주변 인기곡 TOP 50" icon={MapPin}>
          <TopList
            songs={nearbyTop}
            isLoading={nearbyLoading}
            errorMessage={nearbyError}
          />
        </XpPanel>
      </div>
    </div>
  );
}
