import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

function Layout() {
  return (
    <div>
      <Header />  

      <main>
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}

export default Layout;