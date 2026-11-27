// 회원 연령대·성별 선택지 (백엔드 #160의 허용 값과 같게)
export const AGE_GROUP_OPTIONS = [
  { value: "10s", label: "10대" },
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대" },
  { value: "50s", label: "50대" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

// "20s" → "20대"처럼 서버 값을 화면 글자로 바꾼다 (모르는 값이면 undefined)
export const labelOf = (options, value) =>
  options.find((option) => option.value === value)?.label;
