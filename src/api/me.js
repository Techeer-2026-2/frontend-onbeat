import client from "./client";

// 내 정보 (백엔드 #160 기준)
// 응답: { userId, email, nickname, ageGroup, gender, createdAt }
//  - ageGroup: "10s" | "20s" | "30s" | "40s" | "50s" | null (null이면 배너가 노출되지 않음)
//  - gender: "male" | "female" | null
export const getMe = () => client.get("/me");

// 내 정보 수정: 보낸 값만 바뀌고, 보내지 않은 값은 그대로 둔다
// body: { nickname?, ageGroup?, gender? } → 응답: 수정된 내 정보 (getMe와 같은 모양)
export const updateMe = (body) => client.patch("/me", body);
