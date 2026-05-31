"use client";

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatHeader from "./_components/ChatHeader";
import ConversationList from "./_components/ConversationList";
import QuickReplies from "./_components/QuickReplies";
import InputBar from "./_components/InputBar";
import EmergencyBanner from "./_components/EmergencyBanner";

export const dynamic = "force-dynamic";

type ChatRole = "assistant" | "patient";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
  tone?: "normal" | "card" | "warning";
  title?: string;
  subtitle?: string;
  bullets?: string[];
  cta?: string;
};

const quickReplies = [
  "Tôi bị sốt",
  "Tôi bị ho",
  "Đau đầu nhiều",
  "Gửi ảnh kết quả",
];

const defaultMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Xin chào, tôi là Trợ lý Y tế AI. Hãy mô tả triệu chứng hoặc gửi ảnh để tôi hỗ trợ bạn nhanh hơn.",
    time: "09:30",
  },
  {
    id: "guide",
    role: "assistant",
    tone: "card",
    title: "Gợi ý nhanh",
    subtitle: "Chọn một câu mô tả để bắt đầu cuộc trò chuyện.",
    bullets: [
      "Sốt, ho, đau đầu",
      "Đau bụng, buồn nôn",
      "Kết quả xét nghiệm",
      "Đơn thuốc cần giải thích",
    ],
    time: "09:31",
    text: "",
  },
];

function getTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  if (message.tone === "card") {
    return (
      <div className="rounded-[28px] border border-[#d9eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-2 text-[#16a34a]">
          <Sparkles className="h-4 w-4" />
          <p className="text-[13px] font-semibold">{message.title}</p>
        </div>
        <p className="mt-2 text-[15px] leading-6 text-[#1f2939]">
          {message.subtitle}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {message.bullets?.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#d9eadf] bg-[#f3fbf5] px-3 py-2 text-[13px] text-[#1f2939]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (message.tone === "warning") {
    return (
      <div className="rounded-[28px] border border-[#fecaca] bg-[#fff5f5] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-2 text-[#dc2626]">
          <ShieldAlert className="h-4 w-4" />
          <p className="text-[13px] font-semibold">Cảnh báo</p>
        </div>
        <p className="mt-2 text-[15px] leading-6 text-[#1f2939]">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] rounded-[28px] px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${
          isAssistant
            ? "rounded-bl-md bg-white text-[#1f2939]"
            : "rounded-br-md bg-[#16a34a] text-white"
        }`}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-6">
          {message.text}
        </p>
        <p
          className={`mt-2 text-[11px] ${isAssistant ? "text-[#6b7280]" : "text-white/80"}`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

function PatientChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const emergency = searchParams.get("emergency") === "1";
  const mode = searchParams.get("mode") ?? "ai";

  const [draft, setDraft] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (topic) {
      return [
        {
          id: "topic-welcome",
          role: "assistant",
          text: `Mình đã ghi nhận chủ đề ${topic}. Bạn mô tả thêm triệu chứng, thời gian bắt đầu và mức độ đau nhé.`,
          time: "09:30",
        },
        ...defaultMessages,
      ];
    }

    return defaultMessages;
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const title = useMemo(
    () => (mode === "doctor" ? "Chat với bác sĩ" : "Chat với AI"),
    [mode],
  );

  const addPatientMessage = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const patientMessage: ChatMessage = {
      id: `patient-${Date.now()}`,
      role: "patient",
      text: cleanText,
      time: getTimeLabel(),
    };

    setMessages((current) => [
      ...current,
      patientMessage,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: cleanText.toLowerCase().includes("sốt")
          ? "Bạn cho mình biết thêm nhiệt độ, thời gian sốt và có kèm ho, đau họng hay không nhé."
          : "Mình đã ghi nhận. Bạn cho thêm thời điểm xuất hiện, mức độ và yếu tố làm triệu chứng nặng hơn nhé.",
        time: getTimeLabel(),
      },
    ]);
  };

  const onQuickReply = (text: string) => {
    if (text === "Gửi ảnh kết quả") {
      fileInputRef.current?.click();
      return;
    }

    addPatientMessage(text);
  };

  const onSend = () => {
    addPatientMessage(draft);
    setDraft("");
  };

  return (
    <main className="flex h-full min-h-0 bg-[#e9f5ed] px-2 py-2 sm:px-4 sm:py-5">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d7eadf] bg-[#f7fbf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <ChatHeader
          title={title}
          onBack={() => router.push("/patient")}
          onAppointments={() => router.push("/patient/appointments")}
        />

        {emergency ? (
          <EmergencyBanner
            onConnect={() => router.push("/patient/appointments")}
          />
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
          <ConversationList messages={messages} />
          <QuickReplies items={quickReplies} onChoose={onQuickReply} />
        </div>

        <InputBar
          draft={draft}
          setDraft={setDraft}
          onSend={onSend}
          onAttach={() => fileInputRef.current?.click()}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() =>
            addPatientMessage("Mình đã gửi ảnh kết quả, nhờ bạn xem giúp.")
          }
        />
      </div>
    </main>
  );
}

export default function PatientConsultPage() {
  return (
    <Suspense fallback={null}>
      <PatientChatPageContent />
    </Suspense>
  );
}
