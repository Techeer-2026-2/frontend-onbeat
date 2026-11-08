import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  TrainFront,
  Music2,
  Globe2,
  MapPin,
  Play,
  AudioLines,
} from "lucide-react";
import XpPanel from "../components/common/XpPanel";
import MusicPlayer from "../components/player/MusicPlayer";
import { useOnBeat } from "../context/OnBeatContext";
import { useGlobalChart, useNearbyChart } from "../hooks/useCharts";
import { useCurrentPosition } from "../hooks/useCurrentPosition";
import { durationLabel, totalTime } from "../data/mockSongs";

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
        const id = song.id;
        return (
          <div className="top-row" key={id}>
            <b>{song.rank ?? index + 1}</b>
            <img src={song.cover} alt="" />
            <div className="top-song">
              <strong>{song.title}</strong>
              <span>{song.artist}</span>
            </div>
            <button
              className="round-play"
              aria-label={`${song.title} 재생`}
              onClick={() => playSong(id)}
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
    { playlists, getSong, playSong } = useOnBeat();
  const commutePlaylist = (Array.isArray(playlists) ? playlists : []).find(
    (p) => p?.isCommute,
  );
  const songs = (
    Array.isArray(commutePlaylist?.songIds) ? commutePlaylist.songIds : []
  )
    .map(getSong)
    .filter(Boolean);

  // 전체 인기곡: API (차트 화면과 같은 훅이라 캐시도 공유)
  const globalChart = useGlobalChart();
  const globalTop = (globalChart.data ?? []).slice(0, HOME_TOP_COUNT);

  // 주변 인기곡: 홈에 들어오면 바로 위치를 받아서 API 요청
  const { position, error: positionError } = useCurrentPosition(true);
  const nearbyChart = useNearbyChart(position);
  const nearbyTop = (nearbyChart.data ?? []).slice(0, HOME_TOP_COUNT);
  const nearbyLoading =
    nearbyChart.isLoading || (!position && !positionError); // 위치를 기다리는 동안도 로딩
  const nearbyError =
    positionError ?? (nearbyChart.isError ? "차트를 불러오지 못했어요." : "");

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
            <h2>출근 맞춤 플레이리스트</h2>
            <p>지하철 · 예상 소요시간 51분</p>
            <div className="divider-light" />
            <span>
              <Music2 size={19} /> {songs.length || 12}곡 ·{" "}
              {songs.length ? durationLabel(totalTime(songs)) : "44분"}
            </span>
            <div className="equalizer">
              {[9, 15, 29, 20, 37, 23, 13, 33, 17, 30, 42, 18].map((n, i) => (
                <i key={i} style={{ height: n }} />
              ))}
            </div>
          </div>
          <button
            className="big-play"
            onClick={() => playSong(songs[0]?.id || "seven")}
            aria-label="출근길 플레이리스트 재생"
          >
            <Play size={38} strokeWidth={1.9} fill="#a7ed14" />
          </button>
        </div>
      </XpPanel>
      <div className="top-panels">
        <XpPanel title="전체 인기곡 TOP 100" icon={Globe2}>
          <TopList
            songs={globalTop}
            isLoading={globalChart.isLoading}
            errorMessage={globalChart.isError ? "차트를 불러오지 못했어요." : ""}
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
      <MusicPlayer />
    </div>
  );
}
