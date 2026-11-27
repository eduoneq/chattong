# Windows Orca에 전달할 검증 작업

이 문서 전체를 Windows PC의 Orca에 전달하세요.

## 작업 목표

Windows용 카카오톡에서 직접 내보낸 한국어 TXT 파일을 챗통 MCP 0.1.0으로 읽고 검색하는 흐름을 실기기에서 검증하세요. PC 카카오톡과 MCP 호스트의 버전, Node 버전, 패키지 버전, 테스트 결과를 기록하세요. GitHub Actions의 합성 테스트와 실제 앱 내보내기 결과를 각각 기록하세요.

## 모델과 병렬 작업

- GPT-6.2 Astra Medium은 검증 설계와 최종 판정을 맡습니다. 아래 수용 기준을 작업자에게 배분하고, 실제 Windows 환경과 테스트 데이터의 출처를 확인합니다.
- GPT-6.2 Sol Medium은 설치·설정과 재현된 파서 결함 수정을 맡습니다. 결함 수정은 별도 브랜치에서 합성 예제와 회귀 테스트를 함께 작성합니다.
- GPT-6.2 Sol Extra High는 패키지 설치, stdio 호출, 경로·인코딩·페이지 처리의 실패 재현과 재검증을 맡습니다. 최초 실패와 수정 후 결과를 모두 남깁니다.
- GPT-6.1 Terra Medium은 Windows 카카오톡의 실제 내보내기 메뉴와 MCP 호스트의 도구 표시를 확인합니다. 개인정보가 없는 테스트방으로만 화면을 확인합니다.
- 최초에는 설치·자동검사와 실제 내보내기 메뉴 확인을 병렬로 진행하고, 둘이 끝나면 실제 파일로 검사합니다. 동일 결함을 두세 번 수정한 뒤에도 재현되거나 설계 선택이 필요한 경우에만 Astra High를 투입합니다. Extra High 설계 검토는 High에서 해소되지 않은 경우로 한정합니다.

## 설치와 자동 검사

PowerShell에서 공개 저장소를 새 작업 폴더에 받고 아래 명령을 실행하세요. Node.js 22 이상과 Git이 필요합니다. 이미 작업 중인 체크아웃이 있으면 그 변경을 보존하세요.

```powershell
git clone https://github.com/eduoneq/chattong.git chattong-windows-qa
Set-Location chattong-windows-qa
git fetch origin pull/3/head
git switch --detach FETCH_HEAD
git rev-parse HEAD
node --version
npm.cmd --version
node scripts/check-readonly.mjs
node --test tests/packed-mcp.test.mjs
Push-Location packages/mcp
npm.cmd ci
npm.cmd test
node bin/chattong-mcp.js --version
Pop-Location
```

각 명령의 종료 코드를 확인하세요. npm 레지스트리에 0.1.0이 있으면 배포본도 별도로 확인하세요. 0.0.0은 안내만 출력하는 버전입니다.

```powershell
npm.cmd view chattong-mcp@0.1.0 dist.integrity
npx.cmd --yes chattong-mcp@0.1.0 --version
```

## Windows 실기기 검증

1. 본인 계정의 테스트용 나와의 채팅방에서 개인정보 없는 식별 가능한 합성 문장, 한글, 이모지, 줄바꿈 본문을 준비하세요. 사용자가 Windows 카카오톡 내장 메뉴에서 대화 내용을 TXT로 저장하도록 하고 실제 메뉴 이름을 기록하세요. 한글과 공백이 포함된 로컬 폴더를 사용하세요.
2. 내보낸 원본의 메시지 수와 기준 문장 2개를 로컬에서 확인하세요. `Get-FileHash -Algorithm SHA256 -LiteralPath $exportPath`로 테스트 전후 해시를 비교하세요. $exportPath에는 사용자가 선택한 절대 경로만 넣습니다.
3. MCP 호스트의 로컬 stdio 서버 설정에 명령 `node`, 인자 배열 `["C:\\실제경로\\chattong-windows-qa\\packages\\mcp\\bin\\chattong-mcp.js","--file","C:\\실제경로\\테스트 대화.txt"]`를 등록하세요. 두 경로 모두 실제 값으로 바꿉니다. 설정 후 호스트에서 서버를 다시 시작하세요.
4. 호스트에서 list_chats를 호출해 메시지 수를 원본과 대조하세요. read_messages에 offset 0, limit 1을 보내 첫 발신자·시간·본문을 확인하세요. search_messages에서 두 기준 문장과 존재하지 않는 단어를 각각 조회하세요. 결과에 개인 정보가 있으면 보고서에 넣지 마세요.
5. 파일 경로 생략, 잘못된 경로, 허용 크기(8 MiB) 초과, 도구 인자로 다른 파일 요청을 각각 확인하세요. 파일을 다시 내보낸 뒤 MCP를 재시작하여 새 문장이 검색되는지도 확인하세요.
6. 설치본 버전, 실제 MCP 호스트와 Windows·카카오톡 버전, 합성 자동검사 결과, 실제 파일 메시지 수 대조, 검색 성공 수, 원본 해시 일치 여부, 미검증 항목을 표로 보고하세요. 실패하면 인코딩·날짜 형식·구분 문자만 복제한 합성 입력으로 재현하고 원본 파일·대화·계정 식별자·절대 경로는 첨부하지 마세요.

자동검사만 성공한 경우 실기기 확인은 대기로 기록하세요. 실기기 통과 기준은 공식 내보내기, 지정한 MCP 호스트 연결, 건수와 본문 대조, 검색, 원본 보존까지 모두 확인하는 것입니다.
