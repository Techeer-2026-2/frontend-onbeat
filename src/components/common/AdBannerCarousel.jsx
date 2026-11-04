import React,{useEffect,useRef,useState} from 'react';
import {homeAdBanners} from '../../data/mockBanners';

const SLIDE_DELAY=4000;
const SWIPE_THRESHOLD=36;

export default function AdBannerCarousel({banners=homeAdBanners}){
 const [index,setIndex]=useState(0);const [isTransitioning,setIsTransitioning]=useState(false);const startX=useRef(null);const dragged=useRef(false);const unlockTimer=useRef(null);
 const changeTo=(next)=>{if(isTransitioning||!banners.length)return;setIsTransitioning(true);setIndex((next+banners.length)%banners.length);unlockTimer.current=window.setTimeout(()=>setIsTransitioning(false),460)};
 useEffect(()=>{const timer=window.setTimeout(()=>changeTo(index+1),SLIDE_DELAY);return()=>window.clearTimeout(timer)},[index,banners.length]);
 useEffect(()=>()=>window.clearTimeout(unlockTimer.current),[]);
 const begin=(event)=>{startX.current=event.clientX;dragged.current=false;event.currentTarget.setPointerCapture?.(event.pointerId)};
 const end=(event)=>{if(startX.current===null)return;const distance=event.clientX-startX.current;startX.current=null;if(Math.abs(distance)>8)dragged.current=true;if(Math.abs(distance)>=SWIPE_THRESHOLD)changeTo(index+(distance<0?1:-1))};
 const clickBanner=(event,banner)=>{if(dragged.current){event.preventDefault();dragged.current=false;return}if(!banner.link)event.preventDefault()};
 if(!banners.length)return null;
 return <section className="ad-banner-carousel" aria-label="추천 프로모션">
  <div className="ad-banner-viewport" onPointerDown={begin} onPointerUp={end} onPointerCancel={()=>{startX.current=null}}>
   <div className="ad-banner-track" style={{transform:`translateX(-${index*100}%)`}}>
    {banners.map((banner)=><a className="ad-banner-slide" key={banner.id} href={banner.link||undefined} onClick={(event)=>clickBanner(event,banner)} aria-label={banner.link?banner.alt:`${banner.alt} (연결된 링크 없음)`}><img src={banner.image} alt={banner.alt}/></a>)}
   </div>
  </div>
  <div className="ad-banner-dots" role="tablist" aria-label="광고 배너 선택">
   {banners.map((banner,dotIndex)=><button key={banner.id} type="button" className={dotIndex===index?'active':''} onClick={()=>changeTo(dotIndex)} role="tab" aria-selected={dotIndex===index} aria-label={`${dotIndex+1}번 배너 보기`}/>) }
  </div>
 </section>;
}
