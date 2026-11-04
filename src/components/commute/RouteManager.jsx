import React,{useState} from 'react';
import {useOnBeat} from '../../context/OnBeatContext';
import GlassButton from '../common/GlassButton';
import AeroSelect from '../common/AeroSelect';
export default function RouteManager({onClose}){const {commute,setCommute,setToast}=useOnBeat();const [data,setData]=useState({...commute});const set=(key,value)=>setData(prev=>({...prev,[key]:value}));
 const save=()=>{if(!data.origin.trim()||!data.destination.trim()){setToast('출발지와 도착지를 입력해 주세요.');return}setCommute(data);setToast('통근 경로가 저장되었습니다.');onClose()};
 return <div className="route-manager"><label>출발지<input value={data.origin} onChange={e=>set('origin',e.target.value)}/></label><label>도착지<input value={data.destination} onChange={e=>set('destination',e.target.value)}/></label><label>현재 위치<input value={data.currentStation} onChange={e=>set('currentStation',e.target.value)}/></label><label>이동수단<AeroSelect value={data.transport} options={['지하철','버스','도보','자동차']} onValueChange={value=>set('transport',value)} ariaLabel="이동수단"/></label><label>예상 이동 시간 (분)<input type="number" min="1" max="240" value={data.estimatedMinutes} onChange={e=>set('estimatedMinutes',Number(e.target.value))}/></label><GlassButton onClick={save}>✓ 경로 저장</GlassButton></div>
}
