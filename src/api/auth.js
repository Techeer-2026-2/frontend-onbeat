import client from "./client";
import { useAuthStore } from "../stores/authStore";

// 회원가입 (음악 앱 일반 유저). 성공하면 201 과 사용자 정보를 돌려준다.
export const signup = ({ email, password, nickname }) =>
  client.post("/auth/signup", { email, password, nickname });

// 로그인. 성공하면 토큰을 저장한다.
export const login = async ({ email, password }) => {
  const tokens = await client.post("/auth/login", { email, password });
  useAuthStore.getState().setTokens(tokens);
  return tokens;
};

// 로그아웃: 서버의 refresh token 을 지우고, 브라우저의 토큰도 지운다.
export const logout = async () => {
  const { refreshToken } = useAuthStore.getState();
  try {
    if (refreshToken) await client.post("/auth/logout", { refreshToken });
  } finally {
    useAuthStore.getState().clear();
  }
};
