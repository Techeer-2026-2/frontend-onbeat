import { useEffect, useState } from 'react';
import { estimateRoute } from '../api/routes';
import { cancelCommuteSession, completeCommuteSession, startCommuteSession } from '../api/commuteSessions';
import { getApiErrorMessage, getMemberId } from '../api/client';
import {
  MapPin,
  Navigation,
  LocateFixed,
  Clock3,
  TrainFront,
  Bus,
  Footprints,
  CarFront,
  Music2,
  Play,
  Square,
  X,
  ArrowRight,
} from 'lucide-react';

import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import IconButton from '../components/common/IconButton';

const transitModes = [
  { id: 'subway', label: '지하철', icon: TrainFront },
  { id: 'bus', label: '버스', icon: Bus },
  { id: 'walk', label: '도보', icon: Footprints },
  { id: 'car', label: '자동차', icon: CarFront },
];

const stationCoordinates = {
  강남역: { startLatitude: 37.4979, startLongitude: 127.0276 },
  판교역: { endLatitude: 37.3947, endLongitude: 127.1112 },
};

function Map() {
  const [isRouteConfigured, setIsRouteConfigured] = useState(false);
  const [origin, setOrigin] = useState('강남역');
  const [destination, setDestination] = useState('판교역');
  const [transitMode, setTransitMode] = useState('subway');
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [isCommuting, setIsCommuting] = useState(false);
  const [duration, setDuration] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [commuteSession, setCommuteSession] = useState(null);
  const [sessionError, setSessionError] = useState('');
  const [isSessionPending, setIsSessionPending] = useState(false);
  const memberId = getMemberId();
  const [commuteProfileId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('onbeat-commute-profile') || '{}').commuteProfileId ?? null;
    } catch {
      return null;
    }
  });

  const selectedMode = transitModes.find(
    (mode) => mode.id === transitMode
  ) ?? transitModes[0];

  const TransitIcon = selectedMode.icon;

  useEffect(() => {
    if (!isRouteConfigured) return undefined;
    const originCoordinates = stationCoordinates[origin];
    const destinationCoordinates = stationCoordinates[destination];
    if (!originCoordinates || !destinationCoordinates) {
      Promise.resolve().then(() => {
        setDuration(null);
        setEstimateError('출발지와 도착지의 좌표를 확인할 수 없어요.');
      });
      return undefined;
    }
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return null;
      setIsEstimating(true);
      setEstimateError('');
      return estimateRoute({
      ...originCoordinates,
      ...destinationCoordinates,
      transportMode: { subway: 'PUBLIC_TRANSIT', bus: 'PUBLIC_TRANSIT', walk: 'WALK', car: 'CAR' }[transitMode],
      });
    }).then((result) => {
      if (!cancelled) setDuration(Number(result?.durationMinutes ?? result?.duration ?? 0) || null);
    }).catch(() => {
      if (!cancelled) setEstimateError('예상 소요시간을 불러오지 못했어요.');
    }).finally(() => { if (!cancelled) setIsEstimating(false); });
    return () => { cancelled = true; };
  }, [isRouteConfigured, origin, destination, transitMode]);

  const handleSaveRoute = () => {
    if (!origin.trim() || !destination.trim()) {
      alert('출발역과 도착역을 모두 입력해 주세요.');
      return;
    }

    setIsRouteConfigured(true);
    setIsEditingRoute(false);
    setIsCommuting(false);
  };

  const handleToggleCommute = async () => {
    if (isSessionPending) return;
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      setSessionError('.env.local에 유효한 VITE_TEST_MEMBER_ID를 설정해 주세요.');
      return;
    }

    setIsSessionPending(true);
    setSessionError('');
    try {
      if (!isCommuting) {
        if (!Number.isSafeInteger(Number(commuteProfileId)) || Number(commuteProfileId) <= 0) {
          throw new Error('통근 세션을 시작하려면 저장된 통근 프로필이 필요합니다. 통근 맞춤 플레이리스트에서 경로를 먼저 저장해 주세요.');
        }
        const response = await startCommuteSession(memberId, {
          commuteProfileId: Number(commuteProfileId),
        });
        const session = response?.data ?? response?.session ?? response;
        setCommuteSession(session);
        setIsCommuting(true);
      } else {
        const sessionId = commuteSession?.id ?? commuteSession?.sessionId;
        if (sessionId == null) throw new Error('통근 세션 ID를 확인할 수 없습니다.');
        await completeCommuteSession(sessionId, memberId);
        setCommuteSession(null);
        setIsCommuting(false);
      }
    } catch (error) {
      setSessionError(getApiErrorMessage(error, '통근 세션 요청에 실패했어요.'));
    } finally {
      setIsSessionPending(false);
    }
  };

  const handleCancelCommute = async () => {
    const sessionId = commuteSession?.id ?? commuteSession?.sessionId;
    if (sessionId == null || isSessionPending) return;
    setIsSessionPending(true);
    setSessionError('');
    try {
      await cancelCommuteSession(sessionId, memberId);
      setCommuteSession(null);
      setIsCommuting(false);
    } catch (error) {
      setSessionError(getApiErrorMessage(error, '통근 세션 취소에 실패했어요.'));
    } finally {
      setIsSessionPending(false);
    }
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      {/* 통근 경로 미설정 화면 */}
      {!isRouteConfigured ? (
        <Card padding="lg" className="mt-8">
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-spotify-green/10">
              <Navigation
                size={38}
                className="text-spotify-green"
              />
            </div>

            <h2 className="mb-2 text-xl font-bold text-white">
              아직 등록된 통근 경로가 없어요
            </h2>

            <p className="mb-7 max-w-xs text-sm leading-6 text-spotify-subtext">
              출발지와 도착지를 설정하고
              <br />
              나에게 맞는 통근길 플레이리스트를 만나보세요.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsEditingRoute(true)}
            >
              <span className="flex items-center gap-2">
                <MapPin size={18} />
                통근 경로 설정하기
              </span>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* 통근 경로 요약: 모든 정보를 한 줄에 배치 */}
          <Card padding="md">
            <div className="flex items-center justify-between gap-2">
              {/* 왼쪽: 통근 상태 + 출발역 → 도착역 */}
              <div className="flex min-w-0 items-center gap-2">
                <Badge
                  variant={isCommuting ? 'warning' : 'primary'}
                  size="sm"
                  className="shrink-0"
                >
                  {isCommuting ? '통근 중' : '통근 전'}
                </Badge>

                <span className="min-w-0 truncate text-sm font-bold text-white">
                  {origin} → {destination}
                </span>
              </div>

              {/* 오른쪽: 교통수단 + 소요 시간 */}
              <div className="flex shrink-0 items-center gap-1.5 text-sm text-spotify-subtext">
                <TransitIcon
                  size={17}
                  className="shrink-0 text-spotify-green"
                />

                <span>{selectedMode.label}</span>
                <span>·</span>

                <Clock3 size={15} className="shrink-0" />

                    <span>{isEstimating ? '계산 중' : duration ? `${duration}분` : '-'}</span>
              </div>
            </div>

            {/* 통근 중일 때만 진행 상황 표시 */}
            {isCommuting && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-spotify-green">
                    현재: 선릉역
                  </span>

                  <span className="shrink-0 text-spotify-subtext">
                    남은 시간: 16분 (50%)
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/2 rounded-full bg-spotify-green" />
                </div>
              </div>
            )}
          </Card>

          {/* 지도 영역: GPS / 노선 / 예상 소요 시간의 3개 구역 */}
          <div className="relative isolate flex flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-[#151c1a] p-4">
            {/* 점선 그리드 배경 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #35413d 1px, transparent 1.5px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* 1. GPS 상태 + 현재 위치 버튼 */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 rounded-xl bg-black/90 px-3 py-2 text-xs text-white">
                <span className="h-2 w-2 shrink-0 rounded-full bg-spotify-green" />
                <span>GPS 위치 추적 모의 화면</span>
              </div>

              <IconButton
                label="현재 위치"
                className="shrink-0 bg-spotify-dark"
                onClick={() => console.log('현재 위치 버튼 클릭')}
              >
                <LocateFixed
                  size={20}
                  className="text-spotify-green"
                />
              </IconButton>
            </div>

            {/* 2. 노선 표시 영역: 높이를 줄이고 내부 여백을 확보 */}
            <div className="relative flex h-44 w-full items-center justify-center px-6 text-center text-xs text-spotify-subtext">
              경로 선형 지도 데이터는 현재 API 명세에 제공되지 않습니다.
            </div>

            {/* 3. 예상 소요 시간 카드 */}
            <div className="relative z-10 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/90 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Clock3
                  size={22}
                  className="shrink-0 text-spotify-green"
                />

                <div>
                  <p className="text-xs text-spotify-subtext">
                    예상 소요 시간
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {isEstimating ? '계산 중' : duration ? `${duration}분` : '-'} · {selectedMode.label}
                  </p>
                </div>
              </div>

              <Badge variant="primary" className="shrink-0">
                8곡 재생 예정
              </Badge>
            </div>
          </div>

          {/* 통근길 플레이리스트 */}
          <Card padding="md" hoverable>
            <button
              type="button"
              className="flex w-full items-center gap-3 text-left"
              onClick={() =>
                console.log('통근길 플레이리스트 클릭')
              }
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-spotify-green text-black">
                <Music2 size={28} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-bold text-white">
                  32분 맞춤 출근길 플레이리스트
                </h2>

                <p className="mt-1 text-sm text-spotify-subtext">
                  통근 시간에 맞춘 8곡
                </p>
              </div>

              <ArrowRight
                size={22}
                className="shrink-0 text-white"
              />
            </button>
          </Card>

          {/* 통근 시작 / 중단 */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleToggleCommute}
          >
            <span className="flex items-center justify-center gap-2">
              {isCommuting ? (
                <Square size={18} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}

              {isSessionPending ? '처리 중...' : (isCommuting ? '통근 완료' : '출근 시작')}
            </span>
          </Button>
          {isCommuting && (
            <Button variant="secondary" size="md" className="w-full" onClick={handleCancelCommute} disabled={isSessionPending}>
              통근 세션 취소
            </Button>
          )}
          {sessionError && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">{sessionError}</p>}
        </>
      )}

      {/* 경로 설정 모달 */}
      {isEditingRoute && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
          onClick={() => setIsEditingRoute(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-white/10 bg-spotify-dark p-6 sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                통근 경로 설정
              </h2>

              <IconButton
                label="닫기"
                onClick={() => setIsEditingRoute(false)}
              >
                <X size={22} />
              </IconButton>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="origin"
                  className="mb-2 block text-sm text-spotify-subtext"
                >
                  출발역
                </label>

                <input
                  id="origin"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="출발역을 입력하세요"
                  className="w-full rounded-xl border border-white/10 bg-spotify-black px-4 py-3 text-white outline-none focus:border-spotify-green"
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="mb-2 block text-sm text-spotify-subtext"
                >
                  도착역
                </label>

                <input
                  id="destination"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                  placeholder="도착역을 입력하세요"
                  className="w-full rounded-xl border border-white/10 bg-spotify-black px-4 py-3 text-white outline-none focus:border-spotify-green"
                />
              </div>

              <div>
                <p className="mb-3 text-sm text-spotify-subtext">
                  이동 수단
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {transitModes.map((mode) => {
                    const ModeIcon = mode.icon;
                    const isSelected = transitMode === mode.id;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setTransitMode(mode.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition ${
                          isSelected
                            ? 'border-spotify-green bg-spotify-green/10 text-spotify-green'
                            : 'border-white/10 text-spotify-subtext hover:bg-white/5'
                        }`}
                      >
                        <ModeIcon size={22} />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {estimateError && <p role="alert" className="text-xs text-amber-300">{estimateError}</p>}

            <div className="mt-7 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsEditingRoute(false)}
              >
                취소
              </Button>

              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveRoute}
              >
                경로 저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
