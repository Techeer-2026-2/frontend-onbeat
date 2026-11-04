import { withMockFallback } from './mockFallback';
import { mockCommutePlaylist } from '../mocks';

const readCommutePlaylist = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('onbeat-playlists') || '[]');
    return saved.find((playlist) => playlist.isCommute === true) ?? null;
  } catch {
    return null;
  }
};

// The existing commute card is local-first. Keeping the fallback here avoids
// coupling the Home component to fixture data while preserving saved playlists.
export const getHomeCommutePlaylist = () => withMockFallback(
  async () => readCommutePlaylist(),
  mockCommutePlaylist,
  (playlist) => playlist == null,
);
