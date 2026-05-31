"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { buildConsultCase, consultCases, type ConsultCase } from "./consult-case-data";

function getCaseIcon(type: ConsultCase["type"]) {
  if (type === "doctor") {
    return Stethoscope;
  }

  if (type === "emergency") {
    return AlertTriangle;
  }

  return Bot;
}

function getCaseTone(caseItem: ConsultCase) {
  if (caseItem.severity === "high") {
    return {
      card: "border-[#fecaca] bg-[#fff5f5] shadow-[0_10px_24px_rgba(239,68,68,0.08)]",
      badge: "bg-[#fee2e2] text-[#dc2626]",
      chip: "border-[#fecaca] bg-[#fff1f2] text-[#991b1b]",
      icon: "bg-[#fee2e2] text-[#dc2626]",
    };
  }

  if (caseItem.type === "doctor") {
    return {
      card: "border-[#dbeafe] bg-white shadow-[0_10px_24px_rgba(37,99,235,0.06)]",
      badge: "bg-[#eff6ff] text-[#2563eb]",
      chip: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
      icon: "bg-[#dbeafe] text-[#2563eb]",
    };
  }

  return {
    card: "border-[#d9eadf] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]",
    badge: "bg-[#ecfdf3] text-[#16a34a]",
    chip: "border-[#d9eadf] bg-[#f3fbf5] text-[#14532d]",
    icon: "bg-[#dcfce7] text-[#16a34a]",
  };
}

function formatTypeLabel(caseItem: ConsultCase) {
  if (caseItem.type === "emergency") return "Khẩn";
  if (caseItem.type === "doctor") return "Bác sĩ";
  return "AI";
}

export default function ConsultationsInbox() {
  const router = useRouter();
  const cases = consultCases;
  const hasCases = cases.length > 0;

  const openCase = (caseId: string) => {
    router.push(`/patient/consult/${caseId}`);
  };

  const startNewConsultation = () => {
    router.push("/patient/consult/new?mode=ai");
  };

  return (
    <main className="flex h-full min-h-0 bg-[#e9f5ed] px-2 py-2 sm:px-4 sm:py-5">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d7eadf] bg-[#f7fbf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <header className="border-b border-[#e3efe6] bg-white px-4 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-[#16a34a]">Medical Inbox</p>
              <h1 className="mt-1 text-[24px] font-semibold leading-tight text-[#10233f]">
                Tư vấn của tôi
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">
                Quản lý các vấn đề sức khỏe theo từng ca bệnh
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Tìm kiếm"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8eadf] bg-white text-[#64748b] shadow-sm transition hover:bg-[#f7fbf8]"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Bộ lọc"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8eadf] bg-white text-[#64748b] shadow-sm transition hover:bg-[#f7fbf8]"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewConsultation}
            className="mt-4 flex w-full items-center justify-between rounded-[24px] bg-[#16a34a] px-4 py-4 text-left text-white shadow-[0_18px_32px_rgba(22,163,74,0.22)] transition hover:translate-y-[-1px] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold">Bắt đầu tư vấn mới</p>
                <p className="mt-0.5 text-[12px] text-white/80">
                  Chọn AI, bác sĩ hoặc chế độ khẩn
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/90" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {hasCases ? (
            <div className="space-y-3">
              {cases.map((caseItem) => {
                const tone = getCaseTone(caseItem);
                const Icon = getCaseIcon(caseItem.type);

                return (
                  <button
                    key={caseItem.id}
                    type="button"
                    onClick={() => openCase(caseItem.id)}
                    className={`group w-full rounded-[24px] border p-4 text-left transition duration-200 hover:translate-y-[-1px] active:scale-[0.99] ${tone.card}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.icon}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h2 className="truncate text-[16px] font-semibold text-[#10233f]">
                                {caseItem.title}
                              </h2>
                              {caseItem.severity === "high" ? (
                                <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#ef4444]" />
                              ) : null}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#64748b]">
                              {caseItem.subtitle}
                            </p>
                          </div>

                          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#94a3b8] transition group-hover:translate-x-0.5" />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${tone.badge}`}>
                            {caseItem.status}
                          </span>
                          <span className="flex items-center gap-1 rounded-full border border-[#d8eadf] bg-white px-3 py-1 text-[11px] font-medium text-[#64748b]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {caseItem.time}
                          </span>
                          {caseItem.tag ? (
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${tone.chip}`}>
                              {caseItem.tag}
                            </span>
                          ) : null}
                          <span className="rounded-full border border-[#d8eadf] bg-[#f8fbf8] px-3 py-1 text-[11px] font-medium text-[#64748b]">
                            {formatTypeLabel(caseItem)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
                <Stethoscope className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-[20px] font-semibold text-[#10233f]">
                Bạn chưa có tư vấn nào
              </h2>
              <p className="mt-2 max-w-sm text-[14px] leading-6 text-[#6b7280]">
                Tạo một case mới để lưu lại từng vấn đề sức khỏe, theo dõi tiến
                trình và quay lại sau dễ dàng.
              </p>
              <button
                type="button"
                onClick={startNewConsultation}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-5 py-3 text-[14px] font-medium text-white shadow-[0_14px_28px_rgba(22,163,74,0.22)]"
              >
                <Plus className="h-4.5 w-4.5" />
                Bắt đầu tư vấn đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
