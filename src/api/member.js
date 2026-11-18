// 로그인 연동 전까지는 .env의 테스트 회원 ID로 요청한다.
// JWT 로그인으로 바뀌면 이 파일만 고치면 된다.
export const MEMBER_ID = Number(import.meta.env.VITE_TEST_MEMBER_ID || 1);

// 대부분의 사용자 API가 요구하는 ?memberId= 쿼리
export const memberParams = (extra = {}) => ({ memberId: MEMBER_ID, ...extra });
