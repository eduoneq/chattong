const MAX_EXPORT_BYTES = 32 * 1024 * 1024;
const MAX_MESSAGES = 250_000;

const KOREAN_DAY = String.raw`\d{4}년[ \t]*\d{1,2}월[ \t]*\d{1,2}일`;
const DOTTED_DAY = String.raw`\d{4}\.[ \t]*\d{1,2}\.[ \t]*\d{1,2}\.`;
const DAY = String.raw`(?<day>${KOREAN_DAY}|${DOTTED_DAY})`;
const CLOCK = String.raw`(?:(?<period>오전|오후)[ \t]*)?(?<hour>\d{1,2}):(?<minute>\d{2})(?::(?<second>\d{2}))?`;
const WEEKDAY = String.raw`(?:[ \t]+[월화수목금토일]요일)?`;
const DESKTOP_DAY = new RegExp(String.raw`^-{3,}[ \t]*${DAY}${WEEKDAY}[ \t]*-{3,}[ \t]*$`, 'u');
const MOBILE_DAY = new RegExp(String.raw`^(?<day>${KOREAN_DAY})[ \t]+[월화수목금토일]요일[ \t]*$`, 'u');
const DESKTOP_MESSAGE = new RegExp(String.raw`^\[(?<sender>[^\n]{1,1024}?)\][ \t]*\[${CLOCK}\](?:[ \t]|$)`, 'u');
const MOBILE_MESSAGE = new RegExp(String.raw`^${DAY}[ \t]+${CLOCK},[ \t]*`, 'u');
const MOBILE_SENDER = /^(?<sender>[^\n]{1,1024}?)[ \t]:(?:[ \t]|$)/u;
const MALFORMED_DESKTOP = /^\[[^\n]{0,1024}?\][ \t]*\[(?:오전|오후|\d{1,2}:)/u;
const MALFORMED_MOBILE = new RegExp(String.raw`^${DAY}[ \t]+(?:오전|오후|\d{1,2}:)[^,\n]{0,24},`, 'u');
const SYSTEM_NOTICE = /(?:님이 (?:들어왔습니다|나갔습니다)|님을 초대했습니다)\.[ \t]*$/u;

function decodeExport(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('카카오톡 내보내기 파일의 Buffer가 필요합니다.');
  }
  if (buffer.length > MAX_EXPORT_BYTES) {
    throw new RangeError('카카오톡 내보내기 파일은 최대 32 MiB까지 읽을 수 있습니다.');
  }

  let encoding = 'utf-8';
  if (buffer[0] === 0xff && buffer[1] === 0xfe) encoding = 'utf-16le';
  if (buffer[0] === 0xfe && buffer[1] === 0xff) encoding = 'utf-16be';
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(buffer);
  } catch {
    throw new Error('카카오톡 내보내기 파일의 텍스트 인코딩을 읽을 수 없습니다.');
  }
}

function calendarDate(rawDay) {
  const [year, month, day] = rawDay.match(/\d+/g);
  if (year === '0000') return null;
  const isoDay = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
  const calendar = new Date(isoDay + 'T00:00:00Z');
  return Number.isFinite(+calendar) && calendar.toISOString().startsWith(isoDay) ? isoDay : null;
}

function timestamp(day, { period, hour, minute, second = '00' }) {
  if (!day || +minute > 59 || +second > 59) return null;
  let hours = Number(hour);
  if (period) {
    if (hours < 1 || hours > 12) return null;
    hours = hours % 12 + (period === '오후' ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }
  return day + 'T' + String(hours).padStart(2, '0') + ':' + minute + ':' + second;
}

/**
 * 한국어 카카오톡 텍스트 내보내기에서 발화자와 시각이 있는 메시지를 파일 순서대로 읽는다.
 * date는 파일에 표시된 현지 시각을 YYYY-MM-DDTHH:mm:ss 문자열로 반환한다.
 * 인식할 수 있는 메시지가 없으면 빈 배열을 반환하고, 손상된 인코딩과 한도 초과는 예외로 알린다.
 */
export function parseExport(buffer) {
  const source = decodeExport(buffer).replace(/\r\n?/g, '\n');
  if (source.includes('\0')) {
    throw new Error('카카오톡 내보내기 파일에 잘못된 텍스트가 있습니다.');
  }

  const messages = [];
  let desktopDay = null;
  let current = null;
  let textEnd = 0;

  function finishMessage() {
    if (!current) return;
    if (messages.length === MAX_MESSAGES) {
      throw new RangeError('카카오톡 내보내기 파일은 최대 250,000개의 메시지까지 읽을 수 있습니다.');
    }
    const { date, sender, start } = current;
    messages.push({ date, sender, text: source.slice(start, textEnd) });
    current = null;
  }

  for (let start = 0; start < source.length;) {
    const newline = source.indexOf('\n', start);
    const end = newline === -1 ? source.length : newline;
    const line = source.slice(start, end);
    const lineStart = start;
    start = end + 1;

    const divider = DESKTOP_DAY.exec(line) ?? MOBILE_DAY.exec(line);
    if (divider) {
      finishMessage();
      desktopDay = calendarDate(divider.groups.day);
      continue;
    }

    const desktop = DESKTOP_MESSAGE.exec(line);
    const mobile = desktop ? null : MOBILE_MESSAGE.exec(line);
    if (desktop || mobile) {
      finishMessage();
      const match = desktop ?? mobile;
      const day = desktop ? desktopDay : calendarDate(mobile.groups.day);
      const date = timestamp(day, match.groups);
      // 모바일에서는 이름과 본문 사이의 첫 공백-콜론을 구분자로 사용한다.
      const senderField = mobile && MOBILE_SENDER.exec(line.slice(match[0].length));
      const sender = (desktop?.groups.sender ?? senderField?.groups.sender)?.trim();
      if (date && sender) {
        const prefixLength = match[0].length + (senderField ? senderField[0].length : 0);
        current = { date, sender, start: lineStart + prefixLength };
        textEnd = end;
      }
      continue;
    }

    if (MALFORMED_DESKTOP.test(line) || MALFORMED_MOBILE.test(line) || SYSTEM_NOTICE.test(line)) {
      finishMessage();
    } else if (current) {
      textEnd = end;
    }
  }
  finishMessage();
  return messages;
}
