import axios from "axios";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "X-Member-Id": "1",
  },
  timeout: 10000,
});

export default apiClient;