import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCommuteSession,
  completeCommuteSession,
  createCommuteProfile,
  estimateRoute,
  getActiveCommuteSession,
  getCommuteProfiles,
  searchPlaces,
  startCommuteSession,
  updateCommuteProfile,
} from "../api/commute";
import { useIsAuthenticated } from "./useAuth";
import { generatePlaylist } from "../api/playlists";
import {
  placeToLocationDto,
  toCommuteProfile,
  toPlace,
  toPlaylist,
  transportToApi,
} from "../api/mappers";
import { playlistKeys } from "./usePlaylists";

const PREFERRED_PROFILE_ID = Number(
  import.meta.env.VITE_TEST_COMMUTE_PROFILE_ID,
);

export const commuteKeys = {
  profiles: ["commute-profiles"],
  activeSession: ["commute-sessions", "active"],
};

// 통근 프로필 목록
export function useCommuteProfiles() {
  return useQuery({
    queryKey: commuteKeys.profiles,
    queryFn: async () => (await getCommuteProfiles()).map(toCommuteProfile),
  });
}

// 화면에 보여줄 대표 통근 프로필 하나 (.env에 지정한 것 → 없으면 가장 최근 것)
export function useMainCommuteProfile() {
  const query = useCommuteProfiles();
  const profiles = query.data ?? [];
  const profile =
    profiles.find((item) => item.id === PREFERRED_PROFILE_ID) ??
    profiles.at(-1) ??
    null;
  return { ...query, profile };
}

// 통근 프로필 저장: profileId가 있으면 수정, 없으면 새로 만들기
export function useSaveCommuteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, origin, destination, transport }) => {
      const body = {
        commuteType: "TO_WORK",
        transportMode: transportToApi(transport),
        frequentRouteName: `${origin.placeName} → ${destination.placeName}`,
        departure: placeToLocationDto(origin),
        arrival: placeToLocationDto(destination),
      };
      const saved = profileId
        ? await updateCommuteProfile(profileId, body)
        : await createCommuteProfile(body);
      return toCommuteProfile(saved);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: commuteKeys.profiles }),
  });
}

// 장소 검색 (카카오). keyword가 바뀔 때마다 요청하므로 디바운스된 값을 넘길 것
export function usePlaceSearch(keyword) {
  return useQuery({
    queryKey: ["places", keyword],
    queryFn: async () => (await searchPlaces(keyword)).map(toPlace),
    enabled: !!keyword,
    staleTime: 5 * 60 * 1000,
    retry: 1, // 타이핑 중이라 실패하면 빨리 알려주는 게 나음 (기본은 3번 재시도)
  });
}

// 출발지 → 도착지 예상 소요시간(분)
export function useRouteEstimate({ origin, destination, transport }) {
  return useQuery({
    queryKey: [
      "route-estimate",
      origin?.latitude,
      origin?.longitude,
      destination?.latitude,
      destination?.longitude,
      transport,
    ],
    queryFn: async () => {
      const result = await estimateRoute({
        startLatitude: origin.latitude,
        startLongitude: origin.longitude,
        endLatitude: destination.latitude,
        endLongitude: destination.longitude,
        transportMode: transportToApi(transport),
      });
      return result.durationMinutes;
    },
    enabled: !!origin && !!destination,
    staleTime: 10 * 60 * 1000,
  });
}

// 통근 플레이리스트 자동 생성 (서버가 곡을 골라서 플레이리스트까지 만들어 줌)
export function useGenerateCommutePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commuteProfileId, name, size, origin }) =>
      toPlaylist(
        await generatePlaylist({
          commuteProfileId,
          name,
          size,
          latitude: origin?.latitude,
          longitude: origin?.longitude,
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}

// 지금 진행 중인 통근 (없으면 서버가 404 → null)
// 앱 전체를 감싸는 OnBeatContext 에서도 쓰므로, 로그인 화면에서는 요청하지 않는다
export function useActiveCommuteSession() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: commuteKeys.activeSession,
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
        return await getActiveCommuteSession();
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },
  });
}

function useCommuteSessionMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: commuteKeys.activeSession }),
  });
}

// 통근 시작 / 완료 / 취소
export const useStartCommute = () =>
  useCommuteSessionMutation(({ commuteProfileId, playlistId }) =>
    startCommuteSession({ commuteProfileId, playlistId }),
  );
export const useCompleteCommute = () =>
  useCommuteSessionMutation((sessionId) => completeCommuteSession(sessionId));
export const useCancelCommute = () =>
  useCommuteSessionMutation((sessionId) => cancelCommuteSession(sessionId));
