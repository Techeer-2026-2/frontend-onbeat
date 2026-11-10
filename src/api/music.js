import client from "./client";

// 검색어를 받아 해당하는 음악 데이터를 가져오는 함수
export const searchMusic = (term) =>
  client.get("music/search", { params: { term } });
