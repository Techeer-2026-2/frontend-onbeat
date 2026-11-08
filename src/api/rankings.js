import client from "./client";

export const getGlobalChart = (limit = 100) =>
  client.get("/rankings/tracks/global", { params: { limit } });

export const getNearbyChart = (lat, lng, limit = 50) =>
  client.get("/rankings/tracks/nearby", { params: { lat, lng, limit } });
