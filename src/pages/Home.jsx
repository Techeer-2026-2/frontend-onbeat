import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import IconButton from '../components/common/IconButton';
import { getMusicRankings, normalizeRankingTrack } from '../api/rankings';
import { getAdBanners, normalizeAdBanner, recordAdClick } from '../api/ads';
import { getMemberId } from '../api/client';
import { getHomeCommutePlaylist } from '../api/homeContent';
import {
  Disc3,
  MapPin,
  Music2,
  Navigation,
  Play,
  RefreshCw,
} from 'lucide-react';

function Home() {
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [rankingScope, setRankingScope] = useState('GLOBAL');
  const { data: adBanners = [], isLoading: isAdLoading } = useQuery({
    queryKey: ['ad-banners'],
    queryFn: () => getAdBanners(getMemberId()),
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
  const { data: commutePlaylist = null } = useQuery({
    queryKey: ['home-commute-playlist'],
    queryFn: getHomeCommutePlaylist,
  });

  const visibleTracks = showAllTracks ? rankingItems : rankingItems.slice(0, 5);
  const adBanner = adBanners[0] ?? null;
  const handleAdClick = async () => {
    if (!adBanner) return;
    try {
      if (adBanner.notificationId) await recordAdClick(adBanner.notificationId);
    } catch (error) {
      console.error('Ad click event failed:', error);
    }
    if (adBanner.targetUrl) window.open(adBanner.targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="aero-home space-y-5 px-4 pb-8 pt-4">
      {/* 추천 프로모션 광고 */}
      <section>
        {isAdLoading && <div className="aero-promo-loading aspect-[1.65] w-full animate-pulse" />}
        {adBanner && <button
          type="button"
          onClick={handleAdClick}
          aria-label={`${adBanner.title} 자세히 보기`}
          className="aero-promo group relative block aspect-[1.65] w-full overflow-hidden text-left"
        >
          <img
            src={adBanner.image}
            alt="콘서트 조명"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="aero-promo-overlay absolute inset-0" />
          <span className="aero-promo-disc" aria-hidden="true" />
          <span className="aero-promo-headphones" aria-hidden="true" />

          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="aero-promo-kicker"> 추천 프로모션</span>
              <Badge variant="primary" size="sm" className="aero-promo-badge tracking-wider"><Disc3 size={12} className="mr-1 inline" />{adBanner.badge}</Badge>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-black tracking-widest text-[#E9FAFF]">
                {adBanner.subtitle}
              </p>

              <h2 className="aero-promo-title text-2xl font-black leading-tight tracking-tight text-white">
                {adBanner.title}
              </h2>

              <div className="aero-promo-copy mt-2 p-2">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-bold">
                  <Music2 size={13} />
                  타이틀곡 Pre-Listen
                </p>
                <p className="text-[11px] text-[#164A98]">
                  {adBanner.subtitle || '새로운 음악과 프로모션을 만나보세요.'}
                </p>
              </div>

              <div className="aero-button mt-2 flex w-full items-center justify-center gap-2 py-2 text-xs font-black">
                티저 감상하기
                <Play size={15} fill="currentColor" />
              </div>
            </div>
          </div>
        </button>}
      </section>

      {/* 통근 맞춤 플레이리스트가 생성된 경우에만 표시 */}
      {commutePlaylist && <Card
        padding="none"
        className="aero-window aero-player relative overflow-hidden"
      >
        <Navigation
          size={112}
          className="pointer-events-none absolute -bottom-5 -right-5 text-[#69D7F4] opacity-30"
        />

        <div className="aero-titlebar">
          <span>오늘의 출근길 ♫</span>
          <img className="aero-controls-image" src="/assets/controls.png" alt="" aria-hidden="true" />
        </div>

        <div className="aero-window-content relative">
          <div className="aero-player-body">
            <img className="aero-player-art" src={commutePlaylist.cover || commutePlaylist.tracks?.[0]?.image} alt="" />
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-sm font-extrabold text-[#103c78]">{commutePlaylist.title || `${commutePlaylist.origin} → ${commutePlaylist.destination}`}</h2>
              <p className="mb-3 text-xs text-[#47709f]">{commutePlaylist.mode} · 예상 소요시간 {commutePlaylist.commuteMinutes}분</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#2475D5]">{commutePlaylist.tracks?.length ?? 0}곡 · {Math.round((commutePlaylist.totalSeconds ?? 0) / 60)}분</span>
                <Button type="button" onClick={() => console.log('통근 플레이리스트 재생:', commutePlaylist.id)} className="aero-play-image-button" aria-label="플레이리스트 재생"><img src="/assets/aero/controls/play.svg" alt="재생" aria-hidden="true" /></Button>
              </div>
              <div className="aero-progress" aria-hidden="true"><span /></div>
            </div>
          </div>
        </div>
      </Card>}

      {/* 주변 인기곡 TOP 50 */}
      <section className="aero-ranking-window">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="aero-section-heading flex items-center gap-1.5 text-base font-extrabold">
              <img src="/assets/aero/controls/mappin.png" alt="" aria-hidden="true" />
              {rankingScope === 'GLOBAL' ? '인기곡 TOP 100' : `${locationLabel} 주변 인기곡 TOP 50`}
            </h2>
          </div>

          <IconButton
            label="인기곡 새로고침"
            size="sm"
            onClick={() => refetchRankings()}
          >
            <RefreshCw size={15} className="text-[#2475D5]" />
          </IconButton>
        </div>

        <div className="aero-scope mb-3 grid grid-cols-2 p-1">
          {[['GLOBAL', '전체 인기곡'], ['NEARBY', '주변 인기곡']].map(([scope, label]) => (
            <button key={scope} type="button" onClick={() => { setRankingScope(scope); setShowAllTracks(false); }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${rankingScope === scope ? 'aero-scope-active' : 'text-[#47709f]'}`}>
              {label}
            </button>
          ))}
        </div>

        {isRankingLoading && <p className="py-6 text-center text-xs text-spotify-subtext">인기곡을 불러오는 중이에요...</p>}
        {isRankingError && <p role="alert" className="py-6 text-center text-xs text-amber-300">인기곡을 불러오지 못했어요.</p>}
        {rankingScope === 'NEARBY' && locationError && <p role="alert" className="py-6 text-center text-xs text-amber-300">{locationError}</p>}
        {!isRankingLoading && !isRankingError && visibleTracks.length === 0 && <p className="py-6 text-center text-xs text-spotify-subtext">집계된 인기곡이 아직 없어요.</p>}
        {!isRankingLoading && !isRankingError && <div className="aero-ranking-list space-y-1">
          {visibleTracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => console.log('곡 선택:', track.title)}
              className="aero-track-row group flex w-full items-center gap-3 p-2 text-left"
            >
              <span
                className={`w-5 shrink-0 text-center text-sm font-extrabold ${
                  track.id <= 3
                    ? 'text-[#2475D5]'
                    : 'text-[#47709f]'
                }`}
              >
                {track.id}
              </span>

              <img
                src={track.image}
                alt=""
                loading="lazy"
                className="aero-album-art h-11 w-11 shrink-0 object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#123d79] transition-colors group-hover:text-[#2475D5]">
                  {track.title}
                </p>
                <p className="mt-1 truncate text-[11px] text-[#47709f]">
                  {track.artist}
                </p>
              </div>

              <span className="aero-listener shrink-0" aria-label={`${track.listeners} 청취`}>
                <img src="/assets/aero/controls/play.svg" alt="" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>}

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setShowAllTracks((prev) => !prev)}
          className="aero-button mt-3 w-full"
        >
          {showAllTracks
            ? '접기 (TOP 5만 보기)'
            : '더보기 (TOP 100 전체 보기)'}
        </Button>
      </section>
    </div>
  );
}

export default Home;


