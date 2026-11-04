import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe2, MapPin, Play, Music2 } from "lucide-react";
import XpPanel from "../components/common/XpPanel";
import SongRow from "../components/music/SongRow";
import { chartTop100, chartNearby50 } from "../data/mockSongs";
import { useOnBeat } from "../context/OnBeatContext";

export default function Charts() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { getSong, playSong, playCollection } = useOnBeat();
  const [chart, setChart] = useState(
    pathname.includes("nearby") ? "nearby" : "global",
  );
  const config =
    chart === "global"
      ? { label: "전체 TOP 100", icon: Globe2, ids: chartTop100 }
      : { label: "주변 TOP 50", icon: MapPin, ids: chartNearby50 };
  const songs = config.ids.map(getSong).filter(Boolean);
  const Icon = config.icon;
  return (
    <div className="page chart-page">
      <XpPanel
        title="인기 음악 차트"
        icon={Music2}
        action={
          <button
            className="back-pill"
            onClick={() => nav(-1)}
            aria-label="뒤로가기"
          >
            <ArrowLeft size={19} />
          </button>
        }
        className="chart-panel"
      >
        <div className="chart-toolbar">
          <div className="large-tabs">
            <button
              className={chart === "global" ? "active" : ""}
              onClick={() => setChart("global")}
            >
              <Globe2 size={18} /> 전체 TOP 100
            </button>
            <button
              className={chart === "nearby" ? "active" : ""}
              onClick={() => setChart("nearby")}
            >
              <MapPin size={18} /> 주변 TOP 50
            </button>
          </div>
          <div className="chart-summary">
            <span>
              <Icon size={17} /> {config.label} · 총 {songs.length}곡
            </span>
            <button
              className="chart-play-all"
              onClick={() => playCollection(config.ids)}
            >
              <Play size={17} fill="currentColor" /> 전체 재생
            </button>
          </div>
        </div>
        <div className="chart-song-list">
          {songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              rank={index + 1}
              showDuration
              action="favorite"
              onSongClick={() => playSong(song.id)}
            />
          ))}
        </div>
      </XpPanel>
    </div>
  );
}
