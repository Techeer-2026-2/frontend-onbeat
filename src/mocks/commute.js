import { mockSongs } from './songs';

export const mockCommutePlaylist = {
  id: 'mock-commute-playlist',
  title: '상쾌한 출근길',
  origin: '강남역',
  destination: '판교역',
  mode: '지하철',
  commuteMinutes: 51,
  isCommute: true,
  tracks: mockSongs.slice(0, 5),
  totalSeconds: mockSongs.slice(0, 5).reduce((total, song) => total + Math.round(song.trackTimeMillis / 1000), 0),
  cover: mockSongs[1].image,
};
