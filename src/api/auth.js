import client from "./client";

// 음악 앱 회원 인증 (백엔드 /api/v1/auth)
// signup: { email, password, nickname } → { userId, email, nickname, createdAt } (토큰은 주지 않음)
export const signup = (body) => client.post("/auth/signup", body, { skipAuth: true });

// login: { email, password } → { accessToken, refreshToken, tokenType, expiresIn }
export const login = (body) => client.post("/auth/login", body, { skipAuth: true });

// logout: refresh token 을 서버에서 폐기한다 (204)
export const logout = (refreshToken) =>
  client.post("/auth/logout", { refreshToken }, { skipAuth: true });
