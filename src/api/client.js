import axios from "axios";

// axios 인스턴스 생성, 공통 설정 적용
const client = axios.create({
  baseURL: "/api/v1",
});

// 응답 인터셉터 설정
client.interceptors.response.use(
  (res) => res.data?.data ?? res.data, // 백엔드 응답 구조에 맞게 data 필드 추출

  (err) =>
    Promise.reject({
      code: err.response?.data?.code ?? "NETWORK_ERROR",
      message: err.response?.data?.message ?? "서버에 연결할 수 없어요",
    }),
);

export default client;
