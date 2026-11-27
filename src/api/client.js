import axios from "axios";
import { MEMBER_ID } from "./member";

// axios 인스턴스 생성, 공통 설정 적용
const client = axios.create({
  baseURL: "/api/v1",
  timeout: 10000, // 10초 안에 응답이 없으면 실패 처리
  // 회원 번호는 이 헤더로 보낸다 (백엔드 확인: ?memberId= 쿼리는 쓰지 않음)
  headers: { "X-Member-Id": String(MEMBER_ID) },
});

// 응답 인터셉터 설정
client.interceptors.response.use(
  (res) => res.data?.data ?? res.data, // 백엔드 응답 구조에 맞게 data 필드 추출

  (err) => {
    const status = err.response?.status ?? null; // 404 등 상태 코드별 처리를 위해 함께 전달
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
