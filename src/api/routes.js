import apiClient from './client';

// Swagger: POST /api/v1/routes/estimate
export const estimateRoute = async ({
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
  transportMode,
}) => {
  const response = await apiClient.post('/routes/estimate', {
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude,
    transportMode,
  });

  return response.data;
};

