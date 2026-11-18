import { SkipBack, SkipForward, Play, Pause, Heart } from "lucide-react";
import { useOnBeat } from "../../context/OnBeatContext";
import { secondsToTime } from "../../utils/time";

// 하단 내비게이션 위에 항상 떠 있는 플레이어 바
// 고른 곡이 없으면 안내 문구와 함께 버튼을 비활성화해서 보여준다
export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    skip,
    position,
    duration,
    seek,
    isFavorite,
    toggleFavorite,
  } = useOnBeat();
  const empty = !currentSong;
  const liked = !empty && isFavorite(currentSong.id);
  return (
    <div className={`music-player ${empty ? "is-empty" : ""}`}>
      <div className="player-info">
        <div className="player-top">
          <div className="player-song-text">
            <strong>{empty ? "재생 중인 곡이 없어요" : currentSong.title}</strong>
            <span>{empty ? "듣고 싶은 곡을 골라 보세요" : currentSong.artist}</span>
          </div>
          <div className="player-controls">
            <button onClick={() => skip(-1)} aria-label="이전 곡" disabled={empty}>
              <SkipBack size={22} fill="#128ae3" />
            </button>
            <button
              className="player-main-control"
              onClick={togglePlay}
              aria-label={isPlaying ? "일시정지" : "재생"}
              disabled={empty}
            >
              {isPlaying ? (
                <Pause size={27} fill="#e3ff5f" />
              ) : (
                <Play size={27} fill="#e3ff5f" />
              )}
            </button>
            <button onClick={() => skip(1)} aria-label="다음 곡" disabled={empty}>
              <SkipForward size={22} fill="#128ae3" />
            </button>
          </div>
          <button
            className={`player-favorite ${liked ? "liked" : ""}`}
            onClick={() => toggleFavorite(currentSong)}
            aria-label="좋아요"
            disabled={empty}
          >
            <Heart size={28} fill={liked ? "#f767bf" : "#ffbddc"} />
          </button>
        </div>
        <div className="player-progress">
          <input
            type="range"
            min="0"
            max={duration || 1}
            value={Math.min(position, duration || 0)}
            onChange={(e) => seek(+e.target.value)}
            style={{
              "--value": `${duration ? (position / duration) * 100 : 0}%`,
            }}
            aria-label="곡 탐색"
            disabled={empty}
          />
          <span>
            {secondsToTime(empty ? 0 : position)} / {secondsToTime(empty ? 0 : duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
