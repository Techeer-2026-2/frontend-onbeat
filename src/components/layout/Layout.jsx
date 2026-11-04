import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/home';
  return (
    <div className="desktop-stage">
      <div className="desktop-frame">
        <div className="desktop-titlebar" aria-hidden="true">
          <span className="desktop-titlebar-icon">♫</span>
          <span>ONBEAT Media OS</span>
          <img className="aero-controls-image" src="/assets/controls.png" alt="" aria-hidden="true" />
        </div>

        <div className={`desktop-app relative text-white ${isHome ? 'aero-app-shell' : 'border-x border-white/10 bg-spotify-black'}`}>
          <Header />

          <main className="min-h-[calc(100dvh-80px)] pb-20">
            <Outlet />
          </main>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}

export default Layout;
