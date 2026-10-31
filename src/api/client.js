import axios from "axios";

const API_VERSION_PREFIX = "/api/v1";
const MEMBER_ID_ENV_KEY = "VITE_TEST_MEMBER_ID";

// VITE_API_BASE_URL에는 서버 origin(http://localhost:8080) 또는 /api/v1까지
// 포함한 URL을 모두 허용한다. 비워 두면 Vite 개발 서버의 프록시를 사용한다.
const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
export const apiBaseUrl = configuredBaseUrl.endsWith(API_VERSION_PREFIX)
  ? configuredBaseUrl
  : `${configuredBaseUrl}${API_VERSION_PREFIX}`;

export const getMemberId = () => {
  const memberId = Number(import.meta.env[MEMBER_ID_ENV_KEY]);
  return Number.isSafeInteger(memberId) && memberId > 0 ? memberId : null;
};

export const memberParams = (memberId = getMemberId()) => {
  if (!Number.isSafeInteger(memberId) || memberId <= 0) {
    throw new Error(`유효한 회원 ID가 없습니다. .env.local에 ${MEMBER_ID_ENV_KEY}를 설정해 주세요.`);
  }

  return { memberId };
};

export const getApiErrorMessage = (error, fallback = "요청 처리 중 오류가 발생했어요.") => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof responseData?.code === "string" && responseData.code.trim()) {
    return responseData.code;
  }
  if (error?.code === "ECONNABORTED") return "요청 시간이 초과되었어요. 잠시 후 다시 시도해 주세요.";
  if (!error?.response && error?.request) return "서버에 연결할 수 없어요. API 주소와 서버 상태를 확인해 주세요.";
  return fallback;
};

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 현재 백엔드는 memberId 쿼리 파라미터와 X-Member-Id 헤더를 함께 검증한다.
// 각 API 모듈은 memberParams로 쿼리를 넣고, 헤더는 여기서 일관되게 추가한다.
apiClient.interceptors.request.use((config) => {
  const memberId = getMemberId();
  if (memberId !== null) {
    config.headers["X-Member-Id"] = String(memberId);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  },
);

export default apiClient;
