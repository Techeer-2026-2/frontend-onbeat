import { useQuery } from "@tanstack/react-query";
import { getMatchedBanner } from "../api/banners";

// 나에게 맞는 광고 배너 (없으면 null)
// 조회할 때마다 서버가 노출을 기록하므로, 앱을 켜 있는 동안 한 번만 요청한다
export function useMatchedBanner() {
  return useQuery({
    queryKey: ["banner", "match"],
    queryFn: async () => {
      const banner = await getMatchedBanner();
      if (!banner?.notificationId) return null; // 204: 맞는 광고 없음
      return {
        id: banner.notificationId,
        notificationId: banner.notificationId,
        image: banner.imageUrl,
        link: banner.linkUrl || null,
        alt: banner.title || "광고",
        isAd: true,
      };
    },
    staleTime: Infinity,
    retry: false,
  });
}
