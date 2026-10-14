import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { addTracksToPlaylist, generateCustomPlaylist } from '../api/playlists';
import { playlistTracks as MASTER_TRACKS } from '../mocks/tracks';
import {
  ArrowLeft, Check, ChevronDown, Globe, ListMusic, Plus, Search, Share2,
  Music2, X, Trash2, Play,
} from 'lucide-react';

const fmt = (sec) => `${Math.floor(sec / 60)}분`;
const fmtTrack = (sec) => `${Math.floor(sec / 60)}분 ${sec % 60}초`;

function PlaylistCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rawMemberId = import.meta.env.VITE_TEST_MEMBER_ID;
  const memberId = rawMemberId ? Number(rawMemberId) : undefined;
  const [title, setTitle] = useState('내 플레이리스트');
  const [tracks, setTracks] = useState([]);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');
  const [cover, setCover] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [createdPlaylist, setCreatedPlaylist] = useState(null);
  const totalSec = tracks.reduce((sum, t) => sum + t.durationSec, 0);
  const available = useMemo(() => MASTER_TRACKS.filter(t => !tracks.some(added => added.id === t.id)).slice(0, 5), [tracks]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MASTER_TRACKS.filter(t => !q || `${t.title} ${t.artist}`.toLowerCase().includes(q));
  }, [query]);

  const addTrack = (track) => {
    if (tracks.some(t => t.id === track.id)) {
      setNotice('이미 플레이리스트에 담긴 곡입니다.');
      return;
    }
    setTracks(current => [...current, track]);
    if (!cover) setCover(track.art);
    setNotice(`'${track.title}' 곡이 추가되었습니다.`);
  };
  const removeTrack = (id) => {
    setTracks(current => current.filter(t => t.id !== id));
    setNotice('곡이 플레이리스트에서 삭제되었습니다.');
  };
  const rename = () => {
    const value = window.prompt('플레이리스트 이름을 입력하세요:', title);
    if (value?.trim()) setTitle(value.trim());
  };
  const save = async () => {
    if (isSaving) return;
    if (!title.trim()) return setNotice('플레이리스트 이름을 입력해 주세요.');
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setNotice('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // Keep a successfully created playlist so retrying a failed track request never creates a duplicate.
      let pending = createdPlaylist;
      if (!pending) {
        let result;
        try {
          result = await generateCustomPlaylist({ name: title.trim() });
        } catch (error) {
          console.error('Playlist creation failed:', error);
          setNotice(error?.response?.data?.message || '플레이리스트 생성에 실패했어요.');
          return;
        }
        const payload = result?.data ?? result?.playlist ?? result;
        const playlistId = payload?.id ?? payload?.playlistId;
        if (playlistId == null) {
          console.error('Playlist creation response did not include an ID:', result);
          setNotice('플레이리스트는 생성됐지만 서버 응답에서 ID를 확인하지 못했어요. 중복 생성을 막기 위해 다시 생성하지 말고 서버 목록을 확인해 주세요.');
          return;
        }
        pending = { id: playlistId, result: payload };
        setCreatedPlaylist(pending);
        await queryClient.invalidateQueries({ queryKey: ['playlists'] });
      }

      if (tracks.length) {
        const dtoTracks = tracks.map((track) => {
          // Test-only mapping for the local MASTER_TRACKS mock data. These IDs are
          // synthetic and must be replaced when real iTunes search data is wired in.
          const mockId = /^tr-(\d+)$/.exec(String(track.id))?.[1];
          const itunesTrackId = Number(track.itunesTrackId ?? (mockId ? `900000000000000${mockId}` : NaN));
          const durationSec = Number(track.durationSec);
          if (!Number.isSafeInteger(itunesTrackId) || itunesTrackId <= 0 || !Number.isFinite(durationSec) || durationSec <= 0) {
            throw new Error(`'${track.title}'의 테스트 곡 정보가 올바르지 않습니다.`);
          }
          return {
            itunesTrackId,
            trackName: track.trackName ?? track.title,
            artistName: track.artistName ?? track.artist,
            collectionName: track.collectionName ?? '테스트 앨범',
            artworkUrl: track.artworkUrl ?? track.art ?? '',
            previewUrl: track.previewUrl ?? '',
            trackTimeMillis: Math.round(durationSec * 1000),
          };
        });
        try {
          await addTracksToPlaylist(pending.id, memberId, dtoTracks);
        } catch (error) {
          console.error('Adding playlist tracks failed:', error);
          setNotice(error?.response?.data?.message || `${error.message || '곡 추가에 실패했어요.'} 플레이리스트는 생성됐습니다. 곡을 수정한 뒤 저장을 눌러 곡 추가만 재시도하세요.`);
          return;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['playlists'] });
      const result = pending.result;
      const playlist = {
        ...result,
        id: pending.id,
        title: result?.name ?? title.trim(),
        tracks,
        totalSeconds: totalSec,
        cover: cover || tracks[0]?.art || '',
        createdAt: new Date().toISOString(),
        type: 'playlist',
        isCommute: false,
      };
      const saved = JSON.parse(localStorage.getItem('onbeat-playlists') || '[]');
      localStorage.setItem('onbeat-playlists', JSON.stringify([playlist, ...saved.filter((item) => String(item.id) !== String(playlist.id))]));
      setNotice('플레이리스트가 저장되었습니다.');
      navigate('/library', { state: { createdPlaylist: playlist } });
    } catch (error) {
      console.error('Playlist save validation failed:', error);
      setNotice(error.message || '선택한 곡 정보를 확인해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-full bg-spotify-black px-4 pb-8 pt-2 text-white">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"><ArrowLeft size={23} /></button>
      </div>

      <div className="mb-4 flex items-start gap-4">
        <button onClick={rename} aria-label="커버 변경" className="group relative flex h-28 w-28 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-800 text-spotify-subtext shadow-xl">
          {cover ? <img src={cover} alt="플레이리스트 커버" className="absolute inset-0 h-full w-full object-cover" /> : <><ListMusic size={30} className="mb-1" /><span className="text-[9px] font-bold">변경하기</span></>}
          <span className="absolute inset-0 hidden items-center justify-center bg-black/50 group-hover:flex"><span className="text-xs font-bold">변경하기</span></span>
        </button>
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="flex items-center justify-between gap-1">
            <h1 className="truncate text-xl font-extrabold tracking-tight">{title}</h1>
            <button onClick={rename} className="shrink-0 rounded-full border border-white/10 bg-spotify-card px-2.5 py-1 text-[10px] font-bold text-spotify-subtext hover:text-white">변경하기</button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-black">이</span>
            <span className="text-xs font-bold">이유민</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 font-mono text-xs text-spotify-subtext">
            <Globe size={14} /> {tracks.length}곡 • {fmt(totalSec)}
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <button onClick={() => { setQuery(''); setShowAdd(true); }} className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold text-black shadow-xl transition hover:scale-105 active:scale-95"><Plus size={16} strokeWidth={3} /> 이 플레이리스트에 추가</button>
      </div>

      <section className="mb-6 space-y-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-spotify-subtext">담긴 곡 목록</h2>
          <span className="font-mono text-[11px] text-spotify-green">{tracks.length}곡</span>
        </div>
        {tracks.length === 0 ? (
          <div className="space-y-2 py-8 text-center">
            <Music2 size={40} className="mx-auto text-neutral-600" />
            <p className="text-xs font-bold">아직 추가된 곡이 없어요</p>
            <p className="text-[11px] text-spotify-subtext">위의 추가 버튼이나 아래 추천 곡을 클릭해보세요.</p>
          </div>
        ) : tracks.map((track, index) => (
          <div key={track.id} className="group flex items-center justify-between rounded-xl border border-white/5 bg-spotify-dark/60 p-2 transition hover:bg-white/10">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="w-4 shrink-0 text-center font-mono text-xs font-bold text-spotify-subtext">{index + 1}</span>
              <img src={track.art} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover shadow" />
              <div className="min-w-0"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist} · {fmtTrack(track.durationSec)}</p></div>
            </div>
            <button onClick={() => removeTrack(track.id)} aria-label={`${track.title} 삭제`} className="ml-2 p-1.5 text-neutral-500 transition hover:text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
      </section>

      <section className="space-y-3 pt-2">
        <h2 className="text-sm font-extrabold">추천 곡</h2>
        {available.map(track => (
          <div key={track.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-spotify-card/50 p-2 transition hover:bg-white/5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img src={track.art} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover shadow" />
              <div className="min-w-0"><p className="truncate text-xs font-bold">{track.title}</p><p className="truncate text-[11px] text-spotify-subtext">{track.artist}</p></div>
            </div>
            <button onClick={() => addTrack(track)} aria-label={`${track.title} 추가`} className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition hover:border-spotify-green hover:text-spotify-green"><Plus size={16} /></button>
          </div>
        ))}
      </section>

      {notice && <button onClick={() => setNotice('')} role="status" className="fixed left-4 right-4 top-12 z-70 mx-auto max-w-sm rounded-xl border border-black/10 bg-spotify-green px-4 py-3 text-left text-xs font-bold text-black shadow-2xl">{notice} <span className="float-right">×</span></button>}

      {showAdd && (
        <div className="fixed inset-0 z-60 mx-auto flex w-full max-w-md flex-col overflow-hidden bg-spotify-black shadow-2xl">
          <div className="shrink-0 border-b border-white/10 px-4 pb-2 pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-600" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex-1 text-center text-base font-extrabold">플레이리스트에 추가하기</h2>
              <button onClick={() => setShowAdd(false)} aria-label="닫기" className="p-1 text-spotify-subtext hover:text-white"><X size={23} /></button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="shrink-0 rounded-full bg-spotify-green px-3.5 py-1.5 text-xs font-extrabold text-black">곡</span>
              <span className="shrink-0 rounded-full border border-white/10 bg-spotify-card px-3.5 py-1.5 text-xs">좋아요 표시한 곡에 포함됨</span>
            </div>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-4">
            {results.map(track => {
              const added = tracks.some(t => t.id === track.id);
              return <div key={track.id} className="flex items-center justify-between border-b border-white/5 p-2.5">
                <div className="flex min-w-0 items-center gap-3"><img src={track.art} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" /><div className="min-w-0"><p className="truncate text-xs font-bold">{track.title}</p><p className="mt-0.5 truncate text-[11px] text-spotify-subtext">{track.artist}</p></div></div>
                <button onClick={() => { added ? removeTrack(track.id) : addTrack(track); }} className={`ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${added ? 'bg-spotify-green text-black' : 'border border-white/20 text-white hover:border-spotify-green hover:text-spotify-green'}`}>{added ? <Check size={18} /> : <Plus size={19} />}</button>
              </div>;
            })}
          </div>
          <div className="shrink-0 border-t border-white/10 bg-spotify-dark/95 p-4 backdrop-blur-md">
            <div className="relative"><Search size={16} className="absolute left-3.5 top-3.5 text-neutral-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="무엇을 추가하시겠어요?" className="w-full rounded-xl border border-white/10 bg-spotify-card py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-spotify-green" /></div>
            <button onClick={() => setShowAdd(false)} className="mt-3 w-full rounded-full bg-spotify-green py-3 text-xs font-extrabold text-black">완료 · {tracks.length}곡</button>
          </div>
        </div>
      )}
      <div className="mt-5 flex justify-end"><button onClick={save} disabled={isSaving} className="flex items-center gap-2 rounded-full bg-spotify-green px-5 py-2.5 text-xs font-extrabold text-black disabled:cursor-not-allowed disabled:opacity-60"><Check size={15} /> {isSaving ? '저장 중...' : '저장'}</button></div>
    </div>
  );
}

export default PlaylistCreate;

