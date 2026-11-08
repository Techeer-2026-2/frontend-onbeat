import React from 'react';
export default function GlassButton({children,onClick,variant='blue',className='',disabled=false,type='button',title}){
 return <button type={type} title={title} disabled={disabled} onClick={onClick} className={`glass-btn glass-${variant} ${className}`}>{children}</button>
}
