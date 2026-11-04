import React from "react";
import { SkipBack, SkipForward, Play, Pause, Heart } from "lucide-react";
import { useOnBeat } from "../../context/OnBeatContext";
import { secondsToTime } from "../../data/mockSongs";
export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    skip,
    position,
    setPosition,
    favorites,
    toggleFavorite,
  } = useOnBeat();
  if (!currentSong) return null;
  return (
    <div className="music-player">
      <div className="player-info">
        <div className="player-top">
          <div className="player-song-text">
            <strong>{currentSong.title}</strong>
            <span>{currentSong.artist}</span>
          </div>
          <div className="player-controls">
            <button onClick={() => skip(-1)} aria-label="이전 곡">
              <SkipBack size={22} fill="#128ae3" />
            </button>
            <button
              className="player-main-control"
              onClick={togglePlay}
              aria-label={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <Pause size={27} fill="#e3ff5f" />
              ) : (
                <Play size={27} fill="#e3ff5f" />
              )}
            </button>
            <button onClick={() => skip(1)} aria-label="다음 곡">
              <SkipForward size={22} fill="#128ae3" />
            </button>
          </div>
          <button
            className={`player-favorite ${favorites.includes(currentSong.id) ? "liked" : ""}`}
            onClick={() => toggleFavorite(currentSong.id)}
            aria-label="좋아요"
          >
            <Heart
              size={28}
              fill={favorites.includes(currentSong.id) ? "#f767bf" : "#ffbddc"}
            />
          </button>
        </div>
        <div className="player-progress">
          <input
            type="range"
            min="0"
            max={currentSong.duration}
            value={position}
            onChange={(e) => setPosition(+e.target.value)}
            style={{ "--value": `${(position / currentSong.duration) * 100}%` }}
            aria-label="곡 탐색"
          />
          <span>
            {secondsToTime(position)} / {secondsToTime(currentSong.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
