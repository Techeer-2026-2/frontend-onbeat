import apiClient, { memberParams } from "./client";

// 통근 프로필 목록 조회
export const getCommuteProfiles = async (memberId) => {
  const response = await apiClient.get("/commute-profiles", {
    params: memberParams(memberId),
  });

  return response.data;
};
