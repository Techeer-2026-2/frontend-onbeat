import { create } from "zustand";
import { persist } from "zustand/middleware";

// 로그인 토큰을 브라우저(localStorage)에 보관한다.
// accessToken 은 30분, refreshToken 은 14일 유효 (백엔드 설정).
export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      clear: () => set({ accessToken: null, refreshToken: null }),
    }),
    { name: "onbeat-auth" },
  ),
);
