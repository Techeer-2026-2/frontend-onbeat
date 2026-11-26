import client from "./client";
import { MEMBER_ID } from "./member";
import { enqueueClick, isRetryable } from "./bannerClickQueue";

// 광고 타겟 유저 번호: 회원(users)과 다른 target_users 테이블(연령대·성별)의 번호
// .env에 VITE_TEST_TARGET_USER_ID가 없으면 회원 번호를 그대로 쓴다
const TARGET_USER_ID = Number(import.meta.env.VITE_TEST_TARGET_USER_ID || MEMBER_ID);

// 나에게 맞는 광고 배너 1개 (없으면 204 → 빈 응답)
// 호출할 때마다 서버가 "노출"을 기록하므로 자주 부르지 않는다
// 요청 ID 는 호출마다 새로 만든다 (서버가 같은 ID 의 재시도를 한 번만 처리하도록)
export const getMatchedBanner = () =>
  client.get("/banners/match", {
    params: { targetUserId: TARGET_USER_ID },
    headers: { "X-Request-Id": crypto.randomUUID() },
  });

// 배너 클릭 기록 (같은 notificationId로 다시 보내도 재계산에서 한 번만 집계됨)
// 전송이 실패하면(네트워크·5xx) 로컬 큐에 보관해 두고 나중에 다시 보낸다
export const recordBannerClick = (notificationId) =>
  client.post("/clicks", { notificationId }).catch((error) => {
    if (isRetryable(error)) enqueueClick(notificationId);
    throw error;
  });
