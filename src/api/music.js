const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function searchMusic(term) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/music/search?term=${encodeURIComponent(term)}`,
  );

  if (!response.ok) {
    throw new Error(`음악 검색 요청 실패 (${response.status})`);
  }

  return response.json();
}
