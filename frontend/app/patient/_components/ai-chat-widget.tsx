"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, ChevronUp, MessageCircle, Sparkles, X } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "assistant" | "patient";
  text: string;
};

const quickPrompts = [
  "Tôi bị đau đầu và chóng mặt",
  "Tôi muốn hỏi về thuốc đang dùng",
  "Tôi có nên đi khám ngay không?",
];

function getAiReply(message: string) {
  const text = message.toLowerCase();

  if (text.includes("đau đầu") || text.includes("chóng mặt")) {
    return [
      "Tôi đã ghi nhận triệu chứng của bạn.",
      "• Nghỉ ngơi ở nơi thoáng, uống đủ nước",
      "• Nếu có nôn nhiều, nhìn mờ hoặc khó thở, hãy đi khám ngay",
    ].join("\n");
  }

  if (text.includes("thuốc")) {
    return [
      "Hãy gửi tên thuốc hoặc ảnh đơn thuốc để tôi tóm tắt cách dùng nhanh.",
      "Tôi sẽ giúp bạn đọc liều dùng, thời điểm uống và lưu ý quan trọng.",
    ].join("\n");
  }

  if (text.includes("khám") || text.includes("đặt lịch")) {
    return "Tôi có thể chuyển bạn sang luồng tư vấn đầy đủ để đặt lịch nhanh với bác sĩ phù hợp.";
  }

  return "Bạn hãy mô tả thêm triệu chứng, thời gian xuất hiện và mức độ khó chịu để tôi hỗ trợ chính xác hơn.";
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isPatient = message.role === "patient";

  return (
    <div className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isPatient ? "text-right" : "text-left"}`}>
        <div
          className={`rounded-[1.25rem] px-3 py-2 text-[13px] leading-5 ${
            isPatient
              ? "bg-[#2f66dc] text-white shadow-[0_10px_28px_rgba(47,102,220,0.2)]"
              : "bg-white text-[#24304a] shadow-[0_8px_22px_rgba(15,23,42,0.08)]"
          }`}
        >
          {message.text.split("\n").map((line, index) => (
            <p key={`${message.id}-${index}`} className="whitespace-pre-wrap leading-5">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Chào bạn, tôi là trợ lý AI y tế. Nhấn nút chat để hỏi nhanh về triệu chứng, thuốc hoặc lịch khám.",
    },
  ]);

  const sendMessage = (text: string) => {
    const content = text.trim();

    if (!content) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `patient-${Date.now()}`, role: "patient", text: content },
      { id: `assistant-${Date.now()}`, role: "assistant", text: getAiReply(content) },
    ]);
    setDraft("");
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+4px)] z-40 flex justify-end px-4 sm:bottom-[calc(3.5rem+6px)]">
      <div className="pointer-events-none mx-auto w-full max-w-97.5">
        <div className="flex justify-end">
          {isOpen ? (
            <div className="pointer-events-auto w-[min(22.5rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-[#dbe5f5] bg-[#f7f9fe] shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="bg-linear-to-br from-[#2f66dc] via-[#356ee0] to-[#1f5dd8] px-4 py-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">
                        Chat AI y tế
                      </p>
                      <h2 className="text-[16px] font-semibold leading-tight">
                        Trợ lý chat nhanh cho bệnh nhân
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Đóng widget"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/18"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[12px] text-white/92 transition hover:bg-white/18"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto px-3 py-3">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>

              <div className="border-t border-[#e5ebf5] bg-white px-3 py-3">
                <Link
                  href="/patient/consult?mode=ai"
                  className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#edf4ff] px-3 py-2 text-[12px] font-medium text-[#2f66dc]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Mở chat AI đầy đủ
                </Link>

                <form
                  className="flex items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage(draft);
                  }}
                >
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Nhập triệu chứng hoặc câu hỏi..."
                    className="max-h-24 w-full resize-none rounded-[1.15rem] border border-[#dbe4f3] bg-[#f8fbff] px-4 py-3 text-[13px] outline-none placeholder:text-[#8f9ab0] focus:border-[#8db1ff] focus:bg-white"
                  />

                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f66dc] text-white shadow-[0_10px_28px_rgba(47,102,220,0.2)]"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Mở chat AI"
              onClick={() => setIsOpen(true)}
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2f66dc] text-white shadow-[0_18px_45px_rgba(47,102,220,0.32)] ring-1 ring-white/30"
            >
              <Bot className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}