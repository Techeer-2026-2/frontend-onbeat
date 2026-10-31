import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateRecommendedPlaylist } from '../api/playlists';
import { searchPlaces } from '../api/places';
import { normalizeMusicTrack, searchMusic } from '../api/music';
import { createCommuteProfile, getCommuteProfiles } from '../api/commuteProfiles';
import { estimateRoute } from '../api/routes';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Plus, Route, Search, Sparkles, Train, Bus, Footprints, Car, Music2, Trash2, X } from 'lucide-react';

const modes = [{ label: '지하철', Icon: Train }, { label: '버스', Icon: Bus }, { label: '도보', Icon: Footprints }, { label: '자차', Icon: Car }];
const mins = (sec) => Math.round(sec / 60);
// docs/swagger.json CommuteProfileCreateRequest.transportMode enum
const transportModeMap = { 지하철: 'PUBLIC_TRANSIT', 버스: 'PUBLIC_TRANSIT', 도보: 'WALK', 자차: 'CAR' };
const locationCoordinates = {
  강남역: { latitude: 37.4979, longitude: 127.0276 },
  판교역: { latitude: 37.3947, longitude: 127.1112 },
};

// 카카오맵 SDK를 불러와 출발·도착 지점과 연결선을 그린다. 키는 VITE_KAKAO_JS_KEY 로 받는다.
function KakaoRouteMap({ start, end }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!key || !start || !end) return undefined;
    let cancelled = false;
    const draw = () => {
      if (cancelled || !containerRef.current) return;
      const kakao = window.kakao;
      const center = new kakao.maps.LatLng((start.lat + end.lat) / 2, (start.lng + end.lng) / 2);
      const map = new kakao.maps.Map(containerRef.current, { center, level: 6 });
      const startLatLng = new kakao.maps.LatLng(start.lat, start.lng);
      const endLatLng = new kakao.maps.LatLng(end.lat, end.lng);
      new kakao.maps.Marker({ position: startLatLng, map });
      new kakao.maps.Marker({ position: endLatLng, map });
      new kakao.maps.Polyline({
        path: [startLatLng, endLatLng],
        strokeWeight: 6,
        strokeColor: '#1DB954',
        strokeOpacity: 0.9,
        map,
      });
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(startLatLng);
      bounds.extend(endLatLng);
      map.setBounds(bounds);
    };
    const load = () => window.kakao.maps.load(draw);
    if (window.kakao && window.kakao.maps) {
      load();
    } else {
      const existing = document.querySelector('script[data-kakao-sdk]');
      if (existing) {
        existing.addEventListener('load', load);
      } else {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
        script.async = true;
        script.dataset.kakaoSdk = '1';
        script.onload = load;
        document.head.appendChild(script);
      }
    }
    return () => { cancelled = true; };
  }, [start, end]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default function CommutePlaylistCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rawMemberId = import.meta.env.VITE_TEST_MEMBER_ID;
  const memberId = rawMemberId ? Number(rawMemberId) : undefined;
  const createMutation = useMutation({
    mutationFn: async ({ memberId, name, profilePayload, playlistPayload }) => {
      const profilesResponse = await getCommuteProfiles(memberId);
      const profiles = Array.isArray(profilesResponse)
        ? profilesResponse
        : Array.isArray(profilesResponse?.data) ? profilesResponse.data : [];
      const existingProfile = profiles.find((profile) =>
        profile.frequentRouteName === profilePayload.frequentRouteName
        && profile.transportMode === profilePayload.transportMode
      );
      const profile = existingProfile ?? await createCommuteProfile(memberId, profilePayload);
      const commuteProfileId = profile?.id ?? profile?.profileId;
      if (!Number.isSafeInteger(Number(commuteProfileId)) || Number(commuteProfileId) <= 0) {
        throw new Error('통근 프로필 생성 응답에서 ID를 확인하지 못했습니다.');
      }
      const result = await generateRecommendedPlaylist(memberId, {
        ...playlistPayload,
        commuteProfileId: Number(commuteProfileId),
      });
      return { result, commuteProfileId: Number(commuteProfileId), name };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
  const [origin, setOrigin] = useState('강남역');
  const [destination, setDestination] = useState('판교역');
  const [mode, setMode] = useState('지하철');
  const [duration, setDuration] = useState(null);
  const [isEstimatingRoute, setIsEstimatingRoute] = useState(false);
  const [routeEstimateError, setRouteEstimateError] = useState('');
  const [title] = useState('출근 맞춤 플레이리스트');
  const [tracks, setTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [musicResults, setMusicResults] = useState([]);
  const [isMusicSearching, setIsMusicSearching] = useState(false);
  const musicSearchRequestIdRef = useRef(0);
  const [placeResults, setPlaceResults] = useState([]);
  const [activePlaceField, setActivePlaceField] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState('');
  const total = tracks.reduce((sum, track) => sum + track.durationSec, 0);
  const filteredTracks = useMemo(() => musicResults.map((track, index) => {
    const normalized = normalizeMusicTrack(track, index);
    return { ...normalized, art: normalized.image, durationSec: Math.round(normalized.trackTimeMillis / 1000) };
  }), [musicResults]);
  const handleMusicSearch = async (value) => {
    setSearch(value);
    const requestId = ++musicSearchRequestIdRef.current;
    if (value.trim().length < 2) { setMusicResults([]); return; }
    setIsMusicSearching(true);
    try {
      const response = await searchMusic(value);
      if (requestId === musicSearchRequestIdRef.current) setMusicResults(response);
    } catch {
      if (requestId === musicSearchRequestIdRef.current) {
        setMusicResults([]);
        setMessage('음악 검색에 실패했어요.');
      }
    } finally {
      if (requestId === musicSearchRequestIdRef.current) setIsMusicSearching(false);
    }
  };
  const handlePlaceSearch = async (field, value) => {
    if (field === 'origin') setOrigin(value); else setDestination(value);
    setActivePlaceField(field);
    if (value.trim().length < 2) { setPlaceResults([]); return; }
    try {
      const response = await searchPlaces(value.trim());
      const items = response?.data ?? response?.places ?? response?.items ?? response;
      setPlaceResults(Array.isArray(items) ? items : []);
    } catch { setPlaceResults([]); }
  };
  const selectPlace = (field, place) => {
    const name = place.placeName ?? place.name ?? place.addressName ?? place.address ?? '';
    const latitude = Number(place.latitude ?? place.lat);
    const longitude = Number(place.longitude ?? place.lng ?? place.lon);
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    if (field === 'origin') setOrigin(name); else setDestination(name);
    setSelectedPlaces((current) => ({ ...current, [field]: { latitude, longitude, placeName: name } }));
    setPlaceResults([]); setActivePlaceField(null);
  };
  useEffect(() => {
    const start = selectedPlaces.origin ?? locationCoordinates[origin.trim()];
    const end = selectedPlaces.destination ?? locationCoordinates[destination.trim()];
    if (!start || !end) {
      Promise.resolve().then(() => setDuration(null));
      return undefined;
    }
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return null;
      setIsEstimatingRoute(true);
      setRouteEstimateError('');
      return estimateRoute({
        startLatitude: start.latitude,
        startLongitude: start.longitude,
        endLatitude: end.latitude,
        endLongitude: end.longitude,
        transportMode: transportModeMap[mode],
      });
    }).then((response) => {
      if (!response) return;
      const data = response?.data ?? response;
      const minutes = Number(data?.durationMinutes);
      if (!cancelled) setDuration(Number.isFinite(minutes) && minutes > 0 ? minutes : null);
    }).catch(() => {
      if (!cancelled) {
        setDuration(null);
        setRouteEstimateError('예상 이동 시간을 불러오지 못했어요.');
      }
    }).finally(() => { if (!cancelled) setIsEstimatingRoute(false); });
    return () => { cancelled = true; };
  }, [destination, mode, origin, selectedPlaces]);
  const addTrack = (track) => {
    if (tracks.some(t => t.id === track.id)) return;
    setTracks(current => [...current, track]);
  };
  const autoGenerate = () => save();
  const save = () => {
    if (!origin.trim() || !destination.trim()) {
      setMessage('출발지와 도착지를 모두 입력해 주세요.');
      return;
    }
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setMessage('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }

    const start = selectedPlaces.origin ?? locationCoordinates[origin.trim()];
    const end = selectedPlaces.destination ?? locationCoordinates[destination.trim()];
    if (!start || !end) {
      setMessage('현재는 지원되는 장소 좌표가 없어 통근 프로필을 만들 수 없습니다.');
      return;
    }
    const playlistName = `${title} (${origin.trim()}→${destination.trim()})`;
    const profilePayload = {
      commuteType: 'TO_WORK',
      transportMode: transportModeMap[mode],
      frequentRouteName: `${origin.trim()} → ${destination.trim()}`,
      departure: { ...start, placeName: origin.trim() },
      arrival: { ...end, placeName: destination.trim() },
    };
    createMutation.mutate(
      {
        memberId,
        name: playlistName,
        profilePayload,
        playlistPayload: {
          name: playlistName,
          size: tracks.length || 10,
          latitude: start.latitude,
          longitude: start.longitude,
        },
      },
      {
        onSuccess: ({ result, commuteProfileId }) => {
          const generated = result?.data ?? result?.playlist ?? result;
          const playlist = {
            ...generated,
            id: generated?.id ?? `commute-${Date.now()}`,
            title: generated?.name ?? playlistName,
            owner: 'ONBEAT Commute',
            type: 'commute',
            isCommute: true,
            origin: origin.trim(),
            destination: destination.trim(),
            mode,
            commuteProfileId,
            commuteMinutes: duration,
            totalSeconds: generated?.totalDurationSec ?? 0,
            tracks: generated?.tracks ?? generated?.items ?? tracks,
            totalSeconds: total,
            cover: tracks[0]?.art || '',
            createdAt: new Date().toISOString(),
          };
          const saved = JSON.parse(localStorage.getItem('onbeat-playlists') || '[]');
          localStorage.setItem('onbeat-playlists', JSON.stringify([playlist, ...saved]));
          localStorage.setItem('onbeat-commute-profile', JSON.stringify({
            origin: origin.trim(), destination: destination.trim(), mode, duration,
            commuteProfileId,
            playlistId: playlist.id,
          }));
          navigate('/library', { state: { createdPlaylist: playlist } });
        },
        onError: (error) => {
          const message = error?.response?.data?.message;
          setMessage(message || '통근 플레이리스트 생성에 실패했어요. API 요청값과 서버 로그를 확인해 주세요.');
        },
      }
    );
  };

  const toPoint = (p) => (p ? { lat: p.latitude, lng: p.longitude } : null);
  const mapStart = toPoint(selectedPlaces.origin ?? locationCoordinates[origin.trim()]);
  const mapEnd = toPoint(selectedPlaces.destination ?? locationCoordinates[destination.trim()]);

  return <div className="relative min-h-full bg-spotify-black px-4 pb-8 pt-2 text-white">
    <div className="mb-4 flex items-center justify-between">
      <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"><ArrowLeft size={23}/></button>
    </div>

    <div className="mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black"><Route size={17}/></span><div><h1 className="text-xl font-extrabold">통근 맞춤 플레이리스트</h1><p className="mt-0.5 text-[11px] text-spotify-subtext">이동 시간에 맞춰 음악을 자동 구성해요</p></div></div>

    <section className="mb-4 space-y-3 rounded-2xl border border-spotify-green/40  p-4">
      <div className="flex items-center justify-between"><span className="rounded-full border border-spotify-green/30 bg-spotify-green/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-spotify-green">통근 경로 설정</span><span className="text-[10px] text-spotify-subtext">경로 기반 맞춤 재생</span></div>
      <label className="block text-xs text-spotify-subtext">출발지 입력</label>
      <div className="relative"><MapPin size={16} className="absolute left-3 top-3.5 text-spotify-green"/><input value={origin} onChange={e=>handlePlaceSearch('origin', e.target.value)} onFocus={()=>setActivePlaceField('origin')} placeholder="예: 강남역" className="w-full rounded-xl border border-white/10 bg-spotify-card py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-spotify-green"/>{activePlaceField === 'origin' && placeResults.length > 0 && <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-spotify-dark p-1">{placeResults.map((place, index)=><button type="button" key={`${place.id ?? place.placeName}-${index}`} onClick={()=>selectPlace('origin', place)} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white/10">{place.placeName ?? place.name ?? place.addressName}</button>)}</div>}</div>
      <label className="block text-xs text-spotify-subtext">도착지 입력</label>
      <div className="relative"><MapPin size={16} className="absolute left-3 top-3.5 text-sky-400"/><input value={destination} onChange={e=>handlePlaceSearch('destination', e.target.value)} onFocus={()=>setActivePlaceField('destination')} placeholder="예: 판교역" className="w-full rounded-xl border border-white/10 bg-spotify-card py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-spotify-green"/>{activePlaceField === 'destination' && placeResults.length > 0 && <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-spotify-dark p-1">{placeResults.map((place, index)=><button type="button" key={`${place.id ?? place.placeName}-${index}`} onClick={()=>selectPlace('destination', place)} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white/10">{place.placeName ?? place.name ?? place.addressName}</button>)}</div>}</div>
      <div><p className="mb-2 text-xs text-spotify-subtext">이동 수단 선택</p><div className="grid grid-cols-4 gap-2">{modes.map(({label, Icon})=><button key={label} onClick={()=>setMode(label)} className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition ${mode===label?'border-spotify-green bg-spotify-green/20 text-spotify-green':'border-white/10 bg-spotify-card text-spotify-subtext hover:text-white'}`}><Icon size={17}/>{label}</button>)}</div></div>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3"><div className="mb-2 flex items-center justify-between text-xs font-bold"><span>예상 이동 시간</span><span className="text-spotify-green">{isEstimatingRoute ? '계산 중...' : duration ? `${duration}분 소요` : '-'}</span></div><div className="mt-1 flex justify-between text-[10px] text-spotify-subtext"></div><p className="text-[11px] text-spotify-subtext">{duration ? `추천 플레이리스트: 약 ${duration}분에 맞춰 자동 구성` : '출발지와 도착지를 선택하면 예상 이동 시간을 계산합니다.'}</p>{routeEstimateError && <p className="mt-2 text-[11px] text-amber-300">{routeEstimateError}</p>}</div>
    </section>

    <section className="mb-4 rounded-2xl border border-white/10 bg-spotify-dark p-3.5">
      <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="rounded-full bg-spotify-green px-2.5 py-1 text-[10px] font-extrabold text-black">통근 경로</span><span className="truncate text-xs font-bold">{origin || '출발지'} → {destination || '도착지'}</span></div><span className="shrink-0 text-[10px] text-spotify-subtext">{mode} · {duration ? `${duration}분` : '-'}</span></div>
      <div className="relative h-36 overflow-hidden rounded-xl border border-white/10"><KakaoRouteMap start={mapStart} end={mapEnd} /></div>
      <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><Clock3 size={17} className="text-spotify-green"/><div><p className="text-[10px] text-spotify-subtext">총 경로 소요시간</p><p className="text-xs font-bold">{isEstimatingRoute ? '계산 중...' : duration ? `${duration}분 소요 (${mode})` : '-'}</p></div></div><span className="rounded-md bg-spotify-green/20 px-2 py-1 text-[10px] font-bold text-spotify-green">{tracks.length}곡 구성</span></div>
    </section>

    <section className="mb-4 rounded-2xl border border-white/10 bg-spotify-card p-3.5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-800"><Music2 size={20}/></div><div className="min-w-0 flex-1"><h2 className="text-xs font-bold">{duration ? `${duration}분 맞춤 출근길 플레이리스트` : '맞춤 출근길 플레이리스트'}</h2><p className="mt-1 text-[11px] text-spotify-subtext">통근 시간과 경로에 어울리는 곡을 추천해드려요</p></div><button onClick={autoGenerate} className="flex shrink-0 items-center gap-1 text-xs font-bold text-spotify-green"><Sparkles size={14}/> 추천 곡 생성</button></div></section>

    <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2"><h2 className="text-xs font-extrabold uppercase tracking-wider text-spotify-subtext">담긴 곡 목록</h2><span className="text-[11px] font-mono text-spotify-green">{tracks.length}곡 · {mins(total)}분</span></div>
    {tracks.length===0 ? <div className="mb-5 space-y-2 py-7 text-center"><Music2 size={34} className="mx-auto text-neutral-600"/><p className="text-xs font-bold">아직 추가된 곡이 없어요</p><p className="text-[11px] text-spotify-subtext">자동 생성하거나 원하는 곡을 직접 추가해보세요.</p></div> : <div className="mb-5 space-y-1">{tracks.map((track,index)=><div key={track.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-spotify-dark/70 p-2"><span className="w-4 text-center text-xs text-spotify-subtext">{index+1}</span><img src={track.art} alt="" className="h-10 w-10 rounded-md object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist} · {mins(track.durationSec)}분</p></div><button onClick={()=>setTracks(curr=>curr.filter(t=>t.id!==track.id))} aria-label="곡 삭제" className="p-2 text-neutral-500 hover:text-red-400"><Trash2 size={15}/></button></div>)}</div>}

    <button onClick={()=>setShowAdd(true)} className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-xs font-extrabold text-black transition hover:scale-[1.01]"><Plus size={16} strokeWidth={3}/> 이 플레이리스트에 추가</button>
    <button onClick={save} disabled={createMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-full bg-spotify-green py-3.5 text-sm font-extrabold text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 size={18}/> {createMutation.isPending ? '생성 중...' : '경로 저장 및 음악 동기화'}</button>
    {message && <div className="mt-3 rounded-xl border border-spotify-green/20 bg-spotify-green/10 px-3 py-2.5 text-xs text-spotify-green">{message}<button onClick={()=>setMessage('')} className="float-right"><X size={14}/></button></div>}

    {showAdd && <div className="fixed inset-0 z-100 flex flex-col bg-spotify-black"><div className="border-b border-white/10 px-4 pb-3 pt-4"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-600"/><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-extrabold">플레이리스트에 추가하기</h2><button onClick={()=>setShowAdd(false)} aria-label="닫기"><X size={22}/></button></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-spotify-card px-3"><Search size={16} className="text-spotify-subtext"/><input value={search} onChange={e=>handleMusicSearch(e.target.value)} placeholder="무엇을 추가하시겠어요?" className="w-full bg-transparent py-3 text-xs outline-none"/></div></div><div className="flex-1 space-y-1 overflow-y-auto p-4">{isMusicSearching ? <p className="py-8 text-center text-xs text-spotify-subtext">검색 중...</p> : filteredTracks.length === 0 ? <p className="py-8 text-center text-xs text-spotify-subtext">곡명을 입력해 실제 음악을 검색해 주세요.</p> : filteredTracks.map(track=>{const added=tracks.some(t=>t.id===track.id);return <div key={track.id} className="flex items-center gap-3 border-b border-white/5 p-2"><img src={track.art} alt="" className="h-12 w-12 rounded-md object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{track.title}</p><p className="mt-0.5 text-[11px] text-spotify-subtext">{track.artist}</p></div><button onClick={()=>addTrack(track)} className={`flex h-9 w-9 items-center justify-center rounded-full ${added?'bg-spotify-green text-black':'border border-white/20 text-white hover:border-spotify-green hover:text-spotify-green'}`} aria-label={added?'이미 추가됨':'곡 추가'}>{added?<CheckCircle2 size={18}/>:<Plus size={18}/>}</button></div>})}</div><div className="border-t border-white/10 bg-spotify-dark p-4"><button onClick={()=>setShowAdd(false)} className="w-full rounded-full bg-white py-3 text-xs font-extrabold text-black">완료</button></div></div>}
  </div>;
}

