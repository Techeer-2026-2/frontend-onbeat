// 로그인 토큰 보관소 (localStorage + 구독)
// 백엔드는 Authorization: Bearer <회원 access token> 으로 회원을 식별한다 (MemberIdArgumentResolver)
const STORAGE_KEY = "onbeat.session";

const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

let session = read();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSession() {
  return session;
}

// tokens: { accessToken, refreshToken, tokenType, expiresIn }
export function setSession(tokens) {
  session = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenType: tokens.tokenType || "Bearer",
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서는 메모리에만 둔다
  }
  emit();
}

export function clearSession() {
  session = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
  emit();
}

export function subscribeSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 다른 탭에서 로그인/로그아웃하면 이 탭도 따라간다
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    session = read();
    emit();
  });
}
