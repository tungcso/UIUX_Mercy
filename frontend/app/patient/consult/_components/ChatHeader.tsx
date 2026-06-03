"use client";

import { ArrowLeft, Stethoscope } from "lucide-react";

export default function ChatHeader({
  title = "Tư vấn sức khỏe",
  subtitle = "AI sẵn sàng hỗ trợ",
  status = "AI hoạt động",
  emergency = false,
  onBack,
  onTitleClick,
  onStatusClick,
}: {
  title?: string;
  subtitle?: string;
  status?: string;
  emergency?: boolean;
  onBack?: () => void;
  onTitleClick?: () => void;
  onStatusClick?: () => void;
}) {
  return (
    <header className="relative overflow-hidden border-b border-[#dbeaf1] bg-white px-4 py-3 text-[#10233f]">
      <div className="flex min-h-13 items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8e7ef] bg-[#f8fbfd] text-[#334155] transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onTitleClick}
          className="flex min-w-0 flex-1 items-center justify-center gap-3 rounded-2xl px-2 py-1 text-center transition active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecfdf3] text-[#16a34a]">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-[16px] font-semibold leading-tight">
              {title}
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-[#64748b]">
              {subtitle}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onStatusClick}
          aria-label="Xem trạng thái AI"
          className={`min-h-11 shrink-0 rounded-full px-3 text-[11px] font-bold ${
            emergency
              ? "animate-pulse bg-[#fee2e2] text-[#dc2626]"
              : "bg-[#ecfdf3] text-[#16a34a]"
          }`}
        >
          {status}
        </button>
      </div>
    </header>
  );
}

