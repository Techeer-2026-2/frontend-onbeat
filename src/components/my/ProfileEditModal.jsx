import { useState } from "react";
import Modal from "../common/Modal";
import GlassButton from "../common/GlassButton";
import { useOnBeat } from "../../context/OnBeatContext";
import { useUpdateMe } from "../../hooks/useMe";
import { AGE_GROUP_OPTIONS, GENDER_OPTIONS } from "../../data/profileOptions";

const NICKNAME_MAX = 50;

// 선택 버튼 묶음 (연령대·성별 공용)
// 서버는 보내지 않은 값을 그대로 두므로 "선택 안 함"으로 되돌릴 수는 없다 (백엔드 #160)
function OptionChips({ label, options, value, onChange }) {
  return (
    <fieldset className="profile-field-group">
      <legend>{label}</legend>
      <div className="chips">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? "selected" : ""}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// me: 지금 내 정보 / onClose: 모달 닫기
export default function ProfileEditModal({ me, onClose }) {
  const [nickname, setNickname] = useState(me.nickname ?? "");
  const [ageGroup, setAgeGroup] = useState(me.ageGroup ?? null);
  const [gender, setGender] = useState(me.gender ?? null);
  const [error, setError] = useState("");
  const updateMe = useUpdateMe();
  const { setToast } = useOnBeat();

  const submit = (event) => {
    event.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return setError("닉네임을 입력해 주세요.");
    if (trimmed.length > NICKNAME_MAX)
      return setError(`닉네임은 ${NICKNAME_MAX}자 이하로 입력해 주세요.`);

    // 바뀐 값만 보낸다 (보내지 않은 값은 서버가 그대로 둔다)
    const body = {};
    if (trimmed !== me.nickname) body.nickname = trimmed;
    if (ageGroup !== me.ageGroup) body.ageGroup = ageGroup;
    if (gender !== me.gender) body.gender = gender;
    if (Object.keys(body).length === 0) return onClose(); // 바뀐 게 없으면 요청 없이 닫기

    setError("");
    updateMe.mutate(body, {
      onSuccess: () => {
        setToast("내 정보를 저장했어요.");
        onClose();
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <Modal title="내 정보 수정" onClose={onClose}>
      <form className="profile-form" onSubmit={submit}>
        <label className="profile-field-group">
          <span>닉네임</span>
          <div className="glossy-field profile-input">
            <input
              value={nickname}
              maxLength={NICKNAME_MAX}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력해 주세요"
            />
          </div>
        </label>
        <OptionChips
          label="연령대"
          options={AGE_GROUP_OPTIONS}
          value={ageGroup}
          onChange={setAgeGroup}
        />
        <OptionChips
          label="성별"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={setGender}
        />
        <p className="profile-note">
          연령대·성별은 맞춤 광고에 쓰여요. 한 번 저장하면 다른 값으로 바꿀 수는
          있지만 비울 수는 없어요.
        </p>
        {error && (
          <p className="profile-error" role="alert">
            {error}
          </p>
        )}
        <div className="profile-actions">
          <GlassButton onClick={onClose} disabled={updateMe.isPending}>
            취소
          </GlassButton>
          <GlassButton
            type="submit"
            variant="green"
            disabled={updateMe.isPending}
          >
            {updateMe.isPending ? "저장 중..." : "저장"}
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
}
