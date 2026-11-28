// 시간 표시용 함수 모음 (원래 목 데이터 파일에 있던 것을 옮김)

// 184 → "3:04" / 값이 없으면 "-:--"
export const secondsToTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "-:--";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

// 곡 목록의 총 길이(초). 길이를 모르는 곡은 0으로 계산
export const totalTime = (songs) =>
  songs.reduce((acc, song) => acc + (song?.duration || 0), 0);

// 2580 → "43분" / 3900 → "1시간 5분"
export const durationLabel = (seconds) => {
  const value = Number.isFinite(seconds) ? seconds : 0;
  return value >= 3600
    ? `${Math.floor(value / 3600)}시간 ${Math.floor((value % 3600) / 60)}분`
    : `${Math.ceil(value / 60)}분`;
};

// 플레이어가 실제로 재생하는 길이: 미리듣기가 있으면 30초, 없으면 곡 길이
export const playableSeconds = (song) =>
  song?.previewUrl ? song.previewDuration : song?.duration || 0;
