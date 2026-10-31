import axios from "axios";

const MEMBER_ID_ENV_KEY = "VITE_TEST_MEMBER_ID";

export const getMemberId = () => {
  const memberId = Number(localStorage.getItem('onbeat-member-id') || import.meta.env.VITE_TEST_MEMBER_ID || "1");
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
  if (typeof responseData?.message === "string" && responseData.message.trim()) return responseData.message;
  if (typeof responseData?.code === "string" && responseData.code.trim()) return responseData.code;
  if (error?.code === "ECONNABORTED") return "요청 시간이 초과되었어요. 잠시 후 다시 시도해 주세요.";
  if (!error?.response && error?.request) return "서버에 연결할 수 없어요. API 주소와 서버 상태를 확인해 주세요.";
  return fallback;
};

const apiClient = axios.create({
  baseURL: `${(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "")}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "X-Member-Id": String(getMemberId() ?? ""),
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const memberId = getMemberId();
  if (memberId) config.headers['X-Member-Id'] = String(memberId);
  const token = localStorage.getItem('onbeat-access-token');
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
