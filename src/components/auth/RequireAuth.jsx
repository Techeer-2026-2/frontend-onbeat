import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

// 로그인하지 않은 사용자는 로그인 화면으로 보낸다.
export default function RequireAuth({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const location = useLocation();

  // 토큰이 하나라도 있으면 통과시킨다. 만료된 access token 은 client.js 가 갱신한다.
  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
