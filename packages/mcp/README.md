# chattong-mcp 0.2.0

macOS와 Windows에서 사용자가 직접 내보낸 대화 TXT를 AI 클라이언트에 연결하는 읽기 전용 stdio MCP입니다. Node.js 22 이상이 필요합니다.

## 폴더 연결

소스에서 실행하려면 `packages/mcp`에서 `npm ci`를 실행하고 호스트에 stdio 서버 `chattong`을 등록합니다. 실행 명령은 `node`, 인자는 `packages/mcp/bin/chattong-mcp.js`의 절대 경로 하나입니다.

처음 연결하면 문서 폴더 안에 `chattong/kakaotalk`가 생깁니다. Windows의 문서 폴더가 OneDrive에 있으면 그 위치를 따릅니다. AI 앱에서 “챗통 연결 확인”을 요청하면 실제 저장 위치를 확인할 수 있습니다. MCP Apps를 지원하는 호스트에서는 안내 카드도 표시합니다.

카카오톡에서 내보낸 TXT를 방마다 다른 이름으로 여기에 저장하세요. “챗통 대화 목록 보여 줘”를 요청한 뒤 원하는 방을 선택하세요. 같은 이름으로 다시 저장하면 다음 조회에 반영됩니다.

여러 방에서 하나를 선택하려면 목록의 ID를 `read_messages` 또는 `search_messages`의 `chatId`에 전달하세요.

## 파일 하나를 지정해 연결

1. 본인 기기·본인 계정의 카카오톡에서 공유해도 되는 대화를 골라 앱의 대화 내용 내보내기 기능으로 텍스트 파일을 직접 저장합니다. 파일을 열어 참여자 정보와 대화 내용을 확인하세요.
2. MCP 클라이언트의 로컬 stdio 서버 설정에서 실행 명령과 인자를 아래처럼 지정합니다. 경로는 본인이 저장한 파일의 실제 절대 경로로 바꾸세요. Windows의 JSON 경로 예시는 `C:\\Users\\me\\Documents\\chat.txt`입니다.
3. 클라이언트에서 서버를 다시 시작하고 `list_chats`로 연결된 메시지 수를 확인합니다. 다른 대화를 선택하거나 새로 내보낸 내용을 반영할 때도 서버를 다시 시작하세요.

소스 체크아웃에서는 이 패키지 폴더에서 `npm ci`를 실행한 뒤 다음 설정을 사용하세요.

```json
{
  "mcpServers": {
    "chattong": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp/bin/chattong-mcp.js", "--file", "/Users/me/Documents/chat.txt"]
    }
  }
}
```

공개 릴리스 파일은 `npx -y https://github.com/eduoneq/chattong/releases/download/v0.2.0/chattong-mcp-0.2.0.tgz --file "/Users/me/Documents/chat.txt"`로도 실행할 수 있습니다. `--help`로 사용법을, `--version`으로 버전을 확인하세요.

## 단일 파일 모드의 도구와 범위

| 도구 | 입력 | 반환 |
| --- | --- | --- |
| `list_chats` | 없음 | `chats`에 고정 ID `export`와 `messageCount` |
| `read_messages` | 선택적 `offset`, `limit` | 원본 순서의 `messages`와 `nextOffset` |
| `search_messages` | 본문 검색어 `query`, 선택적 `offset`, `limit` | 대소문자를 구분하지 않는 부분 문자열 검색 결과와 `nextOffset` |

`content[0].text`에 JSON을 담습니다. 각 메시지에는 `date`, `sender`, `text`가 있습니다. 원본 메시지 인덱스는 0부터 시작하며 다음 페이지에는 이전 결과의 `nextOffset`을 전달합니다. 마지막 페이지에서는 이 값이 `null`입니다.

파일은 최대 8 MiB의 일반 TXT 파일이어야 합니다. 시작 시 파일을 한 번 읽고 프로세스 안에서만 조회합니다. 조회당 기본 20건, 최대 50건이며 검색어는 200 UTF-16 코드 단위까지 받습니다. 응답에서 본문은 2,048단위, 발신자는 128단위, 날짜는 64단위까지 표시하며 생략 부분은 ‘…’로 표시합니다. 직렬화된 메시지 목록이 약 30 KiB를 넘으면 다음 페이지로 이어집니다.

## 개인 정보와 이용 고지

개인 용도로만 사용하세요. 연결한 AI 클라이언트는 호출한 도구의 결과를 볼 수 있습니다. 클라우드 AI를 사용하면 발신자와 메시지 본문이 해당 서비스에 전송될 수 있습니다. 기기 안에서 처리하려면 로컬 모델과 로컬 전용 클라이언트를 사용하고 해당 앱의 기록·전송 설정을 확인하세요. 참여자 동의와 민감정보 처리에 관한 사항은 [이용 고지와 면책](DISCLAIMER.md)을 확인하세요.

챗통은 메신저·AI 제공사와 독립적인 비공식 프로젝트입니다. 패키지 라이선스는 [MIT](LICENSE)입니다.
