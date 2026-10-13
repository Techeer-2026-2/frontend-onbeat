import { Check, Plus } from 'lucide-react';
import IconButton from '../common/IconButton';

function TrackSearchItem({ track, isAdded, onAdd }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5">
      <img
        src={track.image}
        alt=""
        loading="lazy"
        className="h-11 w-11 shrink-0 rounded-md object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{track.title}</p>
        <p className="mt-1 truncate text-xs text-spotify-subtext">{track.artist}</p>
      </div>
      <IconButton
        label={isAdded ? `${track.title} 이미 추가됨` : `${track.title} 추가`}
        size="sm"
        disabled={isAdded}
        onClick={() => onAdd(track)}
        className={isAdded ? 'text-spotify-green' : 'border border-white/20'}
      >
        {isAdded ? <Check size={17} /> : <Plus size={18} />}
      </IconButton>
    </div>
  );
}

export default TrackSearchItem;
