import { useMemo, useState } from 'react';
import {
  Heart,
  ListMusic,
  Disc3,
  Mic2,
  Plus,
  Search,
  X,
  Navigation,
} from 'lucide-react';

import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import IconButton from '../components/common/IconButton';

const libraryItems = [
  {
    id: 'liked',
    title: '좋아요 표시한 곡',
    subtitle: '내가 좋아요를 누른 음악',
    type: 'playlist',
    image: null,
    icon: 'heart',
    count: '8곡',
  },
  {
    id: 'commute',
    title: '출근 플레이리스트 (강남→판교)',
    subtitle: 'ONBEAT · 32분',
    type: 'playlist',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    icon: 'navigation',
    count: '8곡',
  },
  {
    id: 'daily',
    title: '오늘의 음악',
    subtitle: '매일 듣기 좋은 음악',
    type: 'playlist',
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
    icon: 'playlist',
    count: '12곡',
  },
  {
    id: 'album-1',
    title: 'The Book of Us : Entropy',
    subtitle: 'DAY6',
    type: 'album',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    icon: 'album',
    count: '앨범',
  },
  {
    id: 'artist-1',
    title: 'DAY6',
    subtitle: '아티스트',
    type: 'artist',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300',
    icon: 'artist',
    count: '아티스트',
  },
];

const filters = [
  { label: '전체', value: 'all' },
  { label: '플레이리스트', value: 'playlist' },
  { label: '앨범', value: 'album' },
  { label: '아티스트', value: 'artist' },
];

function Library() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return libraryItems.filter((item) => {
      const matchesFilter =
        activeFilter === 'all' || item.type === activeFilter;

      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const handleItemClick = (item) => {
    console.log('라이브러리 항목 선택:', item.title);
  };

  const handleCreatePlaylist = () => {
    console.log('플레이리스트 만들기');
  };

  const renderItemIcon = (item) => {
    if (item.icon === 'heart') {
      return <Heart size={25} fill="currentColor" />;
    }

    if (item.icon === 'navigation') {
      return <Navigation size={25} />;
    }

    if (item.icon === 'album') {
      return <Disc3 size={25} />;
    }

    if (item.icon === 'artist') {
      return <Mic2 size={25} />;
    }

    return <ListMusic size={25} />;
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      {/* 페이지 제목과 액션 버튼 */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 콘텐츠 필터 */}
          <section className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                variant={activeFilter === filter.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className="shrink-0 rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </section>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            label={isSearchOpen ? '검색 닫기' : '라이브러리 검색'}
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setQuery('');
            }}
          >
            {isSearchOpen ? <X size={21} /> : <Search size={21} />}
          </IconButton>

          <IconButton
            label="플레이리스트 만들기"
            onClick={handleCreatePlaylist}
          >
            <Plus size={25} />
          </IconButton>
        </div>
      </section>

      {/* 라이브러리 검색 */}
      {isSearchOpen && (
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="내 라이브러리 검색"
            aria-label="내 라이브러리 검색"
            autoFocus
            className="w-full rounded-lg bg-spotify-card py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-spotify-subtext focus:ring-2 focus:ring-spotify-green"
          />
        </div>
      )}

      {/* 라이브러리 항목 목록 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            {activeFilter === 'all'
              ? '내 콘텐츠'
              : filters.find((filter) => filter.value === activeFilter)?.label}
          </h2>

          <Badge variant="default" size="sm">
            {visibleItems.length}개
          </Badge>
        </div>

        {visibleItems.length > 0 ? (
          <div className="space-y-3">
            {visibleItems.map((item) => (
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className={`h-14 w-14 shrink-0 object-cover ${
                        item.type === 'artist'
                          ? 'rounded-full'
                          : 'rounded-md'
                      }`}
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
                      {renderItemIcon(item)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white transition-colors hover:text-spotify-green">
                      {item.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-spotify-subtext">
                      {item.subtitle}
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] text-spotify-subtext">
                    {item.count}
                  </span>
                </button>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="py-10 text-center">
            <ListMusic
              size={34}
              className="mx-auto mb-3 text-spotify-subtext"
            />
            <p className="text-sm font-bold text-white">
              검색 결과가 없어요
            </p>
            <p className="mt-2 text-xs text-spotify-subtext">
              다른 검색어나 필터를 선택해 보세요.
            </p>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery('');
                setActiveFilter('all');
              }}
              className="mt-4 rounded-full"
            >
              필터 초기화
            </Button>
          </Card>
        )}
      </section>

      {/* 안내 문구 */}
      <p className="text-center text-[11px] leading-relaxed text-spotify-subtext">
        나만의 음악과 플레이리스트를 모아 보세요.
      </p>
    </div>
  );
}

export default Library;
