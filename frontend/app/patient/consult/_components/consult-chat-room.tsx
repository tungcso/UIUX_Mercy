"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Camera,
  CheckCheck,
  ChevronDown,
  EllipsisVertical,
  Mic,
  Paperclip,
  SendHorizontal,
  Stethoscope,
  Sparkles,
  Trash2,
  CalendarCheck2,
} from "lucide-react";
import BookingModal from "./booking-modal";
import type { LucideIcon } from "lucide-react";

export type ConsultChatRole = "assistant" | "doctor";

export type ConsultChatMessage = {
  id: string;
  role: ConsultChatRole | "patient";
  text: string;
  time: string;
};

type ConsultChatRoomProps = {
  open: boolean;
  threadKey: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  role: ConsultChatRole;
  avatar: "bot" | "doctor";
  initialMessages: ConsultChatMessage[];
  quickReplies: string[];
  placeholder: string;
  onClose: () => void;
  onDelete?: () => void;
};

type ChatAction = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  template: string;
};

function getChatBubbleStyle(role: ConsultChatMessage["role"]) {
  if (role === "patient") {
    return "ml-auto bg-[#2f66dc] text-white shadow-[0_12px_30px_rgba(47,102,220,0.22)]";
  }

  if (role === "doctor") {
    return "bg-[#eef4ff] text-[#1f2f57]";
  }

  return "bg-white text-[#344054] shadow-[0_10px_28px_rgba(15,23,42,0.08)]";
}

