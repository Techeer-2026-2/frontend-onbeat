import { useState } from "react";
import {
  Search as SearchIcon,
  X,
  Sparkles,
  Music2,
  UserRound,
  ListMusic,
  Clock3,
  Trash2,
  Star,
  ChevronDown,
} from "lucide-react";
import XpPanel from "../components/common/XpPanel"; // 창 모양 패널
import SongRow from "../components/music/SongRow"; // 곡 한 줄
import { useOnBeat } from "../context/OnBeatContext"; // 앱 전체가 공유하는 상태
import AeroSelect from "../components/common/AeroSelect"; // 드롭다운 선택 상자
import { useSearchMusic } from "../hooks/useSearchMusic"; // 검색어를 받아 해당하는 음악 데이터 목록을 가져오는 훅
import { useLoadPlaylistSongs, usePlaylists } from "../hooks/usePlaylists"; // 내 플레이리스트 (서버)

// 4개의 탭 [이름, 아이콘]
const types = [
  ["전체", Sparkles],
  ["곡", Music2],
  ["아티스트", UserRound],
  ["플레이리스트", ListMusic],
];

// Todo: 추천 검색어는 서버에서 받아오기
const recommended = [
  "혼자 듣기 좋은 노래",
  "감성 발라드",
  "출근길 플레이리스트",
  "여름 노래",
];

// 컴포넌트
export default function Search() {
  const { recent, setRecent, addRecent, playCollection, setToast } =
    useOnBeat();
  const { data: playlists = [] } = usePlaylists();
  const loadPlaylistSongs = useLoadPlaylistSongs();
  const playPlaylist = async (playlistId) => {
    try {
      playCollection(await loadPlaylistSongs(playlistId));
    } catch {
      setToast("플레이리스트를 불러오지 못했어요.");
    }
  };
  const [query, setQuery] = useState(""),
    [type, setType] = useState("전체"),
    [resultType, setResultType] = useState("곡"),
    [sort, setSort] = useState("정확도순");
  const search = useSearchMusic(query.trim());
  const apiSongs = search.data ?? [];
  const isLoading = search.isLoading;
  const error = search.isError ? "검색 결과를 불러오지 못했어요." : "";
  const q = query.trim().toLowerCase();
  const matchingSongs = apiSongs; // 검색어가 없으면 빈 배열
  const matchingPlaylists = playlists.filter(
    (p) => !q || `${p.name} ${p.description}`.toLowerCase().includes(q),
  );
  // 검색 결과 곡들의 가수 목록 (중복 제거)
  const artists = [...new Set(apiSongs.map((s) => s.artist))];
  const submit = (e) => {
    e?.preventDefault();
    addRecent(query);
  };
  const pick = (word) => {
    setQuery(word);
    addRecent(word);
  };
  const showSongs = (type === "전체" || type === "곡") && resultType === "곡";

  return (
    <div className="page search-page">
      <form className="search-input-bar glossy-field" onSubmit={submit}>
        <SearchIcon size={26} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="노래, 아티스트, 플레이리스트 검색"
          aria-label="음악 검색"
        />
        {query && (
          <button
            type="button"
            className="clear-query"
            onClick={() => setQuery("")}
            aria-label="검색어 지우기"
          >
            <X size={20} />
          </button>
        )}
        <button type="submit" className="search-submit" aria-label="검색">
          <SearchIcon size={22} />
        </button>
      </form>
      <div className="search-tabs">
        {types.map(([t, Icon]) => (
          <button
            key={t}
            className={type === t ? "active" : ""}
            onClick={() => {
              setType(t);
              setResultType(t === "전체" ? "곡" : t);
            }}
          >
            <Icon size={19} />
            {t}
          </button>
        ))}
      </div>
      <section className="glass-section mini-section">
        <div className="mini-title">
          <strong>
            <Clock3 size={20} /> 최근 검색어
          </strong>
          <button onClick={() => setRecent([])}>
            <Trash2 size={16} /> 전체삭제
          </button>
        </div>
        <div className="chips">
          {recent.length ? (
            recent.map((word) => (
              <button key={word} onClick={() => pick(word)}>
                <SearchIcon size={14} />
                {word}
              </button>
            ))
          ) : (
            <span className="muted">최근 검색어가 없습니다.</span>
          )}
        </div>
      </section>
      <section className="glass-section suggested-section">
        <div className="mini-title">
          <strong>
            <Star size={21} fill="#ffdd49" color="#d18f00" /> 추천 검색어
          </strong>
          <Music2 size={19} />
        </div>
        <div className="chips">
          {recommended.map((word) => (
            <button key={word} onClick={() => pick(word)}>
              <SearchIcon size={14} />
              {word}
            </button>
          ))}
        </div>
      </section>
      <XpPanel
        title={`검색 결과${q ? ` (총 ${matchingSongs.length + matchingPlaylists.length + artists.length}건)` : ""}`}
        icon={Music2}
        action={
          <AeroSelect
            className="aero-select--compact"
            value={sort}
            options={["정확도순", "제목순"]}
            onValueChange={setSort}
            ariaLabel="검색 결과 정렬"
          />
        }
        className="results-panel"
      >
        {type === "전체" && (
          <div className="result-tabs">
            {["곡", "아티스트", "플레이리스트"].map((t) => (
              <button
                key={t}
                className={resultType === t ? "active" : ""}
                onClick={() => setResultType(t)}
              >
                {t === "곡" && <Music2 size={17} />} {t}
              </button>
            ))}
          </div>
        )}
        {showSongs || type === "곡" ? (
          <div className="song-list">
            {isLoading && <div className="empty-state">검색 중...</div>}
            {error && <div className="empty-state">{error}</div>}
            {!isLoading &&
              !error &&
              (sort === "제목순"
                ? [...matchingSongs].sort((a, b) =>
                    a.title.localeCompare(b.title),
                  )
                : matchingSongs
              ).map((song) => <SongRow song={song} key={song.id} />)}
            {!isLoading && !error && !matchingSongs.length && (
              <div className="empty-state">
                {q
                  ? "검색 결과가 없습니다."
                  : "노래나 아티스트를 검색해 보세요."}
              </div>
            )}
          </div>
        ) : null}
        {(type === "아티스트" ||
          (resultType === "아티스트" && type === "전체")) && (
          <div className="artist-list">
            {artists.map((artist) => (
              <button
                key={artist}
                className="artist-row"
                onClick={() => pick(artist)}
              >
                <UserRound size={24} />
                <span>{artist}</span>
                <ChevronDown size={18} />
              </button>
            ))}
            {artists.length === 0 && (
              <div className="empty-state">일치하는 아티스트가 없습니다.</div>
            )}
          </div>
        )}
        {(type === "플레이리스트" ||
          (resultType === "플레이리스트" && type === "전체")) && (
          <div className="song-list">
            {matchingPlaylists.map((p) => (
              <div className="playlist-row" key={p.id}>
                <img src={p.cover} alt="" />
                <div className="playlist-row-text">
                  <strong>{p.name}</strong>
                  <span>{p.trackCount}곡</span>
                </div>
                <button
                  className="round-play"
                  onClick={() => playPlaylist(p.id)}
                  aria-label="재생"
                >
                  ▶
                </button>
              </div>
            ))}
            {!matchingPlaylists.length && (
              <div className="empty-state">
                일치하는 플레이리스트가 없습니다.
              </div>
            )}
          </div>
        )}
      </XpPanel>
    </div>
  );
}
