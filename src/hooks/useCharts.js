import { useQuery } from "@tanstack/react-query";
import { getGlobalChart, getNearbyChart } from "../api/rankings";
import { toSong } from "../api/mappers";

// 차트 응답 -> 곡 목록 (공통 변환)
const toChartSongs = (chart) =>
  chart.items.map((item) => ({
    ...toSong(item.track),
    rank: item.rank,
  }));

export function useGlobalChart() {
  return useQuery({
    queryKey: ["chart", "global"],
    queryFn: async () => toChartSongs(await getGlobalChart()),
  });
}

export function useNearbyChart(position) {
  return useQuery({
    queryKey: ["chart", "nearby", position?.lat, position?.lng],
    queryFn: async () =>
      toChartSongs(await getNearbyChart(position.lat, position.lng)),
    enabled: !!position,
  });
}
