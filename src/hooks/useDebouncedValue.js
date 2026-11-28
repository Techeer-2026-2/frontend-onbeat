import { useEffect, useState } from "react";

// 값이 바뀌고 delay(ms) 동안 더 안 바뀌면 그때 새 값을 돌려준다.
// 장소 검색처럼 글자 칠 때마다 요청하면 안 되는 곳에 사용
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
