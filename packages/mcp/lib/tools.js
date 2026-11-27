const page = {
  offset: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 },
  limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
};
const setup = '메신저에서 직접 내보낸 대화 TXT의 절대 경로를 시작 인자 --file 다음에 지정하고 MCP 서버를 다시 시작하세요.';
const definitions = [
  ['list_chats', '연결한 내보내기 파일의 메시지 수를 확인합니다.', {}],
  ['read_messages', '원본 순서로 메시지를 읽습니다. offset은 0부터 시작합니다.', page],
  ['search_messages', '본문에서 대소문자를 구분하지 않고 문자열을 찾습니다. offset은 원본 인덱스입니다.',
    { query: { type: 'string', minLength: 1, maxLength: 200 }, ...page }],
];
export const tools = definitions.map(([name, description, properties]) => ({
  name, description,
  inputSchema: { type: 'object', properties, additionalProperties: false, required: name === 'search_messages' ? ['query'] : [] },
  annotations: { readOnlyHint: true, openWorldHint: false },
}));

function clip(value, limit) {
  if (value.length <= limit) return value;
  return value.slice(0, limit - 1).replace(/[\uD800-\uDBFF]$/, '') + '…';
}

export function callTool(name, args, rows) {
  const tool = tools.find(item => item.name === name);
  if (!tool || !args || typeof args !== 'object' || Array.isArray(args)
      || Object.keys(args).some(key => !Object.hasOwn(tool.inputSchema.properties, key))) throw Error();
  if (name === 'list_chats') return rows === null ? { chats: [], setup } : { chats: [{ id: 'export', messageCount: rows.length }] };
  const { offset = 0, limit = 20, query } = args;
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 50) throw Error();
  if (name === 'search_messages' && (typeof query !== 'string' || !query.trim() || query.length > 200)) throw Error();
  const messages = [];
  if (rows === null) return { messages, nextOffset: null, setup };
  const needle = query?.toLowerCase();
  let bytes = 0;
  for (let i = offset; i < rows.length; i++) {
    const { date, sender, text } = rows[i];
    if (needle && !text.toLowerCase().includes(needle)) continue;
    const message = { date: clip(date, 64), sender: clip(sender, 128), text: clip(text, 2048) };
    bytes += Buffer.byteLength(JSON.stringify(message)) + 1;
    if (messages.length >= limit || bytes > 30 * 1024) return { messages, nextOffset: i };
    messages.push(message);
  }
  return { messages, nextOffset: null };
}
