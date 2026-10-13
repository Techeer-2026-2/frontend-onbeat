import { useNavigate } from 'react-router-dom';
import { ListMusic, Navigation, ChevronRight } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';

function CreateBottomSheet({ onClose }) {
  const navigate = useNavigate();

  const openPlaylistCreate = () => {
    onClose();
    navigate('/playlist/create');
  };

  return (
    <BottomSheet isOpen={true} onClose={onClose} title="만들기">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={openPlaylistCreate}
          className="flex items-center gap-3 rounded-xl bg-spotify-card p-4 text-left transition-colors hover:bg-spotify-card-hover"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
            <ListMusic size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white">일반 플레이리스트</span>
            <span className="mt-1 block text-xs text-spotify-subtext">원하는 곡을 직접 담아 만들기</span>
          </span>
          <ChevronRight size={18} className="text-spotify-subtext" />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/playlist/commute/create');
          }}
          className="flex items-center gap-3 rounded-xl bg-spotify-card p-4 text-left transition-colors hover:bg-spotify-card-hover"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-spotify-green/15 text-spotify-green">
            <Navigation size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white">통근 맞춤 플레이리스트</span>
            <span className="mt-1 block text-xs text-spotify-subtext">통근 경로와 이동 시간에 맞춰 만들기</span>
          </span>
          <ChevronRight size={18} className="text-spotify-subtext" />
        </button>
      </div>
    </BottomSheet>
  );
}

export default CreateBottomSheet;
