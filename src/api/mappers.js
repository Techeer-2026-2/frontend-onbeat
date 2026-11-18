// 서버 응답 모양 → 화면 컴포넌트가 쓰는 모양으로 바꾸는 변환기 모음
//
// 화면에서 쓰는 곡(Song) 모양:
// { id, itunesTrackId, title, artist, album, cover, duration, previewDuration, previewUrl, category }
// - id: iTunes 곡 번호를 문자열로 통일 → 차트·검색·플레이리스트 어디서 온 곡이든 같은 곡이면 id가 같음
// - duration: 원곡 길이(초). 모르면 null
// - previewDuration: 실제로 재생되는 미리듣기 길이(30초)

const DEFAULT_COVER = "/assets/albums/cd.webp";
const PREVIEW_SECONDS = 30;

const PLAYLIST_COVERS = [
  "/assets/albums/cd.webp",
  "/assets/albums/shamrock.webp",
  "/assets/albums/dolphin.webp",
  "/assets/albums/blue-hour.webp",
  "/assets/albums/floral.webp",
];
const COMMUTE_COVER = "/assets/albums/headphones-meadow.webp";
const COVER_STORAGE_KEY = "onbeat-playlist-covers";

const millisToSeconds = (ms) => (ms ? Math.round(ms / 1000) : null);
const toNumberOrNull = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
};

// 차트·곡 상세 API의 Track → Song
export const toSong = (track) => ({
  id: String(track.id),
  itunesTrackId: toNumberOrNull(track.id),
  title: track.title,
  artist: track.artistName, // API 필드명을 화면 필드명에 맞춤
  album: null,
  cover: track.artworkUrl ?? DEFAULT_COVER, // 차트 응답에 artworkUrl이 없어서 기본 커버 사용
  duration: millisToSeconds(track.trackTimeMillis), // 원곡 길이(초), 없으면 null
  previewDuration: PREVIEW_SECONDS, // 실제 재생되는 미리듣기 길이
  previewUrl: track.previewUrl,
  category: null,
});

// 검색 API의 TrackCandidateResponse → Song
export const searchTrackToSong = (track) => ({
  id: String(track.itunesTrackId),
  itunesTrackId: track.itunesTrackId,
  title: track.trackName,
  artist: track.artistName,
  album: track.collectionName ?? null,
  cover: track.artworkUrl ?? DEFAULT_COVER,
  duration: millisToSeconds(track.trackTimeMillis),
  previewDuration: PREVIEW_SECONDS,
  previewUrl: track.previewUrl,
  category: track.genre, // 장르 필드는 검색 결과에서만 제공
});

// 플레이리스트 상세의 PlaylistTrackResponse → Song
// playlistTrackId: 플레이리스트 안에서의 곡 번호 (곡 삭제·순서 변경에 사용)
export const playlistTrackToSong = (track) => ({
  ...searchTrackToSong(track),
  playlistTrackId: track.id,
});

// Song → 플레이리스트 곡 추가 요청(PlaylistTrackAddRequest)
export const songToTrackAddRequest = (song) => ({
  itunesTrackId: song.itunesTrackId,
  trackName: song.title,
  artistName: song.artist,
  collectionName: song.album ?? undefined,
  artworkUrl: song.cover === DEFAULT_COVER ? undefined : song.cover,
  previewUrl: song.previewUrl,
  trackTimeMillis: song.duration ? song.duration * 1000 : undefined,
  genre: song.category ?? undefined,
});

// 서버는 플레이리스트 커버를 저장하지 않아서, 고른 커버는 이 브라우저에만 저장한다
const readCovers = () => {
  try {
    return JSON.parse(localStorage.getItem(COVER_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};
export const savePlaylistCover = (playlistId, cover) => {
  try {
    localStorage.setItem(
      COVER_STORAGE_KEY,
      JSON.stringify({ ...readCovers(), [playlistId]: cover }),
    );
  } catch {
    // 저장 실패해도 기본 커버로 보이면 되므로 무시
  }
};
const playlistCover = (playlist) =>
  readCovers()[playlist.id] ??
  (playlist.type === "COMMUTE_GENERATED"
    ? COMMUTE_COVER
    : PLAYLIST_COVERS[playlist.id % PLAYLIST_COVERS.length]);

// PlaylistResponse / PlaylistDetailResponse / PlaylistGenerateResponse → 화면용 플레이리스트
export const toPlaylist = (playlist) => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description ?? "",
  type: playlist.type,
  isCommute: playlist.type === "COMMUTE_GENERATED",
  isPublic: playlist.isPublic ?? false,
  trackCount: playlist.trackCount ?? playlist.tracks?.length ?? 0,
  totalDurationSec: playlist.totalDurationSec ?? 0,
  cover: playlistCover(playlist),
  songs: playlist.tracks ? playlist.tracks.map(playlistTrackToSong) : null, // 목록 API에는 곡이 없음
});

// 교통수단: 화면 이름 ↔ 서버 값
export const TRANSPORT_OPTIONS = ["대중교통", "자동차", "도보"];
const TRANSPORT_TO_API = { 대중교통: "PUBLIC_TRANSIT", 자동차: "CAR", 도보: "WALK" };
const TRANSPORT_FROM_API = { PUBLIC_TRANSIT: "대중교통", CAR: "자동차", WALK: "도보" };
export const transportToApi = (label) => TRANSPORT_TO_API[label] ?? "PUBLIC_TRANSIT";
export const transportLabel = (mode) => TRANSPORT_FROM_API[mode] ?? "대중교통";

// 장소: 장소 검색 결과(PlaceSearchResponse) / 통근 프로필 위치(LocationDto) → 화면용 장소
export const toPlace = (place) =>
  place
    ? {
        placeName: place.placeName ?? "",
        address: place.addressName ?? "",
        latitude: place.latitude,
        longitude: place.longitude,
      }
    : null;

// 화면용 장소 → 통근 프로필 요청의 LocationDto
export const placeToLocationDto = (place) => ({
  latitude: place.latitude,
  longitude: place.longitude,
  placeName: place.placeName,
});

// CommuteProfileResponse → 화면용 통근 프로필
export const toCommuteProfile = (profile) => ({
  id: profile.id,
  commuteType: profile.commuteType,
  transportMode: profile.transportMode,
  transport: transportLabel(profile.transportMode),
  routeName: profile.frequentRouteName ?? "",
  averageMinutes: profile.averageDurationMinutes ?? null,
  departure: toPlace(profile.departure),
  arrival: toPlace(profile.arrival),
});
