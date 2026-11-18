import client from "./client";
import { MEMBER_ID } from "./member";

// 나에게 맞는 광고 배너 1개 (없으면 204 → 빈 응답)
// 호출할 때마다 서버가 "노출"을 기록하므로 자주 부르지 않는다
export const getMatchedBanner = () =>
  client.get("/banners/match", { params: { targetUserId: MEMBER_ID } });

// 배너 클릭 기록 (같은 notificationId로 다시 보내도 한 번만 집계됨)
export const recordBannerClick = (notificationId) =>
  client.post("/clicks", { notificationId });
