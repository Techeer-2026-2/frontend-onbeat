// 로컬 개발용 임시 회원 ID.
// 로그인하지 않은 상태에서 .env 의 VITE_TEST_MEMBER_ID 가 있을 때만 X-Member-Id 헤더로 보낸다.
// 운영 빌드는 이 값을 비워 두므로 로그인(Authorization 헤더)이 필수다.
const raw = import.meta.env.VITE_TEST_MEMBER_ID;
export const DEV_MEMBER_ID = raw ? Number(raw) : null;
