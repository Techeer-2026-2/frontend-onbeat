import React from 'react';
import {Outlet, useLocation,useNavigate} from 'react-router-dom';
import {Home,Search,Music2,MapPin,UserRound,Music} from 'lucide-react';
import {WinControls} from '../common/XpPanel';
import {useOnBeat} from '../../context/OnBeatContext';
import Modal from '../common/Modal';
import MusicPlayer from '../player/MusicPlayer';
const menus=[['/',Home,'홈'],['/search',Search,'검색'],['/library',Music2,'라이브러리'],['/map',MapPin,'지도'],['/my',UserRound,'마이']];
export default function AppLayout({children}){
 const nav=useNavigate();const {pathname}=useLocation();const {toast,modal,setModal,currentId}=useOnBeat();
 const active=pathname.startsWith('/playlist')?'/library':pathname;
 return <><div className="app-shell">
 <div className="main-win-title"><div className="window-app-name"><Music size={22} fill="white" strokeWidth={1.6}/><strong>OnBeat</strong><span>– Music for Your Commute</span></div><WinControls/></div>
 <div className={`hero-banner ${pathname==='/'?'hero-large':''}`}><img src={pathname==='/'?'/assets/logos/onbeat-banner.webp':'/assets/logos/onbeat-banner-compact.webp'} alt="OnBeat" /></div>
 <main className="page-content">{children ?? <Outlet />}</main>
 {currentId&&<MusicPlayer/>}
 <nav className="bottom-nav" aria-label="하단 내비게이션"><div className="nav-glass">
 {menus.map(([path,Icon,label])=><button key={path} className={`nav-button ${active===path?'active':''}`} onClick={()=>nav(path)} aria-current={active===path?'page':undefined}><Icon size={29} strokeWidth={2.4}/><span>{label}</span></button>)}
 </div></nav>
 </div>
 {toast&&<div className="toast" role="status">{toast}</div>}
 {modal&&<Modal title={modal.title} onClose={()=>setModal(null)}>{modal.content}</Modal>}
 </>
}
