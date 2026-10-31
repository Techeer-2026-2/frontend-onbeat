import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateRecommendedPlaylist } from '../api/playlists';
import { estimateRoute } from '../api/routes';
import { getApiErrorMessage, getMemberId } from '../api/client';
import { playlistTracks as TRACKS } from '../mocks/tracks';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Plus, Route, Search, Sparkles, Train, Bus, Footprints, Car, Music2, Trash2, X } from 'lucide-react';

const modes = [{ label: '지하철', Icon: Train }, { label: '버스', Icon: Bus }, { label: '도보', Icon: Footprints }, { label: '자차', Icon: Car }];
const mins = (sec) => Math.round(sec / 60);
const transportModeMap = { 지하철: 'SUBWAY', 버스: 'BUS', 도보: 'WALK', 자차: 'CAR' };
const locationCoordinates = {
  강남역: { latitude: 37.4979, longitude: 127.0276 },
  판교역: { latitude: 37.3947, longitude: 127.1112 },
};

export default function CommutePlaylistCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const memberId = getMemberId();
  const createMutation = useMutation({
    mutationFn: ({ memberId, name }) =>
      generateRecommendedPlaylist(memberId, { name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
  const [origin, setOrigin] = useState('강남역');
  const [destination, setDestination] = useState('판교역');
  const [mode, setMode] = useState('지하철');
  const [duration, setDuration] = useState(32);
  const [title] = useState('출근 맞춤 플레이리스트');
  const [tracks, setTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState('');
  const [isEstimatingRoute, setIsEstimatingRoute] = useState(false);
  const total = tracks.reduce((sum, track) => sum + track.durationSec, 0);
  const filteredTracks = useMemo(() => TRACKS.filter(t => `${t.title} ${t.artist}`.toLowerCase().includes(search.toLowerCase())), [search]);

  useEffect(() => {
    const start = locationCoordinates[origin.trim()];
    const end = locationCoordinates[destination.trim()];
    if (!start || !end) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsEstimatingRoute(true);
      try {
        const result = await estimateRoute({
          startLatitude: start.latitude,
          startLongitude: start.longitude,
          endLatitude: end.latitude,
          endLongitude: end.longitude,
          transportMode: transportModeMap[mode],
        });
        const nextDuration = Number(result?.durationMinutes);
        if (!cancelled && Number.isFinite(nextDuration) && nextDuration > 0) {
          setDuration(Math.round(nextDuration));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Route duration estimate failed:', error);
          setMessage(getApiErrorMessage(error, '경로 소요시간을 계산하지 못했어요.'));
        }
      } finally {
        if (!cancelled) setIsEstimatingRoute(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [origin, destination, mode]);
  const addTrack = (track) => {
    if (tracks.some(t => t.id === track.id)) { setMessage('이미 플레이리스트에 담긴 곡입니다.'); return; }
    setTracks(current => [...current, track]); setMessage(`'${track.title}' 곡이 추가되었습니다.`);
  };
  const autoGenerate = () => {
    let seconds = 0; const selected = [];
    for (const track of TRACKS) {
      if (seconds + track.durationSec <= duration * 60 + 60) { selected.push(track); seconds += track.durationSec; }
      if (seconds >= duration * 60 - 90) break;
    }
    setTracks(selected); setMessage(`${duration}분 통근 시간에 맞춰 ${selected.length}곡을 구성했습니다.`);
  };
  const save = () => {
    if (!origin.trim() || !destination.trim()) {
      setMessage('출발지와 도착지를 모두 입력해 주세요.');
      return;
    }
    if (!tracks.length) {
      setMessage('곡을 자동 생성하거나 직접 추가해 주세요.');
      return;
    }
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setMessage('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }

    // 현재 Swagger에서 확인된 생성 요청 필드(name)를 전송한다.
    // 추천 생성 API의 Request Body가 다르면 이 payload를 명세에 맞춰 조정해야 한다.
    createMutation.mutate(
      { memberId, name: `${title} (${origin.trim()}→${destination.trim()})` },
      {
        onSuccess: (result) => {
          const playlist = {
            ...result,
            id: result?.id ?? `commute-${Date.now()}`,
            title: result?.name ?? `${title} (${origin.trim()}→${destination.trim()})`,
            owner: 'ONBEAT Commute',
            type: 'commute',
            isCommute: true,
            origin: origin.trim(),
            destination: destination.trim(),
            mode,
            commuteMinutes: duration,
            tracks,
            totalSeconds: total,
            cover: tracks[0]?.art || '',
            createdAt: new Date().toISOString(),
          };
          const saved = JSON.parse(localStorage.getItem('onbeat-playlists') || '[]');
          localStorage.setItem('onbeat-playlists', JSON.stringify([playlist, ...saved]));
          localStorage.setItem('onbeat-commute-profile', JSON.stringify({
            origin: origin.trim(), destination: destination.trim(), mode, duration,
            playlistId: playlist.id,
          }));
          setMessage('통근 맞춤 플레이리스트가 생성되었습니다.');
          navigate('/library', { state: { createdPlaylist: playlist } });
        },
        onError: (error) => {
          setMessage(getApiErrorMessage(error, '통근 플레이리스트 생성에 실패했어요. API 요청값과 서버 로그를 확인해 주세요.'));
        },
      }
    );
  };

  return <div className="relative min-h-full bg-spotify-black px-4 pb-8 pt-2 text-white">
    <div className="mb-4 flex items-center justify-between">
      <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"><ArrowLeft size={23}/></button>
    </div>

    <div className="mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black"><Route size={17}/></span><div><h1 className="text-xl font-extrabold">통근 맞춤 플레이리스트</h1><p className="mt-0.5 text-[11px] text-spotify-subtext">이동 시간에 맞춰 음악을 자동 구성해요</p></div></div>

    <section className="mb-4 space-y-3 rounded-2xl border border-spotify-green/40  p-4">
      <div className="flex items-center justify-between"><span className="rounded-full border border-spotify-green/30 bg-spotify-green/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-spotify-green">통근 경로 설정</span><span className="text-[10px] text-spotify-subtext">경로 기반 맞춤 재생</span></div>
      <label className="block text-xs text-spotify-subtext">출발지 입력</label>
      <div className="relative"><MapPin size={16} className="absolute left-3 top-3.5 text-spotify-green"/><input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="예: 강남역" className="w-full rounded-xl border border-white/10 bg-spotify-card py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-spotify-green"/></div>
      <label className="block text-xs text-spotify-subtext">도착지 입력</label>
      <div className="relative"><MapPin size={16} className="absolute left-3 top-3.5 text-sky-400"/><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="예: 판교역" className="w-full rounded-xl border border-white/10 bg-spotify-card py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-spotify-green"/></div>
      <div><p className="mb-2 text-xs text-spotify-subtext">이동 수단 선택</p><div className="grid grid-cols-4 gap-2">{modes.map(({label, Icon})=><button key={label} onClick={()=>setMode(label)} className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition ${mode===label?'border-spotify-green bg-spotify-green/20 text-spotify-green':'border-white/10 bg-spotify-card text-spotify-subtext hover:text-white'}`}><Icon size={17}/>{label}</button>)}</div></div>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3"><div className="mb-2 flex items-center justify-between text-xs font-bold"><span>예상 이동 시간</span><span className="text-spotify-green">{isEstimatingRoute ? '계산 중...' : `${duration}분 소요`}</span></div><div className="mt-1 flex justify-between text-[10px] text-spotify-subtext"></div><p className="text-[11px] text-spotify-subtext">추천 플레이리스트: 약 {duration}분에 맞춰 자동 구성</p></div>
    </section>

    <section className="mb-4 rounded-2xl border border-white/10 bg-spotify-dark p-3.5">
      <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="rounded-full bg-spotify-green px-2.5 py-1 text-[10px] font-extrabold text-black">통근 경로</span><span className="truncate text-xs font-bold">{origin || '출발지'} → {destination || '도착지'}</span></div><span className="shrink-0 text-[10px] text-spotify-subtext">{mode} · {duration}분</span></div>
      <div className="map-grid-bg relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-white/10" style={{backgroundColor:'#161a20',backgroundImage:'radial-gradient(circle, #2a313d 1px, transparent 1px)',backgroundSize:'20px 20px'}}><svg viewBox="0 0 300 140" className="h-full w-full" aria-label="통근 경로 예시"><path d="M 30 25 L 85 50 L 145 72 L 205 95 L 270 118" stroke="#1DB954" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 4" fill="none"/><circle cx="30" cy="25" r="6" fill="#1DB954" stroke="#000" strokeWidth="2"/><circle cx="85" cy="50" r="4" fill="#282828" stroke="#1DB954" strokeWidth="2"/><circle cx="145" cy="72" r="4" fill="#282828" stroke="#1DB954" strokeWidth="2"/><circle cx="205" cy="95" r="4" fill="#282828" stroke="#1DB954" strokeWidth="2"/><circle cx="270" cy="118" r="6" fill="#007AFF" stroke="#000" strokeWidth="2"/><text x="30" y="13" fill="white" fontSize="9" textAnchor="middle">출발</text><text x="270" y="135" fill="white" fontSize="9" textAnchor="middle">도착</text></svg><span className="absolute left-2 top-2 rounded-lg border border-white/10 bg-black/80 px-2 py-1 text-[9px] text-white">경로 미리보기</span></div>
      <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><Clock3 size={17} className="text-spotify-green"/><div><p className="text-[10px] text-spotify-subtext">총 경로 소요시간</p><p className="text-xs font-bold">{duration}분 소요 ({mode})</p></div></div><span className="rounded-md bg-spotify-green/20 px-2 py-1 text-[10px] font-bold text-spotify-green">{tracks.length}곡 구성</span></div>
    </section>

    <section className="mb-4 rounded-2xl border border-white/10 bg-spotify-card p-3.5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-800"><Music2 size={20}/></div><div className="min-w-0 flex-1"><h2 className="text-xs font-bold">{duration}분 맞춤 출근길 플레이리스트</h2><p className="mt-1 text-[11px] text-spotify-subtext">이동 시간에 맞춰 곡을 자동으로 구성합니다</p></div><button onClick={autoGenerate} className="flex shrink-0 items-center gap-1 text-xs font-bold text-spotify-green"><Sparkles size={14}/> 자동 생성</button></div></section>

    <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2"><h2 className="text-xs font-extrabold uppercase tracking-wider text-spotify-subtext">담긴 곡 목록</h2><span className="text-[11px] font-mono text-spotify-green">{tracks.length}곡 · {mins(total)}분</span></div>
    {tracks.length===0 ? <div className="mb-5 space-y-2 py-7 text-center"><Music2 size={34} className="mx-auto text-neutral-600"/><p className="text-xs font-bold">아직 추가된 곡이 없어요</p><p className="text-[11px] text-spotify-subtext">자동 생성하거나 원하는 곡을 직접 추가해보세요.</p></div> : <div className="mb-5 space-y-1">{tracks.map((track,index)=><div key={track.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-spotify-dark/70 p-2"><span className="w-4 text-center text-xs text-spotify-subtext">{index+1}</span><img src={track.art} alt="" className="h-10 w-10 rounded-md object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist} · {mins(track.durationSec)}분</p></div><button onClick={()=>setTracks(curr=>curr.filter(t=>t.id!==track.id))} aria-label="곡 삭제" className="p-2 text-neutral-500 hover:text-red-400"><Trash2 size={15}/></button></div>)}</div>}

    <button onClick={()=>setShowAdd(true)} className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-xs font-extrabold text-black transition hover:scale-[1.01]"><Plus size={16} strokeWidth={3}/> 이 플레이리스트에 추가</button>
    <button onClick={save} disabled={createMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-full bg-spotify-green py-3.5 text-sm font-extrabold text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 size={18}/> {createMutation.isPending ? '생성 중...' : '경로 저장 및 음악 동기화'}</button>
    {message && <div className="mt-3 rounded-xl border border-spotify-green/20 bg-spotify-green/10 px-3 py-2.5 text-xs text-spotify-green">{message}<button onClick={()=>setMessage('')} className="float-right"><X size={14}/></button></div>}

    {showAdd && <div className="fixed inset-0 z-100 flex flex-col bg-spotify-black"><div className="border-b border-white/10 px-4 pb-3 pt-4"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-600"/><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-extrabold">플레이리스트에 추가하기</h2><button onClick={()=>setShowAdd(false)} aria-label="닫기"><X size={22}/></button></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-spotify-card px-3"><Search size={16} className="text-spotify-subtext"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="무엇을 추가하시겠어요?" className="w-full bg-transparent py-3 text-xs outline-none"/></div></div><div className="flex-1 space-y-1 overflow-y-auto p-4">{filteredTracks.map(track=>{const added=tracks.some(t=>t.id===track.id);return <div key={track.id} className="flex items-center gap-3 border-b border-white/5 p-2"><img src={track.art} alt="" className="h-12 w-12 rounded-md object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{track.title}</p><p className="mt-0.5 text-[11px] text-spotify-subtext">{track.artist}</p></div><button onClick={()=>addTrack(track)} className={`flex h-9 w-9 items-center justify-center rounded-full ${added?'bg-spotify-green text-black':'border border-white/20 text-white hover:border-spotify-green hover:text-spotify-green'}`} aria-label={added?'이미 추가됨':'곡 추가'}>{added?<CheckCircle2 size={18}/>:<Plus size={18}/>}</button></div>})}</div><div className="border-t border-white/10 bg-spotify-dark p-4"><button onClick={()=>setShowAdd(false)} className="w-full rounded-full bg-white py-3 text-xs font-extrabold text-black">완료</button></div></div>}
  </div>;
}

