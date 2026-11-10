const DEFAULT_COVER = "/assets/albums/cd.webp";
const PREVIEW_SECONDS = 30;

// 차트 API 응답을 화면에서 사용하는 Song 객체로 변환
export const toSong = (track) => ({
  id: track.id,
  title: track.title,
  artist: track.artistName, // API 필드명을 화면 필드명에 맞춤
  cover: track.artworkUrl ?? DEFAULT_COVER, // 차트 응답에 artworkUrl이 없어서 기본 커버 사용
  duration: track.trackTimeMillis
    ? Math.round(track.trackTimeMillis / 1000)
    : null, // 원곡 길이(초), 없으면 null
  previewDuration: PREVIEW_SECONDS, // 실제 재생되는 미리듣기 길이
  previewUrl: track.previewUrl,
});

// 검색 API 응답을 화면에서 사용하는 Song 객체로 변환
export const searchTrackToSong = (track) => ({
  id: track.itunesTrackId,
  title: track.trackName,
  artist: track.artistName,
  cover: track.artworkUrl ?? DEFAULT_COVER,
  duration: track.trackTimeMillis
    ? Math.round(track.trackTimeMillis / 1000)
    : null,
  previewDuration: PREVIEW_SECONDS,
  previewUrl: track.previewUrl,
  category: track.genre, // 장르 필드는 검색 결과에서만 제공
});
