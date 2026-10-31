import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import IconButton from '../components/common/IconButton';
import { getMusicRankings, normalizeRankingTrack } from '../api/rankings';
import { getAdBanners, normalizeAdBanner, recordAdClick } from '../api/ads';
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
  const [rankingScope, setRankingScope] = useState('NEARBY');
  const { data: adBanners = [], isLoading: isAdLoading } = useQuery({
    queryKey: ['ad-banners'],
    queryFn: getAdBanners,
    select: (items) => items.map(normalizeAdBanner),
  });
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  useEffect(() => {
    if (!navigator.geolocation) {
      Promise.resolve().then(() => setLocationError('현재 위치를 사용할 수 없어 주변 랭킹을 불러올 수 없어요.'));
      return undefined;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => setLocationError('위치 권한을 허용하면 주변 인기곡을 볼 수 있어요.'),
      { enableHighAccuracy: false, timeout: 10000 },
    );
    return undefined;
  }, []);
  const { data: rankingTracks = [], isLoading: isRankingLoading, isError: isRankingError, refetch: refetchRankings } = useQuery({
    queryKey: ['music-rankings', rankingScope],
    queryFn: () => getMusicRankings({ scope: rankingScope, limit: 50, ...location }),
    enabled: rankingScope === 'GLOBAL' || Boolean(location),
    select: (result) => ({ ...result, items: result.items.map(normalizeRankingTrack) }),
  });
  const rankingItems = rankingTracks.items ?? [];
  const rawLocationLabel = rankingTracks.locationLabel;
  const locationLabel = rawLocationLabel && !rawLocationLabel.includes('인기곡') && rawLocationLabel !== '전체'
    ? rawLocationLabel
    : '현재 위치';
  const [commutePlaylist] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('onbeat-playlists') || '[]');
      return saved.find((playlist) => playlist.isCommute === true) ?? null;
    } catch {
      return null;
    }
  });

  const visibleTracks = showAllTracks ? rankingItems : rankingItems.slice(0, 5);
  const adBanner = adBanners[0] ?? {
    id: 'fallback-banner',
    title: 'KILL THIS LOVE',
    subtitle: 'BLACKPINK · 2nd MINI ALBUM',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    badge: 'COMEBACK SINGLE',
    label: 'RELEASE',
    targetUrl: '',
  };
  const handleAdClick = async () => {
    if (!adBanner) return;
    try {
      await recordAdClick(adBanner.id);
    } catch (error) {
      console.error('Ad click event failed:', error);
    }
    if (adBanner.targetUrl) window.open(adBanner.targetUrl, '_blank', 'noopener,noreferrer');
  };

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

        {isAdLoading && <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10" />}
        {adBanner && <button
          type="button"
          onClick={handleAdClick}
          aria-label={`${adBanner.title} 자세히 보기`}
          className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-pink-500/50 bg-black text-left"
        >
          <img
            src={adBanner.image}
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
                {adBanner.badge}
              </Badge>

              <span className="rounded-md border border-pink-500/40 bg-black/70 px-2 py-1 text-[10px] font-bold text-pink-400">
                {adBanner.label}
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-black tracking-widest text-pink-400">
                {adBanner.subtitle}
              </p>

              <h2 className="text-3xl font-black leading-tight tracking-tight text-white">
                {adBanner.title}
              </h2>

              <div className="mt-3 rounded-lg border border-pink-500/20 bg-black/70 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-pink-400">
                  <Music2 size={13} />
                  타이틀곡 Pre-Listen
                </p>
                <p className="text-xs text-neutral-200">
                  {adBanner.subtitle || '새로운 음악과 프로모션을 만나보세요.'}
                </p>
              </div>

              <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-xs font-black transition-colors group-hover:bg-pink-500">
                티저 감상하기
                <Play size={15} fill="currentColor" />
              </div>
            </div>
          </div>
        </button>}
      </section>

      {/* 통근 맞춤 플레이리스트가 생성된 경우에만 표시 */}
      {commutePlaylist && <Card
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
            {commutePlaylist.origin} → {commutePlaylist.destination}
          </h2>

          <p className="mb-3 text-xs text-spotify-subtext">
            {commutePlaylist.mode} · 예상 소요시간 {commutePlaylist.commuteMinutes}분
          </p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-spotify-green">
              {commutePlaylist.tracks?.length ?? 0}곡 · {Math.round((commutePlaylist.totalSeconds ?? 0) / 60)}분
            </span>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => console.log('통근 플레이리스트 재생:', commutePlaylist.id)}
              className="shrink-0 rounded-full"
            >
              <Play size={14} fill="currentColor" />
              출근길 듣기
            </Button>
          </div>
        </div>
      </Card>}

      {/* 주변 인기곡 TOP 50 */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-white">
              <MapPin size={17} className="shrink-0 text-spotify-green" />
              {rankingScope === 'GLOBAL' ? '전체 인기곡 TOP 50' : `${locationLabel} 주변 인기곡 TOP 50`}
            </h2>

            <p className="mt-1 text-[10px] text-spotify-subtext">
              실시간 집계 기준
            </p>
          </div>

          <IconButton
            label="인기곡 새로고침"
            size="sm"
            onClick={() => refetchRankings()}
          >
            <RefreshCw size={15} />
          </IconButton>
        </div>

        <div className="mb-3 grid grid-cols-2 rounded-xl bg-white/5 p-1">
          {[['GLOBAL', '전체 인기곡'], ['NEARBY', '주변 인기곡']].map(([scope, label]) => (
            <button key={scope} type="button" onClick={() => { setRankingScope(scope); setShowAllTracks(false); }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${rankingScope === scope ? 'bg-spotify-green text-black' : 'text-spotify-subtext hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {isRankingLoading && <p className="py-6 text-center text-xs text-spotify-subtext">인기곡을 불러오는 중이에요...</p>}
        {isRankingError && <p role="alert" className="py-6 text-center text-xs text-amber-300">인기곡을 불러오지 못했어요.</p>}
        {rankingScope === 'NEARBY' && locationError && <p role="alert" className="py-6 text-center text-xs text-amber-300">{locationError}</p>}
        {!isRankingLoading && !isRankingError && visibleTracks.length === 0 && <p className="py-6 text-center text-xs text-spotify-subtext">집계된 인기곡이 아직 없어요.</p>}
        {!isRankingLoading && !isRankingError && <div className="space-y-1">
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
        </div>}

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


