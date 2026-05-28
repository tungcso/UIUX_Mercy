"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Bot,
  CalendarCheck2,
  ChevronRight,
  Clock3,
  MessageCircle,
  PenLine,
  Search,
  Stethoscope,
  UserRound,
  Trash2,
} from "lucide-react";
import ConsultChatRoom from "./_components/consult-chat-room";
import type { ConsultChatMessage } from "./_components/consult-chat-room";

export const dynamic = "force-dynamic";

type OnlineDoctor = {
  id: string;
  name: string;
  avatar: string;
  active: boolean;
  highlighted?: boolean;
  specialty: string;
  responseTime: string;
  detail: string;
};

type RecentConversation = {
  id: string;
  doctorName: string;
  avatar: string;
  time: string;
  unread?: number;
  preview: string;
  detail: string;
  tone: "doctor" | "assistant";
  initialMessages?: ConsultChatMessage[];
};

const onlineDoctors: OnlineDoctor[] = [
  {
    id: "dr-tam",
    name: "BS. Tâm",
    avatar: "👨🏿",
    active: true,
    highlighted: true,
    specialty: "Tim mạch",
    responseTime: "Phản hồi trong 1 phút",
    detail:
      "BS. Tâm đang trực tuyến và có thể tư vấn ngay. Bác sĩ phù hợp khi bạn cần xem nhanh kết quả, hỏi về thuốc hoặc xin hướng dẫn chăm sóc ban đầu.",
  },
  {
    id: "dr-lan",
    name: "BS. Lan",
    avatar: "👩🏾",
    active: true,
    specialty: "Nội tổng quát",
    responseTime: "Phản hồi trong 3 phút",
    detail:
      "BS. Lan đang trực tuyến để hỗ trợ các câu hỏi về triệu chứng, chỉ số sức khỏe và hướng dẫn theo dõi tại nhà.",
  },
  {
    id: "dr-hung",
    name: "BS. Hùng",
    avatar: "👩🏻‍🦰",
    active: true,
    specialty: "Tai Mũi Họng",
    responseTime: "Phản hồi trong 4 phút",
    detail:
      "BS. Hùng đang sẵn sàng tư vấn những câu hỏi liên quan đến hô hấp, dị ứng và chăm sóc triệu chứng nhẹ.",
  },
];

const initialRecentConversations: RecentConversation[] = [
  {
    id: "conv-tam",
    doctorName: "ThS. BS. Trần Tâm",
    avatar: "👨🏿",
    time: "09:12",
    unread: 2,
    preview:
      "Bác sĩ: Kết quả xét nghiệm của bạn đã có, mọi chỉ số đều ổn định nhé.",
    detail:
      "Cuộc trò chuyện này ghi nhận bác sĩ đã xem xét kết quả xét nghiệm và xác nhận các chỉ số ổn định. Bạn có thể mở lại cuộc chat để xem toàn bộ nội dung, gửi thêm câu hỏi hoặc xin lịch tái khám nếu cần.",
    tone: "doctor",
  },
  {
    id: "conv-van-b",
    doctorName: "PGS. TS. Lê Văn B",
    avatar: "👩🏻‍⚕️",
    time: "Hôm qua",
    preview: "Dạ vâng, cảm ơn bác sĩ nhiều ạ.",
    detail:
      "Đây là cuộc trò chuyện đã hoàn tất. Bạn có thể xem lại lịch sử trao đổi, đánh dấu tin nhắn quan trọng hoặc tiếp tục hỏi thêm khi cần tái khám.",
    tone: "doctor",
  },
  {
    id: "conv-ai",
    doctorName: "Trợ lý Y tế AI",
    avatar: "Bot",
    time: "T2",
    preview: "Chào bạn, tôi có thể giúp gì cho bạn hôm nay?",
    detail:
      "Trợ lý Y tế AI có thể gợi ý bác sĩ phù hợp, tóm tắt triệu chứng và nhắc bạn các bước cần làm trước khi gặp bác sĩ thật.",
    tone: "assistant",
  },
];

// recent conversations state is initialized inside the component (hooks must be used in components)

