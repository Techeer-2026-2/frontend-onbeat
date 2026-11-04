import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft,Music2,Search,Image as ImageIcon,ListMusic,Disc3,Check} from 'lucide-react';
import XpPanel from '../components/common/XpPanel';
import SongRow from '../components/music/SongRow';
import {useOnBeat} from '../context/OnBeatContext';
import {durationLabel,totalTime} from '../data/mockSongs';
const covers=['/assets/albums/cd.webp','/assets/albums/headphones-meadow.webp','/assets/albums/shamrock.webp','/assets/albums/dolphin.webp','/assets/albums/blue-hour.webp'];
export default function CreatePlaylist(){
 const nav=useNavigate();const {songs,getSong,addPlaylist,setToast}=useOnBeat();
 const [name,setName]=useState('나만의 플레이리스트'),[description,setDescription]=useState('좋아하는 노래들을 모아둔 플레이리스트 ♫'),[cover,setCover]=useState(covers[0]),[chooseCover,setChooseCover]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState(['seven','supernova','how-sweet']);
 const found=songs.filter(s=>!query||`${s.title} ${s.artist}`.toLowerCase().includes(query.toLowerCase()));
 const add=id=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const remove=id=>setSelected(prev=>prev.filter(x=>x!==id));
 const submit=()=>{if(!name.trim()){setToast('플레이리스트 이름을 입력해 주세요.');return}if(!selected.length){setToast('음악을 한 곡 이상 선택해 주세요.');return}addPlaylist({name:name.trim(),description:description.trim(),cover,songIds:selected});setToast('플레이리스트가 생성되었습니다!');nav('/library')};
 return <div className="page create-page"><XpPanel title="새 플레이리스트 만들기 ♫" icon={Music2} action={<button className="back-pill" onClick={()=>nav('/library')}><ArrowLeft size={19}/></button>} className="create-details-panel">
 <div className="playlist-form"><div className="cover-edit"><img src={cover} alt="새 플레이리스트 커버"/><button onClick={()=>setChooseCover(!chooseCover)}><ImageIcon size={17}/> 커버 선택</button></div><div className="playlist-fields"><label>플레이리스트 이름 <span className="required">*</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={50}/></label><label>설명 (선택)<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3}/></label></div></div>
 {chooseCover&&<div className="cover-picker">{covers.map(img=><button className={cover===img?'selected':''} key={img} onClick={()=>{setCover(img);setChooseCover(false)}}><img src={img} alt="커버 디자인"/></button>)}</div>}
 </XpPanel>
 <XpPanel title="플레이리스트에 음악 추가하기 ♫" icon={Search} className="add-songs-panel"><div className="glossy-field song-filter"><Search size={23}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="노래, 아티스트 검색"/></div><div className="song-list add-song-list">{found.map(s=><SongRow key={s.id} song={s} showDuration action="add" onAdd={add} selected={selected.includes(s.id)}/>)}{!found.length&&<p className="empty-state">검색 결과가 없습니다.</p>}</div></XpPanel>
 <XpPanel title={`선택한 음악 (${selected.length}곡)`} icon={ListMusic} className="selected-panel"><div className="song-list">{selected.map((id,i)=><SongRow key={id} song={getSong(id)} rank={i+1} showDuration action="remove" onRemove={remove} draggable/>)}{!selected.length&&<p className="empty-state">위 목록에서 음악을 추가해 주세요.</p>}</div><div className="selected-total">총 {selected.length}곡 · {durationLabel(totalTime(selected.map(getSong)))}</div></XpPanel>
 <button className="giant-green-btn" onClick={submit}><Music2 size={28} fill="#277200"/> 플레이리스트 만들기</button>
 </div>
}
