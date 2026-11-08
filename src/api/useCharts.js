import { useQuery } from "@tanstack/react-query";
import { getGlobalChart } from "./rankings";
import { toSong } from "./mappers";

export function useGlobalChart() {
  return useQuery({
    queryKey: ["chart", "global"],
    queryFn: async () => {
      const chart = await getGlobalChart();
      return chart.items.map((item) => ({
        ...toSong(item.track),
        rank: item.rank,
      }));
    },
  });
}
