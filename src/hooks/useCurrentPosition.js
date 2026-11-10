import { useEffect, useState } from "react";

// 사용자의 현재 위치를 가져오는 훅
export function useCurrentPosition(enable = true) {
  const supported = "geolocation" in navigator;
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  // 위치를 가져오는 useEffect
  useEffect(() => {
    // 아직 물어보면 안 될 때 / 브라우저가 위치 기능을 지원하지 않을 때 / 이미 위치를 받았을 때
    if (!enable || !supported || position) return;

    // 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () =>
        setError(
          "위치 정보를 가져오지 못했어요. 위치 권한을 허용했는지 확인해주세요.",
        ),
      { timeout: 10000 },
    );
  }, [enable, supported, position]); // 의존성 배열 -> 이 값들이 바뀔 때마다 useEffect가 실행됨

  // 반환값 : 위치 정보와 에러 메시지
  return {
    position,
    error: supported ? error : "이 브라우저는 위치 정보를 지원하지 않아요.",
  };
}
