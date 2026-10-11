import { useState } from 'react';
import { Camera, Music2, Search as SearchIcon, Play, X } from 'lucide-react';

import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import IconButton from '../components/common/IconButton';

const categories = [
  {
    id: 'music',
    title: '음악',
    description: '다양한 음악을 찾아보세요',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    color: 'bg-pink-600',
  },
  {
    id: 'live',
    title: '라이브 이벤트',
    description: '공연과 라이브 음악',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
    color: 'bg-teal-700',
  },
];

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


// 검색 화면에서 사용할 목업 데이터
const tracks = [
  {
    id: 'track-1',
    title: '예뻤어 You Were Beautiful',
    artist: 'DAY6',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
  },
  {
    id: 'track-2',
    title: 'Welcome to the Show',
    artist: 'DAY6',
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
  },
  {
    id: 'track-3',
    title: 'Magnetic',
    artist: 'ILLIT',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
  },
  {
    id: 'track-4',
    title: 'Fiction',
    artist: '비스트',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
  },
  {
    id: 'track-5',
    title: '좋은 날',
    artist: '아이유',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300',
  },
  {
    id: 'track-6',
    title: 'Spot!',
    artist: '지코 (ZICO) · JENNIE',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300',
  },
  {
    id: 'track-7',
    title: 'Supernova',
    artist: 'aespa',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
  },
  {
    id: 'track-8',
    title: 'How Sweet',
    artist: 'NewJeans',
    image:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300',
  },
];