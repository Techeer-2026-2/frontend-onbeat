import client from "./clinet";

export const getGlobalChart = (limit = 100) =>
  client.get("/rankings/tracks/global", { params: { limit } });

export const getNearbyChart = (lat, lng, limit = 50) =>
  clinet.get("/rankings/tracks/nearby", { params: { lat, lng, limit } });
