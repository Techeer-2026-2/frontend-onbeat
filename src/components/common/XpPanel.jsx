import React, { useState } from "react";
import { Minus, Square, X } from "lucide-react";
export function WinControls({ small = false }) {
  return (
    <div
      className={`win-controls ${small ? "win-controls-small" : ""}`}
      aria-label="Windows Vista 스타일 장식"
    >
      <span className="win-control minimize">
        <Minus size={16} />
      </span>
      <span className="win-control maximize">
        <Square size={13} />
      </span>
      <span className="win-control close">
        <X size={18} />
      </span>
    </div>
  );
}
export default function XpPanel({
  title,
  icon: Icon,
  children,
  action,
  className = "",
  collapsible = false,
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className={`xp-panel ${className}`}>
      <div className="xp-panel-title">
        <span className="xp-title-text">
          {Icon && <Icon size={23} strokeWidth={2.6} />}
          <span>{title}</span>
        </span>
        <div className="xp-title-actions">
          {action}
          {collapsible ? (
            <button
              className="collapse-toggle"
              onClick={() => setCollapsed((p) => !p)}
              aria-label={collapsed ? "펼치기" : "접기"}
            >
              {collapsed ? "+" : "−"}
            </button>
          ) : null}
          <WinControls small />
        </div>
      </div>
      {!collapsed && <div className="xp-panel-body">{children}</div>}
    </section>
  );
}
