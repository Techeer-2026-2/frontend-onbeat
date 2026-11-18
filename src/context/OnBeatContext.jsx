import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useActiveCommuteSession } from "../hooks/useCommute";
import { startPlaybackReport } from "../utils/playbackReporter";
import { playableSeconds } from "../utils/time";

// 앱 전체가 공유하는 상태: 플레이어, 좋아요, 최근 검색어, 토스트, 모달
// (플레이리스트·통근 정보는 서버 데이터라 react-query 훅에서 가져온다)
const OnBeatContext = createContext(null);

const read = (key, fallback) => {
  try {
    const val = localStorage.getItem("onbeat-" + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};
// 예전 목 데이터 시절에는 좋아요를 id(문자열)로 저장했어서, 곡 객체만 남긴다
const readFavorites = () =>
  read("favorites", []).filter(
    (item) => item && typeof item === "object" && item.id,
  );

export function OnBeatProvider({ children }) {
  const [favorites, setFavorites] = useState(readFavorites);
  const [recent, setRecent] = useState(() => read("recent", []));
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);

  // ── 플레이어 상태 ──
  // 마지막으로 듣던 곡을 기억해 두었다가, 새로고침해도 플레이어 바에 띄운다 (자동재생은 안 함)
  const [lastSong] = useState(() => {
    const song = read("last-song", null);
    return song && typeof song === "object" && song.id ? song : null;
  });
  // 재생하려고 넘겨받은 곡들 (id → 곡)
  const [songsById, setSongsById] = useState(() =>
    lastSong ? { [lastSong.id]: lastSong } : {},
  );
  const [currentId, setCurrentId] = useState(lastSong?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [playQueue, setPlayQueue] = useState([]);
  // 대기열에서 지금 몇 번째 곡인지 (같은 곡이 두 번 들어 있어도 구분하려고 id 대신 순서로 기억)
  const [queueIndex, setQueueIndex] = useState(0);
  // 실제 소리를 내는 오디오 (앱에 하나). 화면에 그리는 값이 아니라서 ref에 둔다
  const audioRef = useRef(null);
  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  };

  const getSong = (id) =>
    songsById[id] ?? favorites.find((song) => song.id === id);
  const currentSong = currentId ? (getSong(currentId) ?? null) : null;

  // 통근 중이면 재생 기록을 통근 세션에도 남긴다
  const commuteSessionId = useActiveCommuteSession().data?.id ?? null;
  const commuteSessionIdRef = useRef(null);
  useEffect(() => {
    commuteSessionIdRef.current = commuteSessionId;
  }, [commuteSessionId]);

  useEffect(() => {
    localStorage.setItem("onbeat-favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("onbeat-recent", JSON.stringify(recent));
  }, [recent]);
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem("onbeat-last-song", JSON.stringify(currentSong));
    }
  }, [currentSong]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // 곡 객체를 기억해 둔다 (이미 있으면 그대로 → 재생 중인 곡이 다시 시작되지 않게)
  const registerSongs = (songs) =>
    setSongsById((prev) => {
      const missing = songs.filter((song) => song && !prev[song.id]);
      if (!missing.length) return prev;
      const next = { ...prev };
      missing.forEach((song) => {
        next[song.id] = song;
      });
      return next;
    });

  // song: 곡 객체 (예전처럼 id만 넘겨도 이미 기억한 곡이면 재생됨)
  const playSong = (songOrId) => {
    const song = typeof songOrId === "object" ? songOrId : getSong(songOrId);
    if (!song) return;
    registerSongs([song]);
    if (playQueue.includes(song.id)) {
      setQueueIndex(playQueue.indexOf(song.id));
    } else {
      setPlayQueue([song.id]);
      setQueueIndex(0);
    }
    if (song.id === currentId) getAudio().currentTime = 0;
    setCurrentId(song.id);
    setIsPlaying(true);
    setPosition(0);
  };

  // 여러 곡을 순서대로 재생 (첫 곡부터)
  const playCollection = (songs) => {
    const list = songs
      .map((item) => (typeof item === "object" ? item : getSong(item)))
      .filter(Boolean);
    if (!list.length) return;
    registerSongs(list);
    setPlayQueue(list.map((song) => song.id));
    setQueueIndex(0);
    if (list[0].id === currentId) getAudio().currentTime = 0;
    setCurrentId(list[0].id);
    setIsPlaying(true);
    setPosition(0);
  };

  const togglePlay = () => {
    if (currentId) setIsPlaying((p) => !p);
  };

  // direction: 1 다음 곡 / -1 이전 곡, auto: 곡이 끝나서 자동으로 넘어가는 경우
  const skip = (direction, { auto = false } = {}) => {
    if (!currentId) return;
    const queue = playQueue.length ? playQueue : [currentId];
    const nextIndex = (queueIndex + direction + queue.length) % queue.length;
    const nextId = queue[nextIndex];
    setQueueIndex(nextIndex);
    setPosition(0);
    if (nextId === currentId) {
      // 같은 곡을 다시 트는 경우 (대기열에 한 곡뿐이거나, 같은 곡이 연달아 들어 있음)
      const audio = getAudio();
      audio.currentTime = 0;
      if (auto && queue.length === 1) {
        setIsPlaying(false); // 한 곡뿐인데 끝까지 들었으면 멈춤
        return;
      }
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
      return;
    }
    setCurrentId(nextId);
    setIsPlaying(true);
  };

  // 재생 바를 움직였을 때
  const seek = (seconds) => {
    getAudio().currentTime = seconds;
    setPosition(seconds);
  };

  // 오디오 이벤트에서 항상 최신 skip을 부르기 위한 ref
  const skipRef = useRef(skip);
  useEffect(() => {
    skipRef.current = skip;
  });

  // 곡이 바뀌면: 오디오 주소 바꾸기 + 재생 기록 시작/종료
  useEffect(() => {
    const audio = getAudio();
    if (!currentSong?.previewUrl) {
      audio.pause();
      audio.removeAttribute("src");
      return undefined;
    }
    audio.src = currentSong.previewUrl;
    const duration = () => audio.duration || currentSong.previewDuration;
    let report = null;

    // 실제로 소리가 나기 시작했을 때 기록 시작 (자동재생이 막히면 기록 안 함)
    const onPlaying = () => {
      if (!report || report.finished) {
        report = startPlaybackReport(currentSong, commuteSessionIdRef.current);
      }
    };
    const onTimeUpdate = () => setPosition(Math.floor(audio.currentTime));
    const onEnded = () => {
      report?.finish({
        completed: true,
        playedSeconds: duration(),
        duration: duration(),
      });
      skipRef.current(1, { auto: true });
    };
    const onError = () => {
      setIsPlaying(false);
      setToast("이 곡은 미리듣기를 재생할 수 없어요.");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      // 다른 곡으로 넘어가면 지금 곡은 "스킵"으로 기록
      report?.finish({
        completed: false,
        playedSeconds: audio.currentTime,
        duration: duration(),
      });
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [currentSong]);

  // 재생 / 일시정지
  useEffect(() => {
    if (!currentSong?.previewUrl) return;
    const audio = getAudio();
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false)); // 브라우저가 자동재생을 막은 경우
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying]);

  // ── 좋아요 (서버 API가 아직 없어서 이 브라우저에 곡 객체째 저장) ──
  const isFavorite = (id) => favorites.some((song) => song.id === id);
  const toggleFavorite = (song) =>
    setFavorites((prev) =>
      prev.some((item) => item.id === song.id)
        ? prev.filter((item) => item.id !== song.id)
        : [...prev, song],
    );

  const addRecent = (term) => {
    const q = term.trim();
    if (q) setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 8));
  };

  const value = {
    getSong,
    currentSong,
    currentId,
    isPlaying,
    position,
    duration: playableSeconds(currentSong),
    seek,
    playSong,
    playCollection,
    togglePlay,
    skip,
    favorites,
    isFavorite,
    toggleFavorite,
    recent,
    setRecent,
    addRecent,
    toast,
    setToast,
    modal,
    setModal,
  };
  return (
    <OnBeatContext.Provider value={value}>{children}</OnBeatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOnBeat = () => {
  const value = useContext(OnBeatContext);
  if (!value) throw new Error("OnBeatProvider가 필요합니다");
  return value;
};
