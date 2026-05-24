"use client";

import React, { useEffect, useRef } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

type Message = {
  id: string;
  from: "doctor" | "patient";
  text: string;
  time?: string;
};

type Patient = {
  id: string;
  name: string;
  note?: string;
  urgent?: boolean;
  unread?: number;
  online?: boolean;
};

export default function ChatWindow({
  selectedPatient,
  messages = [],
  messageInput,
  setMessageInput,
  onSend,
  aiOpen,
  toggleAi,
}: {
  selectedPatient?: Patient;
  messages?: Message[];
  messageInput: string;
  setMessageInput: (v: string) => void;
  onSend: () => void;
  aiOpen: boolean;
  toggleAi: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col text-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <div className="text-xs font-semibold text-slate-600">
            HỘI THOẠI TRỰC TUYẾN
          </div>
          <div className="mt-1 text-base font-bold text-slate-900">
            Bệnh nhân: {selectedPatient?.name ?? "Chọn bệnh nhân"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-slate-500">
            <div>Hôm nay: Thứ Năm, 21 tháng 5, 2026</div>
            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Có chỉ số đo
              từ xa khẩn cấp!
            </div>
          </div>

          <button
            onClick={toggleAi}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition transform duration-150 ${
              aiOpen
                ? "bg-emerald-700 text-white shadow-[0_10px_30px_rgba(16,185,129,0.18)]"
                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105"
            } focus:outline-none focus:ring-4 focus:ring-emerald-100`}
            aria-pressed={aiOpen}
            aria-label="Toggle AI helper"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>Trợ Lý AI gợi ý</span>
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="w-full">
          <div className="relative rounded-lg bg-[#f7fbfc] px-6 py-6">
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === "doctor" ? "justify-end" : "justify-start"} items-start`}
                >
                  {m.from === "patient" ? (
                    <div className="max-w-[72%]">
                      <div className="rounded-2xl bg-white px-4 py-4 text-[14px] leading-6 shadow-sm">
                        <div className="whitespace-pre-wrap text-slate-800">
                          {m.text}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2 text-[12px] text-slate-400">
                          <span>{m.time ?? "10:04"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[72%]">
                      <div className="ml-auto rounded-2xl bg-emerald-50 px-4 py-4 text-[14px] leading-6 shadow-md">
                        <div className="whitespace-pre-wrap text-emerald-800">
                          {m.text}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2 text-[12px] text-emerald-600">
                          <span>{m.time ?? "10:04"}</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>
        </div>
      </div>

      <footer className="px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
                <textarea
                  rows={1}
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  className="w-full resize-none border-0 bg-transparent p-0 text-sm outline-none"
                />
              </div>
            </div>

            <div className="ml-4">
              <button
                onClick={onSend}
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_18px_40px_rgba(16,185,129,0.18)] transition transform duration-150 hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                aria-label="Gửi"
              >
                <span className="text-sm font-semibold">Gửi</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
