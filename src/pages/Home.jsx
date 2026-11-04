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
import {
  topGlobal,
  topNearby,
  durationLabel,
  totalTime,
} from "../data/mockSongs";
function TopList({ ids }) {
  const { getSong, playSong } = useOnBeat();
  return (
    <div className="top-list">
      {(Array.isArray(ids) ? ids : []).map((id, index) => {
        const song = getSong(id);
        if (!song) return null;
        return (
          <div className="top-row" key={id}>
            <b>{index + 1}</b>
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
          <TopList ids={topGlobal} />
        </XpPanel>
        <XpPanel title="주변 인기곡 TOP 50" icon={MapPin}>
          <TopList ids={topNearby} />
        </XpPanel>
      </div>
      <MusicPlayer />
    </div>
  );
}
