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
        className="
        fixed bottom-0 left-1/2 z-40
        w-full max-w-md -translate-x-1/2
        border-t border-white/10
        bg-spotify-black/95 px-1 pb-safe
        backdrop-blur-xl
      "
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) => `
                flex h-full min-w-0 flex-1
                flex-col items-center justify-center gap-1
                transition-colors
                ${
                  isActive
                    ? 'text-white'
                    : 'text-spotify-subtext hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                  <span className="truncate text-[10px] font-medium">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            aria-label="만들기 메뉴 열기"
            aria-haspopup="dialog"
            onClick={() => setIsCreateOpen(true)}
            className="
              flex h-full min-w-0 flex-1
              flex-col items-center justify-center gap-1
              text-spotify-subtext transition-colors
              hover:text-white
            "
          >
            <Plus size={22} aria-hidden="true" />
            <span className="text-[10px] font-medium">
              만들기
            </span>
          </button>
        </div>
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