function renderMessageContent(text: string, role: ConsultChatMessage["role"]) {
  const lines = text.split("\n").filter(Boolean);
  const bulletTone = role === "patient" ? "text-white/90" : "text-[#ef4444]";

  if (lines.length === 1) {
    return <p className="whitespace-pre-wrap leading-6">{text}</p>;
  }

  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        if (line.trim().startsWith("•")) {
          return (
            <p key={`${index}-${line}`} className={`leading-6 ${bulletTone}`}>
              {line}
            </p>
          );
        }

        return (
          <p key={`${index}-${line}`} className="whitespace-pre-wrap leading-6">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function ConsultChatRoom({
  open,
  threadKey,
  title,
  subtitle,
  statusLabel,
  role,
  avatar,
  initialMessages,
  quickReplies,
  placeholder,
  onClose,
  onDelete,
}: ConsultChatRoomProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [messages, setMessages] =
    useState<ConsultChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isSubtitleOpen, setIsSubtitleOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMessages(initialMessages);
    setDraft("");
    setIsMoreMenuOpen(false);
    setIsRecording(false);
    setIsSubtitleOpen(false);
  }, [initialMessages, open, threadKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const headerTone = useMemo(() => {
    if (role === "assistant") {
      return "bg-[#2f66dc]";
    }

    return "bg-[#2459d6]";
  }, [role]);

  const actionButtons = useMemo<ChatAction[]>(() => {
    if (role === "assistant") {
      return [
        {
          id: "summary",
          label: "Tóm tắt",
          description: "Yêu cầu hệ thống tóm tắt triệu chứng gần nhất.",
          icon: Sparkles,
          template:
            "Hãy tóm tắt lại triệu chứng tôi đã mô tả và gợi ý chuyên khoa phù hợp.",
        },
        {
          id: "specialty",
          label: "Gợi ý chuyên khoa",
          description: "Hỏi chatbot nên gặp khoa nào tiếp theo.",
          icon: Stethoscope,
          template: "Theo triệu chứng hiện tại, tôi nên gặp chuyên khoa nào?",
        },
        {
          id: "photo",
          label: "Gửi ảnh",
          description: "Đính kèm hình ảnh hoặc kết quả xét nghiệm.",
          icon: Camera,
          template:
            "Tôi muốn gửi thêm ảnh hoặc kết quả xét nghiệm để bạn xem giúp.",
        },
        {
          id: "urgent",
          label: "Báo khẩn",
          description: "Đánh dấu tình trạng cần phản hồi nhanh.",
          icon: Sparkles,
          template:
            "Tôi đang có dấu hiệu khẩn cấp, vui lòng hướng dẫn tôi ngay.",
        },
      ];
    }

    return [
      {
        id: "photo",
        label: "Gửi ảnh",
        description: "Đính kèm ảnh xét nghiệm hoặc đơn thuốc.",
        icon: Camera,
        template:
          "Tôi vừa gửi thêm ảnh xét nghiệm / đơn thuốc để bác sĩ xem giúp.",
      },
      {
        id: "prescription",
        label: "Xin đơn thuốc",
        description: "Xin bác sĩ tư vấn đơn thuốc phù hợp.",
        icon: Paperclip,
        template:
          "Nhờ bác sĩ xem lại thuốc đang dùng và hỗ trợ kê đơn phù hợp nếu cần.",
      },
      {
        id: "appointment",
        label: "Đặt lịch",
        description: "Xin lịch tái khám hoặc lịch tư vấn tiếp theo.",
        icon: Sparkles,
        template: "Tôi muốn đặt lịch tái khám sớm, bác sĩ hỗ trợ giúp tôi.",
      },
      {
        id: "video",
        label: "Gọi video",
        description: "Chuyển sang tư vấn trực tiếp qua video.",
        icon: Stethoscope,
        template: "Tôi muốn chuyển sang tư vấn video nếu bác sĩ đang rảnh.",
      },
    ];
  }, [role]);

  const menuActions = useMemo<ChatAction[]>(() => {
    return [
      {
        id: "summary",
        label: "Tóm tắt cuộc trò chuyện",
        description: "Sinh một tin nhắn yêu cầu tóm tắt nội dung.",
        icon: Sparkles,
        template: "Vui lòng tóm tắt ngắn cuộc trò chuyện này cho tôi.",
      },
      ...actionButtons.slice(0, 3),
    ];
  }, [actionButtons]);

  const insertTemplateMessage = (template: string) => {
    sendMessage(template);
    setIsMoreMenuOpen(false);
  };

  const openAttachmentPicker = () => {
    attachmentInputRef.current?.click();
    setIsMoreMenuOpen(false);
  };

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    sendMessage(`Tôi vừa đính kèm tệp: ${file.name}`);
    event.target.value = "";
  };

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      sendMessage("[Ghi âm] Tôi đã gửi xong một đoạn ghi âm.");
      return;
    }

    setIsRecording(true);
  };

  const sendMessage = (text = draft) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `${threadKey}-${Date.now()}`,
        role: "patient",
        text: trimmed,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setDraft("");
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-2 py-2 backdrop-blur-sm sm:px-4">
      <div className="relative flex h-[min(100vh-1rem,920px)] w-full max-w-105 flex-col overflow-hidden rounded-4xl border border-white/40 bg-[#f5f7fb] shadow-[0_30px_90px_rgba(15,23,42,0.34)]">
        <input
          ref={attachmentInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleAttachmentChange}
        />

        <header
          className={`${headerTone} rounded-b-[1.75rem] px-4 pb-4 pt-4 text-white`}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Quay lại"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/18"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#2f66dc] shadow-sm">
                {avatar === "bot" ? (
                  <Bot className="h-6 w-6" />
                ) : (
                  <Stethoscope className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-semibold leading-tight">
                  {title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[12px] text-white/88">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(255,255,255,0.18)]" />
                  <span className="truncate">{statusLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Đặt lịch"
                onClick={() => setIsBookingOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/18"
              >
                <CalendarCheck2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Tuỳ chọn"
                aria-expanded={isMoreMenuOpen}
                onClick={() => setIsMoreMenuOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/18"
              >
                <EllipsisVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={isSubtitleOpen}
            onClick={() => setIsSubtitleOpen((value) => !value)}
            className="mt-3 w-full rounded-2xl bg-white/12 px-3 py-2 text-left text-[12px] text-white/88 backdrop-blur-sm transition hover:bg-white/18"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white">
                Xem chi tiết cuộc trò chuyện
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${isSubtitleOpen ? "rotate-180" : "rotate-0"}`}
              />
            </div>

            {isSubtitleOpen ? (
              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-white/90">
                {subtitle}
              </p>
            ) : null}
          </button>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/12 px-3 py-1 text-[13px] font-medium text-white/90">
                  Chức năng nhanh
                </div>
                <div className="text-[12px] text-white/80">
                  Các hành động gợi ý nhanh
                </div>
              </div>

              <button
                type="button"
                aria-expanded={isActionsOpen}
                onClick={() => setIsActionsOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/18"
                aria-label={
                  isActionsOpen
                    ? "Thu gọn chức năng nhanh"
                    : "Mở chức năng nhanh"
                }
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isActionsOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>
            </div>

            {isActionsOpen ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {actionButtons.map((action) => {
                  const ActionIcon = action.icon;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => insertTemplateMessage(action.template)}
                      className="flex flex-col items-start gap-1 rounded-2xl bg-white/12 px-3 py-2 text-left transition hover:bg-white/18"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2f66dc] shadow-sm">
                        <ActionIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold leading-tight text-white">
                          {action.label}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-white/80">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </header>

        {isMoreMenuOpen ? (
          <div className="absolute right-4 top-16 z-20 w-[min(18rem,calc(100vw-2rem))] rounded-3xl border border-[#e5ebf5] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
            <div className="px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-[#8b97a7]">
              Chức năng nhanh
            </div>
            <div className="space-y-1">
              {menuActions.map((action) => {
                const ActionIcon = action.icon;

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => insertTemplateMessage(action.template)}
                    className="flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[#f4f7fd]"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[#2f66dc]">
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1f2a37]">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-[#6b7280]">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={openAttachmentPicker}
                className="flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[#f4f7fd]"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[#2f66dc]">
                  <Paperclip className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1f2a37]">
                    Đính kèm tệp
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#6b7280]">
                    Mở trình chọn file để gửi ảnh, PDF hoặc văn bản.
                  </p>
                </div>
              </button>

              {/** Delete conversation */}
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  if (typeof onDelete === "function") {
                    onDelete();
                  }
                  onClose();
                }}
                className="flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[#fff1f1]"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[#ef4444]">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1f2a37]">
                    Xoá đoạn chat
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#6b7280]">
                    Xoá toàn bộ nội dung cuộc trò chuyện này
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : null}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto max-w-85">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <p className="text-center text-[14px] text-[#9aa3b3]">
                  {role === "doctor"
                    ? "Chat trực tiếp để được nhân tư vấn từ Bác sĩ"
                    : "Chưa có tin nhắn nào"}
                </p>

                {role === "doctor" ? (
                  <div className="mt-4 w-full">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(true)}
                      className="mx-auto rounded-2xl bg-[#2f66dc] px-5 py-2 text-sm font-medium text-white shadow-sm"
                    >
                      Đặt lịch khám
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mb-3 flex justify-center">
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#8a93a5] shadow-[0_4px_14px_rgba(148,163,184,0.12)]">
                    Hôm nay, 09:41
                  </span>
                </div>

                <div className="space-y-4">
                  {messages.map((message) => {
                    const isPatient = message.role === "patient";
                    const isAssistant = message.role === "assistant";

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-2 ${isPatient ? "justify-end" : "justify-start"}`}
                      >
                        {!isPatient ? (
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[#2f66dc]">
                            {isAssistant ? (
                              <Bot className="h-4.5 w-4.5" />
                            ) : (
                              <Stethoscope className="h-4.5 w-4.5" />
                            )}
                          </div>
                        ) : null}

                        <div
                          className={`max-w-[78%] ${isPatient ? "text-right" : "text-left"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 text-[14px] ${getChatBubbleStyle(message.role)}`}
                          >
                            {renderMessageContent(message.text, message.role)}
                          </div>
                          <div
                            className={`mt-1 flex items-center gap-1 text-[11px] text-[#9aa3b3] ${isPatient ? "justify-end" : "justify-start"}`}
                          >
                            <span>{message.time}</span>
                            {isPatient ? (
                              <CheckCheck className="h-3.5 w-3.5 text-[#8aa6f4]" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-5 space-y-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    className="rounded-full border border-[#bed1ff] bg-[#f8fbff] px-3 py-2 text-[12px] font-medium text-[#2f66dc] transition hover:border-[#88afff] hover:bg-white"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-[#eef2f8] bg-white px-3 py-3 text-[12px] leading-5 text-[#667085] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                Nếu có dấu hiệu nặng như đau đầu dữ dội, nôn liên tục, nhìn mờ
                hoặc khó thở, hãy liên hệ cấp cứu ngay.
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#e9edf5] bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAttachmentPicker}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f6fb] text-[#7b8596] transition hover:bg-[#e8eef8]"
              aria-label="Đính kèm hình ảnh"
            >
              <Camera className="h-4.5 w-4.5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#edf0f5] bg-[#f7f8fb] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <Paperclip className="h-4 w-4 shrink-0 text-[#99a2b1]" />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={placeholder}
                className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#344054] outline-none placeholder:text-[#a6afbd]"
              />
              <button
                type="button"
                onClick={handleMicClick}
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition ${isRecording ? "text-[#ef4444]" : "text-[#7b8596] hover:text-[#2f66dc]"}`}
                aria-label={isRecording ? "Dừng ghi âm" : "Ghi âm"}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => sendMessage()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f66dc] text-white shadow-[0_16px_34px_rgba(47,102,220,0.28)] transition hover:bg-[#2459d6]"
              aria-label="Gửi tin nhắn"
            >
              <SendHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </footer>
        <BookingModal
          open={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      </div>
    </div>
  );
}
