# 카카오톡 대화 파일을 AI 앱에 연결하기

macOS와 Windows에서 Node.js 22 이상을 설치하고 본인 계정의 카카오톡 대화방에서 대화 내용을 TXT 파일로 내보내세요. 전체 디스크 접근 권한은 필요하지 않습니다. 이 파일에는 대화 상대방의 메시지도 포함됩니다. 클라우드 AI에서 조회하면 해당 서비스에 내용이 전송될 수 있습니다. [이용 고지와 면책](../DISCLAIMER.md)

## MCP 서버 설정

로컬 stdio를 지원하는 AI 앱에서 서버 이름을 `chattong`으로 정하고 다음과 같이 설정하세요. 예시의 마지막 인자를 실제 파일의 전체 경로로 바꾸세요. 경로에 공백이 있어도 한 인자로 전달합니다.

```json
{
  "mcpServers": {
    "chattong": {
      "command": "npx",
      "args": ["-y", "https://github.com/eduoneq/chattong/releases/download/v0.1.0/chattong-mcp-0.1.0.tgz", "--file", "/Users/me/Documents/카카오톡 대화.txt"]
    }
  }
}
```

Windows 경로는 JSON에서 `"C:\\Users\\me\\Documents\\카카오톡 대화.txt"`처럼 씁니다. 앱에서 npx 실행 파일을 찾지 못하면 Node.js 설치 폴더를 확인하고 앱을 다시 시작하세요. 서버마다 하나의 내보내기 파일을 지정할 수 있으며 최대 크기는 8 MiB입니다.

## 연결 확인

AI 앱을 다시 열고 챗통의 `list_chats` 도구를 호출하세요. 파일을 지정한 경우 읽어들인 메시지 수를 확인할 수 있습니다. `read_messages`로 본문을 조회하고 `search_messages`로 특정 단어를 찾으세요. 새 대화까지 조회하려면 파일을 다시 내보내고 MCP 서버를 재시작하세요. 파일 경로를 생략하면 설정 안내가 표시됩니다.
