import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Map from './pages/Map';
import CreatePlaylist from './pages/CreatePlaylist';
import CreateCommutePlaylist from './pages/CreateCommutePlaylist';
import MyPage from './pages/MyPage';
import Charts from './pages/Charts';

export default function App() {
  return <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/search" element={<Search />} />
      <Route path="/library" element={<Library />} />
      <Route path="/map" element={<Map />} />
      <Route path="/playlist/create" element={<CreatePlaylist />} />
      <Route path="/playlist/commute/create" element={<CreateCommutePlaylist />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/charts/top100" element={<Charts />} />
      <Route path="/charts/nearby50" element={<Charts />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
