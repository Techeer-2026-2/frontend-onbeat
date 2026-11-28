import client from "./client";
import { enqueueClick, isRetryable } from "./bannerClickQueue";

// 나에게 맞는 광고 배너 1개 (없으면 204 → 빈 응답)
// 회원은 X-Member-Id 헤더(client.js가 자동으로 보냄)로 식별하고, 그 회원의 연령대·성별로 매칭한다
// 연령대를 입력하지 않은 회원은 204(배너 없음)를 받는다
// 호출할 때마다 서버가 "노출"을 기록하므로 자주 부르지 않는다
// 요청 ID 는 호출마다 새로 만든다 (서버가 같은 ID 의 재시도를 한 번만 처리하도록)
export const getMatchedBanner = () =>
  client.get("/banners/match", {
    headers: { "X-Request-Id": crypto.randomUUID() },
  });

// 배너 클릭 기록 (같은 notificationId로 다시 보내도 재계산에서 한 번만 집계됨)
// 전송이 실패하면(네트워크·5xx) 로컬 큐에 보관해 두고 나중에 다시 보낸다
export const recordBannerClick = (notificationId) =>
  client.post("/clicks", { notificationId }).catch((error) => {
    if (isRetryable(error)) enqueueClick(notificationId);
    throw error;
  });
