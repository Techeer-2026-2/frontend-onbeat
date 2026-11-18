import { useState } from "react";
import { useOnBeat } from "../../context/OnBeatContext";
import GlassButton from "../common/GlassButton";
import AeroSelect from "../common/AeroSelect";
import PlaceInput from "./PlaceInput";
import {
  useRouteEstimate,
  useSaveCommuteProfile,
} from "../../hooks/useCommute";
import { TRANSPORT_OPTIONS } from "../../api/mappers";

// 통근 경로(통근 프로필) 등록·수정 창
// profile: 수정할 프로필 (없으면 새로 등록)
export default function RouteManager({ profile, onClose }) {
  const { setToast } = useOnBeat();
  const saveProfile = useSaveCommuteProfile();
  const [origin, setOrigin] = useState(profile?.departure ?? null),
    [destination, setDestination] = useState(profile?.arrival ?? null),
    [transport, setTransport] = useState(
      profile?.transport ?? TRANSPORT_OPTIONS[0],
    );
  const route = useRouteEstimate({ origin, destination, transport });
  const save = () => {
    if (!origin || !destination) {
      setToast("출발지와 도착지를 검색해서 목록에서 골라 주세요.");
      return;
    }
    saveProfile.mutate(
      { profileId: profile?.id, origin, destination, transport },
      {
        onSuccess: () => {
          setToast("통근 경로가 저장되었습니다.");
          onClose();
        },
        onError: (error) =>
          setToast(error?.message || "통근 경로를 저장하지 못했어요."),
      },
    );
  };
  return (
    <div className="route-manager">
      <label>
        출발지
        <PlaceInput value={origin} onChange={setOrigin} ariaLabel="출발지" />
      </label>
      <label>
        도착지
        <PlaceInput
          value={destination}
          onChange={setDestination}
          ariaLabel="도착지"
        />
      </label>
      <label>
        이동수단
        <AeroSelect
          value={transport}
          options={TRANSPORT_OPTIONS}
          onValueChange={setTransport}
          ariaLabel="이동수단"
        />
      </label>
      <p className="music-help">
        예상 이동 시간:{" "}
        {route.isFetching
          ? "계산 중..."
          : route.data != null
            ? `${route.data}분`
            : "출발지와 도착지를 고르면 계산돼요"}
      </p>
      <GlassButton onClick={save} disabled={saveProfile.isPending}>
        {saveProfile.isPending ? "저장 중..." : "✓ 경로 저장"}
      </GlassButton>
    </div>
  );
}
