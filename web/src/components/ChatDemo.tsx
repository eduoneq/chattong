import { useEffect, useState } from "react";
import { DEMOS } from "../data/demos";
import { MESSENGERS, messengerById, type MessengerId } from "../data/messengers";
import { useReducedMotion } from "../lib/useReducedMotion";
import { BrandIcon, aiIconSrc, msgIconSrc } from "./BrandIcon";

type View =
  | { phase: "typing"; count: number }
  | { phase: "thinking" }
  | { phase: "tools"; shown: number; checked: number }
  | { phase: "result" };

function pause(ms: number, isDead: () => boolean) {
  return new Promise<void>((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      window.clearInterval(watch);
      resolve();
    };
    const timer = window.setTimeout(done, ms);
    const watch = window.setInterval(() => {
      if (isDead()) done();
    }, 40);
  });
}

function shotView(): View | null {
  const shot = new URLSearchParams(window.location.search).get("shot");
  if (shot === "chat") return { phase: "tools", shown: 3, checked: 2 };
  if (shot === "result") return { phase: "result" };
  return null;
}

export function ChatDemo() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [kakaoOn, setKakaoOn] = useState(true);
  const [view, setView] = useState<View>({ phase: "typing", count: 0 });
  const prompt = DEMOS[index];

  useEffect(() => {
    const shot = new URLSearchParams(window.location.search).get("shot");
    if (shot === "chat" || shot === "result") {
      document.getElementById("demo")?.scrollIntoView({ block: "start" });
    }
  }, []);

  useEffect(() => {
    const frozen = run === 0 && index === 0 ? shotView() : null;
    if (reduced) {
      setView({ phase: "result" });
      return;
    }
    if (frozen) {
      setView(frozen);
      return;
    }
    let dead = false;
    const isDead = () => dead;
    const text = DEMOS[index].text;
    const tools = DEMOS[index].tools.length;

    void (async () => {
      setView({ phase: "typing", count: 0 });
      for (let i = 1; i <= text.length; i += 1) {
        if (dead) return;
        setView({ phase: "typing", count: i });
        await pause(i < 8 ? 78 : 46, isDead);
      }
      await pause(340, isDead);
      if (dead) return;
      setView({ phase: "thinking" });
      await pause(1050, isDead);
      if (dead) return;
      for (let i = 1; i <= tools; i += 1) {
        if (dead) return;
        setView({ phase: "tools", shown: i, checked: i - 1 });
        await pause(640, isDead);
        if (dead) return;
        setView({ phase: "tools", shown: i, checked: i });
        await pause(260, isDead);
      }
      if (dead) return;
      setView({ phase: "result" });
    })();

    return () => {
      dead = true;
    };
  }, [index, kakaoOn, reduced, run]);

  const typed = prompt.text.slice(0, view.phase === "typing" ? view.count : prompt.text.length);
  const showAssistant = view.phase !== "typing";
  const shown = view.phase === "tools" ? view.shown : view.phase === "result" ? prompt.tools.length : 0;
  const checked = view.phase === "tools" ? view.checked : view.phase === "result" ? prompt.tools.length : 0;
  const items = prompt.items.filter((item) => kakaoOn || item.via !== "kakao");

  return (
    <section id="demo" className="wrap section">
      <div className="sec-h">
        <div className="kicker">사용 예시</div>
        <h2>
          물어보면,
          <br />
          채팅에서 찾아옵니다.
        </h2>
        <p>AI가 챗통으로 메신저를 차례로 확인하고, 답을 한곳에 정리합니다.</p>
      </div>

      <div className="prompt-list" role="tablist" aria-label="예시 질문">
        {DEMOS.map((demo, i) => (
          <button
            key={demo.id}
            type="button"
            role="tab"
            id={`prompt-${demo.id}`}
            aria-selected={i === index}
            aria-controls="chat-window"
            className={i === index ? "prompt on" : "prompt"}
            onClick={() => {
              setIndex(i);
              setRun((n) => n + 1);
            }}
          >
            {demo.text}
          </button>
        ))}
      </div>

      <div className="demo-grid">
        <div
          className="window"
          id="chat-window"
          role="tabpanel"
          aria-labelledby={`prompt-${prompt.id}`}
        >
          <div className="window-bar">
            <BrandIcon src={aiIconSrc(prompt.clientIcon)} mono={prompt.clientMono} className="bar-icon" />
            <div className="bar-name">
              <strong>{prompt.clientName}</strong>
              <span>챗통 MCP</span>
            </div>
            <span className="example-pill">예시</span>
          </div>
          <div className="thread" aria-live="polite">
            <div className="msg user">
              <p>
                {typed}
                {view.phase === "typing" && <span className="caret" aria-hidden="true" />}
              </p>
            </div>
            {showAssistant && (
              <div className="msg assistant">
                <div className="who">
                  <BrandIcon src={aiIconSrc(prompt.clientIcon)} mono={prompt.clientMono} className="who-icon" />
                  <span>{prompt.clientName}</span>
                </div>
                {view.phase === "thinking" && (
                  <div className="typing" aria-label="답변을 준비하고 있습니다">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                {shown > 0 && (
                  <ul className="chips">
                    {prompt.tools.slice(0, shown).map((tool, i) => (
                      <ToolChip
                        key={tool.id}
                        id={tool.id}
                        label={tool.pending}
                        state={
                          tool.id === "kakao" && !kakaoOn
                            ? "skip"
                            : i < checked
                              ? "done"
                              : "busy"
                        }
                      />
                    ))}
                  </ul>
                )}
                {view.phase === "result" && (
                  <div className="result">
                    <p className="lead">{prompt.lead}</p>
                    <ul className="todos">
                      {items.map((item) => (
                        <li key={item.title}>
                          <span className="box" aria-hidden="true" />
                          <span>
                            <strong>{item.title}</strong>
                            <em>{item.meta}</em>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {!kakaoOn && <p className="skip-note">카카오톡 연결이 꺼져 있어 그 대화는 빠졌습니다.</p>}
                    <p className="example-line">예시 데이터 · 이름과 대화는 모두 가상입니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="composer" aria-hidden="true">
            <span>메시지를 입력하세요</span>
            <span className="send">보내기</span>
          </div>
        </div>

        <aside className="conn" aria-label="MCP 연결">
          <div className="conn-h">
            <h3>MCP 연결</h3>
            <p>데모에서 메신저를 켜고 끌 수 있습니다. 지금은 Mac 카카오톡만 사용할 수 있습니다.</p>
          </div>
          <ul>
            {MESSENGERS.map((item) => (
              <li key={item.id}>
                <BrandIcon
                  src={msgIconSrc(item.id)}
                  mono={item.mono}
                  tint={item.tint}
                  className="conn-icon"
                />
                <span className="conn-name">
                  <strong>{item.name}</strong>
                  <em>{item.available ? "Mac · 사용 가능" : "예정"}</em>
                </span>
                {item.available ? (
                  <button
                    type="button"
                    role="switch"
                    className={kakaoOn ? "switch on" : "switch"}
                    aria-checked={kakaoOn}
                    aria-label={`${item.name} 연결`}
                    onClick={() => setKakaoOn((value) => !value)}
                  >
                    <span />
                  </button>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    className="switch"
                    aria-checked={false}
                    aria-label={`${item.name} 예정`}
                    disabled
                  >
                    <span />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="demo-foot">
        <button type="button" className="text-btn" onClick={() => setRun((n) => n + 1)}>
          다시 보기
        </button>
        <p>예시 화면이며 대화와 이름은 모두 가상입니다. 현재는 Mac 카카오톡을 지원하고, 문자와 DM 연결은 개발 예정입니다.</p>
      </div>
    </section>
  );
}

function ToolChip({
  id,
  label,
  state,
}: {
  id: MessengerId;
  label: string;
  state: "busy" | "done" | "skip";
}) {
  const meta = messengerById(id);
  const text = state === "skip" ? `${meta?.name ?? "메신저"} 꺼짐` : label;
  return (
    <li className={`chip ${state}`}>
      <BrandIcon src={msgIconSrc(id)} mono={meta?.mono} tint={meta?.tint} className="chip-icon" />
      <span>{text}</span>
      <span className="mark" aria-hidden="true">
        {state === "done" ? "✓" : state === "skip" ? "–" : ""}
      </span>
    </li>
  );
}
