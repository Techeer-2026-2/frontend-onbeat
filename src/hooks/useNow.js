import { useEffect, useState } from "react";

// 현재 시각(ms)을 intervalMs마다 갱신해서 돌려준다 (진행률·남은 시간 표시용)
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
