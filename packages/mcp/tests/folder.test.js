import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, truncate, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { openFolder } from '../lib/folder.js';
import { callTool, tools } from '../lib/tools.js';

test('내보내기 폴더를 만들고 변경된 대화와 파일별 오류를 반영한다', async t => {
  const documents = await mkdtemp(join(tmpdir(), '챗통-문서-'));
  t.after(() => rm(documents, { recursive: true, force: true }));
  const folder = await openFolderWithOverride(documents);
  const path = join(documents, 'chattong', 'kakaotalk');
  assert.equal(folder.path, path);
  const empty = await folder.call('list_chats', {});
  assert.deepEqual(empty.chats, []);
  assert.ok(empty.setup.includes(path));
  assert.equal((await folder.call('read_messages', {})).setup, empty.setup);

  const room = '연습.TXT';
  const sample = '--- 2026. 11. 27. 금요일 ---\n[연습] [08:11] 첫째\n[연습] [08:12] 둘째';
  await writeFile(join(path, room), sample);
  await writeFile(join(path, '무시.csv'), sample);
  await mkdir(join(path, '하위.txt'));
  await writeFile(join(path, '하위.txt', '무시.txt'), sample);
  await writeFile(join(documents, '외부.txt'), sample);
  assert.deepEqual((await folder.call('list_chats', {})).chats, [{ id: room, name: '연습', messageCount: 2 }]);
  const firstPage = await folder.call('read_messages', { limit: 1 });
  assert.equal(firstPage.messages[0].text, '첫째');
  assert.equal(firstPage.nextOffset, 1);
  const search = await folder.call('search_messages', { chatId: room, query: '둘째' });
  assert.equal(search.messages[0].text, '둘째');
  await assert.rejects(folder.call('read_messages', { chatId: join(documents, '외부.txt') }));
  await assert.rejects(folder.call('read_messages', { chatId: '../외부.txt' }));
  await assert.rejects(folder.call('read_messages', { chatId: 0 }));
  await assert.rejects(folder.call('search_messages', {}));

  const broken = '손상.txt';
  const oversized = '한도.txt';
  await writeFile(join(path, broken), Buffer.from([0xc3, 0x28]));
  await writeFile(join(path, oversized), '');
  await truncate(join(path, oversized), 8 * 1024 * 1024 + 1);
  const { chats } = await folder.call('list_chats', {});
  assert.equal(chats.find(chat => chat.id === room).messageCount, 2);
  for (const id of [broken, oversized]) {
    assert.equal(chats.find(chat => chat.id === id).messageCount, null);
    assert.equal(typeof (await folder.call('read_messages', { chatId: id })).error, 'string');
  }
  assert.match((await folder.call('read_messages', {})).setup, /chatId/);

  await writeFile(join(path, room), sample.replace('첫째', '수정'));
  assert.equal((await folder.call('read_messages', { chatId: room })).messages[0].text, '수정');
  await unlink(join(path, room));
  await assert.rejects(folder.call('read_messages', { chatId: room }));

  assert.ok('chatId' in folder.tools.find(tool => tool.name === 'read_messages').inputSchema.properties);
  assert.ok(!('chatId' in tools.find(tool => tool.name === 'read_messages').inputSchema.properties));
  assert.deepEqual(callTool('list_chats', {}, []), { chats: [{ id: 'export', messageCount: 0 }] });
  assert.throws(() => callTool('read_messages', { chatId: room }, []));
});

test('문서 폴더 재정의에는 절대 경로가 필요하다', async () => {
  await assert.rejects(openFolderWithOverride('relative/documents'), /절대 경로/);
});

async function openFolderWithOverride(path) {
  const previous = process.env.CHATTONG_DOCUMENTS_DIR;
  process.env.CHATTONG_DOCUMENTS_DIR = path;
  try {
    return await openFolder();
  } finally {
    if (previous === undefined) delete process.env.CHATTONG_DOCUMENTS_DIR;
    else process.env.CHATTONG_DOCUMENTS_DIR = previous;
  }
}
