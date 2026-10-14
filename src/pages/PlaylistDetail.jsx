import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Check, Globe, ListMusic, MoreHorizontal, Play, Plus,
  Share2, Shuffle, Music2,
} from 'lucide-react';
import { getPlaylistDetail } from '../api/playlists';

const MASTER_TRACKS = [
  { id: 'tr-1', title: '다시 만난 세계 (Into The New World)', artist: '소녀시대', durationSec: 265, art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { id: 'tr-2', title: '좋은 날', artist: '아이유', durationSec: 233, art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { id: 'tr-3', title: 'I', artist: '태연 및 버벌진트', durationSec: 206, art: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' },
  { id: 'tr-4', title: 'Fiction', artist: '비스트', durationSec: 234, art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
  { id: 'tr-5', title: '내꺼하자', artist: '인피니트', durationSec: 205, art: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { id: 'tr-6', title: 'Only One', artist: '보아', durationSec: 217, art: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300' },
  { id: 'tr-7', title: 'Ugly', artist: '2NE1', durationSec: 221, art: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
  { id: 'tr-8', title: '8282', artist: '다비치', durationSec: 218, art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { id: 'tr-9', title: 'TOUCH MY BODY', artist: '씨스타', durationSec: 208, art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { id: 'tr-10', title: '예뻤어 You Were Beautiful', artist: 'DAY6', durationSec: 283, art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { id: 'tr-11', title: 'Welcome to the Show', artist: 'DAY6', durationSec: 217, art: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' },
  { id: 'tr-12', title: 'Magnetic', artist: 'ILLIT', durationSec: 160, art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
];

const recommendedTracks = [
  { id: 'rec-1', title: '스물셋', artist: '아이유', durationSec: 194, art: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300' },
  { id: 'rec-2', title: 'Time for the moon night', artist: '여자친구', durationSec: 227, art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { id: 'rec-3', title: '그리워하다', artist: '비투비', durationSec: 216, art: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300' },
];

const fmt = (sec) => `${Math.floor(sec / 60)}분`;
const fmtTrack = (sec) => `${Math.floor(sec / 60)}분 ${sec % 60}초`;

function normalizeTrack(track, index) {
  const rawDuration = track.durationSec ?? track.durationSeconds ?? track.duration ?? 0;
  const durationSec = typeof rawDuration === 'number'
    ? rawDuration
    : Number.parseInt(rawDuration, 10) || 0;

  return {
    id: String(track.id ?? track.trackId ?? `track-${index}`),
    title: track.title ?? track.name ?? track.trackName ?? '제목 없는 곡',
    artist: track.artist ?? track.artistName ?? track.artists?.map?.((artist) => artist.name ?? artist).join(', ') ?? '아티스트 정보 없음',
    durationSec,
    art: track.art ?? track.image ?? track.coverImageUrl ?? track.albumImageUrl ?? track.album?.imageUrl ?? '',
  };
}

function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const memberId = Number(import.meta.env.VITE_TEST_MEMBER_ID);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['playlist', playlistId, memberId],
    queryFn: () => getPlaylistDetail(playlistId, memberId),
    enabled: Boolean(playlistId) && Number.isSafeInteger(memberId) && memberId > 0,
  });

  const playlist = data?.data ?? data?.playlist ?? data ?? {};
  const rawTracks = playlist.tracks ?? playlist.trackList ?? playlist.items ?? [];
  const tracks = useMemo(
    () => (Array.isArray(rawTracks) ? rawTracks.map(normalizeTrack) : []),
    [data],
  );
  const available = useMemo(
    () => MASTER_TRACKS.filter((track) => !tracks.some((added) => added.id === track.id)).slice(0, 5),
    [tracks],
  );
  const title = playlist.name ?? playlist.title ?? `내 플레이리스트 #${playlistId}`;
  const cover = playlist.coverImageUrl ?? playlist.imageUrl ?? playlist.cover ?? tracks[0]?.art ?? '';
  const totalSec = tracks.reduce((sum, track) => sum + track.durationSec, 0);

  return (
    <div className="relative min-h-full bg-spotify-black px-4 pb-8 pt-2 text-white">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10">
          <ArrowLeft size={23} />
        </button>
      </div>

      <div className="mb-4 flex items-start gap-4">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-800 text-spotify-subtext shadow-xl">
          {cover ? <img src={cover} alt="플레이리스트 커버" className="absolute inset-0 h-full w-full object-cover" /> : <ListMusic size={30} />}
        </div>
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <h1 className="break-break-word text-xl font-extrabold tracking-tight">{title}</h1>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-black">이</span>
            <span className="text-xs font-bold">이유민</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 font-mono text-xs text-spotify-subtext">
            <Globe size={14} /> {tracks.length}곡 · {fmt(totalSec)}
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-spotify-subtext">
          <button type="button" aria-label="공유" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="p-1 hover:text-white"><Share2 size={22} /></button>
          <button type="button" aria-label="더 보기" className="p-1 hover:text-white"><MoreHorizontal size={23} /></button>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="셔플 재생" className="text-spotify-green"><Shuffle size={25} /></button>
          <button type="button" aria-label="재생" className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green text-black"><Play size={20} fill="currentColor" /></button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2">
        <button type="button" onClick={() => navigate('/search')} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[11px] font-bold hover:bg-white/10"><Plus size={16} />추가</button>
        <button type="button" onClick={() => navigate('/playlist/create')} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[11px] font-bold hover:bg-white/10"><ListMusic size={16} />수정</button>
        <button type="button" className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[11px] font-bold hover:bg-white/10"><Check size={16} />정렬</button>
        <button type="button" onClick={() => window.alert(`플레이리스트 이름: ${title}`)} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[10px] font-bold hover:bg-white/10"><MoreHorizontal size={16} />정보</button>
      </div>

      {isLoading && <p className="py-5 text-center text-xs text-spotify-subtext">플레이리스트를 불러오는 중이에요...</p>}
      {isError && <p role="status" className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}

      <section className="mb-6 space-y-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-spotify-subtext">담긴 곡 목록</h2>
          <span className="font-mono text-[11px] text-spotify-green">{tracks.length}곡</span>
        </div>
        {tracks.length === 0 && !isLoading ? (
          <div className="space-y-2 py-8 text-center">
            <Music2 size={32} className="mx-auto text-neutral-600" />
            <p className="text-xs font-bold">{isError ? '곡 목록을 불러오지 못했어요.' : '아직 추가된 곡이 없어요.'}</p>
            <p className="text-[11px] text-spotify-subtext">플레이리스트에 곡을 추가해 보세요.</p>
          </div>
        ) : tracks.map((track, index) => (
          <div key={track.id} className="group flex items-center justify-between rounded-xl border border-white/5 bg-spotify-dark/60 p-2 transition hover:bg-white/10">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="w-4 shrink-0 text-center font-mono text-xs font-bold text-spotify-subtext">{index + 1}</span>
              {track.art ? <img src={track.art} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover shadow" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-800"><Music2 size={18} /></div>}
              <div className="min-w-0"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist}{track.durationSec ? ` · ${fmtTrack(track.durationSec)}` : ''}</p></div>
            </div>
            <button type="button" aria-label={`${track.title} 메뉴`} className="ml-2 p-1.5 text-neutral-500 transition hover:text-white"><MoreHorizontal size={18} /></button>
          </div>
        ))}
      </section>

      <section className="space-y-3 pt-2">
        <h2 className="text-sm font-extrabold">추천 곡</h2>
        <p className="-mt-2 text-[11px] text-spotify-subtext">이 플레이리스트의 곡 기준</p>
        {available.length > 0 ? available.map((track) => (
          <div key={track.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-spotify-card/50 p-2 transition hover:bg-white/5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img src={track.art} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover shadow" />
              <div className="min-w-0"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist}</p></div>
            </div>
            <button type="button" aria-label={`${track.title} 추가`} className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition hover:border-spotify-green hover:text-spotify-green"><Plus size={16} /></button>
          </div>
        )) : recommendedTracks.map((track) => (
          <div key={track.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-spotify-card/50 p-2 transition hover:bg-white/5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img src={track.art} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover shadow" />
              <div className="min-w-0"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist}</p></div>
            </div>
            <button type="button" aria-label={`${track.title} 추가`} className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition hover:border-spotify-green hover:text-spotify-green"><Plus size={16} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default PlaylistDetail;
