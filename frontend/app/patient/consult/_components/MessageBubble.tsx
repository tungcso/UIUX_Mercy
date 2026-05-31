"use client";

import React from "react";

export default function MessageBubble({
  role = "assistant",
  text,
  time,
  variant = "normal",
}: {
  role?: "assistant" | "patient";
  text: string;
  time?: string;
  variant?: string;
}) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 ${isAssistant ? "bg-white text-[#111827]" : "bg-[#16a34a] text-white"} shadow-sm`}
      >
        <div className="whitespace-pre-wrap text-[15px] leading-6">{text}</div>
        {time ? (
          <div
            className={`mt-2 text-[11px] ${isAssistant ? "text-[#6b7280]" : "text-white/80"}`}
          >
            {time}
          </div>
        ) : null}
      </div>
    </div>
  );
}
