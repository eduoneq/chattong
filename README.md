<p align="center">
  <img src="web/public/brand/lockup-light.png" alt="챗통 chattong" width="520">
</p>

<h1 align="center">내 AI에, 내 모든 채팅을 연결.</h1>

<p align="center">
챗통은 무료 오픈소스 읽기 전용 MCP입니다.<br>
메신저로 흩어진 대화를 내 컴퓨터에서 읽어, 내가 쓰는 AI에 연결합니다.
</p>

<p align="center">
  <a href="https://github.com/eduoneq/chattong">GitHub</a>
</p>

## 설치

Mac 카카오톡을 읽으려면 엔진을 먼저 설치합니다.

```bash
brew install silver-flight-group/tap/kakaocli
npx -y chattong-mcp
```

`chattong-mcp` 패키지는 아직 배포 전입니다. 명령과 각 AI 앱의 연결 경로는 배포 뒤에도 그대로 둡니다. 지금은 Mac 카카오톡만 읽을 수 있고, Google 메시지와 DM은 준비 중입니다. 메시지를 보내거나 지우지 않습니다.

## 랜딩

사이트는 `web/`에 있습니다. Vite와 React로 정적 페이지를 만듭니다.

```bash
cd web
npm install
npm run dev
```

개발 서버가 뜨면 브라우저에서 히어로, 사용 예시, 연결 창을 확인할 수 있습니다.

```bash
npm run build
npm run preview
```

`npm run build`는 `web/dist`에 정적 파일을 만듭니다. 추적 스크립트는 넣지 않습니다.

### 배포

- **Vercel / Netlify**: 프로젝트 루트를 `web`으로 지정하고 빌드 명령은 `npm run build`, 출력 폴더는 `dist`입니다.
- **그 외 정적 호스팅**: `web/dist`를 올리면 됩니다.
- **GitHub Pages**처럼 저장소 하위 경로에 올릴 때는 `web/vite.config.ts`의 `base`를 `/chattong/`처럼 맞춥니다.

저장소 소셜 미리보기는 [`.github/social-preview.png`](.github/social-preview.png) 입니다. GitHub 저장소 설정에서 이 파일을 소셜 프리뷰로 올리면 됩니다.

## 크레딧

Mac 카카오톡 읽기는 [kakaocli](https://github.com/silver-flight-group/kakaocli) (MIT, silver-flight-group)를 사용합니다.

KakaoTalk, Google Messages, Instagram을 비롯한 메신저와 AI 서비스의 이름과 로고는 각 권리자의 상표입니다. 챗통은 해당 권리자와 관련이 없으며, 승인이나 후원을 받지 않았습니다.

아이콘 출처와 라이선스는 [docs/brand-sources.md](docs/brand-sources.md)에 있습니다. 글꼴은 Pretendard (SIL Open Font License)입니다.
