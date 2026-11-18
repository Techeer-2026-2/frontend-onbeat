import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft,TrainFront,MapPin,ArrowDownUp,Clock3,Music2} from 'lucide-react';
import XpPanel from '../components/common/XpPanel';
import PlaceInput from '../components/commute/PlaceInput';
import AeroSelect from '../components/common/AeroSelect';
import {useOnBeat} from '../context/OnBeatContext';
import {useGenerateCommutePlaylist,useMainCommuteProfile,useRouteEstimate,useSaveCommuteProfile} from '../hooks/useCommute';
import {useRemovePlaylistTracks} from '../hooks/usePlaylists';
import {TRANSPORT_OPTIONS} from '../api/mappers';
import {secondsToTime,durationLabel,totalTime} from '../utils/time';

const AVERAGE_SONG_MINUTES=3.5; // 통근 시간으로 곡 수를 정할 때 쓰는 곡 평균 길이
const samePlace=(a,b)=>!!a&&!!b&&a.latitude===b.latitude&&a.longitude===b.longitude;

// 저장된 통근 프로필을 다 불러온 다음 폼을 그린다 (처음 값으로 프로필을 쓰기 위해)
export default function CreateCommutePlaylist(){
 const {profile,isLoading}=useMainCommuteProfile();
 if(isLoading)return <div className="page commute-create-page"><p className="empty-state">통근 정보를 불러오는 중...</p></div>;
 return <CommuteForm key={profile?.id??'new'} profile={profile}/>;
}

