"use client";

import React from "react";
import { Camera, Mic, SendHorizontal } from "lucide-react";

export default function InputBar({
  draft,
  setDraft,
  onSend,
  onAttach,
  onRecord,
}: {
  draft: string;
  setDraft: (s: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onRecord?: () => void;
}) {
  return (
    <footer className="border-t border-[#d8eadf] bg-white px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3">
      <div className="flex items-end gap-2">
        <button
          onClick={onRecord}
          aria-label="Ghi âm"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f7f4] text-[#16a34a]"
        >
          <Mic className="h-5 w-5" />
        </button>

        <button
          onClick={onAttach}
          aria-label="Gửi ảnh"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f7f4] text-[#16a34a]"
        >
          <Camera className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 rounded-3xl border border-[#d7eadf] bg-[#f8fbf8] px-4 py-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Mô tả triệu chứng hoặc đặt câu hỏi..."
            className="w-full bg-transparent text-[15px] text-[#1f2939] outline-none placeholder:text-[#9aa4b5]"
          />
        </div>

        <button
          onClick={onSend}
          aria-label="Gửi"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16a34a] text-white"
        >
          <SendHorizontal className="h-4.5 w-4.5" />
        </button>
      </div>
    </footer>
  );
}
