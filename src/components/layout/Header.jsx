import { useNavigate } from 'react-router-dom';
import IconButton from '../common/IconButton';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-spotify-black px-5 py-4">
      <button
        type="button"
        onClick={() => navigate('/home')}
        aria-label="ONBEAT 홈으로 이동"
        className="text-xl font-extrabold tracking-tight text-white transition-opacity hover:opacity-80"
      >
        ON<span className="text-spotify-green">BEAT</span>
      </button>

      <IconButton
        label="프로필"
        onClick={() => console.log('프로필 클릭')}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-card text-sm font-bold">
          이
        </span>
      </IconButton>
    </header>
  );
}

export default Header;
