import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FolderHeart,Music2,Heart,Plus,TrainFront,Trash2,CheckSquare,Square} from 'lucide-react';
import XpPanel from '../components/common/XpPanel';
import PlaylistRow from '../components/music/PlaylistRow';
import SongRow from '../components/music/SongRow';
import {useOnBeat} from '../context/OnBeatContext';
export default function Library(){
 const nav=useNavigate();const {playlists,favorites,getSong,removePlaylists,setToast,setModal}=useOnBeat();const [tab,setTab]=useState('playlists');const [selectionMode,setSelectionMode]=useState(false);const [selectedIds,setSelectedIds]=useState([]);const playlistItems=Array.isArray(playlists)?playlists:[];const allSelected=playlistItems.length>0&&selectedIds.length===playlistItems.length;
 const toggleSelection=(id)=>setSelectedIds(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);
 const finishSelection=()=>{setSelectionMode(false);setSelectedIds([])};
 const toggleAll=()=>setSelectedIds(allSelected?[]:playlistItems.map(playlist=>playlist.id));
 const confirmDelete=()=>{const count=selectedIds.length;removePlaylists(selectedIds);setModal(null);finishSelection();setToast(`${count}개의 플레이리스트를 삭제했습니다.`)};
 const requestDelete=()=>{if(!selectedIds.length)return;setModal({title:'선택한 플레이리스트 삭제',content:<div className="playlist-delete-confirm"><Trash2 size={38}/><p><strong>{selectedIds.length}개</strong>의 플레이리스트를 삭제할까요?</p><small>삭제한 플레이리스트는 되돌릴 수 없습니다.</small><div><button className="glass-btn playlist-delete-cancel" onClick={()=>setModal(null)}>취소</button><button className="playlist-delete-confirm-btn" onClick={confirmDelete}>삭제</button></div></div>})};
 return <div className="page library-page">
 <XpPanel title="내 플레이리스트 ♫" icon={FolderHeart} className="library-main-panel"><div className="large-tabs"><button className={tab==='playlists'?'active':''} onClick={()=>setTab('playlists')}><Music2 size={20}/> 내 플레이리스트</button><button className={tab==='saved'?'active':''} onClick={()=>setTab('saved')}><Heart size={20} fill="#ee83c5"/> 저장한 음악</button></div>
 {tab==='playlists'?<><div className="playlist-selection-toolbar">{selectionMode?<><button onClick={toggleAll}>{allSelected?<CheckSquare size={17}/>:<Square size={17}/>} {allSelected?'전체 해제':'전체 선택'}</button><span>{selectedIds.length}개 선택됨</span><button onClick={finishSelection}>취소</button></>:<button onClick={()=>setSelectionMode(true)}><Trash2 size={16}/> 선택 삭제</button>}</div><div className="playlist-list">{playlistItems.map(p=><PlaylistRow key={p.id} playlist={p} selectionMode={selectionMode} selected={selectedIds.includes(p.id)} onSelectionChange={()=>toggleSelection(p.id)}/>)}</div>{selectionMode&&<button className="playlist-delete-action" disabled={!selectedIds.length} onClick={requestDelete}><Trash2 size={19}/> 선택한 플레이리스트 삭제{selectedIds.length?` (${selectedIds.length})`:''}</button>}</>:<div className="song-list">{favorites.map(id=>getSong(id)).filter(Boolean).map(s=><SongRow key={s.id} song={s} action="favorite"/>)}{!favorites.length&&<p className="empty-state">저장한 음악이 없습니다.</p>}</div>}
 <div className="library-add-actions"><button onClick={()=>nav('/playlist/create')}><Plus size={17}/> 일반 플레이리스트 만들기</button><button onClick={()=>nav('/playlist/commute/create')}><TrainFront size={17}/> 통근 플레이리스트 만들기</button></div>
 </XpPanel>
 <XpPanel title={`저장한 음악 ♥`} icon={Music2} action={<span className="count-label">총 {favorites.length}곡</span>} className="library-favorites-panel"><div className="song-list">{favorites.map(id=>getSong(id)).filter(Boolean).map(song=><SongRow key={song.id} song={song} showDuration action="favorite"/>)}{!favorites.length&&<p className="empty-state">하트를 눌러 좋아하는 노래를 저장해 보세요.</p>}</div></XpPanel>
 </div>
}
