"use client";

import React, { useState } from "react";
import ChatWindow from "./chat-window";
import { Plus, FileText, CheckCircle2 } from "lucide-react";

type Patient = {
  id: string;
  name: string;
  note?: string;
  urgent?: boolean;
  unread?: number;
  online?: boolean;
};

export default function ChatShell({ patients = [] }: { patients?: Patient[] }) {
  const [selected, setSelected] = useState<string | null>(
    patients[0]?.id ?? null,
  );

  const [messages, setMessages] = useState(() => [
    {
      id: "1",
      from: "patient",
      text: "Chào bác sĩ Trí, tôi vừa uống thuốc hạ áp khẩn cấp nhưng vẫn buốt đau vùng chẩm sau tai.",
      time: "10:02",
    },
    {
      id: "2",
      from: "doctor",
      text: "Chào chị Mai, máy đo của chị hiển thị chỉ số 180/120 mmHg. Chị cần nằm bất động đầu cao 30 độ.",
      time: "10:04",
    },
    {
      id: "3",
      from: "patient",
      text: "Tôi đã nằm yên một chỗ rồi, nhờ bác sĩ kê đơn hoặc hướng dẫn cấp cứu giúp.",
      time: "10:05",
    },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showSuccessNotice = (actionName: string) => {
    setActionNotice(`${actionName} thành công`);
  };

  const sampleSuggestions = [
    {
      id: "s1",
      text: "Cho phép bệnh nhân nằm bất động, nâng đầu cao 30 độ, theo dõi huyết áp 5-10 phút.",
    },
    {
      id: "s2",
      text: "Chuẩn bị thuốc hạ áp nhanh (Captopril 25mg) nếu huyết áp > 180/120 và theo dõi.",
    },
    {
      id: "s3",
      text: "Nếu có dấu thần kinh khu trú, chuyển viện gần nhất ngay lập tức.",
    },
  ];

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const next = {
      id: String(Date.now()),
      from: "doctor" as const,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((m) => [...m, next]);
    setMessageInput("");
    showSuccessNotice("Gửi tin nhắn");
  };

  const insertSuggestion = (text: string) => {
    setMessageInput(text);
    showSuccessNotice("Chèn gợi ý");
  };

  const generateDraft = () => {
    // If draft exists already, toggle the draft content only (do not close the panel)
    if (aiDraft) {
      setAiDraft(null);
      return;
    }

    // Otherwise generate a new draft and ensure the AI panel is open
    const summary = `Bệnh nhân: ${messages
      .filter((m) => m.from === "patient")
      .map((m) => m.text)
      .join(" ")}`;

    const suggestion =
      "Gợi ý: Cân nhắc dùng Captopril 25mg uống ngay, theo dõi huyết áp, chuẩn bị chuyển viện nếu cần.";

    setAiDraft(`${summary}\n\n${suggestion}`);
    setAiOpen(true);
    showSuccessNotice("Tạo AI Draft");
  };

  React.useEffect(() => {
    if (!actionNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setActionNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  return (
    <div className="relative flex h-[80vh] min-h-[500px] overflow-hidden rounded-lg border border-slate-200 bg-white">
      {actionNotice ? (
        <div className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      <div className="w-52 border-r border-slate-100 p-2.5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-slate-700">
            Hộp thư tư vấn trực tuyến
          </h3>
        </div>
        <div className="space-y-4 overflow-y-auto">
          {/* Group patients into sections: urgent, follow-up, completed */}
          {(() => {
            const urgent = patients.filter((p) => p.urgent);
            const followUp = patients.filter((p) => !p.urgent && p.online);
            const completed = patients.filter((p) => !p.urgent && !p.online);

            return (
              <div className="space-y-4">
                {urgent.length > 0 && (
                  <section>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <h4 className="text-[11px] font-semibold uppercase text-rose-600">
                        Cần ưu tiên gấp
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {urgent.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelected(p.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[11px] transition-shadow ${
                            selected === p.id
                              ? "bg-rose-50/60 shadow-sm"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                              {p.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate font-semibold text-slate-900">
                                {p.name}
                              </div>
                              {p.unread ? (
                                <div className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-2 text-[11px] font-semibold text-white shadow-sm">
                                  {p.unread}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {followUp.length > 0 && (
                  <section>
                    <div className="mb-2">
                      <h4 className="text-[11px] font-semibold uppercase text-slate-400">
                        Lịch hẹn theo dõi
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {followUp.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelected(p.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[11px] transition-shadow ${
                            selected === p.id
                              ? "bg-slate-50 shadow-sm"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                              {p.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate text-slate-900">
                                {p.name}
                              </div>
                              {p.unread ? (
                                <div className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-2 text-xs font-semibold text-white">
                                  {p.unread}
                                </div>
                              ) : null}
                            </div>
                            <div className="mt-1 text-[10px] text-slate-400">
                              {p.note ?? ""}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {completed.length > 0 && (
                  <section>
                    <div className="mb-2">
                      <h4 className="text-[11px] font-semibold uppercase text-slate-400">
                        Đã hoàn thành
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {completed.map((p) => (
                        <div
                          key={p.id}
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[11px] transition-shadow opacity-70 text-slate-400"
                        >
                          <div className="relative">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-300">
                              {p.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{p.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="relative flex-1 transition-all duration-300 ease-in-out">
        <ChatWindow
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={sendMessage}
          aiOpen={aiOpen}
          toggleAi={() => setAiOpen((v) => !v)}
        />
      </div>

      <div className="relative">
        {/* backdrop overlay when AI panel open */}
        {aiOpen ? (
          <div
            onClick={() => setAiOpen(false)}
            className="absolute inset-0 z-20 bg-black/20 transition-opacity"
          />
        ) : null}
      </div>

      <aside
        className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out ${aiOpen ? "w-80 p-4" : "w-0 p-0 overflow-hidden"} border-l border-slate-100 bg-[#fbfefe]`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700">
              GEMINI COPILOT CHAT
            </h4>
            <div className="inline-flex items-center gap-2">
              <button
                onClick={generateDraft}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition transform duration-150 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                aria-label="Generate AI draft"
              >
                <FileText className="h-4 w-4" /> AI Draft
              </button>
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4">
            {aiDraft ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-slate-800">
                  TÓM TẮT CA BỆNH NHANH
                </div>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {aiDraft}
                </p>
                <button
                  onClick={() => insertSuggestion(aiDraft)}
                  className="mt-3 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition transform duration-150 hover:bg-emerald-700 hover:scale-105 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  SỬ DỤNG GỢI Ý NÀY
                </button>
              </div>
            ) : null}

            <div className="text-xs font-semibold text-slate-500">
              Phác đồ/đoạn trả lời nhanh
            </div>

            <div className="space-y-3">
              {sampleSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="text-sm text-slate-700">{s.text}</div>
                  <button
                    onClick={() => insertSuggestion(s.text)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition transform duration-150 hover:scale-110 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    title="Chèn vào ô nhập"
                    aria-label={`Chèn gợi ý: ${s.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
