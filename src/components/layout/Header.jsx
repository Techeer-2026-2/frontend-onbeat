import { useLocation, useNavigate } from 'react-router-dom';
import IconButton from '../common/IconButton';

const PAGE_TITLES = {
  '/home': 'ONBEAT',
  '/search': '검색',
  '/library': '내 라이브러리',
};

function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 현재 페이지에 맞는 헤더 제목 결정
  const title = PAGE_TITLES[pathname];

  // 지도 탭은 별도 헤더를 사용
  if (pathname === '/map') {
    return null;
  }

  return (
    <header className="flex items-center gap-3 border-b border-white/10 bg-spotify-black px-5 py-4">
      <IconButton
        label="프로필"
        onClick={() => console.log('프로필 클릭')}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-card text-sm font-bold">
          이
        </span>
      </IconButton>

      <button
        type="button"
        onClick={() => navigate('/home')}
        aria-label="ONBEAT 홈으로 이동"
        className="text-xl font-extrabold tracking-tight text-white transition-opacity hover:opacity-80"
      >
        {title === 'ONBEAT' ? (
          <>
            ONBEAT
          </>
        ) : (
          title
        )}
      </button>
    </header>
  );
}

export default Header;