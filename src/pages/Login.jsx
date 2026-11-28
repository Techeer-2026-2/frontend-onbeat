import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import AuthLayout, { AuthField } from "../components/auth/AuthLayout";
import GlassButton from "../components/common/GlassButton";
import { useAuthActions, useSession } from "../hooks/useAuth";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const session = useSession();
  const { login } = useAuthActions();
  const justSignedUp = Boolean(location.state?.signedUp); // 회원가입 직후 넘어온 경우
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // 로그인 후 원래 가려던 화면으로 돌아간다
  const redirectTo = location.state?.from?.pathname ?? "/";
  if (session) return <Navigate to={redirectTo} replace />;

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setError("");
    setIsPending(true);
    try {
      await login({ email: email.trim(), password });
      nav(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.code === "INVALID_CREDENTIALS"
          ? "이메일 또는 비밀번호가 올바르지 않아요."
          : err.message,
      );
      setIsPending(false);
    }
  };

  return (
    <AuthLayout title="로그인 ♫" icon={LogIn}>
      <form className="auth-form" onSubmit={submit} noValidate>
        {justSignedUp ? (
          <p className="auth-notice" role="status">
            회원가입이 완료됐어요. 로그인해 주세요.
          </p>
        ) : (
          <p className="auth-lead">통근길 음악, OnBeat 에 오신 걸 환영해요!</p>
        )}
        <AuthField
          label="이메일"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="listener@onbeat.com"
          autoFocus={!justSignedUp}
        />
        <AuthField
          label="비밀번호"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoFocus={justSignedUp}
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <GlassButton type="submit" variant="green" className="auth-submit" disabled={isPending}>
          {isPending ? "로그인 중..." : "로그인"}
        </GlassButton>
        <p className="auth-switch">
          아직 계정이 없나요? <Link to="/signup" state={location.state}>회원가입</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
