import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../../hooks/useAuth";

// 로그인하지 않았으면 로그인 화면으로 보내고, 로그인 후 원래 가려던 곳으로 돌아온다
export default function RequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
