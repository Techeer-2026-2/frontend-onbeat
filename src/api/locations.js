import apiClient, { memberParams } from './client';

export const saveCurrentLocation = async (memberId, location) => (
  await apiClient.post('/locations', { location }, { params: memberParams(memberId) })
).data;
