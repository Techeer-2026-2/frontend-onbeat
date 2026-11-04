import React,{useState} from 'react';
import {MapPin,TrainFront,Map as MapIcon,Clock3,Plus,Minus,LocateFixed,Check} from 'lucide-react';
import XpPanel from '../components/common/XpPanel';
import GlassButton from '../components/common/GlassButton';
import RouteManager from '../components/commute/RouteManager';
import {useOnBeat} from '../context/OnBeatContext';
export default function Map(){
 const {commute,setModal}=useOnBeat();const [zoom,setZoom]=useState(1);const openManager=()=>setModal({title:'내 통근 경로 관리',content:<RouteManager onClose={()=>setModal(null)}/>});
 return <div className="page map-page"><XpPanel title="나의 통근 지도 ♫" icon={MapPin} className="map-main-panel"><div className="map-canvas"><div className="map-image" style={{transform:`scale(${zoom})`}} role="img" aria-label={`${commute.origin}에서 ${commute.destination}까지의 통근 경로를 표시한 지도`}></div><div className="map-zoom"><button onClick={()=>setZoom(z=>Math.min(1.65,+(z+.15).toFixed(2)))} aria-label="지도 확대"><Plus size={23}/></button><button onClick={()=>setZoom(z=>Math.max(1,+(z-.15).toFixed(2)))} aria-label="지도 축소"><Minus size={23}/></button><button onClick={()=>setZoom(1)} aria-label="지도 초기화"><LocateFixed size={23}/></button></div></div></XpPanel>
 <XpPanel title="내 통근 경로" icon={TrainFront} className="saved-route-panel"><div className="saved-route-content"><img src="/assets/albums/subway.webp" alt="지하철 노선"/><div><h3>{commute.origin} → {commute.destination}</h3><p><TrainFront size={19}/> {commute.transport} · 예상 소요시간 {commute.estimatedMinutes}분</p><span className="route-saved"><Check size={18}/> 경로 저장 완료</span></div><GlassButton onClick={openManager} className="route-manage-btn"><MapIcon size={19}/> 경로 관리</GlassButton></div></XpPanel>
 <XpPanel title="현재 통근 상태 ♫" icon={TrainFront} className="status-panel"><div className="status-main"><img src="/assets/albums/subway-front.webp" alt="진행 중인 지하철"/><div className="status-copy"><h3><i className="live-dot"/> 현재 통근 중</h3><strong>{commute.origin} → {commute.destination}</strong><p><MapPin size={17}/> 현재 위치: {commute.currentStation}</p><p><Clock3 size={17}/> 남은 시간: 약 {commute.remainingMinutes}분</p></div><div className="progress-box"><span>진행률</span><strong>{commute.progress}%</strong></div></div><div className="progress-track big-progress"><span style={{width:`${commute.progress}%`}}/></div></XpPanel>
 </div>
}