const aiConsultMessages = [
  {
    id: "ai-1",
    role: "assistant" as const,
    text: "Chào Nguyễn Văn An! Tôi là Trợ lý Y tế AI.\nDựa trên hồ sơ của bạn, có vẻ dạo này bạn đang gặp vấn đề về sức khỏe. Hãy mô tả triệu chứng để tôi tư vấn chuyên khoa phù hợp nhé.",
    time: "09:41",
  },
  {
    id: "ai-2",
    role: "patient" as const,
    text: "Mấy hôm nay tôi bị hay bị đau đầu, chóng mặt và có cảm giác buồn nôn mỗi khi thức dậy.",
    time: "09:43",
  },
  {
    id: "ai-3",
    role: "assistant" as const,
    text: "Tôi đã ghi nhận các triệu chứng:\n• Đau đầu\n• Chóng mặt\n• Buồn nôn buổi sáng\n\nTình trạng này diễn ra bao lâu rồi bạn? Cơn đau đầu thường ở vị trí nào?",
    time: "09:44",
  },
];

const doctorConsultMessages = [
  {
    id: "doctor-1",
    role: "doctor" as const,
    text: "Chào bạn, tôi là bác sĩ trực tuyến hôm nay. Bạn có thể gửi thêm ảnh xét nghiệm hoặc mô tả chi tiết cơn đau để tôi hỗ trợ chính xác hơn.",
    time: "09:38",
  },
  {
    id: "doctor-2",
    role: "patient" as const,
    text: "Tôi muốn hỏi về thuốc đang dùng và liệu có cần đặt lịch tái khám sớm không.",
    time: "09:40",
  },
  {
    id: "doctor-3",
    role: "doctor" as const,
    text: "Tôi sẽ xem lại đơn thuốc của bạn và kết quả gần nhất. Nếu có kết quả xét nghiệm, hãy gửi thêm để tôi đối chiếu nhanh nhé.",
    time: "09:41",
  },
];

export default function PatientConsultPage() {
  return (
    <Suspense fallback={null}>
      <PatientConsultPageContent />
    </Suspense>
  );
}

function PatientConsultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isComposePanelOpen, setIsComposePanelOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<OnlineDoctor | null>(
    null,
  );
  const [selectedConversation, setSelectedConversation] =
    useState<RecentConversation | null>(null);
  const [mode, setMode] = useState<"doctor" | "ai">(
    searchParams.get("mode") === "ai" ? "ai" : "doctor",
  );

  const [recentConversations, setRecentConversations] = useState<
    RecentConversation[]
  >(initialRecentConversations);

  const highlightedDoctor =
    onlineDoctors.find((doctor) => doctor.highlighted) ?? onlineDoctors[0];

  const startChat = (doctor: OnlineDoctor) => {
    setMode("doctor");
    setSelectedDoctor(doctor);
    setSelectedConversation(null);
    setIsSearchPanelOpen(false);
    setIsComposePanelOpen(false);
  };

  const openConversation = (conversation: RecentConversation) => {
    setMode(conversation.tone === "assistant" ? "ai" : "doctor");
    setSelectedConversation(conversation);
    setSelectedDoctor(null);
    setIsSearchPanelOpen(false);
    setIsComposePanelOpen(false);
  };

  const openComposePanel = () => {
    setIsComposePanelOpen(true);
    setIsSearchPanelOpen(false);
    setSelectedConversation(null);
    setSelectedDoctor(null);
  };

  const goToAppointments = () => {
    router.push("/patient/appointments");
  };

  const createAiConversation = () => {
    const id = `conv-ai-${Date.now()}`;
    const conv: RecentConversation = {
      id,
      doctorName: "Trợ lý Y tế AI",
      avatar: "Bot",
      time: "Bây giờ",
      preview: "Chào bạn, tôi có thể giúp gì cho bạn hôm nay?",
      detail:
        "Trợ lý Y tế AI có thể gợi ý bác sĩ phù hợp, tóm tắt triệu chứng và nhắc bạn các bước cần làm trước khi gặp bác sĩ thật.",
      tone: "assistant",
      initialMessages: [
        {
          id: `${id}-init`,
          role: "assistant",
          text: `Chào Nguyễn Văn An! Tôi là Trợ lý Y tế AI.\n\nDựa trên hồ sơ của bạn, có vẻ dạo này bạn đang gặp vấn đề về sức khỏe. Hãy mô tả triệu chứng để tôi tư vấn chuyên khoa phù hợp nhé.`,
          time: "Bây giờ",
        },
      ],
    };

    setRecentConversations((prev) => [conv, ...prev]);
    setMode("ai");
    setSelectedConversation(conv);
    setIsComposePanelOpen(false);
  };

  const deleteConversation = (id: string) => {
    setRecentConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-1 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3 pt-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-[32px] font-bold leading-tight">
              Tin nhắn & Tư vấn
            </h1>
            <button
              type="button"
              aria-label="Soạn tư vấn mới"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3c74ea]"
              onClick={openComposePanel}
            >
              <PenLine className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-2xl bg-white px-4 py-2 text-left text-[#9aa4b5] shadow-sm"
            onClick={() => setIsSearchPanelOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="text-[13px]">Tìm kiếm bác sĩ, chuyên khoa...</span>
          </button>
        </section>

        <section className="px-4 pb-23 pt-4">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("doctor")}
              className={`rounded-full px-4 py-2 text-[14px] font-semibold ${mode === "doctor" ? "bg-[#2f66dc] text-white" : "bg-white text-[#2f66dc] border border-[#e6eefc]"}`}
            >
              Tư vấn với bác sĩ
            </button>

            <button
              type="button"
              onClick={() => setMode("ai")}
              className={`rounded-full px-4 py-2 text-[14px] font-semibold ${mode === "ai" ? "bg-[#2f66dc] text-white" : "bg-white text-[#2f66dc] border border-[#e6eefc]"}`}
            >
              Chatbot AI
            </button>
          </div>

          {mode === "doctor" ? (
            <>
              <h2 className="text-[28px] font-bold text-[#1f2939]">
                Bác sĩ đang trực tuyến
              </h2>

              <div className="mt-2.5 flex items-start gap-3">
                {onlineDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    className="text-center"
                    onClick={() => startChat(doctor)}
                  >
                    <div
                      className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f3f7] text-[30px] ${doctor.highlighted ? "ring-2 ring-[#3a76ea] ring-offset-2 ring-offset-[#f7f8fb]" : ""}`}
                    >
                      {doctor.avatar}
                      {doctor.active ? (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#f7f8fb] bg-[#22c55e]" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-[14px] text-[#4b5568]">
                      {doctor.name}
                    </p>
                  </button>
                ))}

                <button
                  type="button"
                  className="text-center"
                  onClick={openComposePanel}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#c7cfdb] text-[22px] font-bold text-[#98a3b5]">
                    ...
                  </div>
                  <p className="mt-2 text-[14px] text-[#6b7485]">Xem thêm</p>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[28px] font-bold text-[#1f2939]">
                Trợ lý Y tế AI
              </h2>

              <div className="mt-3 rounded-2xl bg-[#f8fbff] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dfeafb] text-[#2f66dc]">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#202939]">
                      Trợ lý Y tế AI
                    </p>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      Tự động gợi ý bác sĩ phù hợp, tóm tắt triệu chứng và hỏi
                      nhanh triệu chứng.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {recentConversations.find((c) => c.id === "conv-ai") ? (
                    <button
                      type="button"
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                      onClick={() => {
                        const aiConv = recentConversations.find(
                          (c) => c.id === "conv-ai",
                        );
                        if (aiConv) openConversation(aiConv);
                      }}
                    >
                      Bắt đầu với AI
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                    onClick={createAiConversation}
                  >
                    Soạn tư vấn mới
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[28px] font-bold text-[#1f2939]">Gần đây</h3>
              <button
                type="button"
                className="text-[14px] font-medium text-[#2667ea]"
                onClick={goToAppointments}
              >
                Xem lịch khám
              </button>
            </div>

            <div className="mt-2.5 space-y-2">
              {recentConversations
                .filter((conversation) =>
                  mode === "ai"
                    ? conversation.tone === "assistant"
                    : conversation.tone === "doctor",
                )
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    role="button"
                    tabIndex={0}
                    className={`w-full rounded-3xl border bg-white px-3 py-2 text-left shadow-[0_4px_14px_rgba(148,163,184,0.08)] ${
                      conversation.id === "conv-tam"
                        ? "border-[#bfd6ff]"
                        : "border-[#e4e8ef]"
                    }`}
                    onClick={() => openConversation(conversation)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openConversation(conversation);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${
                            conversation.tone === "assistant"
                              ? "bg-[#dfeafb] text-[#2f66dc]"
                              : conversation.id === "conv-tam"
                                ? "bg-[#dcecff] text-[27px]"
                                : "bg-[#f1f3f7] text-[28px]"
                          }`}
                        >
                          {conversation.avatar === "Bot" ? (
                            <Bot className="h-6 w-6" />
                          ) : (
                            conversation.avatar
                          )}
                          {conversation.id === "conv-tam" ? (
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22c55e]" />
                          ) : null}
                        </div>

                        <div>
                          <p className="text-[16px] font-bold leading-tight text-[#202939]">
                            {conversation.doctorName}
                          </p>
                          <p className="mt-0.5 max-w-60 text-[14px] leading-5 text-[#4b5565]">
                            {conversation.preview}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[#2667ea]">
                            {conversation.time}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            aria-label="Xoá đoạn chat"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5f5] text-[#ef4444] transition hover:bg-[#ffecec]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {conversation.unread ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[12px] font-semibold text-white">
                            {conversation.unread}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-2 py-1 backdrop-blur">
          <ul className="grid grid-cols-4 text-center">
            <li>
              <Link
                href="/patient"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <Stethoscope className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Trang chủ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/appointments"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <CalendarCheck2 className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Lịch khám</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/consult"
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <MessageCircle className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Tư vấn</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/profile"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <UserRound className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Cá nhân</span>
              </Link>
            </li>
          </ul>
        </nav>

        {isSearchPanelOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng tìm kiếm nhanh"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setIsSearchPanelOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Tìm nhanh
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Chọn cách bắt đầu cuộc tư vấn
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => startChat(highlightedDoctor)}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Nhắn nhanh bác sĩ đang trực tuyến
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Mở cuộc trò chuyện với bác sĩ đang phản hồi nhanh nhất
                    </p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>

                <button
                  type="button"
                  onClick={openComposePanel}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Soạn tư vấn mới
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Tạo cuộc trò chuyện mới và nhập triệu chứng
                    </p>
                  </div>
                  <PenLine className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>

                <button
                  type="button"
                  onClick={goToAppointments}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Kiểm tra lịch khám sắp tới
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Mở trang lịch hẹn để đối chiếu lịch tư vấn
                    </p>
                  </div>
                  <CalendarCheck2 className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSearchPanelOpen(false)}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isComposePanelOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Đóng soạn tư vấn"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setIsComposePanelOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Soạn tư vấn mới
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Chọn bác sĩ hoặc trợ lý để bắt đầu
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposePanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dfeafb] text-[#2f66dc]">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#202939]">
                      Trợ lý Y tế AI
                    </p>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      Tự động gợi ý bác sĩ phù hợp và hỏi nhanh triệu chứng.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {onlineDoctors.map((doctor) => (
                    <button
                      key={`compose-${doctor.id}`}
                      type="button"
                      className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] bg-white px-4 py-3 text-left"
                      onClick={() => startChat(doctor)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[26px]">
                          {doctor.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202939]">
                            {doctor.name}
                          </p>
                          <p className="text-[13px] text-[#6b7280]">
                            {doctor.specialty} · {doctor.responseTime}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4.5 w-4.5 text-[#2f66dc]" />
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    onClick={() => startChat(highlightedDoctor)}
                  >
                    Bắt đầu với bác sĩ phù hợp
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                    onClick={() => setIsComposePanelOpen(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {selectedDoctor ? (
          <ConsultChatRoom
            open
            threadKey={selectedDoctor.id}
            title={selectedDoctor.name}
            subtitle={`${selectedDoctor.specialty} · ${selectedDoctor.detail}`}
            statusLabel={selectedDoctor.responseTime}
            role="doctor"
            avatar="doctor"
            initialMessages={[]}
            quickReplies={[
              "Gửi ảnh kết quả",
              "Xin kê đơn thuốc",
              "Đặt lịch tái khám",
            ]}
            placeholder="Nhập câu hỏi cho bác sĩ..."
            onClose={() => setSelectedDoctor(null)}
          />
        ) : null}

        {selectedConversation ? (
          <ConsultChatRoom
            open
            threadKey={selectedConversation.id}
            title={selectedConversation.doctorName}
            subtitle={selectedConversation.detail}
            statusLabel={
              selectedConversation.tone === "assistant"
                ? "Đang trực tuyến"
                : "Phản hồi trong 3 phút"
            }
            role={
              selectedConversation.tone === "assistant" ? "assistant" : "doctor"
            }
            avatar={
              selectedConversation.tone === "assistant" ? "bot" : "doctor"
            }
            initialMessages={
              selectedConversation.initialMessages ??
              (selectedConversation.tone === "assistant"
                ? aiConsultMessages
                : doctorConsultMessages)
            }
            quickReplies={
              selectedConversation.tone === "assistant"
                ? ["Đau nửa đầu", "Đau khắp đầu", "Đã kéo dài 1 tuần"]
                : [
                    "Tôi đã gửi kết quả",
                    "Nhờ bác sĩ xem đơn",
                    "Cần tái khám sớm",
                  ]
            }
            placeholder={
              selectedConversation.tone === "assistant"
                ? "Mô tả thêm triệu chứng..."
                : "Nhập câu hỏi cho bác sĩ..."
            }
            onClose={() => setSelectedConversation(null)}
            onDelete={() => deleteConversation(selectedConversation.id)}
          />
        ) : null}
      </div>
    </main>
  );
}
