import { useEffect, useRef } from "react";
import { useState } from "react";
import { BREW, PLATFORMS, BADGE, platformById, type Platform } from "../data/platforms";
import { BrandIcon, aiIconSrc } from "./BrandIcon";
import { CopyButton } from "./CopyButton";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
};

export function ConnectModal({ open, selectedId, onSelect, onBack, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const selected = selectedId ? platformById(selectedId) : undefined;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    if (!root) return;
    const preferred = root.querySelector<HTMLElement>("[data-initial-focus]");
    (preferred ?? root).focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, selectedId, onClose]);

  if (!open) return null;

  return (
    <div className="modal-root" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-title"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-bar">
          <div>
            <h2 id="connect-title">{selected ? `${selected.name}에 연결` : "내 AI에 연결하기"}</h2>
            <p>
              {selected
                ? selected.sub
                : "쓰는 도구를 고르면 그 도구에 맞는 연결 순서가 열립니다."}
            </p>
          </div>
          <button type="button" className="icon-btn" aria-label="닫기" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {selected ? (
          <Steps platform={selected} onBack={onBack} onSelect={onSelect} />
        ) : (
          <div className="cgrid modal-grid">
            {PLATFORMS.map((item) => (
              <PlatformButton key={item.id} platform={item} onSelect={onSelect} />
            ))}
          </div>
        )}
        <p className="src">
          연결 순서는 2026년 11월 각 서비스 공식 문서 기준이며 바뀔 수 있습니다. chattong-mcp 패키지는 배포 전입니다.
        </p>
      </div>
    </div>
  );
}

function PlatformButton({ platform, onSelect }: { platform: Platform; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      className={platform.kind === "no" ? "tile muted" : "tile"}
      onClick={() => onSelect(platform.id)}
    >
      <span className="ic">
        <BrandIcon src={aiIconSrc(platform.icon)} mono={platform.mono} tint={platform.tint} />
      </span>
      <span className="nm">
        {platform.name}
        <small>{platform.sub}</small>
      </span>
      <span className="act">
        <b className={`badge b-${platform.kind}`}>{BADGE[platform.kind]}</b>
        <span className="go">보기</span>
      </span>
    </button>
  );
}

function Steps({
  platform,
  onBack,
  onSelect,
}: {
  platform: Platform;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const [hold, setHold] = useState(false);
  const blocked = platform.kind === "no";

  return (
    <div className="steps-wrap">
      <button type="button" className="text-btn back" onClick={onBack} data-initial-focus>
        모든 도구
      </button>
      <div className="picked">
        <span className="ic">
          <BrandIcon src={aiIconSrc(platform.icon)} mono={platform.mono} tint={platform.tint} />
        </span>
        <div>
          <strong>{platform.name}</strong>
          <span>{platform.sub}</span>
        </div>
        <b className={`badge b-${platform.kind}`}>{BADGE[platform.kind]}</b>
      </div>

      {blocked ? (
        <div className="ps solo">
          <h3>지금은 연결할 수 없습니다</h3>
          <p>{platform.blurb}</p>
          <button type="button" className="btn primary" onClick={() => onSelect("grok-build")}>
            Grok Build로 연결하기
          </button>
        </div>
      ) : (
        <div className="psteps">
          <article className="ps">
            <span className="k">1 · 엔진</span>
            <h3>kakaocli 설치</h3>
            <p>Mac에서 카카오톡 대화를 읽는 오픈소스 엔진입니다. 챗통은 이 위에서 읽기만 합니다.</p>
            <div className="code">
              <code>{BREW}</code>
              <CopyButton value={BREW} />
            </div>
            <p className="note">지금은 Mac 카카오톡만 지원합니다.</p>
          </article>
          <article className="ps">
            <span className="k">2 · 권한</span>
            <h3>전체 디스크 접근</h3>
            <p>
              시스템 설정 &gt; 개인정보 보호 및 보안 &gt; 전체 디스크 접근에서 <b>{platform.name}</b>
              (또는 터미널)을 켭니다. 메시지를 보내기 위한 권한은 필요 없습니다.
            </p>
          </article>
          <article className="ps">
            <span className="k">3 · 연결</span>
            <h3>{platform.kind === "one" ? "한 번에 추가" : platform.kind === "cmd" ? "명령 붙여넣기" : "앱에서 추가"}</h3>
            <p>{platform.blurb}</p>
            {platform.command && (
              <div className={platform.command.includes("\n") ? "code block" : "code"}>
                <code>{platform.command}</code>
                <CopyButton value={platform.command} />
              </div>
            )}
            {platform.href === "#mcpb" ? (
              <>
                <button type="button" className="btn blue" onClick={() => setHold(true)} aria-describedby="mcpb-note">
                  {platform.hrefLabel}
                </button>
                <p id="mcpb-note" className="note" role="status">
                  {hold
                    ? "아직 받을 파일이 없습니다. chattong-mcp 배포와 함께 이 버튼으로 받게 됩니다."
                    : platform.note}
                </p>
              </>
            ) : (
              platform.href &&
              platform.hrefLabel && (
                <a className="btn blue" href={platform.href}>
                  {platform.hrefLabel}
                </a>
              )
            )}
            {platform.note && platform.href !== "#mcpb" && <p className="note">{platform.note}</p>}
            {platform.verify && <p className="note">확인: {platform.verify}</p>}
          </article>
        </div>
      )}
      <p className="src left">
        출처:{" "}
        <a href={platform.srcHref} target="_blank" rel="noreferrer">
          {platform.srcLabel}
        </a>
      </p>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
