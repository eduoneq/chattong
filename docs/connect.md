# 카카오톡 대화 파일을 AI 앱에 연결하기

macOS와 Windows에서 Node.js 22 이상을 설치하고 본인 계정의 카카오톡 대화방에서 대화 내용을 TXT 파일로 내보내세요. 전체 디스크 접근 권한은 필요하지 않습니다. 이 파일에는 대화 상대방의 메시지도 포함됩니다. 클라우드 AI에서 조회하면 해당 서비스에 내용이 전송될 수 있습니다. [이용 고지와 면책](../DISCLAIMER.md)

## 폴더 연결

로컬 stdio 서버의 이름을 `chattong`, 명령을 `npx`로 설정하고 다음 인자를 전달하세요.

```json
["-y", "https://github.com/eduoneq/chattong/releases/download/v0.2.0/chattong-mcp-0.2.0.tgz"]
```

소스에서 실행하려면 `packages/mcp`에서 `npm ci`를 실행하고 호스트에 stdio 서버 `chattong`을 등록합니다. 실행 명령은 `node`, 인자는 `packages/mcp/bin/chattong-mcp.js`의 절대 경로 하나입니다.

처음 연결하면 문서 폴더 안에 `chattong/kakaotalk`가 생깁니다. Windows의 문서 폴더가 OneDrive에 있으면 그 위치를 따릅니다. AI 앱에서 “챗통 연결 확인”을 요청하면 실제 저장 위치를 확인할 수 있습니다. MCP Apps를 지원하는 호스트에서는 안내 카드도 표시합니다.

카카오톡에서 내보낸 TXT를 방마다 다른 이름으로 여기에 저장하세요. “챗통 대화 목록 보여 줘”를 요청한 뒤 원하는 방을 선택하세요. 같은 이름으로 다시 저장하면 다음 조회에 반영됩니다.

## 배포본 0.2.0으로 파일 하나 연결하기

로컬 stdio를 지원하는 AI 앱에서 서버 이름을 `chattong`으로 정하고 다음과 같이 설정하세요. 예시의 마지막 인자를 실제 파일의 전체 경로로 바꾸세요. 경로에 공백이 있어도 한 인자로 전달합니다.

```json
{
  "mcpServers": {
    "chattong": {
      "command": "npx",
      "args": ["-y", "https://github.com/eduoneq/chattong/releases/download/v0.2.0/chattong-mcp-0.2.0.tgz", "--file", "/Users/me/Documents/카카오톡 대화.txt"]
    }
  }
}
```

Windows 경로는 JSON에서 `"C:\\Users\\me\\Documents\\카카오톡 대화.txt"`처럼 씁니다. 앱에서 npx 실행 파일을 찾지 못하면 Node.js 설치 폴더를 확인하고 앱을 다시 시작하세요. 서버마다 하나의 내보내기 파일을 지정할 수 있으며 최대 크기는 8 MiB입니다.

## 단일 파일 연결 확인

AI 앱을 다시 열고 챗통의 `list_chats` 도구를 호출하세요. 파일을 지정한 경우 읽어들인 메시지 수를 확인할 수 있습니다. `read_messages`로 본문을 조회하고 `search_messages`로 특정 단어를 찾으세요. 새 대화까지 조회하려면 파일을 다시 내보내고 MCP 서버를 재시작하세요. 파일 경로를 생략하면 문서 폴더 연결 모드로 실행합니다.
