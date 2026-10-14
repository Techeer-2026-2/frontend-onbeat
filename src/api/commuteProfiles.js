import apiClient from "./client";

// 통근 프로필 목록 조회
export const getCommuteProfiles = async (memberId) => {
  const response = await apiClient.get("/commute-profiles", {
    params: { memberId },
  });

  return response.data;
};