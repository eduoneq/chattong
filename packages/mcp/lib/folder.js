import { execFile } from 'node:child_process';
import { lstat, mkdir, readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, extname, isAbsolute, join, parse } from 'node:path';
import { promisify } from 'node:util';

import { parseExport } from './export-reader.js';
import { loadFile } from './load-file.js';
import { callTool, folderTools, validateToolArgs } from './tools.js';

const run = promisify(execFile);
const documentsCommand = '[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false); ' +
  '[Console]::Write([Environment]::GetFolderPath([Environment+SpecialFolder]::MyDocuments, [Environment+SpecialFolderOption]::DoNotVerify))';

async function documentsPath() {
  const override = process.env.CHATTONG_DOCUMENTS_DIR;
  let path;
  if (override !== undefined) {
    path = override;
  } else if (process.platform === 'win32') {
    const powershell = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    const { stdout } = await run(powershell, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', documentsCommand], {
      encoding: 'utf8', windowsHide: true, timeout: 10000, maxBuffer: 64 * 1024,
    });
    path = stdout;
  } else {
    path = join(homedir(), 'Documents');
  }
  if (!isAbsolute(path) || (process.platform === 'win32' && parse(path).root.length === 1)) {
    throw Error('문서 폴더의 절대 경로를 확인할 수 없습니다.');
  }
  return path;
}

async function checkDirectory(path) {
  if (!(await lstat(path)).isDirectory()) throw Error('카카오톡 내보내기 폴더를 확인할 수 없습니다.');
}

async function roomRows(path) {
  try {
    return parseExport(await loadFile(path));
  } catch {
    return null;
  }
}

const unreadable = '이 TXT 파일을 읽을 수 없습니다. 파일의 크기(최대 8 MiB), 형식, 읽기 권한을 확인하세요.';

export async function openFolder() {
  const documents = await documentsPath();
  const parent = join(documents, 'chattong');
  const path = join(parent, 'kakaotalk');
  await mkdir(parent, { recursive: true });
  await checkDirectory(parent);
  await mkdir(path, { recursive: true });
  await checkDirectory(path);

  const setup = `카카오톡에서 직접 내보낸 대화 TXT 파일을 다음 폴더에 복사하세요.\n${path}\n파일을 추가하거나 교체한 뒤 list_chats를 다시 호출하세요.`;
  return { path, tools: folderTools, call };

  async function call(name, args) {
    validateToolArgs(name, args, folderTools);
    const { chatId, ...messageArgs } = args;
    if (chatId !== undefined && (typeof chatId !== 'string' || !chatId.length)) throw Error();

    await checkDirectory(parent);
    await checkDirectory(path);
    const entries = await readdir(path, { withFileTypes: true });
    const ids = entries.filter(entry => entry.isFile() && extname(entry.name).toLowerCase() === '.txt')
      .map(entry => entry.name).sort();

    if (name === 'list_chats') {
      const chats = [];
      for (const id of ids) {
        const rows = await roomRows(join(path, id));
        chats.push({ id, name: basename(id, extname(id)), messageCount: rows?.length ?? null,
          ...(rows === null ? { error: unreadable } : {}) });
      }
      return { chats, setup };
    }

    const id = chatId ?? (ids.length === 1 ? ids[0] : undefined);
    if (id === undefined) {
      const guide = ids.length ? 'list_chats로 대화 목록을 확인하고 chatId를 지정하세요.' : setup;
      return { messages: [], nextOffset: null, setup: guide };
    }
    if (!ids.includes(id)) throw Error('list_chats에서 반환한 대화 ID를 지정하세요.');
    const rows = await roomRows(join(path, id));
    if (rows === null) return { messages: [], nextOffset: null, error: unreadable };
    return callTool(name, messageArgs, rows);
  }
}
