import { MoreVertical, Play } from "lucide-react";
import { useOnBeat } from "../../context/OnBeatContext";
import {
  useLoadPlaylistSongs,
  usePlaylistDetail,
} from "../../hooks/usePlaylists";
import { durationLabel } from "../../utils/time";

// 정보 창 안의 곡 목록 (열 때 상세 API로 곡을 불러옴)
function PlaylistSongs({ playlist }) {
  const { data, isLoading, isError } = usePlaylistDetail(playlist.id);
  return (
    <>
      <p>{playlist.description}</p>
      <p>
        {playlist.trackCount}곡 · {durationLabel(playlist.totalDurationSec)}
      </p>
      {isLoading && <p className="empty-state">곡 목록을 불러오는 중...</p>}
      {isError && <p className="empty-state">곡 목록을 불러오지 못했어요.</p>}
      {data && (
        <ul className="modal-song-list">
          {data.songs.map((song) => (
            <li key={song.playlistTrackId}>
              {song.title} — {song.artist}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PlaylistRow({
  playlist,
  selectionMode = false,
  selected = false,
  onSelectionChange,
}) {
  const { playCollection, setModal, setToast } = useOnBeat();
  const loadSongs = useLoadPlaylistSongs();
  const play = async () => {
    try {
      const songs = await loadSongs(playlist.id);
      if (!songs.length) {
        setToast("플레이리스트에 곡이 없어요.");
        return;
      }
      playCollection(songs);
    } catch {
      setToast("플레이리스트를 불러오지 못했어요.");
    }
  };
  return (
    <div className={`playlist-row ${selectionMode ? "is-selecting" : ""}`}>
      {selectionMode && (
        <label className="playlist-selection-check">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectionChange?.(event.target.checked)}
            aria-label={`${playlist?.name || "플레이리스트"} 선택`}
          />
          <span aria-hidden="true">✓</span>
        </label>
      )}
      <img src={playlist?.cover} alt="플레이리스트 커버" />
      <div className="playlist-row-text">
        <strong>{playlist?.name}</strong>
        <span>
          {playlist.trackCount}곡 · {durationLabel(playlist.totalDurationSec)}
        </span>
      </div>
      <button
        className="round-play"
        onClick={play}
        aria-label={`${playlist?.name || "플레이리스트"} 재생`}
      >
        <Play size={19} fill="#0575e2" />
      </button>
      <button
        className="icon-only"
        onClick={() =>
          setModal({
            title: playlist?.name,
            content: <PlaylistSongs playlist={playlist} />,
          })
        }
        aria-label="플레이리스트 정보"
      >
        <MoreVertical size={22} />
      </button>
    </div>
  );
}
