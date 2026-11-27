import client from "./client";

// 클릭 전송이 실패(네트워크 끊김·5xx)하면 로컬에 보관했다가 다시 보낸다.
// 저장 형식: notificationId 문자열 배열 (같은 ID 는 한 번만 보관)
const STORAGE_KEY = "onbeat.bannerClickQueue";
const RETRY_INTERVAL_MS = 30000;

// 클라이언트 인터셉터는 에러를 { status, code, message } 로 바꿔 던진다. 네트워크 실패는 status 가 null.
export const isRetryable = (error) => error.status == null || error.status >= 500;

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function enqueueClick(notificationId) {
  const ids = read();
  if (!ids.includes(notificationId)) write([...ids, notificationId]);
}

// 보관된 클릭을 앞에서부터 다시 보낸다.
// 2xx(201 전송, 202 서버 보관)와 404(노출 없음)는 큐에서 뺀다. 그 밖의 4xx 도 다시 보내도 실패하므로 뺀다.
// 네트워크·5xx 는 서버가 아직 안 되는 것이므로 거기서 멈추고 다음 주기에 다시 시도한다.
export async function flushClickQueue() {
  const done = new Set();
  for (const notificationId of read()) {
    try {
      await client.post("/clicks", { notificationId });
      done.add(notificationId);
    } catch (error) {
      if (!isRetryable(error)) {
        done.add(notificationId);
        continue;
      }
      break;
    }
  }
  if (done.size) write(read().filter((id) => !done.has(id)));
}

// 앱 시작 때 한 번 보내고, 그 뒤 30초마다 다시 보낸다.
export function startClickQueueRetry() {
  flushClickQueue();
  return window.setInterval(flushClickQueue, RETRY_INTERVAL_MS);
}
