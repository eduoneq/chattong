#!/usr/bin/env node
// 배포 전 자리 패키지: 아무것도 읽지 않고, 네트워크·파일에 접근하지 않으며, 안내만 출력하고 끝난다.
const msg = [
  '챗통(chattong)은 아직 배포 전입니다. 이 패키지는 이름을 지키기 위한 자리 패키지이며 아무 기능이 없습니다.',
  '소식과 설치 방법: https://chattong.dev  ·  https://github.com/eduoneq/chattong',
  'chattong is not released yet. This placeholder does nothing. See https://chattong.dev',
].join('\n');
process.stderr.write(msg + '\n');
process.exit(1);
