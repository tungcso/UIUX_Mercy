"use client";

import {
  AlertTriangle,
  CalendarCheck2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Pill,
  Plus,
  SendHorizontal,
  Square,
} from "lucide-react";
import type { ComponentType } from "react";

export default function InputBar({
  draft,
  setDraft,
  onSend,
  onAttach,
  onRecord,
  onLab,
  onMedicine,
  onBookDoctor,
  onEmergency,
  isSending = false,
  isAiLoading = false,
  isRecording = false,
}: {
  draft: string;
  setDraft: (s: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onRecord?: () => void;
  onLab?: () => void;
  onMedicine?: () => void;
  onBookDoctor?: () => void;
  onEmergency?: () => void;
  isSending?: boolean;
  isAiLoading?: boolean;
  isRecording?: boolean;
}) {
  const canSend = draft.trim().length > 0 && !isSending && !isAiLoading;

  return (
    <footer className="border-t border-[#d8eadf] bg-white px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3">
      {isAiLoading ? (
        <div className="mb-2 flex items-center gap-2 rounded-2xl bg-[#ecfdf3] px-3 py-2 text-[12px] font-medium text-[#16a34a]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#16a34a]" />
          Đang phân tích ngữ cảnh y tế...
        </div>
      ) : null}

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <QuickAction icon={ImageIcon} label="Gửi ảnh" onClick={onAttach} />
        <QuickAction icon={FileText} label="Tải xét nghiệm" onClick={onLab} />
        <QuickAction icon={Pill} label="Thuốc đang dùng" onClick={onMedicine} />
        <QuickAction
          icon={CalendarCheck2}
          label="Đặt lịch bác sĩ"
          onClick={onBookDoctor}
        />
        <QuickAction
          icon={AlertTriangle}
          label="Khẩn cấp"
          onClick={onEmergency}
          danger
        />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={onAttach}
          aria-label="Mở tệp đính kèm"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3f7f4] text-[#16a34a] transition active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onRecord}
          aria-label={isRecording ? "Dừng ghi âm" : "Ghi âm"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
            isRecording
              ? "bg-[#fee2e2] text-[#dc2626]"
              : "bg-[#f3f7f4] text-[#16a34a]"
          }`}
        >
          {isRecording ? (
            <Square className="h-4.5 w-4.5 fill-current" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1 rounded-3xl border border-[#d7eadf] bg-[#f8fbf8] px-4 py-3">
          <input
            value={draft}
            disabled={isSending}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Mô tả triệu chứng hoặc đặt câu hỏi..."
            className="w-full bg-transparent text-[15px] text-[#1f2939] outline-none placeholder:text-[#9aa4b5] disabled:opacity-70"
          />
        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Gửi"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
            canSend
              ? "bg-[#16a34a] text-white shadow-[0_10px_22px_rgba(22,163,74,0.2)]"
              : "bg-[#e5edf3] text-[#94a3b8]"
          }`}
        >
          {isSending ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <SendHorizontal className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </footer>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition active:scale-95 ${
        danger
          ? "border-[#fecaca] bg-[#fff1f2] text-[#dc2626]"
          : "border-[#d7eadf] bg-[#f8fbf8] text-[#15803d]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

