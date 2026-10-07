import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import CreateBottomSheet from './CreateBottomSheet';

function BottomNavigation() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <nav>
        <NavLink to="/home">홈</NavLink>
        <NavLink to="/search">검색하기</NavLink>
        <NavLink to="/library">내 라이브러리</NavLink>
        <NavLink to="/map">지도</NavLink>
        <button onClick={() => setIsCreateOpen(true)}>
          만들기
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

