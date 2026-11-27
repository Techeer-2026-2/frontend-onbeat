import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Heart, Music2, TrainFront, Settings } from "lucide-react";
import XpPanel from "../components/common/XpPanel";
import GlassButton from "../components/common/GlassButton";
import ProfileEditModal from "../components/my/ProfileEditModal";
import { useOnBeat } from "../context/OnBeatContext";
import { logout } from "../api/auth";
import { usePlaylists } from "../hooks/usePlaylists";
import { useMainCommuteProfile } from "../hooks/useCommute";
import { useMe } from "../hooks/useMe";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  labelOf,
} from "../data/profileOptions";
export default function MyPage() {
  const nav = useNavigate();
  const { favorites } = useOnBeat();
  const { data: playlists = [] } = usePlaylists();
  const { profile } = useMainCommuteProfile();
  const { data: me, isLoading: isMeLoading, isError: isMeError } = useMe();
  const [isEditOpen, setIsEditOpen] = useState(false);
  // 연령대·성별 중 있는 것만 "20대 · 여성"처럼 이어 붙인다
  const demographics = [
    labelOf(AGE_GROUP_OPTIONS, me?.ageGroup),
    labelOf(GENDER_OPTIONS, me?.gender),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="page my-page">
      <XpPanel title="마이페이지 ♫" icon={UserRound}>
        <div className="my-avatar">
          <UserRound size={50} />
        </div>
        <h2 className="my-name">
          {isMeLoading ? "불러오는 중..." : me?.nickname || "OnBeat 사용자"}
        </h2>
        <p className="my-sub">{demographics || "Music for Your Commute ♫"}</p>
        <GlassButton
          onClick={async () => {
            await logout();
            nav("/login", { replace: true });
          }}
        >
          로그아웃
        </GlassButton>
        {isMeError && <p className="my-hint">내 정보를 불러오지 못했어요.</p>}
        {me && !me.ageGroup && (
          <p className="my-hint">연령대를 입력하면 맞춤 광고를 받을 수 있어요.</p>
        )}
        {me && (
          <div className="my-edit">
            <GlassButton onClick={() => setIsEditOpen(true)}>
              정보 수정
            </GlassButton>
          </div>
        )}
        <div className="my-stats">
          <div>
            <strong>{playlists.length}</strong>
            <span>플레이리스트</span>
          </div>
          <div>
            <strong>{favorites.length}</strong>
            <span>저장한 음악</span>
          </div>
          <div>
            <strong>
              {profile?.averageMinutes != null
                ? `${profile.averageMinutes}분`
                : "-"}
            </strong>
            <span>통근 시간</span>
          </div>
        </div>
      </XpPanel>
      <XpPanel title="빠른 메뉴" icon={Settings}>
        <div className="my-actions">
          <button onClick={() => nav("/library")}>
            <Music2 /> 내 라이브러리
          </button>
          <button onClick={() => nav("/playlist/commute/create")}>
            <TrainFront /> 통근 플레이리스트 만들기
          </button>
          <button onClick={() => nav("/map")}>
            <Heart /> 나의 통근 경로
          </button>
        </div>
      </XpPanel>
      {isEditOpen && me && (
        <ProfileEditModal me={me} onClose={() => setIsEditOpen(false)} />
      )}
    </div>
  );
}
