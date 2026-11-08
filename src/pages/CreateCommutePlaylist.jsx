import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft,TrainFront,MapPin,ArrowDownUp,Clock3,Music2,Disc3,Search} from 'lucide-react';
import XpPanel from '../components/common/XpPanel';
import SongRow from '../components/music/SongRow';
import {useOnBeat} from '../context/OnBeatContext';
import {commuteSongIds,secondsToTime,durationLabel,totalTime} from '../data/mockSongs';
import {travelMinutes} from '../data/mockCommute';
import AeroSelect from '../components/common/AeroSelect';
export default function CreateCommutePlaylist(){
 const nav=useNavigate();const {getSong,addPlaylist,commute,setCommute,setToast,playSong}=useOnBeat();
 const [origin,setOrigin]=useState(commute.origin),[destination,setDestination]=useState(commute.destination),[transport,setTransport]=useState(commute.transport),[minutes,setMinutes]=useState(commute.estimatedMinutes);
 const [selected,setSelected]=useState(commuteSongIds);
 const songs=selected.map(getSong).filter(Boolean);
 const calc=(a,b,mode)=>travelMinutes[`${a.trim()}-${b.trim()}`]||({지하철:32,버스:45,도보:61,자동차:38}[mode]||32);
 const updateRoute=(a,b,mode)=>{setOrigin(a);setDestination(b);setTransport(mode);setMinutes(calc(a,b,mode))};
 const create=()=>{if(!origin.trim()||!destination.trim()){setToast('출발지와 도착지를 입력해 주세요.');return}if(!selected.length){setToast('추천 음악을 한 곡 이상 선택해 주세요.');return}addPlaylist({name:`${origin} → ${destination} 통근 음악`,description:`${transport} · 예상 ${minutes}분 · 나만의 통근 플레이리스트`,songIds:selected,cover:'/assets/albums/headphones-meadow.webp',isCommute:true});setCommute(prev=>({...prev,origin,destination,transport,estimatedMinutes:minutes}));setToast('통근 플레이리스트가 생성되었습니다!');nav('/library')};
 return <div className="page commute-create-page"><XpPanel title="나만의 통근 플레이리스트 ♫" icon={TrainFront} action={<button className="back-pill" onClick={()=>nav('/library')}><ArrowLeft size={19}/></button>} className="commute-route-panel">
 <div className="commute-route-form"><img className="commute-route-art" src="/assets/albums/subway.webp" alt="하늘을 달리는 지하철"/><div className="route-fields"><label><MapPin size={22}/> <b>출발지</b><div className="field-end"><input value={origin} onChange={e=>updateRoute(e.target.value,destination,transport)} aria-label="출발지"/><Search size={19}/></div></label><label><MapPin size={22}/> <b>도착지</b><div className="field-end"><input value={destination} onChange={e=>updateRoute(origin,e.target.value,transport)} aria-label="도착지"/><Search size={19}/></div></label><label><TrainFront size={22}/><b>교통수단</b><AeroSelect value={transport} options={['지하철','버스','도보','자동차']} onValueChange={value=>updateRoute(origin,destination,value)} ariaLabel="교통수단"/></label></div><button className="swap-route" onClick={()=>updateRoute(destination,origin,transport)} aria-label="출발 도착 교환"><ArrowDownUp size={24}/></button></div>
 </XpPanel>
 <XpPanel title="예상 이동 시간" icon={Clock3} className="time-panel"><div className="travel-time"><div className="digital-clock"><strong>{minutes}</strong><span>분</span></div><div className="time-description"><p>이동 시간에 딱 맞는<br/>통근 음악을 만들어드려요! ♫</p><div className="progress-track"><span style={{width:'75%'}}/></div></div><img src="/assets/decorations/glossy-cd.webp" alt="CD 디스크"/></div></XpPanel>
 <XpPanel title="오늘의 통근 음악 ♫" icon={Music2} className="today-music-panel"><div className="commute-playlist-overview"><img src="/assets/albums/headphones-meadow.webp" alt="오늘의 추천 음악"/><div><h3>{origin||'출발지'} → {destination||'도착지'}</h3><p>추천 통근 플레이리스트</p><span>♫ {selected.length}곡 · 총 {durationLabel(totalTime(songs))}</span></div><button className="big-play" onClick={()=>selected[0]&&playSong(selected[0])} aria-label="추천 음악 재생">▶</button></div><div className="song-list commute-song-list">{commuteSongIds.slice(0,5).map((id,i)=>{const s=getSong(id);return <div className="commute-track" key={id}><span>{i+1}</span><img src={s.cover} alt=""/><div><strong>{s.title}</strong><small>{s.artist}</small></div><span className="commute-track-duration">{secondsToTime(s.duration)}</span><button className={selected.includes(id)?'track-toggle selected':'track-toggle'} onClick={()=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])} aria-label="추천곡 선택">{selected.includes(id)?'✓':'+'}</button></div>})}</div><p className="music-help">노래를 선택하거나 해제하여 통근 음악을 구성할 수 있어요.</p></XpPanel>
 <button className="giant-green-btn" onClick={create}><Music2 size={27} fill="#267a00"/> 통근 플레이리스트 만들기</button></div>
}
