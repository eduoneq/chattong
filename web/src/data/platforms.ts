/** Install targets. Commands checked against vendor docs, November 2026. */

const MCP_CONFIG = '{"command":"npx","args":["-y","chattong-mcp"]}';
const VSCODE_CONFIG = '{"name":"chattong","command":"npx","args":["-y","chattong-mcp"]}';

export const CURSOR_HREF =
  "cursor://anysphere.cursor-deeplink/mcp/install?name=chattong&config=" +
  btoa(MCP_CONFIG);

export const VSCODE_HREF = "vscode:mcp/install?" + encodeURIComponent(VSCODE_CONFIG);

export const BREW = "brew install silver-flight-group/tap/kakaocli";

export const WINDSURF_JSON = `{
  "mcpServers": {
    "chattong": {
      "command": "npx",
      "args": ["-y", "chattong-mcp"]
    }
  }
}`;

export type PlatformKind = "one" | "cmd" | "app" | "no";

export type Platform = {
  id: string;
  icon: string;
  /** Single-color mark, tinted with currentColor so it follows the theme. */
  mono?: boolean;
  /** Fixed brand tint for a mono mark. */
  tint?: string;
  name: string;
  sub: string;
  kind: PlatformKind;
  blurb: string;
  command?: string;
  href?: string;
  hrefLabel?: string;
  note?: string;
  verify?: string;
  srcLabel: string;
  srcHref: string;
};

export const BADGE: Record<PlatformKind, string> = {
  one: "원클릭",
  cmd: "명령어",
  app: "앱에서 추가",
  no: "로컬 미지원",
};

