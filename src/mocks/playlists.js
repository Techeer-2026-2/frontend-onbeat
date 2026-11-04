import { mockSongs } from './songs';

const tracks = mockSongs.slice(0, 5).map((song, index) => ({
  id: `mock-playlist-track-${index + 1}`,
  trackId: song.itunesTrackId,
  title: song.title,
  artist: song.artist,
  durationSec: Math.round(song.trackTimeMillis / 1000),
  image: song.image,
}));

export const mockPlaylists = [
  { id: 'mock-playlist-1', name: '상쾌한 출근길', trackCount: tracks.length, coverImageUrl: tracks[0].image, description: '맑은 아침을 위한 음악' },
  { id: 'mock-playlist-2', name: 'Aero 오후 산책', trackCount: 4, coverImageUrl: mockSongs[5].image, description: '가볍게 걷는 오후의 선곡' },
];

export const mockPlaylistDetails = {
  'mock-playlist-1': { ...mockPlaylists[0], tracks },
  'mock-playlist-2': { ...mockPlaylists[1], tracks: tracks.slice(2) },
};
