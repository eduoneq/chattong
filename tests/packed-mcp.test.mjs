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
    // 테스트가 제공하는 설치본과 합성 파일만 읽을 수 있게 한다.
    permissions: ['--permission', `--allow-fs-read=${root}`],
    entrypoint: resolve(directory, manifest.bin[packageName]),
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

async function withServer(installation, { documentsRoot, allowFolderCreation = false, args = [] }, exercise) {
  const permissions = [...installation.permissions];
  if (allowFolderCreation) permissions.push(`--allow-fs-write=${documentsRoot}`);
  const child = spawn(process.execPath, [...permissions, installation.entrypoint, ...args], {
    cwd: installation.cwd,
    env: { ...process.env, CHATTONG_DOCUMENTS_DIR: documentsRoot },
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

  await t.test('기본 폴더를 만들고 설정 화면과 최신 대화 목록을 제공한다', async () => {
    const documentsRoot = join(root, '합성 문서 & 테스트');
    const folder = join(documentsRoot, 'chattong', 'kakaotalk');
    await mkdir(documentsRoot);

    await withServer(installation, { documentsRoot, allowFolderCreation: true }, async request => {
      const { tools } = (await request('tools/list', {})).result;
      assert.deepEqual(tools.map(tool => tool.name).sort(), ['list_chats', 'read_messages', 'search_messages']);
      for (const tool of tools) assert.equal(tool.annotations?.readOnlyHint, true, tool.name);
      const listTool = tools.find(tool => tool.name === 'list_chats');
      const readTool = tools.find(tool => tool.name === 'read_messages');
      const searchTool = tools.find(tool => tool.name === 'search_messages');
      assert.equal(readTool.inputSchema.properties.chatId.type, 'string');
      assert.equal(searchTool.inputSchema.properties.chatId.type, 'string');
      assert.deepEqual(searchTool.inputSchema.required, ['query']);

      const status = await callTool(request, 'list_chats');
      assert.deepEqual(status.chats, []);
      assert.ok(status.setup.includes(folder));
      assert.ok((await stat(folder)).isDirectory());
      assert.deepEqual((await callTool(request, 'read_messages')).messages, []);
      assert.deepEqual((await callTool(request, 'search_messages', { query: '합성' })).messages, []);

      const uri = listTool._meta?.ui?.resourceUri;
      assert.match(uri, /^ui:\/\//);
      const { resources } = (await request('resources/list', {})).result;
      assert.ok(resources.some(resource => resource.uri === uri));
      const resource = await request('resources/read', { uri });
      assert.ok(!resource.error, '설정 화면을 읽지 못했습니다.');
      const [html] = resource.result.contents;
      assert.equal(html.uri, uri);
      assert.match(html.mimeType, /^text\/html;\s*profile=mcp-app$/);
      assert.match(html.text, /<(?:!doctype html|html\b)/i);
      assert.ok(html.text.includes(folder.replaceAll('&', '&amp;')), '설정 화면에 실제 폴더 경로가 없습니다.');

      const firstFile = join(folder, '합성 첫 대화.txt');
      const secondFile = join(folder, '합성 둘째 대화.TXT');
      await writeFile(firstFile, exports[0].bytes);
      await writeFile(join(folder, 'TXT가 아닌 합성 파일.md'), exports[0].bytes);

      const initial = await callTool(request, 'list_chats');
      assert.equal(initial.chats.length, 1);
      const [firstChat] = initial.chats;
      assert.equal(firstChat.messageCount, messages.length);
      assert.equal(typeof firstChat.id, 'string');
      assert.ok(firstChat.id.length > 0);

      const secondMessage = { ...messages[0], text: '두 번째 대화의 FixtureNeedle' };
      await writeFile(secondFile, [
        '합성 둘째 대화방 님과 카카오톡 대화',
        '--------------- 2026년 11월 27일 금요일 ---------------',
        `[${secondMessage.sender}] [오전 9:01] ${secondMessage.text}`,
      ].join('\n'));

      const refreshed = await callTool(request, 'list_chats');
      assert.equal(refreshed.chats.length, 2);
      assert.ok(refreshed.setup.includes(folder));
      const secondChat = refreshed.chats.find(chat => chat.messageCount === 1);
      assert.equal(typeof secondChat?.id, 'string');
      assert.ok(secondChat.id.length > 0);
      assert.notEqual(secondChat.id, firstChat.id);
      assert.equal(refreshed.chats.find(chat => chat.id === firstChat.id)?.messageCount, messages.length);

      assert.deepEqual(await callTool(request, 'read_messages', { chatId: firstChat.id }), {
        messages, nextOffset: null,
      });
      assert.deepEqual(await callTool(request, 'search_messages', { chatId: secondChat.id, query: 'FIXTURENEEDLE' }), {
        messages: [secondMessage], nextOffset: null,
      });

      await writeFile(secondFile, exports[1].bytes);
      await rm(firstFile);
      const remaining = await callTool(request, 'list_chats');
      assert.deepEqual(remaining.chats.map(({ id, messageCount }) => ({ id, messageCount })), [
        { id: secondChat.id, messageCount: messages.length },
      ]);
      assert.deepEqual(await callTool(request, 'read_messages', { chatId: secondChat.id }), {
        messages, nextOffset: null,
      });
    });
  });

  const blockedDocuments = join(root, '기본 폴더 생성이 막힌 문서');
  await mkdir(blockedDocuments);
  await writeFile(join(blockedDocuments, 'chattong'), '합성 일반 파일');
  for (const [index, fixture] of exports.entries()) {
    await t.test(`기본 폴더를 만들 수 없어도 --file의 ${fixture.name} 대화를 읽고 원본을 보존한다`, async () => {
      const file = join(root, `합성 대화 내보내기 ${index}.txt`);
      await writeFile(file, fixture.bytes, { mode: 0o444 });
      const before = await stat(file, { bigint: true });
      const output = await withServer(installation, { documentsRoot: blockedDocuments, args: ['--file', file] }, async request => {
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
    const invalid = spawnSync(process.execPath, [...installation.permissions, installation.entrypoint, '--file', file], {
      cwd: installation.cwd,
      env: { ...process.env, CHATTONG_DOCUMENTS_DIR: blockedDocuments },
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
