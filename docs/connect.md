# 내 AI에 연결하기

쓰는 도구를 고르면 그 도구에 맞는 연결 순서가 열립니다. 대화는 읽기 전용으로만 열립니다.

**`chattong-mcp`는 아직 배포 전입니다.** 아래 명령과 경로는 배포 뒤에 쓰도록 맞춰 둔 것이며, 지금 실행하면 안내 문구만 나옵니다. 배포 뒤에는 버전을 고정한 명령(`npx -y chattong-mcp@<버전>`)을 권장합니다. 연결 순서는 2026년 11월 각 서비스 공식 문서 기준이며 바뀔 수 있습니다.

쓰기 전에 [이용 고지와 면책](../DISCLAIMER.md)을 읽어 주세요. 본인 기기·본인 계정만, 개인 용도로 쓰세요.

## 공통

### 1. Node.js

Claude Desktop 원클릭 설치를 뺀 모든 방법은 Node.js 22 이상이 필요합니다. [nodejs.org](https://nodejs.org)에서 설치합니다.

### 2. 권한 (Mac 자동 읽기에만 해당)

Mac에서 카카오톡을 자동으로 읽으려면 "전체 디스크 접근" 권한이 필요합니다. 권한을 줄 대상은 연결 방식마다 달라서, 배포 뒤 `npx chattong-mcp doctor`가 정확한 대상을 알려 줍니다. 이 권한은 그 앱이 실행하는 모든 프로그램에 디스크 전체 읽기를 허용하므로 필요한 동안만 켜세요. 메시지를 보내기 위한 권한(접근성 등)은 쓰지 않습니다.

## Claude Desktop

원클릭. chattong.mcpb를 더블클릭하거나 Claude 창으로 끌어다 놓으면 설치 창이 열립니다. 창이 안 열리면 설정 > 데스크톱 앱 > 확장 프로그램 관리 > 고급 설정 > Extension Developer > 확장 설치…에서 파일을 고르세요(이전 화면: 설정 > 확장).

패키지 배포 전입니다. 파일은 배포와 함께 받을 수 있습니다.

확인: Claude를 다시 열고 도구 목록에서 chattong을 확인합니다.

출처: [Claude MCPB 문서](https://claude.com/docs/connectors/building/mcpb)

## Claude Code

터미널. 사용자 범위로 등록하면 새 세션에서도 챗통을 쓸 수 있습니다.

```bash
claude mcp add chattong -s user -- npx -y chattong-mcp
```

Windows에서 연결이 닫히면 `-- cmd /c npx -y chattong-mcp`로 바꿔 보세요.

확인: `claude mcp list`에 chattong이 ✔ Connected로 보이면 됩니다.

출처: [Claude Code MCP 문서](https://code.claude.com/docs/en/mcp)

## ChatGPT 데스크톱

앱에서 추가. 설정 > MCP servers > Add server에서 이름(chattong)을 넣고 STDIO를 골라 명령 `npx`, 인자 `-y chattong-mcp`를 넣은 뒤 Restart합니다. Work 또는 Codex에서 쓰는 것을 권장합니다. 웹 채팅(chatgpt.com)에서는 직접 연결되지 않습니다.

```bash
npx -y chattong-mcp
```

확인: 입력창에 `/mcp`를 치면 chattong이 보여야 합니다.

출처: [ChatGPT MCP 문서](https://learn.chatgpt.com/docs/extend/mcp)

## Codex

CLI · IDE. ChatGPT 데스크톱과 같은 설정 파일(`~/.codex/config.toml`, Windows는 `%USERPROFILE%\.codex\config.toml`)을 씁니다.

```bash
codex mcp add chattong -- npx -y chattong-mcp
```

첫 실행이 10초를 넘어 실패하면 설정 파일의 `[mcp_servers.chattong]`에 `startup_timeout_sec = 30`을 추가하세요.

확인: `codex mcp list`에서 chattong을 확인합니다.

출처: [ChatGPT·Codex MCP 문서](https://learn.chatgpt.com/docs/extend/mcp)

## Cursor

원클릭. Cursor가 열리면서 설치를 확인하는 창이 뜹니다.

[Cursor에 추가](cursor://anysphere.cursor-deeplink/mcp/install?name=chattong&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNoYXR0b25nLW1jcCJdfQ==)

`config`는 `{"command":"npx","args":["-y","chattong-mcp"]}`를 base64로 넣은 값입니다.

확인: 사이드바 Customize > MCP에서 chattong이 켜져 있고, Output > MCP Logs에 오류가 없으면 됩니다.

출처: [Cursor 설치 링크 문서](https://cursor.com/docs/mcp/install-links)

## VS Code

원클릭. VS Code가 열리면서 MCP 서버 설치 화면이 뜹니다.

[VS Code에 추가](https://vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522chattong%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522chattong-mcp%2522%255D%257D)

주소의 JSON은 `{"name":"chattong","command":"npx","args":["-y","chattong-mcp"]}`입니다. Copilot CLI를 함께 쓴다면 `copilot mcp add chattong -- npx -y chattong-mcp`로도 등록할 수 있습니다.

확인: Chat: Open Customizations > MCP Servers에 chattong이 보이고 도구 호출이 한 번 되면 됩니다.

출처: [VS Code MCP 문서](https://code.visualstudio.com/docs/agent-customization/mcp-servers)

## Grok Build

grok CLI. 내 컴퓨터의 grok 명령으로 로컬 서버를 붙입니다. Claude Code에 사용자 범위로 등록해 두었다면 자동으로 보입니다.

```bash
grok mcp add chattong -- npx -y chattong-mcp
```

확인: `grok mcp doctor chattong`이 통과하면 됩니다.

출처: [xAI Grok Build MCP 문서](https://docs.x.ai/build/features/mcp-servers)

## Gemini CLI · Antigravity

Gemini CLI는 2026년 6월 18일부터 Gemini Code Assist Standard·Enterprise와 유료 API 키 사용자만 쓸 수 있습니다. 그 경우의 명령은 아래와 같습니다. `-y`가 옵션으로 먹히지 않도록 `--` 뒤에 둡니다.

```bash
gemini mcp add -s user chattong npx -- -y chattong-mcp
```

개인·Google AI Pro/Ultra 사용자는 Antigravity(App·CLI)에서 `~/.gemini/config/mcp_config.json`에 아래 Devin Desktop과 같은 JSON을 넣거나 `/mcp`에서 추가하세요.

확인: `gemini mcp list`(Antigravity는 MCP 관리 화면)에서 chattong을 확인합니다.

출처: [Gemini CLI MCP 문서](https://geminicli.com/docs/tools/mcp-server/) · [Antigravity MCP 문서](https://antigravity.google/docs/mcp)

## Devin Desktop (구 Windsurf)

앱에서 추가. `~/.config/devin/mcp_config.json`(Windows는 `%APPDATA%\devin\mcp_config.json`)에 아래를 넣거나, 터미널에서 `devin mcp add -s user chattong -- npx -y chattong-mcp`를 실행합니다.

```json
{
  "mcpServers": {
    "chattong": {
      "command": "npx",
      "args": ["-y", "chattong-mcp"]
    }
  }
}
```

확인: Customize > MCPs > This computer에서 켜져 있으면 됩니다.

출처: [Devin Desktop MCP 문서](https://docs.devin.ai/desktop/devin-local/customizations#mcp-servers)

## Grok 웹 · 앱

로컬 미지원. grok.com 커넥터는 공개 인터넷에서 닿는 원격 MCP 주소만 받고, localhost·사설 IP 주소는 거부합니다. 대화를 인터넷에 여는 터널은 권하지 않습니다. 같은 Grok을 내 컴퓨터에서 쓰려면 [Grok Build](#grok-build)를 고르세요.

출처: [xAI 커넥터 문서](https://docs.x.ai/grok/connectors)

## 로컬 모델로 쓰기

대화를 컴퓨터 밖으로 보내고 싶지 않다면 LM Studio처럼 MCP를 지원하는 로컬 모델 앱에 연결하세요. LM Studio는 Program 탭 > Install > Edit mcp.json에 위 Devin Desktop과 같은 JSON을 넣습니다.
