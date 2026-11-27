import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import GlassButton from "../components/common/GlassButton";
import { login, signup } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

// 음악 앱 로그인 / 회원가입 화면. 로그인해야 메인 화면을 쓸 수 있다.
export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // 이미 로그인된 상태면 바로 원래 가려던 곳으로
  if (accessToken) return <Navigate to={location.state?.from || "/"} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await signup(form);
        // 가입 후 바로 로그인
      }
      await login({ email: form.email, password: form.password });
      nav(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message || "요청을 처리하지 못했어요");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page login-page" style={{ maxWidth: 360, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>
        {mode === "login" ? "로그인" : "회원가입"} · OnBeat ♫
      </h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호 (8자 이상)"
          value={form.password}
          onChange={onChange}
          minLength={8}
          required
        />
        {mode === "signup" && (
          <input
            name="nickname"
            placeholder="닉네임"
            value={form.nickname}
            onChange={onChange}
            maxLength={50}
            required
          />
        )}
        {error && <p style={{ color: "#c2410c" }}>{error}</p>}
        <GlassButton type="submit" disabled={busy}>
          {busy ? "처리 중..." : mode === "login" ? "로그인" : "가입하고 시작하기"}
        </GlassButton>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
        }}
        style={{ marginTop: 12, background: "none", border: "none", textDecoration: "underline" }}
      >
        {mode === "login" ? "처음이신가요? 회원가입" : "이미 계정이 있어요 (로그인)"}
      </button>
    </div>
  );
}
