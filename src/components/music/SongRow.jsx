import React from 'react';
import {Play,Plus,Check, X, Heart,GripVertical,MoreVertical} from 'lucide-react';
import {secondsToTime} from '../../data/mockSongs';
import {useOnBeat} from '../../context/OnBeatContext';
export function PlayBubble({songId,className=''}){const {playSong}=useOnBeat();return <button className={`round-play ${className}`} onClick={()=>playSong(songId)} aria-label="곡 재생"><Play size={19} fill="#0575e2"/></button>}
export default function SongRow({song,rank,showDuration=false,action='menu',onAdd,onRemove,selected=false,draggable=false,compact=false,onSongClick}){
 const {toggleFavorite,favorites,setToast,setModal}=useOnBeat();
 const showMenu=()=>setModal({title:'곡 정보',content:<div className="song-dialog"><img src={song.cover} alt=""/><h3>{song.title}</h3><p>{song.artist}</p><p>재생 시간 {secondsToTime(song.duration)}</p><button className="glass-btn glass-blue" onClick={()=>{toggleFavorite(song.id);setModal(null);setToast('저장한 음악이 변경되었습니다.')}}><Heart size={17}/> {favorites.includes(song.id)?'좋아요 해제':'좋아요'}</button></div>});
 return <div className={`song-row ${compact?'song-row-compact':''}`}>
 {draggable&&<GripVertical className="drag-handle" size={20}/>} {rank!==undefined&&<b className="song-rank">{rank}</b>}
 <img className="song-cover" src={song.cover} alt={`${song.title} 앨범 커버`} />
 <div className={`song-text ${onSongClick?'song-text-clickable':''}`} onClick={onSongClick}><strong>{song.title}</strong><span>{song.artist}</span>{!showDuration&&action==='menu'&&<small>{secondsToTime(song.duration)} · 곡</small>}</div>
 {showDuration&&<span className="song-duration">{secondsToTime(song.duration)}</span>}
 {action==='favorite'&&<button className={`heart-button ${favorites.includes(song.id)?'liked':''}`} onClick={()=>toggleFavorite(song.id)} aria-label="좋아요"><Heart size={24} fill={favorites.includes(song.id)?'#f770c2':'transparent'}/></button>}
 <PlayBubble songId={song.id}/>
 {action==='menu'&&<button className="icon-only" onClick={showMenu} aria-label="옵션"><MoreVertical size={21}/></button>}
 {action==='add'&&<button className={`round-add ${selected?'added':''}`} onClick={()=>onAdd(song.id)} aria-label={selected?'음악 선택됨':'음악 추가'}>{selected?<Check size={21}/>:<Plus size={21}/>}</button>}
 {action==='remove'&&<button className="round-remove" onClick={()=>onRemove(song.id)} aria-label="음악 제거"><X size={21}/></button>}
 </div>
}
