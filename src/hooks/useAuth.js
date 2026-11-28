import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { login as loginApi, logout as logoutApi, signup as signupApi } from "../api/auth";
import { clearSession, getSession, setSession, subscribeSession } from "../api/session";

// 지금 로그인 상태 (토큰이 바뀌면 다시 그린다)
export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession);
}

// 로그인 토큰이 있어야 앱을 쓸 수 있다 (로컬 개발도 동일)
export function useIsAuthenticated() {
  return Boolean(useSession());
}

export function useAuthActions() {
  const queryClient = useQueryClient();

  const login = async ({ email, password }) => {
    const tokens = await loginApi({ email, password });
    queryClient.clear(); // 이전 회원의 캐시가 섞이지 않게 비운다
    setSession(tokens);
  };

  // 가입 API 는 토큰을 주지 않으므로 가입 직후 같은 정보로 로그인한다
  const signup = async ({ email, password, nickname }) => {
    await signupApi({ email, password, nickname });
    await login({ email, password });
  };

  const logout = async () => {
    const refreshToken = getSession()?.refreshToken;
    clearSession();
    queryClient.clear();
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch {
        // 서버 폐기에 실패해도 이 기기에서는 이미 로그아웃됐다
      }
    }
  };

  return { login, signup, logout };
}
