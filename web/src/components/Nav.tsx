import { useEffect, useState } from "react";
import type { Theme } from "../lib/useTheme";

const LINKS = [
  { href: "#demo", label: "사용 예시" },
  { href: "#connect", label: "연결하기" },
  { href: "#safety", label: "안전" },
  { href: "#faq", label: "질문" },
];

export function Nav({
  theme,
  onToggleTheme,
  onConnect,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  onConnect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const logo = theme === "dark" ? "/brand/app-dark-96.png" : "/brand/app-light-96.png";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav>
      <div className="wrap nav-row">
        <a className="brand" href="#top">
          <img src={logo} width={30} height={30} alt="" />
          <span>챗통</span>
          <small>chattong</small>
        </a>
        <div className={open ? "links open" : "links"} id="site-menu">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="https://github.com/eduoneq/chattong" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "메뉴 닫기" : "메뉴"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseGlyph /> : <MenuGlyph />}
          </button>
          <button
            type="button"
            className="icon-btn theme-btn"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button type="button" className="pill-btn" onClick={onConnect}>
            내 AI에 연결
          </button>
        </div>
      </div>
    </nav>
  );
}

function MenuGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M18 6l-1.6 1.6M7.6 16.4L6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M15.5 3.8A7.8 7.8 0 1 0 20.2 14 6.2 6.2 0 0 1 15.5 3.8z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
