import { useEffect, useRef, useState } from 'react';
import { Music2, Search as SearchIcon, Play, X } from 'lucide-react';
import { searchMusic, normalizeMusicTrack } from '../api/music';
import { recordListeningEvent, recordPlaybackEvent } from '../api/playback';
import { getApiErrorMessage, getMemberId } from '../api/client';

import Button from '../components/common/Button';
import Card from '../components/common/Card';
import IconButton from '../components/common/IconButton';
import { searchCategories as categories } from '../mocks/content';

function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function Search() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [playbackError, setPlaybackError] = useState('');
  const audioRef = useRef(null);
  const memberId = getMemberId();
  const debouncedQuery = useDebouncedValue(query);

  const normalizedQuery = query.trim();

  const isSearching = normalizedQuery.length > 0;

  useEffect(() => {
    let cancelled = false;
    const term = debouncedQuery.trim();

    if (!term) {
      return undefined;
    }

    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setIsLoading(true);
        setSearchError('');
        return searchMusic(term);
      })
      .then((tracks) => {
        if (!tracks) return;
        if (!cancelled) setSearchResults(tracks.map(normalizeMusicTrack));
      })
      .catch((error) => {
        console.error('Music search failed:', error);
        if (!cancelled) {
          setSearchResults([]);
          setSearchError('음악 검색에 실패했어요. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handlePlayClick = async (track) => {
    if (!track.previewUrl) {
      setPlaybackError('이 곡은 미리듣기를 제공하지 않아요.');
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(track.previewUrl);
    audioRef.current = audio;
    setPlayingTrackId(track.id);
    setPlaybackError('');
    try {
      await recordPlaybackEvent(memberId, { trackId: track.itunesTrackId ?? track.id, eventType: 'PLAY' });
      audio.onended = async () => {
        setPlayingTrackId(null);
        try {
          await recordListeningEvent(memberId, {
            trackId: track.itunesTrackId ?? track.id,
            listenedSeconds: Math.round((track.trackTimeMillis ?? 0) / 1000),
            completed: true,
          });
        } catch (error) { console.error('Listening event failed:', error); }
      };
      audio.onerror = () => setPlayingTrackId(null);
      await audio.play();
    } catch (error) {
      setPlayingTrackId(null);
      setPlaybackError(getApiErrorMessage(error, '음악 재생을 시작하지 못했어요.'));
    }
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      {/* 검색창 */}
      <section>
        <div className="relative">
          <SearchIcon
            size={20}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-800"
          />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="어떤 것을 듣고 싶으세요?"
            aria-label="음악 검색"
            className="w-full rounded-lg bg-white py-3 pl-11 pr-11 text-sm font-medium text-black shadow-md outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-spotify-green"
          />

          {query && (
            <IconButton
              label="검색어 지우기"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-700"
            >
              <X size={17} />
            </IconButton>
          )}
        </div>
      </section>

      {/* 탐색 카테고리 */}
      {!isSearching && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">
              무엇을 찾으세요?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                padding="none"
                hoverable
                className={`relative h-28 overflow-hidden border-0 ${category.color}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (category.id === 'music') {
                      setQuery('');
                    } else {
                      console.log('라이브 이벤트 카테고리 선택');
                    }
                  }}
                  className="relative flex h-full w-full flex-col justify-between p-3 text-left"
                >
                  <span className="relative z-10 text-base font-extrabold text-white">
                    {category.title}
                  </span>

                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    className="absolute -bottom-2 -right-3 h-20 w-20 rotate-20 rounded-md object-cover shadow-lg transition-transform duration-300 group-hover:scale-110"
                  />

                  <span className="relative z-10 text-[10px] font-medium text-white/80">
                    {category.description}
                  </span>
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 검색 결과 */}
      {isSearching && (
        <section>
          {playbackError && <p role="alert" className="mb-2 text-xs text-amber-300">{playbackError}</p>}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">
                검색 결과
              </h2>
              <p className="mt-1 text-xs text-spotify-subtext">
                '{query.trim()}' 검색 결과 {searchResults.length}곡
              </p>
            </div>

            <IconButton
              label="검색어 지우기"
              size="sm"
              onClick={() => setQuery('')}
            >
              <X size={17} />
            </IconButton>
          </div>

          {isLoading ? (
            <Card padding="lg" className="py-10 text-center">
              <p className="text-sm font-bold text-white">음악을 검색하고 있어요...</p>
            </Card>
          ) : searchError ? (
            <Card padding="lg" className="py-10 text-center">
              <p role="alert" className="text-sm font-bold text-white">{searchError}</p>
            </Card>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                >
                  <img
                    src={track.image}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-md object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {track.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-spotify-subtext">
                      {track.artist}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayClick(track)}
                    className="shrink-0"
                  >
                    <Play size={16} fill="currentColor" />
                    {playingTrackId === track.id ? '재생 중' : '재생'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card padding="lg" className="py-10 text-center">
              <Music2
                size={36}
                className="mx-auto mb-3 text-spotify-subtext"
              />
              <p className="text-sm font-bold text-white">
                검색 결과가 없어요
              </p>
              <p className="mt-2 text-xs text-spotify-subtext">
                곡 제목이나 아티스트 이름을 다시 확인해 주세요.
              </p>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}

export default Search;


