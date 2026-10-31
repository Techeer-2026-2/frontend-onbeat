import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Check, Globe, ListMusic, MoreHorizontal, Play, Plus,
  Share2, Shuffle, Music2, Trash2,
} from 'lucide-react';

import { addTracksToPlaylist, deletePlaylist as requestDeletePlaylist, deleteTrackFromPlaylist, getPlaylistDetail, updatePlaylist, updatePlaylistTrackOrder } from '../api/playlists';
import { normalizeMusicTrack, searchMusic } from '../api/music';
import { getApiErrorMessage } from '../api/client';
import { createPlaylistShare } from '../api/playlistShares';


const fmt = (sec) => `${Math.floor(sec / 60)}분`;
const fmtTrack = (sec) => `${Math.floor(sec / 60)}분 ${sec % 60}초`;

function normalizeTrack(track, index) {
  const rawDuration = track.durationSec ?? track.durationSeconds ?? track.duration ?? 0;
  const durationSec = typeof rawDuration === 'number'
    ? rawDuration
    : Number.parseInt(rawDuration, 10) || 0;

  return {
    id: String(track.id ?? track.trackId ?? `track-${index}`),
    trackId: track.trackId ?? track.id ?? null,
    title: track.title ?? track.name ?? track.trackName ?? '제목 없는 곡',
    artist: track.artist ?? track.artistName ?? track.artists?.map?.((artist) => artist.name ?? artist).join(', ') ?? '아티스트 정보 없음',
    durationSec,
    art: track.art ?? track.image ?? track.coverImageUrl ?? track.albumImageUrl ?? track.album?.imageUrl ?? '',
  };
}

