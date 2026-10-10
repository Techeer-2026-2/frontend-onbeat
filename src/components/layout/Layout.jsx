import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

function Layout() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md border-x border-white/10 bg-spotify-black text-white">
      <Header />

      <main className="min-h-[calc(100dvh-80px)] pb-20">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}

export default Layout;