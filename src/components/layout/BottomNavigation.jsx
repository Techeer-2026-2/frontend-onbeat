import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  House,
  Search,
  Library,
  Map,
  Plus,
} from 'lucide-react';    /*아이콘 가져오기*/

import CreateBottomSheet from './CreateBottomSheet';

const navItems = [
  {
    to: '/home', 
    label: '홈',
    Icon: House,
  },
  {
    to: '/search',
    label: '검색하기',
    Icon: Search,
  },
  {
    to: '/library',
    label: '내 라이브러리',
    Icon: Library,
  },
  {
    to: '/map',
    label: '지도',
    Icon: Map,
  },
];

function BottomNavigation() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  return (
    <>
      <nav
        aria-label="주요 메뉴"
        className={`
        app-navigation aero-dock aero-navigation z-40
      `}
      >
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) => `aero-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="aero-nav-icon" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}

        <button type="button" aria-label="만들기 메뉴 열기" aria-haspopup="dialog" onClick={() => setIsCreateOpen(true)} className="aero-nav-item">
          <Plus className="aero-nav-icon" aria-hidden="true" />
          <span>만들기</span>
        </button>
      </nav>

      {isCreateOpen && (
        <CreateBottomSheet
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </>
  );
}

export default BottomNavigation;
