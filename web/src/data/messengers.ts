export type MessengerId =
  | "kakao"
  | "gmsg"
  | "insta"
  | "messenger"
  | "line"
  | "telegram"
  | "whatsapp"
  | "slack"
  | "x"
  | "discord";

export type Messenger = {
  id: MessengerId;
  name: string;
  /** full: the file is already an app icon. glyph: draw it on a tile. */
  fit: "full" | "glyph";
  mono?: boolean;
  tint?: string;
  /** Only Mac KakaoTalk can be toggled on today. */
  available?: boolean;
  detail: string;
};

export const MESSENGERS: Messenger[] = [
  { id: "kakao", name: "카카오톡", fit: "full", available: true, detail: "Mac" },
  { id: "gmsg", name: "Google 메시지", fit: "full", detail: "문자" },
  { id: "insta", name: "Instagram", fit: "full", detail: "DM" },
  { id: "messenger", name: "Messenger", fit: "full", detail: "DM" },
  { id: "line", name: "LINE", fit: "full", detail: "채팅" },
  { id: "telegram", name: "Telegram", fit: "full", detail: "채팅" },
  { id: "whatsapp", name: "WhatsApp", fit: "full", detail: "채팅" },
  { id: "slack", name: "Slack", fit: "full", detail: "워크스페이스" },
  { id: "x", name: "X", fit: "glyph", mono: true, detail: "DM" },
  { id: "discord", name: "Discord", fit: "glyph", mono: true, tint: "#5865F2", detail: "채팅" },
];

export function messengerById(id: string) {
  return MESSENGERS.find((item) => item.id === id);
}
