import client from "./client";
import { memberParams } from "./member";

// 검색어를 받아 해당하는 음악 데이터를 가져오는 함수
export const searchMusic = (term) =>
  client.get("/music/search", { params: { term } });

// 곡 정보를 서버 카탈로그에 등록 (재생 기록·랭킹이 이 곡을 알아볼 수 있게)
// trackId: iTunes 곡 번호
export const saveTrack = (trackId, { title, artistName, previewUrl, externalUrl }) =>
  client.put(
    `/music/tracks/${trackId}`,
    { title, artistName, previewUrl, externalUrl },
    { params: memberParams() },
  );
