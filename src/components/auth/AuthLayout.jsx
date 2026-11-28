import { Music } from "lucide-react";
import { WinControls } from "../common/XpPanel";
import XpPanel from "../common/XpPanel";

// 로그인·회원가입 공용 틀 (하단 내비게이션·플레이어 없이 앱 창 모양만 유지)
export default function AuthLayout({ title, icon, children }) {
  return (
    <div className="app-shell auth-shell">
      <div className="main-win-title">
        <div className="window-app-name">
          <Music size={22} fill="white" strokeWidth={1.6} />
          <strong>OnBeat</strong>
          <span>– Music for Your Commute</span>
        </div>
        <WinControls />
      </div>
      <div className="hero-banner hero-large">
        <img src="/assets/logos/onbeat-banner.webp" alt="OnBeat" />
      </div>
      <main className="page-content">
        <div className="page auth-page">
          <XpPanel title={title} icon={icon}>
            {children}
          </XpPanel>
        </div>
      </main>
    </div>
  );
}

// 라벨 + 유리 입력칸
export function AuthField({ label, icon: Icon, error, ...inputProps }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className={`glossy-field auth-input ${error ? "has-error" : ""}`}>
        {Icon && <Icon size={18} />}
        <input {...inputProps} aria-invalid={Boolean(error)} />
      </div>
      {error && <small className="auth-field-error">{error}</small>}
    </label>
  );
}
