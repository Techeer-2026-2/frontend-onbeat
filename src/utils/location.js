// 재생 기록에 붙일 현재 위치를 한 번만 가져온다.
// 권한이 없거나 실패하면 null (위치 없이도 재생 기록은 보낼 수 있음)
export const getLocationOnce = () =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) =>
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracyMeters: coords.accuracy,
          recordedAt: new Date(timestamp).toISOString(),
        }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 },
    );
  });
