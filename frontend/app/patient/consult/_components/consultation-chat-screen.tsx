"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ConversationList from "./ConversationList";
import EmergencyBanner from "./EmergencyBanner";
import InputBar from "./InputBar";
import QuickReplies from "./QuickReplies";
import {
  type ConsultCase,
  type ConsultMessage,
} from "./consult-case-data";

function getTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CaseContextBanner({ consultCase }: { consultCase: ConsultCase }) {
  const isEmergency = consultCase.severity === "high";

  return (
    <div
      className={`mx-4 mt-3 rounded-[24px] border px-4 py-3 ${
        isEmergency
          ? "border-[#fecaca] bg-[#fff5f5]"
          : "border-[#d9eadf] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Case context
          </p>
          <h2 className="mt-1 text-[16px] font-semibold text-[#10233f]">
            {consultCase.title}
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#64748b]">
            {consultCase.subtitle}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            isEmergency
              ? "bg-[#fee2e2] text-[#dc2626]"
              : consultCase.type === "doctor"
                ? "bg-[#eff6ff] text-[#2563eb]"
                : "bg-[#ecfdf3] text-[#16a34a]"
          }`}
        >
          {consultCase.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[#d8eadf] bg-[#f8fbf8] px-3 py-1 text-[11px] font-medium text-[#64748b]">
          {consultCase.typeLabel}
        </span>
        <span className="rounded-full border border-[#d8eadf] bg-[#f8fbf8] px-3 py-1 text-[11px] font-medium text-[#64748b]">
          Cập nhật {consultCase.time}
        </span>
        {consultCase.tag ? (
          <span className="rounded-full border border-[#d8eadf] bg-[#f8fbf8] px-3 py-1 text-[11px] font-medium text-[#64748b]">
            {consultCase.tag}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function buildAssistantReply(text: string) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("sốt")) {
    return "Bạn cho mình biết thêm nhiệt độ, thời gian sốt và có kèm ho, đau họng hay không nhé.";
  }

  if (lowerText.includes("đau đầu")) {
    return "Mình đã ghi nhận. Bạn có chóng mặt, buồn nôn hoặc mờ mắt kèm theo không?";
  }

  if (lowerText.includes("ảnh") || lowerText.includes("hình")) {
    return "Ảnh đã được ghi nhận. Mình sẽ đối chiếu thêm với mô tả triệu chứng của bạn.";
  }

  return "Mình đã ghi nhận. Bạn cho thêm thời điểm xuất hiện, mức độ và yếu tố làm triệu chứng nặng hơn nhé.";
}

export default function ConsultationChatScreen({
  consultCase,
}: {
  consultCase: ConsultCase;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ConsultMessage[]>(
    consultCase.messages,
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const title = useMemo(() => {
    if (consultCase.type === "doctor") {
      return "Chat với bác sĩ";
    }

    if (consultCase.severity === "high") {
      return "Hỗ trợ khẩn";
    }

    return "Chat với AI";
  }, [consultCase.severity, consultCase.type]);

  const subtitle = useMemo(() => {
    if (consultCase.type === "doctor") {
      return "Bác sĩ đang theo dõi case này";
    }

    if (consultCase.severity === "high") {
      return "Ưu tiên xử lý khẩn";
    }

    return "Trợ lý đang sẵn sàng";
  }, [consultCase.severity, consultCase.type]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const addPatientMessage = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const patientMessage: ConsultMessage = {
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
        text: buildAssistantReply(cleanText),
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
          subtitle={subtitle}
          onBack={() => router.push("/patient/consult")}
          onAppointments={() => router.push("/patient/appointments")}
        />

        {consultCase.severity === "high" ? (
          <EmergencyBanner
            onConnect={() => router.push("/patient/appointments")}
          />
        ) : null}

        <CaseContextBanner consultCase={consultCase} />

        <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
          <ConversationList messages={messages} />
          <QuickReplies items={consultCase.quickReplies} onChoose={onQuickReply} />
        </div>

        <InputBar
          draft={draft}
          setDraft={setDraft}
          onSend={onSend}
          onAttach={() => fileInputRef.current?.click()}
          onRecord={() => router.push("/patient/consult/new?mode=doctor")}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => addPatientMessage("Mình đã gửi ảnh kết quả, nhờ bạn xem giúp.")}
        />
      </div>
    </main>
  );
}