export const PLATFORMS: Platform[] = [
  {
    id: "claude-desktop",
    icon: "claude",
    name: "Claude",
    sub: "Desktop",
    kind: "one",
    blurb:
      "chattong.mcpb를 더블클릭하면 Claude 설치 창이 열립니다. Windows에서 창이 안 열리면 설정 > 확장 > 고급 설정 > 확장 설치에서 파일을 고르세요.",
    href: "#mcpb",
    hrefLabel: "chattong.mcpb 받기",
    note: "패키지 배포 전입니다. 파일은 배포와 함께 이 자리에서 받을 수 있습니다.",
    verify: "Claude를 다시 열고 도구 목록에서 chattong을 확인합니다.",
    srcLabel: "Claude MCPB 문서",
    srcHref: "https://claude.com/docs/connectors/building/mcpb",
  },
  {
    id: "claude-code",
    icon: "claudecode",
    mono: true,
    name: "Claude Code",
    sub: "터미널",
    kind: "cmd",
    blurb: "사용자 범위로 등록하면 새 세션에서도 챗통을 쓸 수 있습니다.",
    command: "claude mcp add chattong -s user -- npx -y chattong-mcp",
    verify: "claude mcp list 에 chattong connected가 보이면 됩니다.",
    srcLabel: "Claude Code MCP 문서",
    srcHref: "https://code.claude.com/docs/en/mcp",
  },
  {
    id: "chatgpt",
    icon: "openai",
    mono: true,
    name: "ChatGPT",
    sub: "데스크톱 앱",
    kind: "app",
    blurb:
      "설정 > MCP servers > Add server에서 STDIO를 고르고 아래 명령을 넣은 뒤 다시 시작합니다. 웹(chatgpt.com)과 모바일은 이 컴퓨터의 서버에 연결할 수 없습니다.",
    command: "npx -y chattong-mcp",
    verify: "입력창에 /mcp 를 치면 chattong이 보여야 합니다.",
    srcLabel: "ChatGPT MCP 문서",
    srcHref: "https://learn.chatgpt.com/docs/extend/mcp",
  },
  {
    id: "codex",
    icon: "codex",
    mono: true,
    name: "Codex",
    sub: "CLI · IDE",
    kind: "cmd",
    blurb: "ChatGPT 데스크톱과 같은 설정 파일(~/.codex/config.toml)을 씁니다.",
    command: "codex mcp add chattong -- npx -y chattong-mcp",
    verify: "codex mcp list 에서 chattong을 확인합니다.",
    srcLabel: "ChatGPT·Codex MCP 문서",
    srcHref: "https://learn.chatgpt.com/docs/extend/mcp",
  },
  {
    id: "cursor",
    icon: "cursor",
    mono: true,
    name: "Cursor",
    sub: "에디터",
    kind: "one",
    blurb: "Cursor가 열리면서 설치를 확인하는 창이 뜹니다.",
    href: CURSOR_HREF,
    hrefLabel: "Cursor에 추가",
    verify: "설정 > MCP에서 chattong 옆의 초록 점을 확인합니다.",
    srcLabel: "Cursor 설치 링크 문서",
    srcHref: "https://cursor.com/docs/context/mcp/install-links",
  },
  {
    id: "vscode",
    icon: "vscode",
    name: "VS Code",
    sub: "Copilot",
    kind: "one",
    blurb: "VS Code가 열리면서 MCP 서버 설치 화면이 뜹니다.",
    href: VSCODE_HREF,
    hrefLabel: "VS Code에 추가",
    verify: "MCP Servers 목록에서 chattong을 시작합니다.",
    srcLabel: "VS Code MCP 문서",
    srcHref: "https://code.visualstudio.com/docs/copilot/customization/mcp-servers",
  },
  {
    id: "grok-build",
    icon: "grok",
    name: "Grok Build",
    sub: "grok CLI",
    kind: "cmd",
    blurb: "내 컴퓨터의 grok 명령으로 로컬 서버를 붙입니다.",
    command: "grok mcp add chattong -- npx -y chattong-mcp",
    verify: "grok mcp doctor chattong 이 통과하면 됩니다.",
    srcLabel: "xAI Grok Build MCP 문서",
    srcHref: "https://docs.x.ai/build/features/mcp-servers",
  },
  {
    id: "gemini",
    icon: "gemini",
    name: "Gemini CLI",
    sub: "터미널",
    kind: "cmd",
    blurb:
      "2026년 11월 문서 형식은 gemini mcp add [옵션] <이름> <명령> [인자…] 입니다. -y 가 옵션으로 먹히지 않도록 -- 뒤에 둡니다.",
    command: "gemini mcp add -s user chattong npx -- -y chattong-mcp",
    verify: "gemini mcp list 에서 chattong을 확인합니다.",
    srcLabel: "Gemini CLI MCP 문서",
    srcHref: "https://geminicli.com/docs/tools/mcp-server/",
  },
  {
    id: "windsurf",
    icon: "windsurf",
    mono: true,
    name: "Windsurf",
    sub: "Devin Desktop",
    kind: "app",
    blurb:
      "~/.config/devin/mcp_config.json 에 아래를 넣습니다. 원클릭 링크는 MCP 레지스트리에 올라간 뒤 열 예정입니다.",
    command: WINDSURF_JSON,
    verify: "Customize > MCPs > This computer 에서 켜져 있으면 됩니다.",
    srcLabel: "Devin MCP 문서",
    srcHref: "https://docs.devin.ai/work-with-devin/mcp",
  },
  {
    id: "grok-web",
    icon: "grok",
    name: "Grok",
    sub: "웹 · 앱",
    kind: "no",
    blurb:
      "grok.com 커넥터는 공개 인터넷 주소(원격 HTTPS MCP)만 받습니다. 대화를 인터넷에 여는 터널은 권하지 않습니다. 같은 Grok을 내 컴퓨터에서 쓰려면 Grok Build를 고르세요.",
    srcLabel: "xAI 커넥터 문서",
    srcHref: "https://docs.x.ai/grok/connectors",
  },
];

export function platformById(id: string) {
  return PLATFORMS.find((item) => item.id === id);
}
