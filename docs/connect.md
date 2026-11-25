# 내 AI에 연결하기

쓰는 도구를 고르면 그 도구에 맞는 연결 순서가 열립니다. 대화는 읽기 전용으로만 열립니다.

`chattong-mcp` 패키지는 배포 전입니다. 아래 명령과 경로는 배포 뒤에도 그대로 씁니다. 연결 순서는 2026년 11월 각 서비스 공식 문서 기준이며 바뀔 수 있습니다.

지금은 Mac 카카오톡만 읽을 수 있습니다. 메시지를 보내기 위한 권한은 필요 없습니다.

## 공통

### 1. 엔진

Mac에서 카카오톡 대화를 읽는 오픈소스 엔진입니다. 챗통은 이 위에서 읽기만 합니다.

```bash
brew install silver-flight-group/tap/kakaocli
```

### 2. 전체 디스크 접근

시스템 설정 > 개인정보 보호 및 보안 > 전체 디스크 접근에서 연결할 앱(또는 터미널)을 켭니다.

## Claude Desktop

원클릭. chattong.mcpb를 더블클릭하면 Claude 설치 창이 열립니다. Windows에서 창이 안 열리면 설정 > 확장 > 고급 설정 > 확장 설치에서 파일을 고르세요.

패키지 배포 전입니다. 파일은 배포와 함께 받을 수 있습니다.

확인: Claude를 다시 열고 도구 목록에서 chattong을 확인합니다.

출처: [Claude MCPB 문서](https://claude.com/docs/connectors/building/mcpb)

## Claude Code

터미널. 사용자 범위로 등록하면 새 세션에서도 챗통을 쓸 수 있습니다.

```bash
claude mcp add chattong -s user -- npx -y chattong-mcp
```

확인: `claude mcp list` 에 chattong connected가 보이면 됩니다.

출처: [Claude Code MCP 문서](https://code.claude.com/docs/en/mcp)

## ChatGPT 데스크톱

앱에서 추가. 설정 > MCP servers > Add server에서 STDIO를 고르고 아래 명령을 넣은 뒤 다시 시작합니다. 웹(chatgpt.com)과 모바일은 이 컴퓨터의 서버에 연결할 수 없습니다.

```bash
npx -y chattong-mcp
```

확인: 입력창에 `/mcp` 를 치면 chattong이 보여야 합니다.

출처: [ChatGPT MCP 문서](https://learn.chatgpt.com/docs/extend/mcp)

## Codex

CLI · IDE. ChatGPT 데스크톱과 같은 설정 파일(`~/.codex/config.toml`)을 씁니다.

```bash
codex mcp add chattong -- npx -y chattong-mcp
```

확인: `codex mcp list` 에서 chattong을 확인합니다.

출처: [ChatGPT·Codex MCP 문서](https://learn.chatgpt.com/docs/extend/mcp)

## Cursor

원클릭. Cursor가 열리면서 설치를 확인하는 창이 뜹니다.

[Cursor에 추가](cursor://anysphere.cursor-deeplink/mcp/install?name=chattong&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNoYXR0b25nLW1jcCJdfQ==)

`config`는 `{"command":"npx","args":["-y","chattong-mcp"]}` 를 base64로 넣은 값입니다.

확인: 설정 > MCP에서 chattong 옆의 초록 점을 확인합니다.

출처: [Cursor 설치 링크 문서](https://cursor.com/docs/context/mcp/install-links)

## VS Code

원클릭. VS Code가 열리면서 MCP 서버 설치 화면이 뜹니다.

[VS Code에 추가](vscode:mcp/install?%7B%22name%22%3A%22chattong%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22chattong-mcp%22%5D%7D)

주소의 JSON은 `{"name":"chattong","command":"npx","args":["-y","chattong-mcp"]}` 입니다.

확인: MCP Servers 목록에서 chattong을 시작합니다.

출처: [VS Code MCP 문서](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

## Grok Build

grok CLI. 내 컴퓨터의 grok 명령으로 로컬 서버를 붙입니다.

```bash
grok mcp add chattong -- npx -y chattong-mcp
```

확인: `grok mcp doctor chattong` 이 통과하면 됩니다.

출처: [xAI Grok Build MCP 문서](https://docs.x.ai/build/features/mcp-servers)

## Gemini CLI

터미널. 2026년 11월 문서 형식은 `gemini mcp add [옵션] <이름> <명령> [인자…]` 입니다. `-y` 가 옵션으로 먹히지 않도록 `--` 뒤에 둡니다.

```bash
gemini mcp add -s user chattong npx -- -y chattong-mcp
```

확인: `gemini mcp list` 에서 chattong을 확인합니다.

출처: [Gemini CLI MCP 문서](https://geminicli.com/docs/tools/mcp-server/)

## Windsurf

Devin Desktop. 앱에서 추가합니다. `~/.config/devin/mcp_config.json` 에 아래를 넣습니다. 원클릭 링크는 MCP 레지스트리에 올라간 뒤 열 예정입니다.

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

확인: Customize > MCPs > This computer 에서 켜져 있으면 됩니다.

출처: [Devin MCP 문서](https://docs.devin.ai/work-with-devin/mcp)

## Grok 웹 · 앱

로컬 미지원. grok.com 커넥터는 공개 인터넷 주소(원격 HTTPS MCP)만 받습니다. 대화를 인터넷에 여는 터널은 권하지 않습니다. 같은 Grok을 내 컴퓨터에서 쓰려면 [Grok Build](#grok-build)를 고르세요.

출처: [xAI 커넥터 문서](https://docs.x.ai/grok/connectors)
