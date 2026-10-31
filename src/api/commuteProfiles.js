import apiClient from "./client";

// 통근 프로필 목록 조회
export const getCommuteProfiles = async (memberId) => {
  const response = await apiClient.get("/commute-profiles", {
    params: { memberId },
  });

  return response.data;
};

export const getCommuteProfile = async (profileId, memberId) => {
  const response = await apiClient.get(`/commute-profiles/${profileId}`, {
    params: { memberId },
  });
  return response.data;
};

export const createCommuteProfile = async (memberId, payload) => {
  const response = await apiClient.post('/commute-profiles', payload, {
    params: { memberId },
  });
  return response.data;
};

export const updateCommuteProfile = async (profileId, memberId, payload) => {
  const response = await apiClient.patch(`/commute-profiles/${profileId}`, payload, {
    params: { memberId },
  });
  return response.data;
};

export const deleteCommuteProfile = async (profileId, memberId) => {
  return apiClient.delete(`/commute-profiles/${profileId}`, {
    params: { memberId },
  });
};
