import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {initialSongs,commuteSongIds} from '../data/mockSongs';
import {initialPlaylists,initialFavorites} from '../data/mockPlaylists';
import {initialCommute} from '../data/mockCommute';

const OnBeatContext=createContext(null);
const read=(key,fallback)=>{try{const val=localStorage.getItem('onbeat-'+key);return val?JSON.parse(val):fallback}catch{return fallback}};
export function OnBeatProvider({children}){
 const [playlists,setPlaylists]=useState(()=>read('playlists',initialPlaylists));
 const [favorites,setFavorites]=useState(()=>read('favorites',initialFavorites));
 const [commute,setCommute]=useState(()=>read('commute',initialCommute));
 const [recent,setRecent]=useState(()=>read('recent',['뉴진스','아이유','봄날','출근길','감성팝']));
 const [currentId,setCurrentId]=useState(null);
 const [isPlaying,setIsPlaying]=useState(false);
 const [position,setPosition]=useState(84);
 const [playQueue,setPlayQueue]=useState(commuteSongIds);
 const [toast,setToast]=useState('');
 const [modal,setModal]=useState(null);
 const songs=initialSongs;
 const getSong=(id)=>songs.find(song=>song.id===id);
 const currentSong=currentId?getSong(currentId):null;
 useEffect(()=>{localStorage.setItem('onbeat-playlists',JSON.stringify(playlists))},[playlists]);
 useEffect(()=>{localStorage.setItem('onbeat-favorites',JSON.stringify(favorites))},[favorites]);
 useEffect(()=>{localStorage.setItem('onbeat-commute',JSON.stringify(commute))},[commute]);
 useEffect(()=>{localStorage.setItem('onbeat-recent',JSON.stringify(recent))},[recent]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)},[toast]);
 const playSong=(id)=>{if(!getSong(id))return;setCurrentId(id);setIsPlaying(true);setPosition(0)};
 const playCollection=(ids)=>{const queue=ids.filter(id=>getSong(id));if(!queue.length)return;setPlayQueue(queue);setCurrentId(queue[0]);setIsPlaying(true);setPosition(0)};
 const togglePlay=()=>{if(currentId)setIsPlaying(p=>!p)};
 const skip=(direction)=>{if(!currentId)return;const queue=playQueue.length?playQueue:commuteSongIds;const index=queue.indexOf(currentId);const next=(index+direction+queue.length)%queue.length;setCurrentId(queue[next]);setPosition(0);setIsPlaying(true)};
 const toggleFavorite=(id)=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const addPlaylist=(data)=>{const p={...data,id:`custom-${Date.now()}`};setPlaylists(prev=>[p,...prev]);return p};
 const removePlaylists=(ids)=>{const targets=new Set(ids);setPlaylists(prev=>prev.filter(playlist=>!targets.has(playlist.id)))};
 const addRecent=(term)=>{const q=term.trim();if(q)setRecent(prev=>[q,...prev.filter(x=>x!==q)].slice(0,8))};
 const value=useMemo(()=>({songs,getSong,currentSong,currentId,isPlaying,position,setPosition,playSong,playCollection,togglePlay,skip,playlists,addPlaylist,removePlaylists,favorites,toggleFavorite,commute,setCommute,recent,setRecent,addRecent,toast,setToast,modal,setModal}),[currentSong,currentId,isPlaying,position,playQueue,playlists,favorites,commute,recent,toast,modal]);
 return <OnBeatContext.Provider value={value}>{children}</OnBeatContext.Provider>;
}
export const useOnBeat=()=>{const value=useContext(OnBeatContext);if(!value)throw new Error('OnBeatProvider가 필요합니다');return value};
