import React,{useEffect} from 'react';
import {X} from 'lucide-react';
export default function Modal({title,onClose,children}){
 useEffect(()=>{const handler=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[onClose]);
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="xp-modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-title"><b>{title}</b><button onClick={onClose} aria-label="닫기"><X size={22}/></button></div><div className="modal-content">{children}</div></div></div>;
}
