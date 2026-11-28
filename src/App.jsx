import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Map from "./pages/Map";
import CreatePlaylist from "./pages/CreatePlaylist";
import CreateCommutePlaylist from "./pages/CreateCommutePlaylist";
import MyPage from "./pages/MyPage";
import Charts from "./pages/Charts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./components/auth/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* 아래 화면은 로그인해야 볼 수 있다 */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/map" element={<Map />} />
          <Route path="/playlist/create" element={<CreatePlaylist />} />
          <Route
            path="/playlist/commute/create"
            element={<CreateCommutePlaylist />}
          />
          <Route path="/my" element={<MyPage />} />
          <Route path="/charts/top100" element={<Charts />} />
          <Route path="/charts/nearby50" element={<Charts />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
