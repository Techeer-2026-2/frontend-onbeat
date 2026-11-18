import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe2, MapPin, Play, Music2 } from "lucide-react";
import XpPanel from "../components/common/XpPanel";
import SongRow from "../components/music/SongRow";
import { useOnBeat } from "../context/OnBeatContext";
import { useGlobalChart, useNearbyChart } from "../hooks/useCharts";
import { useCurrentPosition } from "../hooks/useCurrentPosition";

export default function Charts() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { playSong, playCollection } = useOnBeat();
  const [chart, setChart] = useState(
    pathname.includes("nearby") ? "nearby" : "global",
  );

  const globalChart = useGlobalChart();
  const { position, error: positionError } = useCurrentPosition(
    chart === "nearby",
  );
  const nearbyChart = useNearbyChart(position);

  const current = chart === "global" ? globalChart : nearbyChart;
  const songs = current.data ?? [];
  const isLoading =
    current.isLoading || (chart === "nearby" && !position && !positionError);
  const errorMessage =
    chart === "nearby" && positionError
      ? positionError
      : current.isError
        ? "차트를 불러오지 못했어요."
        : "";

  const config =
    chart === "global"
      ? { label: "전체 TOP 100", icon: Globe2 }
      : { label: "주변 TOP 50", icon: MapPin };
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
              onClick={() => playCollection(songs)}
            >
              <Play size={17} fill="currentColor" /> 전체 재생
            </button>
          </div>
        </div>
        <div className="chart-song-list">
          {isLoading && (
            <div className="empty-state">차트를 불러오는 중...</div>
          )}
          {errorMessage && <div className="empty-state">{errorMessage}</div>}
          {!isLoading && !errorMessage && !songs.length && (
            <div className="empty-state">아직 집계된 차트가 없어요.</div>
          )}
          {songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              rank={song.rank ?? index + 1} // 서버가 준 순위가 있으면 사용
              showDuration
              action="favorite"
              onSongClick={() => playSong(song)}
            />
          ))}
        </div>
      </XpPanel>
    </div>
  );
}
