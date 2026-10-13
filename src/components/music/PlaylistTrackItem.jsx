import { GripVertical, X } from 'lucide-react';
import IconButton from '../common/IconButton';

function PlaylistTrackItem({ track, index, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
      <GripVertical size={17} className="shrink-0 text-neutral-600" aria-hidden="true" />
      <span className="w-4 shrink-0 text-center text-xs text-spotify-subtext">{index + 1}</span>
      <img src={track.image} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{track.title}</p>
        <p className="mt-1 truncate text-xs text-spotify-subtext">{track.artist}</p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-spotify-subtext">{track.duration}</span>
      <IconButton label={`${track.title} 삭제`} size="sm" onClick={() => onRemove(track.id)}>
        <X size={17} />
      </IconButton>
    </div>
  );
}

export default PlaylistTrackItem;