function CommuteForm({profile}){
 const nav=useNavigate();const {setToast,playCollection}=useOnBeat();
 const [origin,setOrigin]=useState(profile?.departure??null),[destination,setDestination]=useState(profile?.arrival??null),[transport,setTransport]=useState(profile?.transport??TRANSPORT_OPTIONS[0]);
 const [generated,setGenerated]=useState(null); // 서버가 만들어 준 통근 플레이리스트
 const [kept,setKept]=useState([]); // 남길 곡의 playlistTrackId
 const saveProfile=useSaveCommuteProfile(),generate=useGenerateCommutePlaylist(),removeTracks=useRemovePlaylistTracks();

 const route=useRouteEstimate({origin,destination,transport});
 const sameAsProfile=!!profile&&samePlace(profile.departure,origin)&&samePlace(profile.arrival,destination)&&profile.transport===transport;
 const minutes=route.data??(sameAsProfile?profile.averageMinutes:null);
 const songs=generated?.songs??[];
 const keptSongs=songs.filter(song=>kept.includes(song.playlistTrackId));
 const isBusy=saveProfile.isPending||generate.isPending||removeTracks.isPending;

 const recommend=async()=>{
  if(!origin||!destination){setToast('출발지와 도착지를 검색해서 목록에서 골라 주세요.');return}
  try{
   const saved=sameAsProfile?profile:await saveProfile.mutateAsync({profileId:profile?.id,origin,destination,transport});
   const size=Math.min(50,Math.max(5,Math.round((minutes??30)/AVERAGE_SONG_MINUTES)));
   const playlist=await generate.mutateAsync({commuteProfileId:saved.id,name:`${origin.placeName} → ${destination.placeName} 통근 음악`,size,origin});
   setGenerated(playlist);setKept((playlist.songs??[]).map(song=>song.playlistTrackId));
  }catch(error){setToast(error?.message||'통근 플레이리스트를 만들지 못했어요.')}
 };
 const finish=async()=>{
  if(!keptSongs.length){setToast('추천 음악을 한 곡 이상 선택해 주세요.');return}
  const removed=songs.filter(song=>!kept.includes(song.playlistTrackId)).map(song=>song.playlistTrackId);
  try{
   if(removed.length)await removeTracks.mutateAsync({playlistId:generated.id,playlistTrackIds:removed});
   setToast('통근 플레이리스트가 저장되었습니다!');nav('/library');
  }catch(error){setToast(error?.message||'곡을 정리하지 못했어요.')}
 };
 const toggle=id=>setKept(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const changeRoute=(setter)=>(value)=>{setter(value);setGenerated(null)};

 return <div className="page commute-create-page"><XpPanel title="나만의 통근 플레이리스트 ♫" icon={TrainFront} action={<button className="back-pill" onClick={()=>nav('/library')}><ArrowLeft size={19}/></button>} className="commute-route-panel">
 <div className="commute-route-form"><img className="commute-route-art" src="/assets/albums/subway.webp" alt="하늘을 달리는 지하철"/><div className="route-fields"><label><MapPin size={22}/> <b>출발지</b><PlaceInput value={origin} onChange={changeRoute(setOrigin)} ariaLabel="출발지" placeholder="예: 강남역"/></label><label><MapPin size={22}/> <b>도착지</b><PlaceInput value={destination} onChange={changeRoute(setDestination)} ariaLabel="도착지" placeholder="예: 판교역"/></label><label><TrainFront size={22}/><b>교통수단</b><AeroSelect value={transport} options={TRANSPORT_OPTIONS} onValueChange={changeRoute(setTransport)} ariaLabel="교통수단"/></label></div><button className="swap-route" onClick={()=>{setOrigin(destination);setDestination(origin);setGenerated(null)}} aria-label="출발 도착 교환"><ArrowDownUp size={24}/></button></div>
 </XpPanel>
 <XpPanel title="예상 이동 시간" icon={Clock3} className="time-panel"><div className="travel-time"><div className="digital-clock"><strong>{route.isFetching?'…':minutes??'--'}</strong><span>분</span></div><div className="time-description"><p>{route.isError?'소요시간을 계산하지 못했어요.':<>이동 시간에 딱 맞는<br/>통근 음악을 만들어드려요! ♫</>}</p><div className="progress-track"><span style={{width:'75%'}}/></div></div><img src="/assets/decorations/glossy-cd.webp" alt="CD 디스크"/></div></XpPanel>
 <XpPanel title="오늘의 통근 음악 ♫" icon={Music2} className="today-music-panel"><div className="commute-playlist-overview"><img src="/assets/albums/headphones-meadow.webp" alt="오늘의 추천 음악"/><div><h3>{origin?.placeName||'출발지'} → {destination?.placeName||'도착지'}</h3><p>{generated?generated.name:'추천 통근 플레이리스트'}</p><span>♫ {keptSongs.length}곡 · 총 {durationLabel(totalTime(keptSongs))}</span></div><button className="big-play" onClick={()=>keptSongs.length&&playCollection(keptSongs)} aria-label="추천 음악 재생" disabled={!keptSongs.length}>▶</button></div>
 <div className="song-list commute-song-list">{songs.map((s,i)=><div className="commute-track" key={s.playlistTrackId}><span>{i+1}</span><img src={s.cover} alt=""/><div><strong>{s.title}</strong><small>{s.artist}</small></div><span className="commute-track-duration">{secondsToTime(s.duration)}</span><button className={kept.includes(s.playlistTrackId)?'track-toggle selected':'track-toggle'} onClick={()=>toggle(s.playlistTrackId)} aria-label="추천곡 선택">{kept.includes(s.playlistTrackId)?'✓':'+'}</button></div>)}{!generated&&<p className="empty-state">{generate.isPending?'날씨와 시간대에 맞는 곡을 고르는 중...':'출발지·도착지를 정하고 아래 버튼을 눌러 추천을 받아 보세요.'}</p>}</div>
 <p className="music-help">{generated?'추천 플레이리스트는 이미 라이브러리에 만들어졌어요. 빼고 싶은 곡은 체크를 해제하고 저장하세요.':'날씨·시간대·주변 인기곡을 반영해 서버가 곡을 골라줘요.'}</p></XpPanel>
 <button className="giant-green-btn" onClick={generated?finish:recommend} disabled={isBusy}><Music2 size={27} fill="#267a00"/> {isBusy?'처리 중...':generated?'통근 플레이리스트 저장':'통근 음악 추천 받기'}</button></div>
}
