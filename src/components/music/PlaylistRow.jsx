import React from 'react';
import {MoreVertical,Play} from 'lucide-react';
import {useOnBeat} from '../../context/OnBeatContext';
import {durationLabel,totalTime} from '../../data/mockSongs';
export default function PlaylistRow({playlist,selectionMode=false,selected=false,onSelectionChange}){
 const {getSong,playSong,setModal}=useOnBeat();const songIds=Array.isArray(playlist?.songIds)?playlist.songIds:[];const songs=songIds.map(getSong).filter(Boolean);
 return <div className={`playlist-row ${selectionMode?'is-selecting':''}`}>{selectionMode&&<label className="playlist-selection-check"><input type="checkbox" checked={selected} onChange={event=>onSelectionChange?.(event.target.checked)} aria-label={`${playlist?.name||'플레이리스트'} 선택`}/><span aria-hidden="true">✓</span></label>}<img src={playlist?.cover} alt="플레이리스트 커버"/><div className="playlist-row-text"><strong>{playlist?.name}</strong><span>{songs.length}곡 · {durationLabel(totalTime(songs))}</span></div><button className="round-play" onClick={()=>songs[0]&&playSong(songs[0].id)} aria-label={`${playlist?.name||'플레이리스트'} 재생`}><Play size={19} fill="#0575e2"/></button><button className="icon-only" onClick={()=>setModal({title:playlist?.name,content:<><p>{playlist?.description}</p><p>{songs.length}곡 · {durationLabel(totalTime(songs))}</p><ul className="modal-song-list">{songs.map(song=><li key={song.id}>{song.title} — {song.artist}</li>)}</ul></>})} aria-label="플레이리스트 정보"><MoreVertical size={22}/></button></div>
}
