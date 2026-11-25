import { useEffect, useState } from "react";
import { ChatDemo } from "./components/ChatDemo";
import { ConnectModal } from "./components/ConnectModal";
import { Nav } from "./components/Nav";
import { Stage } from "./components/Stage";
import { CopyButton } from "./components/CopyButton";
import { BrandIcon, aiIconSrc } from "./components/BrandIcon";
import { BADGE, PLATFORMS } from "./data/platforms";
import { useTheme } from "./lib/useTheme";

const INSTALL = "npx -y chattong-mcp";

const FAQS = [
  {
    q: "챗통이 메시지를 보내거나 지우나요?",
    a: "아니요. 읽기만 합니다. 보내기, 수정, 삭제 기능은 없습니다.",
  },
  {
    q: "지금 어떤 메신저를 읽을 수 있나요?",
    a: "Mac의 카카오톡입니다. Google 메시지, Instagram DM을 비롯한 다른 메신저는 준비 중입니다.",
  },
  {
    q: "대화가 챗통 서버로 나가나요?",
    a: "챗통은 대화를 받아 두는 서버가 없습니다. 읽기는 내 컴퓨터 안에서 끝납니다.",
  },
  {
    q: "AI 서비스에는 내용이 가나요?",
    a: "갈 수 있습니다. Claude나 ChatGPT처럼 클라우드 모델을 쓰는 앱은 질문과 도구 결과를 그 서비스로 보낼 수 있습니다. 챗통이 대신 보내는 것이 아니라, 연결한 AI 앱의 정책을 따릅니다. 민감한 대화라면 그 서비스의 데이터 설정을 먼저 확인하세요. 내 컴퓨터에서만 도는 모델을 쓰면 그 밖으로 나가지 않습니다.",
  },
  {
    q: "어떤 권한이 필요한가요?",
    a: "Mac에서는 카카오톡 대화를 읽기 위해 전체 디스크 접근이 필요합니다. 메시지를 보내기 위한 접근성 권한은 쓰지 않습니다.",
  },
  {
    q: "무료인가요?",
    a: "챗통은 무료 오픈소스입니다. 연결한 AI 서비스의 이용 요금은 그 서비스 기준입니다.",
  },
  {
    q: "카카오톡 공식 제품인가요?",
    a: "아닙니다. 챗통은 카카오톡, Google, Meta를 비롯한 메신저·AI 회사와 관련이 없고, 승인이나 후원을 받지 않았습니다. Mac 카카오톡 읽기는 MIT 라이선스의 kakaocli를 사용합니다.",
  },
  {
    q: "설치 명령이 지금 바로 되나요?",
    a: "chattong-mcp 패키지는 배포 전입니다. 화면의 명령과 연결 경로는 배포 뒤에도 그대로 쓰도록 맞춰 두었습니다.",
  },
];

