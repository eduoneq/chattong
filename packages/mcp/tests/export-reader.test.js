import assert from 'node:assert/strict';
import test from 'node:test';

import { parseExport } from '../lib/export-reader.js';

const parseText = (text, encoding = 'utf8') => parseExport(Buffer.from(text, encoding));

test('Windows 형식의 UTF-8 BOM과 CRLF를 읽고 여러 줄 본문과 날짜 전환을 처리한다', () => {
  const input = [
    '\uFEFF주말 모형 전시회 님과 카카오톡 대화',
    '저장한 날짜 : 2026-03-02 13:25:39',
    '',
    '--------------- 2026년 3월 1일 일요일 ---------------',
    '가상 참가자님이 들어왔습니다.',
    '[편집 [합성]] [오전 12:01] 일정: 토요일',
    '',
    '  준비물: 종이, 테이프  ',
    '[준비팀] [오후 12:00] 사진',
    '--------------- 2026년 3월 2일 월요일 ---------------',
    '[준비팀] [오후 1:09]  최종 확인',
    '',
  ].join('\r\n');

  assert.deepEqual(parseText(input), [
    { date: '2026-03-01T00:01:00', sender: '편집 [합성]', text: '일정: 토요일\n\n  준비물: 종이, 테이프  ' },
    { date: '2026-03-01T12:00:00', sender: '준비팀', text: '사진' },
    { date: '2026-03-02T13:09:00', sender: '준비팀', text: ' 최종 확인' },
  ]);
});

test('Android 형식의 전체 날짜, 이름에 포함된 콜론, 시스템 메시지를 처리한다', () => {
  const input = [
    '독서 모임 모의 대화 님과 카카오톡 대화',
    '저장한 날짜 : 2024년 3월 1일 오후 2:10',
    '',
    '2024년 2월 29일 오전 9:06, 진행:1팀 : 첫 줄',
    '둘째 줄 : 책, 연필',
    '2024년 2월 29일 오전 9:07, 모의 참가자님이 나갔습니다.',
    '2024년 3월 1일 오후 2:00, 기록팀 : ',
    '2024년 3월 1일 오후 2:00, 기록팀 : 파일: 모의일정.pdf',
  ].join('\n');

  assert.deepEqual(parseText(input), [
    { date: '2024-02-29T09:06:00', sender: '진행:1팀', text: '첫 줄\n둘째 줄 : 책, 연필' },
    { date: '2024-03-01T14:00:00', sender: '기록팀', text: '' },
    { date: '2024-03-01T14:00:00', sender: '기록팀', text: '파일: 모의일정.pdf' },
  ]);
});

test('iOS 형식의 점으로 구분된 날짜와 구분선 없는 날짜 제목을 읽는다', () => {
  const input = [
    '모형 정원 만들기 님과 카카오톡 대화',
    '저장한 날짜 : 2026. 11. 27. 오후 8:15',
    '',
    '2026년 11월 26일 목요일',
    '2026. 11. 26. 오후 8:14, 모형 A : 첫 번째 설계',
    '2026년 11월 27일 금요일',
    '2026. 11. 27. 오전 8:02, 모형 B : 둘째 설계',
  ].join('\n');

  assert.deepEqual(parseText(input), [
    { date: '2026-11-26T20:14:00', sender: '모형 A', text: '첫 번째 설계' },
    { date: '2026-11-27T08:02:00', sender: '모형 B', text: '둘째 설계' },
  ]);
});

test('BOM이 있는 UTF-16LE 및 UTF-16BE와 초 단위 시각을 읽는다', () => {
  const input = '\uFEFF--- 2026. 10. 20. 화요일 ---\r\n[합성] [23:59:08] 기록';
  const expected = [{ date: '2026-10-20T23:59:08', sender: '합성', text: '기록' }];
  assert.deepEqual(parseText(input, 'utf16le'), expected);
  assert.deepEqual(parseExport(Buffer.from(input, 'utf16le').swap16()), expected);
});

test('잘못된 날짜나 시각이 이전 메시지에 붙지 않고 다음 유효한 메시지를 읽는다', () => {
  const input = [
    '[기록팀] [오전 9:00] 날짜 없는 메시지',
    '--- 2025년 2월 28일 금요일 ---',
    '[기록팀] [오전 8:11] 정상',
    '[기록팀] [오후 00:10] 잘못된 시간',
    '잘못된 메시지의 둘째 줄',
    '--- 2025년 2월 29일 토요일 ---',
    '[기록팀] [오전 9:00] 잘못된 날짜',
    '2026. 11. 27. 오후 8:1, 기록팀 : 잘못된 분 자리',
    '2026. 11. 27. 오후 8:10,    : 이름 없음',
    '2026. 11. 27. 오후 8:11, 기록팀 : 복구',
    '[목록] 확인',
    '99:24는 모형 번호입니다.',
  ].join('\n');

  assert.deepEqual(parseText(input), [
    { date: '2025-02-28T08:11:00', sender: '기록팀', text: '정상' },
    { date: '2026-11-27T20:11:00', sender: '기록팀', text: '복구\n[목록] 확인\n99:24는 모형 번호입니다.' },
  ]);
});

test('빈 입력과 형식을 인식할 수 없는 텍스트는 빈 배열을 반환한다', () => {
  assert.deepEqual(parseText(''), []);
  assert.deepEqual(parseText('\uFEFF모의 채팅방 님과 카카오톡 대화\n저장한 날짜 : 2026-11-27 13:00:00\n'), []);
  assert.deepEqual(parseText('가상의 일반 텍스트 파일'), []);
});

test('잘못된 입력과 인코딩 오류에 본문이나 원인 객체가 포함되지 않는다', () => {
  assert.throws(() => parseExport('가상의 민감한 본문'), {
    name: 'TypeError', message: '카카오톡 내보내기 파일의 Buffer가 필요합니다.',
  });
  assert.throws(() => parseExport(Buffer.from([0x41, 0xc3, 0x28])), (error) =>
    error.message === '카카오톡 내보내기 파일의 텍스트 인코딩을 읽을 수 없습니다.' && error.cause === undefined);
  assert.throws(() => parseText('가상 본문\0가상 본문'), {
    message: '카카오톡 내보내기 파일에 잘못된 텍스트가 있습니다.',
  });
});

test('바이트 한도와 메시지 한도를 각각 넘으면 결과 없이 실패한다', () => {
  assert.throws(() => parseExport(Buffer.alloc(32 * 1024 * 1024 + 1)), {
    name: 'RangeError', message: '카카오톡 내보내기 파일은 최대 32 MiB까지 읽을 수 있습니다.',
  });
  const line = '[합성] [오전 8:00] 모의 메시지\n';
  const input = '--- 2026년 11월 27일 금요일 ---\n' + line.repeat(250_001);
  assert.throws(() => parseText(input), {
    name: 'RangeError', message: '카카오톡 내보내기 파일은 최대 250,000개의 메시지까지 읽을 수 있습니다.',
  });
});
