import axios from "axios";

const client = axios.create({
  baseURL: "/api/v1",
});

client.interceptors.response.use(
  (res) => res.data?.data ?? res.data, // 백엔드 응답 구조에 맞게 data 필드 추출

  (err) =>
    Promise.reject({
      code: err.response?.data?.code ?? "NETWORK_ERROR",
      message: err.response?.data?.message ?? "서버에 연결할 수 없어요",
    }),
);

export default client;
