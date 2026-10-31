import { useState } from 'react';
import { Music2, Search as SearchIcon, Play, X } from 'lucide-react';

import Button from '../components/common/Button';
import Card from '../components/common/Card';
import IconButton from '../components/common/IconButton';
import { searchCategories as categories } from '../mocks/content';
import { searchTracks as tracks } from '../mocks/tracks';

function Search() {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = normalizedQuery
    ? tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(normalizedQuery) ||
          track.artist.toLowerCase().includes(normalizedQuery),
      )
    : [];

  const isSearching = normalizedQuery.length > 0;

  const handlePlayClick = (track) => {
    console.log('선택한 곡:', track.title, track.artist);
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

          {searchResults.length > 0 ? (
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
                    재생
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


