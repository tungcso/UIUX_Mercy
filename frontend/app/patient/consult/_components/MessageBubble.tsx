"use client";

import { useState, type MouseEvent } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  Copy,
  Pill,
  PhoneCall,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { ConsultAction, ConsultMessage } from "./consult-case-data";

function actionClass(tone: ConsultAction["tone"]) {
  if (tone === "danger") {
    return "border-[#fecaca] bg-[#fff1f2] text-[#dc2626]";
  }

  if (tone === "primary") {
    return "border-[#bbf7d0] bg-[#16a34a] text-white";
  }

  return "border-[#d8e7ef] bg-white text-[#334155]";
}

function getCopyText(message: ConsultMessage) {
  if (message.card) {
    return `${message.card.name}\n${message.card.description}`;
  }

  return message.text || message.title || "";
}

function emergencyActionClass(action: ConsultAction) {
  if (action.value === "call-emergency") {
    return "bg-[#dc2626] text-white shadow-[0_16px_32px_rgba(220,38,38,0.28)]";
  }

  if (action.value === "connect-doctor") {
    return "bg-[#16a34a] text-white shadow-[0_14px_28px_rgba(22,163,74,0.22)]";
  }

  return "border border-[#fecaca] bg-white text-[#991b1b]";
}

function getEmergencyActionIcon(value: string) {
  if (value === "call-emergency") return PhoneCall;
  if (value === "connect-doctor") return Stethoscope;
  return Bot;
}

