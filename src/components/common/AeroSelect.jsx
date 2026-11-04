import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function AeroSelect({ value, options, onValueChange, ariaLabel, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const closeFromOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeFromEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeFromOutside);
    document.addEventListener('keydown', closeFromEscape);
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromEscape);
    };
  }, []);

  const choose = (nextValue) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  return <div className={`aero-select ${open ? 'is-open' : ''} ${className}`} ref={rootRef}>
    <button type="button" className="aero-select-trigger" onClick={() => setOpen((current) => !current)} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}>
      <span>{value}</span><ChevronDown size={18} aria-hidden="true" />
    </button>
    {open && <div className="aero-select-menu" role="listbox" aria-label={ariaLabel}>
      {options.map((option) => <button type="button" key={option} role="option" aria-selected={option === value} className={option === value ? 'selected' : ''} onClick={() => choose(option)}>{option}</button>)}
    </div>}
  </div>;
}
