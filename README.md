<p align="center">
  <img src=".github/assets/app-light.png" alt="" width="96">
</p>

<p align="center">
  <img src=".github/assets/lockup-light.png" alt="챗통 chattong" width="520">
</p>

<h1 align="center">내 AI에, 내 모든 채팅을 연결.</h1>

<p align="center">
챗통은 무료 오픈소스 읽기 전용 MCP입니다.<br>
메신저로 흩어진 대화를 내 컴퓨터에서 읽어, 내가 쓰는 AI에 연결합니다.
</p>

<p align="center">
  <a href="https://chattong.dev">chattong.dev</a>
</p>

> 0.1.0에서는 macOS와 Windows에서 카카오톡 대화방 하나를 텍스트 파일로 내보낸 뒤 AI 앱에서 조회하거나 검색할 수 있습니다. 다른 메신저는 추가 예정입니다.

## 먼저 읽어 주세요

- **본인 기기에서 본인 계정의 대화만** 읽으세요. 다른 사람의 기기나 계정은 안 됩니다.
- **개인 용도로** 쓰세요. 고객 상담방처럼 업무에 쓰면 개인정보 보호법상 의무가 생길 수 있습니다.
- 클라우드 AI(Claude, ChatGPT 등)에 연결하면 **대화 상대의 메시지도 그 회사로 전송**됩니다. 민감한 대화는 **로컬 모델**(예: LM Studio)로 쓰세요.
- 비공식 프로그램이며, 메신저 약관 위반으로 **계정 이용이 제한될 수 있습니다.** 책임은 사용자에게 있습니다.

전문: [이용 고지와 면책](DISCLAIMER.md)

## 읽기만 합니다

- 메시지를 보내거나 고치거나 지우는 기능이 없습니다.
- 메신저 서버에 접속하지 않고, 실행 중인 앱의 메모리를 읽거나 화면을 조작하지 않습니다.
- 대화를 받아 두는 챗통 서버가 없습니다.
- 이 원칙은 코드로 지킵니다. 쓰기·전송·화면 조작·네트워크·메모리 접근 코드가 들어오면 [읽기 전용 검사](scripts/check-readonly.mjs)가 PR마다 막습니다.

## 설치

Node.js 22 이상과 로컬 stdio MCP 서버를 실행할 수 있는 AI 앱이 필요합니다. 카카오톡에서 본인 대화방을 TXT로 내보내고, AI 앱의 챗통 설정에 파일의 전체 경로를 지정하세요. 새 메시지를 반영하려면 대화를 다시 내보내고 MCP 서버를 다시 시작하세요.

[설정 예시와 연결 확인 방법](docs/connect.md)

## 라이선스와 크레딧

- [MIT License](LICENSE) · Copyright (c) 2026 EDUONEQ Corp.
- macOS와 Windows 외부 CLI의 출처 및 이용 범위는 [면책문](DISCLAIMER.md)을 참고하세요. 프로젝트의 제3자 고지는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

KakaoTalk, Google Messages, Instagram을 비롯한 메신저와 AI 서비스의 이름과 로고는 각 권리자의 상표입니다. 챗통은 해당 권리자와 관련이 없으며, 승인이나 후원을 받지 않았습니다.
