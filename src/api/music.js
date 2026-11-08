import axios from "axios";

export async function searchMusic(term) {
  const response = await axios.get("/api/v1/music/search", {
    params: { term },
  });
  return response.data;
}
