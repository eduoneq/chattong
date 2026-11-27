import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const source = fileURLToPath(new URL('../packages/mcp/', import.meta.url));
const packageName = 'chattong-mcp';
const protocolVersion = '2025-06-18';
const windows = process.platform === 'win32';

function npm(args, cwd, root) {
  // Windows의 npm.cmd를 셸로 해석하는 대신 Node 배포본에 포함된 npm CLI를 호출한다.
  const cli = windows ? join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js') : null;
  return execFileSync(cli ? process.execPath : 'npm', cli ? [cli, ...args] : args, {
    cwd,
    encoding: 'utf8',
    timeout: 120_000,
    windowsHide: true,
    env: {
      ...process.env,
      npm_config_userconfig: join(root, 'user.npmrc'),
      npm_config_globalconfig: join(root, 'global.npmrc'),
    },
  });
}

async function installPackedPackage(root) {
  npm(['pack', '--loglevel=error', '--ignore-scripts', '--pack-destination', root], source, root);
  const archives = (await readdir(root)).filter(filename => filename.endsWith('.tgz'));
  assert.equal(archives.length, 1);
  const [archive] = archives;

  const cwd = join(root, 'isolated install');
  await mkdir(cwd);
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ private: true }));
  npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', join(root, archive)], cwd, root);

  const directory = join(cwd, 'node_modules', packageName);
  const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  assert.equal(manifest.name, packageName);
  assert.equal(archive, `${packageName}-${manifest.version}.tgz`);
  await access(join(cwd, 'node_modules', '.bin', windows ? `${packageName}.cmd` : packageName));
  return {
    cwd,
    version: manifest.version,
    // 테스트가 제공하는 설치본과 합성 파일만 읽을 수 있게 하고 파일 쓰기는 허용하지 않는다.
    nodeArgs: ['--permission', `--allow-fs-read=${root}`, resolve(directory, manifest.bin[packageName])],
  };
}

