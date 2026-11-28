import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, UserRound } from "lucide-react";
import AuthLayout, { AuthField } from "../components/auth/AuthLayout";
import GlassButton from "../components/common/GlassButton";
import { useAuthActions, useSession } from "../hooks/useAuth";

// 백엔드 UserSignupRequest 검증 규칙과 맞춘다
const EMAIL_MAX = 128;
const NICKNAME_MAX = 50;
const PASSWORD_MIN = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt 한계 (UTF-8 기준)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, nickname, password, passwordConfirm }) {
  const errors = {};
  if (!email) errors.email = "이메일을 입력해 주세요.";
  else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email))
    errors.email = "올바른 이메일 형식이 아니에요.";

  if (!nickname) errors.nickname = "닉네임을 입력해 주세요.";
  else if (nickname.length > NICKNAME_MAX)
    errors.nickname = `닉네임은 ${NICKNAME_MAX}자 이하로 입력해 주세요.`;

  if (password.length < PASSWORD_MIN)
    errors.password = `비밀번호는 ${PASSWORD_MIN}자 이상이어야 해요.`;
  else if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES)
    errors.password = "비밀번호가 너무 길어요. (영문 72자 / 한글 24자까지)";

  if (passwordConfirm !== password)
    errors.passwordConfirm = "비밀번호가 일치하지 않아요.";
  return errors;
}

export default function Signup() {
  const nav = useNavigate();
  const location = useLocation();
  const session = useSession();
  const { signup } = useAuthActions();
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const redirectTo = location.state?.from?.pathname ?? "/";
  if (session) return <Navigate to={redirectTo} replace />;

  const update = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const values = { ...form, email: form.email.trim(), nickname: form.nickname.trim() };
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setServerError("");
    setIsPending(true);
    try {
      await signup({
        email: values.email,
        nickname: values.nickname,
        password: values.password,
      });
      // 가입 완료 → 로그인 화면으로 (이메일은 미리 채우고, 로그인 후 원래 가려던 곳으로)
      nav("/login", {
        replace: true,
        state: { email: values.email, signedUp: true, from: location.state?.from },
      });
    } catch (err) {
      setIsPending(false);
      if (err.status === 409) {
        setErrors({ email: "이미 가입된 이메일이에요." });
        return;
      }
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout title="회원가입 ♫" icon={UserPlus}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <p className="auth-lead">가입하고 나만의 통근 플레이리스트를 만들어 보세요.</p>
        <AuthField
          label="이메일"
          icon={Mail}
          type="email"
          autoComplete="email"
          maxLength={EMAIL_MAX}
          value={form.email}
          onChange={update("email")}
          placeholder="listener@onbeat.com"
          error={errors.email}
          autoFocus
        />
        <AuthField
          label="닉네임"
          icon={UserRound}
          autoComplete="nickname"
          maxLength={NICKNAME_MAX}
          value={form.nickname}
          onChange={update("nickname")}
          placeholder="출근러"
          error={errors.nickname}
        />
        <AuthField
          label="비밀번호"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          placeholder={`${PASSWORD_MIN}자 이상`}
          error={errors.password}
        />
        <AuthField
          label="비밀번호 확인"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          value={form.passwordConfirm}
          onChange={update("passwordConfirm")}
          placeholder="비밀번호를 한 번 더 입력"
          error={errors.passwordConfirm}
        />
        {serverError && (
          <p className="auth-error" role="alert">
            {serverError}
          </p>
        )}
        <GlassButton type="submit" variant="green" className="auth-submit" disabled={isPending}>
          {isPending ? "가입 중..." : "가입하고 시작하기"}
        </GlassButton>
        <p className="auth-switch">
          이미 계정이 있나요? <Link to="/login" state={location.state}>로그인</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
