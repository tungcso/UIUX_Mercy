"use client";

import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import React from "react";

export default function ChatHeader({
  title = "Tư vấn sức khỏe",
  subtitle = "AI sẵn sàng hỗ trợ",
  onBack,
  onAppointments,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onAppointments?: () => void;
}) {
  return (
    <header className="relative overflow-hidden rounded-b-3xl bg-linear-to-br from-[#1fa24a] via-[#16a34a] to-[#10813a] px-4 pb-4 pt-4 text-white">
      <div className="relative flex items-center justify-between gap-3">
        <button
          aria-label="Quay lại"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#16a34a]">
            <svg
              className="h-5 w-5 text-[#16a34a]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M12 2v4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-[13px] text-white/80">Trợ lý đang sẵn sàng</p>
            <h1 className="text-[20px] font-semibold leading-tight">{title}</h1>
          </div>
        </div>

        <button
          aria-label="Đặt lịch"
          onClick={onAppointments}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12"
        >
          <CalendarCheck2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
