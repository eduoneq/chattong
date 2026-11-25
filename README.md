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
  <a href="#랜딩">랜딩: 도메인 연결 예정</a>
</p>

## 설치

Mac 카카오톡을 읽으려면 엔진을 먼저 설치합니다.

```bash
brew install silver-flight-group/tap/kakaocli
npx -y chattong-mcp
```

`chattong-mcp` 패키지는 아직 배포 전입니다. 명령과 각 AI 앱의 연결 경로는 배포 뒤에도 그대로 둡니다. 지금은 Mac 카카오톡만 읽을 수 있고, Google 메시지와 DM은 준비 중입니다. 메시지를 보내거나 지우지 않습니다.

연결 순서는 [docs/connect.md](docs/connect.md)에 있습니다.

## 크레딧

Mac 카카오톡 읽기는 [kakaocli](https://github.com/silver-flight-group/kakaocli) (MIT, silver-flight-group)를 사용합니다.

KakaoTalk, Google Messages, Instagram을 비롯한 메신저와 AI 서비스의 이름과 로고는 각 권리자의 상표입니다. 챗통은 해당 권리자와 관련이 없으며, 승인이나 후원을 받지 않았습니다.
