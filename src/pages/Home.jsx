import { useState } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import IconButton from '../components/common/IconButton';
import {
  Disc3,
  MapPin,
  Music2,
  Navigation,
  Play,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

function Home() {
  const [showAllTracks, setShowAllTracks] = useState(false);

  const visibleTracks = showAllTracks
    ? tracks
    : tracks.slice(0, 5);

  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      {/* 추천 프로모션 광고 */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-xs font-bold text-spotify-subtext">
            <Sparkles size={14} className="text-spotify-green" />
            추천 프로모션
          </span>

          <Badge variant="default" size="sm">
            SPONSORED
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => console.log('광고 클릭')}
          aria-label="BLACKPINK 컴백 프로모션 자세히 보기"
          className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-pink-500/50 bg-black text-left"
        >
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"
            alt="콘서트 조명"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/10" />

          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-2">
              <Badge
                variant="danger"
                size="sm"
                className="tracking-wider"
              >
                <Disc3 size={12} className="mr-1 inline" />
                COMEBACK SINGLE
              </Badge>

              <span className="rounded-md border border-pink-500/40 bg-black/70 px-2 py-1 text-[10px] font-bold text-pink-400">
                RELEASE
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-black tracking-widest text-pink-400">
                BLACKPINK · 2nd MINI ALBUM
              </p>

              <h2 className="text-3xl font-black leading-tight tracking-tight text-white">
                KILL THIS LOVE
              </h2>

              <div className="mt-3 rounded-lg border border-pink-500/20 bg-black/70 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-pink-400">
                  <Music2 size={13} />
                  타이틀곡 Pre-Listen
                </p>
                <p className="text-xs text-neutral-200">
                  강렬한 브라스와 중독성 있는 드럼 비트!
                </p>
              </div>

              <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-xs font-black transition-colors group-hover:bg-pink-500">
                티저 감상하기
                <Play size={15} fill="currentColor" />
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* 오늘의 출근길 플레이리스트 */}
      <Card
        padding="md"
        className="relative overflow-hidden border border-spotify-green/30 bg-linear-to-t from-emerald-950 via-spotify-dark to-spotify-dark"
      >
        <Navigation
          size={112}
          className="pointer-events-none absolute -bottom-5 -right-5 text-spotify-green opacity-10"
        />

        <div className="relative">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="sm">
              오늘의 출근길
            </Badge>

            <span className="text-[11px] text-spotify-subtext">
              ☀️ 맑음 22°C
            </span>
          </div>

          <h2 className="mb-1 text-lg font-bold text-white">
            강남역 → 판교역
          </h2>

          <p className="mb-3 text-xs text-spotify-subtext">
            지하철 · 예상 소요시간 32분
          </p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-spotify-green">
              8곡 · 32분
            </span>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => console.log('지도 탭으로 이동')}
              className="shrink-0 rounded-full"
            >
              <Play size={14} fill="currentColor" />
              출근길 듣기
            </Button>
          </div>
        </div>
      </Card>

      {/* 주변 인기곡 TOP 50 */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-white">
              <MapPin size={17} className="shrink-0 text-spotify-green" />
              성수동 주변 인기곡 TOP 50
            </h2>

            <p className="mt-1 text-[10px] text-spotify-subtext">
              실시간 집계 기준
            </p>
          </div>

          <IconButton
            label="인기곡 새로고침"
            size="sm"
            onClick={() => console.log('인기곡 새로고침')}
          >
            <RefreshCw size={15} />
          </IconButton>
        </div>

        <div className="space-y-1">
          {visibleTracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => console.log('곡 선택:', track.title)}
              className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/10"
            >
              <span
                className={`w-5 shrink-0 text-center text-sm font-extrabold ${
                  track.id <= 3
                    ? 'text-spotify-green'
                    : 'text-spotify-subtext'
                }`}
              >
                {track.id}
              </span>

              <img
                src={track.image}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-spotify-green">
                  {track.title}
                </p>
                <p className="mt-1 truncate text-[11px] text-spotify-subtext">
                  {track.artist}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[10px] text-spotify-subtext">
                {track.listeners} 청취
              </span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setShowAllTracks((prev) => !prev)}
          className="mt-3 w-full rounded-full"
        >
          {showAllTracks
            ? '접기 (TOP 5만 보기)'
            : '더보기 (TOP 50 전체보기)'}
        </Button>
      </section>
    </div>
  );
}

export default Home;


// 더미 데이터: 실제 API 연동 시 제거 필요
const tracks = [
  {
    id: 1,
    title: '예뻤어 You Were Beautiful',
    artist: 'DAY6',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150',
    listeners: 142,
  },
  {
    id: 2,
    title: 'Welcome to the Show',
    artist: 'DAY6',
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150',
    listeners: 128,
  },
  {
    id: 3,
    title: 'Magnetic',
    artist: 'ILLIT',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150',
    listeners: 115,
  },
  {
    id: 4,
    title: 'Fiction',
    artist: '비스트',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150',
    listeners: 98,
  },
  {
    id: 5,
    title: '좋은 날',
    artist: '아이유',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150',
    listeners: 87,
  },
  {
    id: 6,
    title: 'Spot!',
    artist: '지코 (ZICO) ft. JENNIE',
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150',
    listeners: 76,
  },
  {
    id: 7,
    title: 'Supernova',
    artist: 'aespa',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150',
    listeners: 65,
  },
  {
    id: 8,
    title: 'How Sweet',
    artist: 'NewJeans',
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150',
    listeners: 54,
  },
];