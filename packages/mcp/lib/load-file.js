import { constants } from 'node:fs';
import { lstat, open } from 'node:fs/promises';
import { extname, isAbsolute } from 'node:path';

const MAX_BYTES = 8 * 1024 * 1024;

export async function loadFile(path) {
  if (!isAbsolute(path) || extname(path).toLowerCase() !== '.txt') throw Error();
  // Windows drive paths only. Reject device namespaces, UNC, alternate streams and DOS devices.
  if (process.platform === 'win32' && (!/^[a-z]:[\\/]/i.test(path)
      || /[:]/.test(path.slice(2)) || /(?:^|[\\/])(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:[ .\\/]|$)/i.test(path))) throw Error();
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.size > MAX_BYTES) throw Error();
  const file = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
  try {
    const info = await file.stat({ bigint: true });
    if (!info.isFile() || info.dev !== before.dev || info.ino !== before.ino || info.size > MAX_BYTES) throw Error();
    const buffer = Buffer.alloc(Number(info.size));
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await file.read(buffer, offset, buffer.length - offset, offset);
      if (!bytesRead) throw Error();
      offset += bytesRead;
    }
    const after = await file.stat({ bigint: true });
    if (info.size !== after.size || info.mtimeNs !== after.mtimeNs || info.ctimeNs !== after.ctimeNs) throw Error();
    return buffer;
  } finally {
    await file.close();
  }
}
