import axios from "axios";
import { MEMBER_ID } from "./member";
import { useAuthStore } from "../stores/authStore";

// axios 인스턴스 생성, 공통 설정 적용
const client = axios.create({
  baseURL: "/api/v1",
  timeout: 10000, // 10초 안에 응답이 없으면 실패 처리
  // 로그인 토큰이 있으면 백엔드는 토큰으로 회원을 판별한다.
  // X-Member-Id 는 토큰이 없을 때만 쓰이는 임시 값이고, 운영에서 헤더 차단을 켜면 무시된다.
  headers: { "X-Member-Id": String(MEMBER_ID) },
});

// 요청마다 로그인 토큰을 붙인다
client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"];
let refreshing = null; // 동시에 여러 요청이 401 을 받아도 재발급은 한 번만 한다

// 토큰을 새로 받는다. 실패하면 로그인 정보를 지우고 로그인 화면으로 보낸다.
async function refreshAccessToken() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error("no refresh token");
  const res = await axios.post("/api/v1/auth/refresh", { refreshToken });
  useAuthStore.getState().setTokens(res.data);
  return res.data.accessToken;
}

// 응답 인터셉터 설정
client.interceptors.response.use(
  (res) => res.data?.data ?? res.data, // 백엔드 응답 구조에 맞게 data 필드 추출

  async (err) => {
    const original = err.config;
    const status = err.response?.status ?? null;

    // 토큰 만료(401): 한 번만 재발급 후 같은 요청을 다시 보낸다
    if (
      status === 401 &&
      original &&
      !original._retried &&
      !AUTH_PATHS.some((p) => original.url?.startsWith(p))
    ) {
      original._retried = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => (refreshing = null));
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      } catch {
        useAuthStore.getState().clear();
        window.location.assign("/login");
        return Promise.reject({ status, code: "AUTH_EXPIRED", message: "로그인이 만료되었어요" });
      }
    }

    // 응답 자체가 없으면 서버가 꺼진 것, 응답은 왔는데 설명이 없으면 서버 내부 오류
    const fallback = !err.response
      ? "서버에 연결할 수 없어요"
      : `요청을 처리하지 못했어요 (오류 ${status})`;
    return Promise.reject({
      status,
      code: err.response?.data?.code ?? (err.response ? "SERVER_ERROR" : "NETWORK_ERROR"),
      message: err.response?.data?.message ?? fallback,
    });
  },
);

export default client;
