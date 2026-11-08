import React from 'react';
import {useNavigate} from 'react-router-dom';
import {UserRound,Heart,Music2,TrainFront,Settings} from 'lucide-react';
import XpPanel from '../components/common/XpPanel';
import {useOnBeat} from '../context/OnBeatContext';
export default function MyPage(){const nav=useNavigate();const {playlists,favorites,commute,setToast}=useOnBeat();return <div className="page my-page"><XpPanel title="마이페이지 ♫" icon={UserRound}><div className="my-avatar"><UserRound size={50}/></div><h2 className="my-name">OnBeat 사용자</h2><p className="my-sub">Music for Your Commute ♫</p><div className="my-stats"><div><strong>{playlists.length}</strong><span>플레이리스트</span></div><div><strong>{favorites.length}</strong><span>저장한 음악</span></div><div><strong>{commute.estimatedMinutes}분</strong><span>통근 시간</span></div></div></XpPanel><XpPanel title="빠른 메뉴" icon={Settings}><div className="my-actions"><button onClick={()=>nav('/library')}><Music2/> 내 라이브러리</button><button onClick={()=>nav('/playlist/commute/create')}><TrainFront/> 통근 플레이리스트 만들기</button><button onClick={()=>nav('/map')}><Heart/> 나의 통근 경로</button></div></XpPanel></div>}
