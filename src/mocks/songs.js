const cover = (seed) => `https://picsum.photos/seed/onbeat-${seed}/240/240`;

export const mockSongs = [
  { id: 'mock-song-1', itunesTrackId: 101001, title: 'Blue Summer', artist: 'OnBeat', image: cover('blue-summer'), collectionName: 'Aero Days', previewUrl: '', trackTimeMillis: 214000, genre: 'Pop' },
  { id: 'mock-song-2', itunesTrackId: 101002, title: 'Aqua Drive', artist: 'Lumen', image: cover('aqua-drive'), collectionName: 'Ocean Highway', previewUrl: '', trackTimeMillis: 198000, genre: 'Electronic' },
  { id: 'mock-song-3', itunesTrackId: 101003, title: 'Windy', artist: 'Cloudline', image: cover('windy'), collectionName: 'Blue Window', previewUrl: '', trackTimeMillis: 221000, genre: 'Indie' },
  { id: 'mock-song-4', itunesTrackId: 101004, title: 'Morning Signal', artist: 'Neon Harbor', image: cover('morning-signal'), collectionName: 'Commute FM', previewUrl: '', trackTimeMillis: 207000, genre: 'Pop' },
  { id: 'mock-song-5', itunesTrackId: 101005, title: '파란 파도', artist: '윤슬', image: cover('blue-wave'), collectionName: '여름의 페이지', previewUrl: '', trackTimeMillis: 235000, genre: 'K-Pop' },
  { id: 'mock-song-6', itunesTrackId: 101006, title: '도시의 구름', artist: '새벽비', image: cover('city-cloud'), collectionName: 'Window Seat', previewUrl: '', trackTimeMillis: 189000, genre: 'Indie' },
  { id: 'mock-song-7', itunesTrackId: 101007, title: 'Sunlit Avenue', artist: 'Miro', image: cover('sunlit-avenue'), collectionName: 'Daylight', previewUrl: '', trackTimeMillis: 202000, genre: 'R&B' },
  { id: 'mock-song-8', itunesTrackId: 101008, title: '물결 위의 밤', artist: 'NOVA', image: cover('night-wave'), collectionName: 'Moonlit Water', previewUrl: '', trackTimeMillis: 228000, genre: 'Electronic' },
];

export const findMockSongs = (term) => {
  const keyword = String(term ?? '').trim().toLowerCase();
  if (!keyword) return [];
  return mockSongs.filter((song) => `${song.title} ${song.artist} ${song.collectionName}`.toLowerCase().includes(keyword));
};