export default function MessageBubble({
  message,
  onQuickReply,
  onAction,
}: {
  message: ConsultMessage;
  onQuickReply?: (value: string) => void;
  onAction?: (action: ConsultAction, message: ConsultMessage) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAssistant = message.role === "assistant";

  const copyMessage = async () => {
    const text = getCopyText(message);
    if (!text) return;

    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setMenuOpen(false);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const openContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setMenuOpen((value) => !value);
  };

  if (message.kind === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[86%] rounded-full border border-[#d8e7ef] bg-white px-3 py-2 text-center text-[12px] font-medium text-[#64748b] shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.kind === "medical-info" && message.card) {
    return (
      <div className="relative" onContextMenu={openContextMenu}>
        <div className="rounded-[24px] border border-[#d8e7ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[#16a34a]">
              <Pill className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#16a34a]">
                Medical info
              </p>
              <h3 className="mt-1 text-[16px] font-bold text-[#10233f]">
                {message.card.name}
              </h3>
              <p className="mt-1 text-[14px] leading-6 text-[#475569]">
                {message.card.description}
              </p>
            </div>
          </div>

          {expanded && message.card.details ? (
            <div className="mt-3 rounded-2xl bg-[#f8fbfd] px-3 py-3 text-[13px] leading-5 text-[#475569]">
              {message.card.details}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#d8e7ef] bg-[#f8fbfd] px-3 text-[12px] font-semibold text-[#334155]"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {expanded ? "Thu gọn" : "Mở rộng"}
            </button>
            {message.card.actions?.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => onAction?.(action, message)}
                className={`min-h-9 rounded-full border px-3 text-[12px] font-semibold ${actionClass(
                  action.tone,
                )}`}
              >
                {action.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#64748b]">{message.time}</p>
        </div>
        <MessageMenu
          open={menuOpen}
          copied={copied}
          onCopy={copyMessage}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    );
  }

  if (message.kind === "recommendation") {
    return (
      <div className="relative" onContextMenu={openContextMenu}>
        <div className="rounded-[24px] border border-[#bbf7d0] bg-[#ecfdf3] p-4 shadow-[0_10px_24px_rgba(22,163,74,0.08)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#16a34a]">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#16a34a]">
                Recommendation
              </p>
              <h3 className="mt-1 text-[16px] font-bold text-[#10233f]">
                {message.title}
              </h3>
              <p className="mt-1 text-[14px] leading-6 text-[#475569]">
                {message.text}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions?.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => onAction?.(action, message)}
                className={`min-h-9 rounded-full border px-3 text-[12px] font-semibold ${actionClass(
                  action.tone,
                )}`}
              >
                {action.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#64748b]">{message.time}</p>
        </div>
        <MessageMenu
          open={menuOpen}
          copied={copied}
          onCopy={copyMessage}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    );
  }

  if (message.kind === "emergency") {
    const priorityActions = (message.actions ?? []).filter((action) =>
      ["connect-doctor", "call-emergency"].includes(action.value),
    );
    const secondaryActions = (message.actions ?? []).filter(
      (action) => !["connect-doctor", "call-emergency"].includes(action.value),
    );

    return (
      <div className="relative" onContextMenu={openContextMenu}>
        <div className="rounded-[24px] border-2 border-[#fca5a5] bg-[#fff5f5] p-4 shadow-[0_18px_38px_rgba(239,68,68,0.16)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fee2e2] text-[#dc2626]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#dc2626]">
                Cảnh báo khẩn cấp
              </p>
              <h3 className="mt-1 text-[16px] font-bold text-[#991b1b]">
                {message.title}
              </h3>
              <p className="mt-1 text-[14px] leading-6 text-[#7f1d1d]">
                {message.text}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {priorityActions.map((action) => {
              const Icon = getEmergencyActionIcon(action.value);

              return (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => onAction?.(action, message)}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-extrabold transition active:scale-[0.98] ${emergencyActionClass(
                    action,
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                  {action.label}
                </button>
              );
            })}

            {secondaryActions.length ? (
              <div className="grid gap-2 pt-1">
                {secondaryActions.map((action) => {
                  const Icon = getEmergencyActionIcon(action.value);

                  return (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => onAction?.(action, message)}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl px-3 text-[13px] font-bold transition active:scale-[0.98] ${emergencyActionClass(
                        action,
                      )}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <p className="mt-3 text-[11px] text-[#991b1b]">{message.time}</p>
        </div>
        <MessageMenu
          open={menuOpen}
          copied={copied}
          onCopy={copyMessage}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex ${isAssistant ? "justify-start" : "justify-end"}`}
      onContextMenu={openContextMenu}
    >
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
          isAssistant
            ? "rounded-bl-md bg-white text-[#111827]"
            : "rounded-br-md bg-[#16a34a] text-white"
        }`}
      >
        {message.kind === "question" ? (
          <div className="mb-2 flex items-center gap-2 text-[#16a34a]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[12px] font-semibold">
              Câu hỏi tiếp theo
            </span>
          </div>
        ) : null}
        <div className="whitespace-pre-wrap text-[15px] leading-6">
          {message.text}
        </div>
        {message.kind === "question" && message.quickReplies?.length ? (
          <div className="mt-3 flex flex-wrap gap-2 animate-[reply-slide_180ms_ease-out]">
            {message.quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => onQuickReply?.(reply)}
                className="min-h-9 rounded-full border border-[#bbf7d0] bg-[#ecfdf3] px-3 text-[12px] font-semibold text-[#15803d]"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-3">
          <span
            className={`text-[11px] ${
              isAssistant ? "text-[#6b7280]" : "text-white/80"
            }`}
          >
            {message.time}
          </span>
          <button
            type="button"
            onClick={copyMessage}
            className={`inline-flex items-center gap-1 text-[11px] ${
              isAssistant ? "text-[#64748b]" : "text-white/80"
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Đã copy" : "Copy"}
          </button>
        </div>
      </div>
      <MessageMenu
        open={menuOpen}
        copied={copied}
        onCopy={copyMessage}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
}

function MessageMenu({
  open,
  copied,
  onCopy,
  onClose,
}: {
  open: boolean;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute right-2 top-2 z-20 w-36 rounded-2xl border border-[#d8e7ef] bg-white p-1 shadow-[0_14px_32px_rgba(15,23,42,0.16)]">
      <button
        type="button"
        onClick={onCopy}
        className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-[13px] font-medium text-[#334155] hover:bg-[#f8fbfd]"
      >
        <Copy className="h-4 w-4" />
        {copied ? "Đã copy" : "Copy"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="min-h-9 w-full rounded-xl px-3 text-left text-[13px] font-medium text-[#64748b] hover:bg-[#f8fbfd]"
      >
        Đóng
      </button>
    </div>
  );
}
