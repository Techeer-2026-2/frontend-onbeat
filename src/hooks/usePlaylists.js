import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPlaylistTracks,
  createPlaylist,
  deletePlaylist,
  deletePlaylistTrack,
  getPlaylist,
  getPlaylists,
  updatePlaylist,
} from "../api/playlists";
import {
  savePlaylistCover,
  songToTrackAddRequest,
  toPlaylist,
} from "../api/mappers";

export const playlistKeys = {
  all: ["playlists"],
  detail: (id) => ["playlists", id],
};

const fetchPlaylistDetail = async (id) => toPlaylist(await getPlaylist(id));

// 내 플레이리스트 목록 (곡 수·총 시간만 있고 곡 목록은 없음)
export function usePlaylists() {
  return useQuery({
    queryKey: playlistKeys.all,
    queryFn: async () => (await getPlaylists()).map(toPlaylist),
  });
}

// 플레이리스트 상세 (곡 목록 포함)
export function usePlaylistDetail(playlistId) {
  return useQuery({
    queryKey: playlistKeys.detail(playlistId),
    queryFn: () => fetchPlaylistDetail(playlistId),
    enabled: playlistId != null,
  });
}

// 버튼을 눌렀을 때 곡 목록이 필요하면 쓰는 함수 (캐시에 있으면 바로 돌려줌)
export function useLoadPlaylistSongs() {
  const queryClient = useQueryClient();
  return async (playlistId) => {
    const playlist = await queryClient.fetchQuery({
      queryKey: playlistKeys.detail(playlistId),
      queryFn: () => fetchPlaylistDetail(playlistId),
    });
    return playlist.songs ?? [];
  };
}

// 플레이리스트 만들기: 생성 → 설명 저장 → 곡 추가 → 커버 저장
export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, songs, cover }) => {
      const created = await createPlaylist(name);
      if (description) await updatePlaylist(created.id, { description });
      const tracks = songs
        .filter((song) => song.itunesTrackId)
        .map(songToTrackAddRequest);
      if (tracks.length) await addPlaylistTracks(created.id, tracks);
      if (cover) savePlaylistCover(created.id, cover);
      return created;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}

// 여러 플레이리스트 삭제
export function useDeletePlaylists() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => Promise.all(ids.map((id) => deletePlaylist(id))),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}

// 플레이리스트에서 곡 여러 개 빼기
export function useRemovePlaylistTracks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, playlistTrackIds }) =>
      Promise.all(
        playlistTrackIds.map((trackId) =>
          deletePlaylistTrack(playlistId, trackId),
        ),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}
