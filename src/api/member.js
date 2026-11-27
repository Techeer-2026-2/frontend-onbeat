// 로그인 연동 전까지는 .env의 테스트 회원 ID로 요청한다. (client.js가 X-Member-Id 헤더로 보냄)
// JWT 로그인으로 바뀌면 이 파일과 client.js의 헤더만 고치면 된다.
export const MEMBER_ID = Number(import.meta.env.VITE_TEST_MEMBER_ID || 1);
