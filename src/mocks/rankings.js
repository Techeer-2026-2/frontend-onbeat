import { mockSongs } from './songs';

const makeRanking = (scope) => Array.from({ length: 50 }, (_, index) => {
  const song = mockSongs[index % mockSongs.length];
  return {
    rank: index + 1,
    track: {
      title: song.title,
      artistName: song.artist,
      artworkUrl: song.image,
    },
    uniqueListenerCount: 8420 - (index * 107) + (scope === 'NEARBY' ? 314 : 0),
  };
});

export const mockGlobalRankings = makeRanking('GLOBAL');
export const mockNearbyRankings = makeRanking('NEARBY');
