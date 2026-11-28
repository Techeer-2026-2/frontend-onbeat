import axios from "axios";
import { clearSession, getSession, setSession } from "./session";

const BASE_URL = "/api/v1";

// axios 인스턴스 생성, 공통 설정 적용
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10초 안에 응답이 없으면 실패 처리
});

// 요청마다 로그인 토큰을 붙인다 (백엔드가 토큰에서 회원 ID 를 꺼낸다)
client.interceptors.request.use((config) => {
  if (config.skipAuth) return config;
  const session = getSession();
  if (session) {
    config.headers.Authorization = `${session.tokenType} ${session.accessToken}`;
  }
  return config;
});

// 동시에 여러 요청이 401 을 받아도 토큰 갱신은 한 번만 한다
let refreshing = null;
function refreshTokens() {
  if (!refreshing) {
    const refreshToken = getSession()?.refreshToken;
    refreshing = (
      refreshToken
        ? axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 10000 })
        : Promise.reject(new Error("no refresh token"))
    )
      .then((res) => {
        const tokens = res.data?.data ?? res.data;
        if (!tokens?.accessToken) throw new Error("invalid refresh response");
        setSession(tokens);
        return tokens;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

// CloudFront 는 403/404 를 SPA 용 index.html(200)로 바꿔 돌려준다.
// API 응답인데 HTML 이 오면 실제로는 "찾을 수 없음"이므로 실패로 처리한다.
function isHtmlFallback(res) {
  const type = res.headers?.["content-type"] ?? "";
  return (
    type.includes("text/html") ||
    (typeof res.data === "string" && res.data.trimStart().startsWith("<!"))
  );
}

// 응답 인터셉터 설정
client.interceptors.response.use(
  (res) => {
    if (isHtmlFallback(res)) {
      return Promise.reject({
        status: 404,
        code: "NOT_FOUND",
        message: "요청한 정보를 찾을 수 없어요",
      });
    }
    return res.data?.data ?? res.data; // 백엔드 응답 구조에 맞게 data 필드 추출
  },

  async (err) => {
    const status = err.response?.status ?? null; // 404 등 상태 코드별 처리를 위해 함께 전달
    const config = err.config;

    // access token 만료 → refresh token 으로 한 번만 다시 시도
    if (status === 401 && config && !config.skipAuth && !config._retried && getSession()) {
      try {
        await refreshTokens();
        config._retried = true;
        return client(config);
      } catch {
        clearSession(); // 갱신도 실패하면 로그아웃 → RequireAuth 가 로그인 화면으로 보낸다
      }
    } else if (status === 401 && config && !config.skipAuth) {
      clearSession();
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
