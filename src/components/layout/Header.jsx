import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import IconButton from '../common/IconButton';

const PAGE_TITLES = {
  '/home': 'ONBEAT',
  '/search': '검색',
  '/library': '내 라이브러리',
  '/map': '통근 지도',
  '/playlist/create': '플레이리스트 만들기',
};

function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === '/home';

  // 현재 페이지에 맞는 헤더 제목 결정
  const title = PAGE_TITLES[pathname];

  // 플레이리스트 탭은 별도 헤더를 사용
  if (pathname === '/playlist/create' || pathname === '/playlist/commute/create' || /^\/playlist\/\d+$/.test(pathname)) {
    return null;
  }

  return (
    <header className={`${isHome ? 'aero-header' : 'flex items-center gap-3 bg-spotify-black px-5 pt-4 pb-0'}`}>
      {isHome ? (
        <>
          <div className="aero-header-row">
            <button
              type="button"
              onClick={() => navigate('/home')}
              aria-label="ONBEAT 홈으로 이동"
            >
              <img className="aero-logo-image" src="/assets/logo.png" alt="OnBeat" />
            </button>

            <IconButton label="프로필" onClick={() => navigate('/auth')} className="aero-profile">
              <img src="/assets/profile.svg" alt="" aria-hidden="true" />
            </IconButton>
          </div>

          <button type="button" onClick={() => navigate('/search')} className="aero-search-link" aria-label="음악 검색으로 이동">
            <Search size={23} aria-hidden="true" />
            <span>노래, 아티스트, 플레이리스트 검색</span>
            <img src="/assets/aero/controls/arrow-next.svg" alt="" aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <IconButton label="프로필" onClick={() => navigate('/auth')}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-card text-sm font-bold">이</span>
          </IconButton>
          <button type="button" onClick={() => navigate('/home')} aria-label="ONBEAT 홈으로 이동" className="text-xl font-extrabold tracking-tight text-white transition-opacity hover:opacity-80">
            {title}
          </button>
        </>
      )}
    </header>
  );
}

export default Header;