export function App() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const logo = theme === "dark" ? "/brand/app-dark-192.png" : "/brand/app-light-192.png";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("shot") === "modal") {
      setSelectedId(params.get("app"));
      setOpen(true);
    }
    const jump = params.get("shot");
    if (jump === "connect" || jump === "safety" || jump === "faq") {
      document.getElementById(jump)?.scrollIntoView();
    }
  }, []);

  function openConnect(id?: string | null) {
    setSelectedId(id ?? null);
    setOpen(true);
  }

  return (
    <>
      <a className="skip" href="#main">
        본문으로
      </a>
      <div id="page" inert={open ? true : undefined}>
        <Nav theme={theme} onToggleTheme={toggle} onConnect={() => openConnect(null)} />
        <main id="main">
          <header className="hero wrap" id="top">
            <p className="eyebrow">
              <i />
              무료 · 오픈소스 · 읽기 전용 MCP
            </p>
            <h1>
              내 AI에,
              <br />
              <span>내 모든 채팅을</span>
              <br className="only-mobile" /> 연결.
            </h1>
            <p className="sub">
              메신저, 문자, DM으로 흩어진 대화를 내가 쓰는 AI 하나에 연결하세요. 대화는 내 컴퓨터에서 읽기
              전용으로만 열립니다.
            </p>
            <div className="cta">
              <div className="cmd">
                <span>
                  <span className="p">$</span> {INSTALL}
                </span>
                <CopyButton value={INSTALL} />
              </div>
              <button type="button" className="btn primary" onClick={() => openConnect(null)}>
                내 AI에 연결하기
              </button>
            </div>
            <Stage />
          </header>

          <ChatDemo />

          <section id="connect" className="wrap section">
            <div className="sec-h">
              <div className="kicker">연결하기</div>
              <h2>쓰는 AI를 고르면 연결 방법이 열립니다.</h2>
              <p>데스크톱, 터미널, 에디터마다 넣는 곳이 다릅니다.</p>
            </div>
            <div className="cgrid">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.kind === "no" ? "tile muted" : "tile"}
                  onClick={() => openConnect(item.id)}
                >
                  <span className="ic">
                    <BrandIcon src={aiIconSrc(item.icon)} mono={item.mono} tint={item.tint} />
                  </span>
                  <span className="nm">
                    {item.name}
                    <small>{item.sub}</small>
                  </span>
                  <span className="act">
                    <b className={`badge b-${item.kind}`}>{BADGE[item.kind]}</b>
                    <span className="go">방법 보기</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="src">한 번 누르면 설치 순서가 열립니다. chattong-mcp 패키지는 배포 전입니다.</p>
          </section>

          <section id="safety" className="wrap section">
            <div className="sec-h">
              <div className="kicker">안전</div>
              <h2>
                읽기만 합니다.
                <br />
                보내지 않습니다.
              </h2>
            </div>
            <div className="trust">
              <article className="tr">
                <span className="ico" aria-hidden="true">
                  <EyeIcon />
                </span>
                <h3>읽기 전용</h3>
                <p>메시지를 보내거나 고치거나 지우는 기능이 없습니다.</p>
              </article>
              <article className="tr">
                <span className="ico" aria-hidden="true">
                  <DeskIcon />
                </span>
                <h3>내 컴퓨터에서만</h3>
                <p>대화는 이 컴퓨터에서 열립니다. 챗통이 운영하는 서버로 나가지 않습니다.</p>
              </article>
              <article className="tr">
                <span className="ico" aria-hidden="true">
                  <CodeIcon />
                </span>
                <h3>무료 · 오픈소스</h3>
                <p>코드는 공개되어 있습니다. Mac 카카오톡 읽기는 MIT 라이선스 kakaocli 위에서 동작합니다.</p>
              </article>
            </div>
            <aside className="privacy">
              <h3>클라우드 AI를 쓰면</h3>
              <p>
                Claude, ChatGPT, Gemini처럼 클라우드 모델을 쓰는 클라이언트는 질문과 조회 결과를 그 회사로
                보낼 수 있습니다. 그 전송은 챗통이 하지 않습니다. 각 서비스의 보관·학습 설정을 확인하세요.
                내 컴퓨터 안에서만 도는 모델이라면 대화도 그 안에 남습니다.
              </p>
            </aside>
          </section>

          <section id="faq" className="wrap section">
            <div className="sec-h">
              <div className="kicker">질문</div>
              <h2>자주 묻는 질문</h2>
            </div>
            <div className="faq">
              {FAQS.map((item, i) => {
                const opened = faqOpen === i;
                const panelId = `faq-${i}`;
                return (
                  <div key={item.q} className={opened ? "qa open" : "qa"}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={opened}
                        aria-controls={panelId}
                        onClick={() => setFaqOpen(opened ? null : i)}
                      >
                        {item.q}
                        <span aria-hidden="true">{opened ? "–" : "+"}</span>
                      </button>
                    </h3>
                    <div id={panelId} role="region" hidden={!opened}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="final wrap">
            <img src={logo} width={96} height={96} alt="" />
            <h2>
              흩어진 메신저,
              <br />
              내 AI 하나로.
            </h2>
            <div className="cta">
              <button type="button" className="btn primary" onClick={() => openConnect(null)}>
                내 AI에 연결하기
              </button>
            </div>
          </section>
        </main>
        <footer>
          <div className="wrap foot">
            <div className="foot-brand">
              <img src={logo} width={36} height={36} alt="" />
              <div>
                <strong>챗통</strong>
                <span>chattong</span>
              </div>
            </div>
            <p>
              <a href="https://github.com/silver-flight-group/kakaocli" target="_blank" rel="noreferrer">
                <b>kakaocli</b>
              </a>{" "}
              (MIT, silver-flight-group) 위에서 Mac 카카오톡을 읽습니다.
            </p>
            <p>
              KakaoTalk, Google Messages, Instagram을 비롯한 메신저와 AI 서비스의 이름과 로고는 각 권리자의
              상표입니다. 챗통은 해당 권리자와 관련이 없으며, 승인이나 후원을 받지 않았습니다.
            </p>
            <p className="quiet">
              아이콘: Wikimedia Commons, Simple Icons (CC0), LobeHub Icons (MIT). 글꼴: Pretendard (SIL OFL).
              예시 대화와 이름은 모두 가상입니다.
            </p>
          </div>
        </footer>
      </div>
      <ConnectModal
        open={open}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onBack={() => setSelectedId(null)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DeskIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" />
    </svg>
  );
}
