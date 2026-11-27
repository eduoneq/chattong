export const guideResource = {
  uri: 'ui://chattong/setup-guide.html',
  name: '챗통 대화 연결 안내',
  mimeType: 'text/html;profile=mcp-app',
};

const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function renderGuide(folderPath) {
  const directory = folderPath.replace(/[&<>"']/g, character => htmlEntities[character]);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>챗통 대화 연결 안내</title>
  <style>
    :root {
      color-scheme: light dark;
      --border: light-dark(#dedcd4, #484640);
      --surface: light-dark(#fffefa, #22211e);
      --text: light-dark(#231e16, #f7f3e9);
      --muted: light-dark(#625c52, #d3cabc);
      --inset: light-dark(#f5f2e8, #312e26);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: clamp(8px, 3vw, 24px);
      font: 1rem/1.6 system-ui, "Malgun Gothic", sans-serif;
      color: var(--text);
      background: transparent;
      overflow-wrap: anywhere;
    }
    main {
      max-width: 42rem;
      margin: 0 auto;
      padding: clamp(12px, 4vw, 28px);
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--surface);
    }
    h1 { margin: 0 0 6px; font-size: clamp(1.35rem, 4vw, 1.8rem); line-height: 1.3; }
    h2 { margin: 0; font-size: 1rem; }
    p { margin: 4px 0 0; }
    ol { margin: 20px 0; padding-inline-start: 1.5rem; }
    li + li { margin-top: 14px; }
    li::marker { font-weight: 700; }
    .directory {
      display: block;
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--inset);
      white-space: pre-wrap;
      user-select: all;
    }
    .notice { padding-top: 12px; border-top: 1px solid var(--border); font-size: .875rem; color: var(--muted); }
  </style>
</head>
<body>
  <main>
    <h1>챗통에 대화 연결하기</h1>
    <p>카카오톡에서 내보낸 대화 TXT를 연결하면 이 채팅에서 대화를 찾아볼 수 있습니다.</p>
    <ol>
      <li>
        <h2>대화 TXT 넣기</h2>
        <p>본인 기기와 계정의 카카오톡에서 공유해도 되는 대화를 TXT로 내보내고, 아래 폴더에 저장하거나 복사하세요.</p>
        <code class="directory" dir="auto">${directory}</code>
      </li>
      <li>
        <h2>대화 목록 요청하기</h2>
        <p>이 채팅에 “챗통 대화 목록을 보여줘”라고 입력하세요.</p>
      </li>
      <li>
        <h2>대화방 고르기</h2>
        <p>목록에서 읽을 대화방을 고르고 “○○ 대화방의 메시지를 보여줘”라고 요청하세요. 이름이 같으면 목록에 표시된 ID를 함께 알려주세요.</p>
      </li>
    </ol>
    <p class="notice">개인 용도로만 사용하세요. 클라우드 AI를 사용하면 도구 응답에 포함된 발신자와 대화 내용이 해당 서비스에 전송될 수 있습니다. 기기 안에서 처리하려면 로컬 모델과 로컬 전용 클라이언트를 사용하세요.</p>
  </main>
  <script>
    (() => {
      const host = window.parent;
      if (host === window) return;

      const send = message => host.postMessage({ jsonrpc: '2.0', ...message }, '*');
      const initializeId = 'chattong-guide-initialize';
      let observer;
      let ready = false;

      window.addEventListener('message', event => {
        const message = event.data;
        if (event.source !== host || message?.jsonrpc !== '2.0') return;

        if (!ready && message.id === initializeId && !message.method && message.result) {
          ready = true;
          send({ method: 'ui/notifications/initialized' });
          observer = new ResizeObserver(() => {
            send({
              method: 'ui/notifications/size-changed',
              params: { height: Math.ceil(document.body.getBoundingClientRect().height) },
            });
          });
          observer.observe(document.body);
        }

        if (ready && message.id != null && message.method === 'ping') {
          send({ id: message.id, result: {} });
        }
        if (ready && message.id != null && message.method === 'ui/resource-teardown') {
          observer?.disconnect();
          send({ id: message.id, result: {} });
        }
      });

      send({
        id: initializeId,
        method: 'ui/initialize',
        params: {
          protocolVersion: '2026-01-26',
          appInfo: { name: 'chattong-setup-guide', version: '1.0.0' },
          appCapabilities: { availableDisplayModes: ['inline'] },
        },
      });
    })();
  </script>
</body>
</html>`;
}