async function withinDeadline(operation, action) {
  let timer;
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${action} 응답 시간 초과`)), 10_000);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

async function withServer(installation, args, exercise) {
  const child = spawn(process.execPath, [...installation.nodeArgs, ...args], {
    cwd: installation.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const stopped = new Promise(resolve => {
    child.once('error', error => resolve({ error }));
    child.once('close', (code, signal) => resolve({ code, signal }));
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  child.stdin.on('error', () => {}); // 서버가 먼저 끝나면 응답 검사에서 종료를 보고한다.
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const replies = lines[Symbol.asyncIterator]();
  let nextId = 0;

  function send(message) {
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');
  }

  async function request(method, params) {
    const id = ++nextId;
    send({ id, method, params });
    const reply = await withinDeadline(replies.next(), method);
    assert.ok(!reply.done, `${method} 응답 전에 MCP 서버가 종료됐습니다.`);
    const response = JSON.parse(reply.value);
    assert.equal(response.jsonrpc, '2.0');
    assert.equal(response.id, id);
    return response;
  }

  try {
    const initialized = await request('initialize', {
      protocolVersion,
      capabilities: {},
      clientInfo: { name: 'chattong-packed-e2e', version: '1.0.0' },
    });
    assert.equal(initialized.result?.protocolVersion, protocolVersion);
    assert.deepEqual(initialized.result.serverInfo, { name: packageName, version: installation.version });
    assert.ok(initialized.result.capabilities.tools);
    send({ method: 'notifications/initialized' });
    await exercise(request);
  } finally {
    child.stdin.end();
    try {
      const exit = await withinDeadline(stopped, 'MCP 종료');
      assert.ifError(exit.error);
      assert.equal(exit.code, 0, `MCP 종료 코드 ${exit.code}, 시그널 ${exit.signal}`);
    } finally {
      if (child.exitCode === null && child.signalCode === null) child.kill();
      lines.close();
    }
  }
  return { stdout, stderr };
}

async function callTool(request, name, args = {}) {
  const response = await request('tools/call', { name, arguments: args });
  assert.ok(!response.error && !response.result?.isError, `${name} 호출에 실패했습니다.`);
  const [item] = response.result.content;
  assert.equal(item.type, 'text');
  return JSON.parse(item.text);
}

function assertPrivate({ stdout, stderr }, ...values) {
  for (const value of values) {
    assert.ok(!stdout.includes(value), '표준 출력에 비공개 입력이 포함됐습니다.');
    assert.ok(!stderr.includes(value), '표준 오류에 비공개 입력이 포함됐습니다.');
  }
}

const messages = [
  { date: '2026-11-27T09:01:00', sender: '합성 화자 가', text: '한글 FixtureNeedle 메시지\n메시지의 둘째 줄' },
  { date: '2026-11-27T12:02:00', sender: '합성 화자 나', text: '검색에 걸리지 않는 대화' },
  { date: '2026-11-27T12:03:00', sender: '합성 화자 가', text: '다시 fixtureneedle 확인' },
];
const malformedSender = 'synthetic-private-sender-89fc';
const malformedBody = 'synthetic-private-body-26a9';
const exports = [
  {
    name: '대괄호 형식과 UTF-8',
    bytes: Buffer.from([
      '합성 대화방 님과 카카오톡 대화',
      '--------------- 2026년 11월 27일 금요일 ---------------',
      `[${messages[0].sender}] [오전 9:01] ${messages[0].text}`,
      `[${malformedSender}] [오전 99:99] ${malformedBody}`,
      `[${messages[1].sender}] [오후 12:02] ${messages[1].text}`,
      `[${messages[2].sender}] [오후 12:03] ${messages[2].text}`,
    ].join('\n')),
  },
  {
    name: '쉼표 형식과 UTF-16LE BOM, CRLF',
    bytes: Buffer.from('\uFEFF' + [
      '합성 대화방 님과 카카오톡 대화',
      `2026년 11월 27일 오전 9:01, ${messages[0].sender} : ${messages[0].text}`,
      `2026년 11월 27일 오전 99:99, ${malformedSender} : ${malformedBody}`,
      `2026년 11월 27일 오후 12:02, ${messages[1].sender} : ${messages[1].text}`,
      `2026년 11월 27일 오후 12:03, ${messages[2].sender} : ${messages[2].text}`,
    ].join('\n').replaceAll('\n', '\r\n'), 'utf16le'),
  },
];

test('격리된 설치 디렉터리의 npm 패키지로 stdio MCP를 검증한다', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'chattong-packed-'));
  t.after(() => rm(temporary, { recursive: true, force: true, maxRetries: 3 }));
  const root = await realpath(temporary);
  const installation = await installPackedPackage(root);

  await t.test('파일 없이 연결하면 읽기 전용 도구와 설정 안내를 반환한다', async () => {
    await withServer(installation, [], async request => {
      const { tools } = (await request('tools/list', {})).result;
      assert.deepEqual(tools.map(tool => tool.name).sort(), ['list_chats', 'read_messages', 'search_messages']);
      for (const tool of tools) assert.equal(tool.annotations?.readOnlyHint, true, tool.name);
      assert.deepEqual(tools.find(tool => tool.name === 'search_messages').inputSchema.required, ['query']);

      const status = await callTool(request, 'list_chats');
      assert.deepEqual(status.chats, []);
      assert.match(status.setup, /--file/);
      assert.deepEqual((await callTool(request, 'read_messages')).messages, []);
      assert.deepEqual((await callTool(request, 'search_messages', { query: '합성' })).messages, []);
    });
  });

  for (const [index, fixture] of exports.entries()) {
    await t.test(`${fixture.name}에서 상태, 본문, 검색을 반환하고 파일을 보존한다`, async () => {
      const file = join(root, `합성 대화 내보내기 ${index}.txt`);
      await writeFile(file, fixture.bytes, { mode: 0o444 });
      const before = await stat(file, { bigint: true });
      const output = await withServer(installation, ['--file', file], async request => {
        const status = await callTool(request, 'list_chats');
        assert.deepEqual(status.chats, [{ id: 'export', messageCount: messages.length }]);
        assert.equal(status.setup, undefined);

        const first = await callTool(request, 'read_messages', { limit: 1 });
        assert.deepEqual(first, { messages: messages.slice(0, 1), nextOffset: 1 });
        assert.deepEqual(await callTool(request, 'read_messages', { offset: first.nextOffset }), {
          messages: messages.slice(1), nextOffset: null,
        });

        const search = await callTool(request, 'search_messages', { query: 'FIXTURENEEDLE', limit: 1 });
        assert.deepEqual(search, { messages: messages.slice(0, 1), nextOffset: 2 });
        assert.deepEqual(await callTool(request, 'search_messages', { query: 'FIXTURENEEDLE', offset: search.nextOffset }), {
          messages: messages.slice(2), nextOffset: null,
        });
        assert.deepEqual(await callTool(request, 'search_messages', { query: '없는 검색어' }), { messages: [], nextOffset: null });

        const mutation = await request('tools/call', { name: 'send_message', arguments: {} });
        assert.ok(mutation.error || mutation.result?.isError, '전송 도구 호출이 거부되어야 합니다.');
      });
      assertPrivate(output, malformedSender, malformedBody, basename(file));
      assert.deepEqual(await readFile(file), fixture.bytes);
      const after = await stat(file, { bigint: true });
      assert.equal(after.mtimeNs, before.mtimeNs);
      assert.equal(after.ctimeNs, before.ctimeNs);
    });
  }

  await t.test('손상된 파일은 경로와 내용을 노출하지 않고 시작에 실패한다', async () => {
    const file = join(root, '합성 synthetic-private-location-c911.txt');
    const privateText = 'synthetic-private-content-e013';
    await writeFile(file, Buffer.concat([Buffer.from(privateText), Buffer.from([0xff])]));
    const invalid = spawnSync(process.execPath, [...installation.nodeArgs, '--file', file], {
      cwd: installation.cwd,
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true,
    });
    assert.ifError(invalid.error);
    assert.equal(invalid.status, 1);
    assertPrivate(invalid, 'synthetic-private-location-c911', privateText);
    assert.equal(invalid.stdout, '');
    assert.match(invalid.stderr, /--help/);
  });
});
