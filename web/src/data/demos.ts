import type { MessengerId } from "./messengers";

export type DemoTool = {
  id: MessengerId;
  pending: string;
};

export type DemoItem = {
  title: string;
  meta: string;
  via: MessengerId;
};

export type DemoPrompt = {
  id: string;
  text: string;
  clientIcon: string;
  clientMono?: boolean;
  clientName: string;
  tools: DemoTool[];
  lead: string;
  items: DemoItem[];
};

/** Fictional sample threads. Names and messages are not real. */
export const DEMOS: DemoPrompt[] = [
  {
    id: "tasks",
    text: "오늘 카톡이랑 문자 확인해서 할 일 정리해줘",
    clientIcon: "claude",
    clientName: "Claude",
    tools: [
      { id: "kakao", pending: "카카오톡 확인 중…" },
      { id: "gmsg", pending: "메시지 확인 중…" },
      { id: "insta", pending: "DM 확인 중…" },
    ],
    lead: "오늘 대화에서 할 일로 읽히는 것만 골랐어요.",
    items: [
      { title: "회의 자료 보내기", meta: "김하늘 · 카카오톡 · 오늘 18:00", via: "kakao" },
      { title: "택배 도착했는지 답장", meta: "박서준 · 문자 · 오늘", via: "gmsg" },
      { title: "금요일 점심 장소 정하기", meta: "이도윤 · 카카오톡", via: "kakao" },
    ],
  },
  {
    id: "open",
    text: "이번 주에 나한테 온 질문 중 아직 답 안 한 것만 모아줘",
    clientIcon: "openai",
    clientMono: true,
    clientName: "ChatGPT",
    tools: [
      { id: "kakao", pending: "카카오톡 확인 중…" },
      { id: "insta", pending: "DM 확인 중…" },
      { id: "slack", pending: "슬랙 확인 중…" },
    ],
    lead: "이번 주 메시지 중, 질문인데 답이 없는 것만 모았어요.",
    items: [
      { title: "내일 미팅 몇 시예요?", meta: "최민재 · 카카오톡 · 수요일", via: "kakao" },
      { title: "견적 초안 확인하셨나요?", meta: "정하린 · Instagram DM · 화요일", via: "insta" },
      { title: "목요일 전에 회신 부탁드려요.", meta: "오세린 · Slack", via: "slack" },
    ],
  },
  {
    id: "tomorrow",
    text: "내일 일정이랑 약속 관련 메시지만 정리해줘",
    clientIcon: "cursor",
    clientMono: true,
    clientName: "Cursor",
    tools: [
      { id: "kakao", pending: "카카오톡 확인 중…" },
      { id: "gmsg", pending: "메시지 확인 중…" },
      { id: "line", pending: "LINE 확인 중…" },
    ],
    lead: "내일 일정으로 읽히는 메시지만 남겼어요.",
    items: [
      { title: "10:00 한빛상사 미팅", meta: "김하늘 · 카카오톡", via: "kakao" },
      { title: "19:00 저녁 약속, 한남", meta: "박서준 · 문자", via: "gmsg" },
      { title: "오후 이동 시간 확인 요청", meta: "윤도하 · LINE", via: "line" },
    ],
  },
  {
    id: "quotes",
    text: "거래처에서 온 견적·계약 얘기만 요약해줘",
    clientIcon: "grok",
    clientName: "Grok Build",
    tools: [
      { id: "kakao", pending: "카카오톡 확인 중…" },
      { id: "slack", pending: "슬랙 확인 중…" },
      { id: "gmsg", pending: "메시지 확인 중…" },
    ],
    lead: "견적과 계약 이야기만 짧게 요약했어요.",
    items: [
      { title: "한빛상사 견적 2,400만 원", meta: "납기 12월 15일 · 카카오톡", via: "kakao" },
      { title: "푸른물류 계약 갱신 검토", meta: "금요일까지 회신 요청 · Slack", via: "slack" },
      { title: "날인 요청은 아직 없음", meta: "문자에서 관련 문장 없음", via: "gmsg" },
    ],
  },
];
