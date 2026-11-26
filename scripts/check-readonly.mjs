#!/usr/bin/env node
// 읽기 전용 강제 검사: 쓰기·전송·화면 조작·네트워크·프로세스 메모리 접근 코드가 제품 코드에 들어오면 실패한다.
// 사용: node scripts/check-readonly.mjs [검사할 폴더...]   (기본: packages)
// 예외가 정말 필요하면 해당 줄 끝에 `// readonly-guard: allow <사유>`를 달고 리뷰에서 사유를 확인한다.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const targets = (process.argv.slice(2).length ? process.argv.slice(2) : ['packages']).map((p) => join(ROOT, p));
const EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.tsx', '.jsx']);
const SKIP_DIR = new Set(['node_modules', 'dist', 'build', '.git', 'test', 'tests', '__tests__', 'fixtures']);

const RULES = [
  // 1. 데이터베이스 쓰기
  { id: 'sql-write', why: '쓰기 SQL', re: /["'`][^"'`]*\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|REPLACE\s+INTO|CREATE\s+(TABLE|INDEX|TRIGGER|VIEW)|DROP\s+(TABLE|INDEX|TRIGGER|VIEW)|ALTER\s+TABLE|ATTACH\s+DATABASE|DETACH\s+DATABASE|VACUUM|REINDEX)\b/i },
  { id: 'pragma-write', why: '쓰기성 PRAGMA', re: /pragma\s*\(?\s*["'`]?\s*(rekey|journal_mode\s*=|wal_checkpoint|user_version\s*=|writable_schema)/i },
  { id: 'db-open-writable', why: '읽기 전용이 아닌 DB 열기', re: /new\s+(Database|DatabaseSync)\s*\((?![^)]*readonly\s*:\s*true)(?![^)]*readOnly\s*:\s*true)/ },
  // 2. 네트워크
  { id: 'net-module', why: '네트워크 모듈', re: /(from\s+|require\s*\(\s*|import\s*\(\s*)["'`](node:)?(http|https|http2|net|tls|dgram|dns)["'`]/ },
  { id: 'net-lib', why: '네트워크 라이브러리', re: /["'`](undici|axios|node-fetch|got|ws|socket\.io-client|ky)["'`]/ },
  { id: 'net-call', why: '네트워크 호출', re: /\b(fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/ },
  // 3. 화면 조작·클립보드·전송 자동화
  { id: 'ui-automation', why: '화면 조작·클립보드', re: /\b(osascript|AXUIElement|CGEvent|pbcopy|pbpaste|robotjs|nut-js|@nut-tree|SendInput|keybd_event|SendMessage[AW]?|xdotool|clipboardy|EVA_VH_ListControl)\b/ },
  // 4. 실행 중 앱 메모리 접근
  { id: 'process-memory', why: '프로세스 메모리 접근', re: /\b(task_for_pid|ptrace|ReadProcessMemory|OpenProcess|frida|mach_vm_read|vm_read)\b/ },
  // 5. 쓰기·전송 성격의 MCP 도구
  { id: 'write-tool', why: '쓰기·전송 도구 등록', re: /(registerTool|server\.tool|\.tool)\s*\(\s*["'`](send|reply|post|write|delete|remove|edit|update|mark|forward|react)[_a-z]*["'`]/i },
];

// 문자열 밖의 // 주석만 잘라 낸다(문자열 속 https:// 는 유지)
function stripLineComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '/' && line[i + 1] === '/') return line.slice(0, i);
  }
  return line;
}

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (EXT.has(extname(name))) yield p;
  }
}

const violations = [];
let files = 0;
for (const t of targets) {
  for (const f of walk(t)) {
    files++;
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const code = stripLineComment(line).trim();
      if (!code || code.startsWith('*') || code.startsWith('/*')) return;
      if (/readonly-guard:\s*allow\s+\S+/.test(line)) return;
      for (const r of RULES) if (r.re.test(code)) violations.push(`${relative(ROOT, f)}:${i + 1} [${r.id}] ${r.why}: ${code.slice(0, 120)}`);
    });
  }
}

if (violations.length) {
  console.error(`읽기 전용 검사 실패: ${violations.length}건 (파일 ${files}개 검사)`);
  for (const v of violations) console.error('  ' + v);
  console.error('\n챗통은 읽기 전용입니다. 쓰기·전송·화면 조작·네트워크·메모리 접근 코드는 넣을 수 없습니다(DISCLAIMER.md 2절).');
  process.exit(1);
}
console.log(`읽기 전용 검사 통과: 파일 ${files}개, 위반 0건`);
