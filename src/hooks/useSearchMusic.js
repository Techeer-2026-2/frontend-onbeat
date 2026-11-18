import { useQuery } from "@tanstack/react-query";
import { searchMusic } from "../api/music";
import { searchTrackToSong } from "../api/mappers";

// 검색어를 받아 해당하는 음악 데이터 목록을 가져오는 훅
export function useSearchMusic(term) {
  return useQuery({
    queryKey: ["search", term],
    queryFn: async () => (await searchMusic(term)).map(searchTrackToSong),
    enabled: !!term, // 검색어가 없으면 쿼리 실행하지 않음
  });
}