function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const memberId = Number(import.meta.env.VITE_TEST_MEMBER_ID);
  const [deletingTrackId, setDeletingTrackId] = useState(null);
  const [isDeletingPlaylist, setIsDeletingPlaylist] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingPlaylist, setIsUpdatingPlaylist] = useState(false);
  const [isOrderingTracks, setIsOrderingTracks] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingTracks, setIsSearchingTracks] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['playlist', playlistId, memberId],
    queryFn: () => getPlaylistDetail(playlistId, memberId),
    enabled: Boolean(playlistId) && Number.isSafeInteger(memberId) && memberId > 0,
  });

  const playlist = data?.data ?? data?.playlist ?? data ?? {};
  const tracks = useMemo(() => {
    const playlistData = data?.data ?? data?.playlist ?? data ?? {};
    const rawTracks = playlistData.tracks ?? playlistData.trackList ?? playlistData.items ?? [];
    return Array.isArray(rawTracks) ? rawTracks.map(normalizeTrack) : [];
  }, [data]);
  useEffect(() => {
    if (!showTrackPicker || !trackQuery.trim()) { Promise.resolve().then(() => setSearchResults([])); return undefined; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsSearchingTracks(true);
      searchMusic(trackQuery).then((items) => {
        if (!cancelled) setSearchResults(items.map(normalizeMusicTrack));
      }).catch(() => { if (!cancelled) setSearchResults([]); }).finally(() => {
        if (!cancelled) setIsSearchingTracks(false);
      });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [showTrackPicker, trackQuery]);
  const title = playlist.name ?? playlist.title ?? '플레이리스트';
  const cover = playlist.coverImageUrl ?? playlist.imageUrl ?? playlist.cover ?? tracks[0]?.art ?? '';
  const totalSec = tracks.reduce((sum, track) => sum + track.durationSec, 0);

  const handleShare = async () => {
    if (isSharing) return;
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setNotice('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }
    setIsSharing(true);
    try {
      const result = await createPlaylistShare(playlistId, memberId);
      const shareToken = result?.shareToken ?? result?.data?.shareToken ?? result?.token;
      const shareUrl = result?.shareUrl ?? result?.url ?? result?.data?.shareUrl
        ?? (shareToken ? `${window.location.origin}/shared/playlists/${shareToken}` : window.location.href);
      await navigator.clipboard?.writeText(shareUrl);
      setNotice('플레이리스트 공유 링크를 복사했습니다.');
    } catch (error) {
      setNotice(getApiErrorMessage(error, '플레이리스트 공유 링크를 만들지 못했어요.'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setNotice('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }
    if (track.trackId == null) {
      setNotice('서버에서 곡 ID를 확인할 수 없어 삭제할 수 없습니다.');
      return;
    }
    if (deletingTrackId != null) return;
    setDeletingTrackId(track.trackId);
    try {
      await deleteTrackFromPlaylist(playlistId, track.trackId, memberId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['playlist', playlistId, memberId] }),
        queryClient.invalidateQueries({ queryKey: ['playlists'] }),
      ]);
      setNotice(`'${track.title}' 곡을 플레이리스트에서 삭제했습니다.`);
    } catch (error) {
      console.error('Playlist track deletion failed:', error);
      setNotice(error?.response?.data?.message || '곡 삭제에 실패했어요.');
    } finally {
      setDeletingTrackId(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setNotice('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }
    if (isDeletingPlaylist) return;
    setIsDeletingPlaylist(true);
    try {
      await requestDeletePlaylist(playlistId, memberId);
      try {
        const saved = JSON.parse(localStorage.getItem('onbeat-playlists') || '[]');
        localStorage.setItem('onbeat-playlists', JSON.stringify(saved.filter((item) => String(item.id) !== String(playlistId))));
      } catch (storageError) {
        console.error('Could not update local playlist cache after deletion:', storageError);
      }
      await queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setShowDeleteModal(false);
      navigate('/library', { replace: true });
    } catch (error) {
      console.error('Playlist deletion failed:', error);
      setNotice(error?.response?.data?.message || '플레이리스트 삭제에 실패했어요.');
    } finally {
      setIsDeletingPlaylist(false);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setNotice('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }
    if (isUpdatingPlaylist) return;

    const name = editName;
    if (!name.trim()) {
      setNotice('플레이리스트 이름을 입력해 주세요.');
      return;
    }

    setIsUpdatingPlaylist(true);
    try {
      await updatePlaylist(playlistId, memberId, {
        name: name.trim(),
        description: playlist.description ?? '',
        isPublic: typeof playlist.isPublic === 'boolean' ? playlist.isPublic : true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['playlist', playlistId, memberId] }),
        queryClient.invalidateQueries({ queryKey: ['playlists'] }),
      ]);
      setNotice('플레이리스트 정보를 수정했습니다.');
      setShowEditModal(false);
    } catch (error) {
      console.error('Playlist update failed:', error);
      setNotice(getApiErrorMessage(error, '플레이리스트 수정에 실패했어요.'));
    } finally {
      setIsUpdatingPlaylist(false);
    }
  };

  const handleToggleTrackOrder = async () => {
    if (isOrderingTracks || tracks.length < 2) return;
    setIsOrderingTracks(true);
    try {
      await updatePlaylistTrackOrder(playlistId, memberId, tracks.map((track) => track.trackId ?? track.id).reverse());
      await queryClient.invalidateQueries({ queryKey: ['playlist', playlistId, memberId] });
      setNotice('곡 순서를 변경했습니다.');
    } catch (error) {
      setNotice(getApiErrorMessage(error, '곡 순서를 변경하지 못했어요.'));
    } finally {
      setIsOrderingTracks(false);
    }
  };

  const handleAddTrack = async (track) => {
    if (addingTrackId != null) return;
    setAddingTrackId(track.id);
    try {
      await addTracksToPlaylist(playlistId, memberId, [{
        itunesTrackId: Number(track.itunesTrackId ?? track.id),
        trackName: track.title,
        artistName: track.artist,
        collectionName: track.collectionName ?? '',
        artworkUrl: track.image ?? '',
        previewUrl: track.previewUrl ?? '',
        trackTimeMillis: Number(track.trackTimeMillis ?? 0),
        genre: track.genre ?? 'Unknown',
      }]);
      await queryClient.invalidateQueries({ queryKey: ['playlist', playlistId, memberId] });
      setNotice(`'${track.title}' 곡을 추가했습니다.`);
    } catch (error) {
      setNotice(getApiErrorMessage(error, '곡 추가에 실패했어요.'));
    } finally { setAddingTrackId(null); }
  };

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
          <button type="button" aria-label="공유" onClick={handleShare} disabled={isSharing} className="p-1 hover:text-white disabled:opacity-50"><Share2 size={22} /></button>
          <button type="button" aria-label="플레이리스트 삭제" title="플레이리스트 삭제" onClick={() => setShowDeleteModal(true)} disabled={isDeletingPlaylist} className="p-1 text-spotify-subtext hover:text-red-400 disabled:opacity-50"><Trash2 size={21} /></button>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="셔플 재생" className="text-spotify-green"><Shuffle size={25} /></button>
          <button type="button" aria-label="재생" className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green text-black"><Play size={20} fill="currentColor" /></button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2">
        <button type="button" onClick={() => setShowTrackPicker(true)} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[11px] font-bold hover:bg-white/10"><Plus size={16} />추가</button>
        <button type="button" onClick={() => { setEditName(title); setShowEditModal(true); }} disabled={isUpdatingPlaylist} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[11px] font-bold hover:bg-white/10 disabled:opacity-50"><ListMusic size={16} />수정</button>
        <button type="button" onClick={handleToggleTrackOrder} disabled={isOrderingTracks || tracks.length < 2} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[11px] font-bold hover:bg-white/10 disabled:opacity-50"><Check size={16} />{isOrderingTracks ? '저장 중' : '정렬'}</button>
        <button type="button" onClick={() => setShowInfoModal(true)} className="flex min-w-0 items-center justify-center gap-1 rounded-full bg-spotify-card px-1.5 py-2.5 text-[10px] font-bold hover:bg-white/10"><MoreHorizontal size={16} />정보</button>
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
            <button type="button" aria-label={`${track.title} 플레이리스트에서 삭제`} onClick={() => handleDeleteTrack(track)} disabled={deletingTrackId != null} className="ml-2 p-1.5 text-neutral-500 transition hover:text-red-400 disabled:opacity-50"><Trash2 size={17} /></button>
          </div>
        ))}
      </section>

      {notice && <button type="button" role="status" onClick={() => setNotice('')} className="fixed left-4 right-4 top-12 z-70 mx-auto max-w-sm rounded-xl border border-black/10 bg-spotify-green px-4 py-3 text-left text-xs font-bold text-black shadow-2xl">{notice} <span className="float-right">×</span></button>}
      {showDeleteModal && <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 px-4"><div className="w-full max-w-sm rounded-2xl bg-spotify-card p-5"><h2 className="text-base font-bold">플레이리스트 삭제</h2><p className="mt-3 text-sm text-spotify-subtext">'{title}' 플레이리스트를 삭제할까요?</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-full bg-white/10 py-2.5 text-sm">취소</button><button type="button" onClick={handleDeletePlaylist} disabled={isDeletingPlaylist} className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white">{isDeletingPlaylist ? '삭제 중' : '삭제'}</button></div></div></div>}

      {showEditModal && <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 px-4"><div className="w-full max-w-sm rounded-2xl bg-spotify-card p-5"><h2 className="mb-4 text-base font-bold">플레이리스트 수정</h2><label htmlFor="playlist-name" className="mb-2 block text-xs text-spotify-subtext">플레이리스트 이름</label><input id="playlist-name" value={editName} onChange={(event) => setEditName(event.target.value)} className="w-full rounded-xl bg-spotify-dark px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-spotify-green" /><div className="mt-4 flex gap-2"><button type="button" onClick={() => setShowEditModal(false)} className="flex-1 rounded-full bg-white/10 py-2.5 text-sm">취소</button><button type="button" onClick={handleUpdatePlaylist} disabled={isUpdatingPlaylist} className="flex-1 rounded-full bg-spotify-green py-2.5 text-sm font-bold text-black">{isUpdatingPlaylist ? '저장 중' : '저장'}</button></div></div></div>}
      {showInfoModal && <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 px-4"><div className="w-full max-w-sm rounded-2xl bg-spotify-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-bold">플레이리스트 정보</h2><button type="button" onClick={() => setShowInfoModal(false)} aria-label="정보 닫기">닫기</button></div><div className="space-y-3 text-sm"><p><span className="text-spotify-subtext">이름</span><br />{title}</p><p><span className="text-spotify-subtext">수록 곡</span><br />{tracks.length}곡</p><p><span className="text-spotify-subtext">재생 시간</span><br />{fmt(totalSec)}</p></div></div></div>}

      <section className="space-y-3 pt-2">
        <h2 className="text-sm font-extrabold">추천 곡</h2>
        <p className="-mt-2 text-[11px] text-spotify-subtext">이 플레이리스트의 곡 기준</p>
        <p className="text-xs text-spotify-subtext">곡 추가 버튼으로 실제 음악 검색 결과를 확인하세요.</p>
      </section>
      {showTrackPicker && <div className="fixed inset-0 z-60 flex flex-col bg-spotify-black"><div className="border-b border-white/10 p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">곡 추가</h2><button type="button" onClick={() => setShowTrackPicker(false)}>닫기</button></div><input autoFocus value={trackQuery} onChange={(event) => setTrackQuery(event.target.value)} placeholder="곡 제목이나 아티스트 검색" className="w-full rounded-xl bg-spotify-card px-3 py-3 text-sm outline-none" /></div><div className="flex-1 space-y-2 overflow-y-auto p-4">{isSearchingTracks && <p className="text-center text-xs text-spotify-subtext">검색 중...</p>}{searchResults.map((track) => <div key={track.id} className="flex items-center gap-3 rounded-xl bg-spotify-card p-2"><img src={track.image} alt="" className="h-11 w-11 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{track.title}</p><p className="truncate text-xs text-spotify-subtext">{track.artist}</p></div><button type="button" onClick={() => handleAddTrack(track)} disabled={addingTrackId === track.id} className="rounded-full border border-white/20 px-3 py-2 text-xs">{addingTrackId === track.id ? '추가 중' : '추가'}</button></div>)}</div></div>}
    </div>
  );
}

export default PlaylistDetail;
