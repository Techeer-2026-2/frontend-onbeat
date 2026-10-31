import apiClient from './client';

// docs/swagger.json: GET /api/v1/places/search?keyword={keyword}
export const searchPlaces = async (keyword) => {
  const response = await apiClient.get('/places/search', { params: { keyword } });
  return response.data;
};
