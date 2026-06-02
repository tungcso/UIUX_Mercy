"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  Clock3,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserRound,
  Sparkles,
  Thermometer,
  Headphones,
  Smile,
  Droplets,
  MoonStar,
  Activity,
  Pill,
  X,
} from "lucide-react";
import {
  consultCases,
  type ConsultCase,
  type ConsultCaseSeverity,
} from "./consult/_components/consult-case-data";

const commonSymptoms = ["Sốt", "Ho", "Đau đầu", "Đau bụng", "Đau họng"];

const storedConsultCasesKey = "mercy-patient-consult-cases";

const symptomSummaries: Record<
  string,
  {
    overview: string;
    selfCare: string[];
    warningSigns: string[];
  }
> = {
  Sốt: {
    overview:
      "Sốt là phản ứng thường gặp khi cơ thể đang chống lại nhiễm trùng hoặc viêm. Cần theo dõi nhiệt độ, thời gian sốt và triệu chứng đi kèm.",
    selfCare: ["Uống đủ nước", "Nghỉ ngơi", "Mặc đồ thoáng", "Đo nhiệt độ mỗi 4-6 giờ"],
    warningSigns: ["Sốt trên 39-40°C", "Lơ mơ/co giật", "Khó thở", "Sốt kéo dài hơn 3 ngày"],
  },
  Ho: {
    overview:
      "Ho có thể do cảm lạnh, dị ứng, kích ứng đường thở hoặc nhiễm trùng hô hấp. Loại ho và thời gian ho giúp định hướng nguy cơ.",
    selfCare: ["Uống nước ấm", "Tránh khói bụi", "Giữ ấm cổ", "Theo dõi màu đờm"],
    warningSigns: ["Khó thở", "Đau ngực", "Ho ra máu", "Ho kéo dài hơn 1 tuần"],
  },
  "Đau đầu": {
    overview:
      "Đau đầu thường liên quan căng thẳng, thiếu ngủ, mất nước hoặc bệnh lý kèm theo. Cần chú ý mức độ đau và dấu hiệu thần kinh.",
    selfCare: ["Nghỉ nơi yên tĩnh", "Uống đủ nước", "Ngủ đủ", "Giảm nhìn màn hình lâu"],
    warningSigns: ["Đau dữ dội đột ngột", "Mờ mắt/yếu liệt", "Nôn nhiều", "Sốt cao"],
  },
  "Đau bụng": {
    overview:
      "Đau bụng có nhiều nguyên nhân như rối loạn tiêu hóa, viêm dạ dày, nhiễm khuẩn hoặc vấn đề cần khám sớm tùy vị trí đau.",
    selfCare: ["Ăn nhẹ", "Uống nước", "Theo dõi vị trí đau", "Tránh tự dùng thuốc giảm đau mạnh"],
    warningSigns: ["Đau tăng nhanh", "Sốt", "Nôn nhiều", "Đau khu trú bên phải"],
  },
  "Đau họng": {
    overview:
      "Đau họng thường do viêm họng, cảm lạnh, kích ứng hoặc trào ngược. Cần theo dõi sốt, ho, khó nuốt và thời gian kéo dài.",
    selfCare: ["Uống nước ấm", "Súc miệng nước muối", "Tránh đồ lạnh/cay", "Nghỉ giọng"],
    warningSigns: ["Sốt cao", "Khó thở", "Khó nuốt nhiều", "Đau kéo dài hơn 1 tuần"],
  },
};

const personalizedTips = [
  {
    icon: Droplets,
    title: "Uống đủ nước hôm nay",
    detail: "Giữ cơ thể đủ nước giúp giảm mệt mỏi và hỗ trợ phục hồi tốt hơn.",
  },
  {
    icon: MoonStar,
    title: "Ngủ sớm hơn 30 phút",
    detail: "Một giấc ngủ đều đặn giúp cơ thể ổn định hơn trong vài ngày tới.",
  },
  {
    icon: Activity,
    title: "Đi bộ nhẹ 10 phút",
    detail: "Vận động nhẹ giúp tuần hoàn tốt và giảm căng thẳng.",
  },
];

function getTopicQuery(topic: string) {
  return `/patient/consult/ai-${Date.now()}?mode=ai&topic=${encodeURIComponent(topic)}`;
}

function readStoredConsultCases() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storedConsultCasesKey);
    const parsed = raw ? (JSON.parse(raw) as ConsultCase[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSeverityRank(severity: ConsultCaseSeverity) {
  if (severity === "high") return 0;
  if (severity === "medium") return 1;
  return 2;
}

function getCasePreview(caseItem: ConsultCase) {
  const lastMessage = [...caseItem.messages]
    .reverse()
    .find((message) => message.text || message.title);

  if (lastMessage?.text) return lastMessage.text;
  if (lastMessage?.title) return lastMessage.title;
  return caseItem.subtitle;
}

function getCaseTone(caseItem: ConsultCase) {
  const status = caseItem.status.toLowerCase();

  if (caseItem.severity === "high") {
    return {
      border: "border-[#fecaca]",
      bg: "bg-[#fff7f7]",
      iconBg: "bg-[#fee2e2]",
      iconText: "text-[#dc2626]",
      badge: "bg-[#fee2e2] text-[#dc2626]",
    };
  }

  if (caseItem.severity === "medium" && status.includes("theo dõi")) {
    return {
      border: "border-[#fde68a]",
      bg: "bg-[#fffbeb]",
      iconBg: "bg-[#fef3c7]",
      iconText: "text-[#b45309]",
      badge: "bg-[#fef3c7] text-[#b45309]",
    };
  }

  return {
    border: "border-[#d8eadf]",
    bg: "bg-white",
    iconBg: "bg-[#ecfdf3]",
    iconText: "text-[#16a34a]",
    badge: "bg-[#ecfdf3] text-[#16a34a]",
  };
}

export default function PatientPage() {
  const router = useRouter();
  const [homeConsultCases, setHomeConsultCases] =
    useState<ConsultCase[]>(consultCases);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  useEffect(() => {
    const storedCases = readStoredConsultCases();
    const mergedCases = [
      ...storedCases,
      ...consultCases.filter(
        (caseItem) =>
          !storedCases.some((storedCase) => storedCase.id === caseItem.id),
      ),
    ].sort(
      (a, b) => getSeverityRank(a.severity) - getSeverityRank(b.severity),
    );

    setHomeConsultCases(mergedCases);
  }, []);

  const goToExam = () => {
    router.push("/patient/appointments");
  };

  const goToConsult = () => {
    router.push("/patient/consult");
  };

  const goToAiConsult = () => {
    router.push(`/patient/consult/ai-${Date.now()}?mode=ai`);
  };

  const openConsultCase = (caseItem: ConsultCase) => {
    router.push(`/patient/consult/${caseItem.id}`);
  };

  return (
    <main className="flex h-full min-h-0 justify-center bg-[#e9f5ed] px-2 py-2 sm:px-4 sm:py-5">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d7eadf] bg-[#f7fbf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <section className="relative overflow-hidden rounded-b-[30px] bg-linear-to-br from-[#1fa24a] via-[#16a34a] to-[#10813a] px-4 pb-4 pt-3 text-white">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-emerald-200/15 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[22px] shadow-[0_10px_24px_rgba(15,23,42,0.15)]">
                👨🏻
              </div>
              <div>
                <p className="text-sm text-white/85">Chào Nguyễn Văn An</p>
                <h1 className="text-[23px] font-semibold leading-tight">
                  Bạn cần hỗ trợ sức khỏe gì hôm nay?
                </h1>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white/95 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-3 rounded-[28px] border border-white/15 bg-white/12 p-2.5 shadow-[0_16px_40px_rgba(10,48,19,0.18)] backdrop-blur-sm">
            <button
              type="button"
              aria-label="Mô tả triệu chứng hoặc đặt câu hỏi"
              onClick={goToAiConsult}
              className="flex w-full items-start gap-3 rounded-[22px] bg-white px-4 py-2.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-[#94a3b8]" />
              <span className="flex-1 text-[14px] text-[#9aa4b5]">
                Mô tả triệu chứng hoặc đặt câu hỏi
              </span>
            </button>

          </div>
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 overscroll-contain">
          <div className="grid gap-3">
            <button
              type="button"
              onClick={goToExam}
              className="flex items-center justify-between rounded-3xl border border-[#d8eadf] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1f2939]">
                    Tôi cần khám
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">
                    Đặt lịch, xem bác sĩ và chuẩn bị trước cuộc hẹn
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#16a34a]" />
            </button>

            <button
              type="button"
              onClick={goToConsult}
              className="flex items-center justify-between rounded-3xl border border-[#d8eadf] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eafaf1] text-[#16a34a]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1f2939]">
                    Tôi cần tư vấn sức khỏe
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">
                    Trao đổi với AI hoặc bác sĩ online ngay trên app
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#16a34a]" />
            </button>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1f2939]">
                Triệu chứng phổ biến
              </h2>
            </div>

            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => setSelectedSymptom(symptom)}
                  className="shrink-0 rounded-full border border-[#cfe8d8] bg-white px-4 py-2 text-[14px] font-medium text-[#1f2939] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:border-[#16a34a] hover:bg-[#f0fbf4]"
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1f2939]">
                Tiếp tục cuộc trò chuyện
              </h2>
            </div>

            <div className="space-y-3">
              {homeConsultCases.slice(0, 3).map((caseItem) => {
                const tone = getCaseTone(caseItem);

                return (
                  <button
                    key={caseItem.id}
                    type="button"
                    onClick={() => openConsultCase(caseItem)}
                    className={`w-full rounded-[24px] border px-4 py-3 text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 ${tone.border} ${tone.bg}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${tone.iconBg} ${tone.iconText}`}
                          >
                            {caseItem.type === "doctor" ? (
                              <Stethoscope className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </span>
                          <p className="truncate text-[15px] font-semibold text-[#202939]">
                            {caseItem.title}
                          </p>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#6b7280]">
                          {getCasePreview(caseItem)}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${tone.badge}`}
                          >
                            {caseItem.status}
                          </span>
                          {caseItem.tag ? (
                            <span className="rounded-full border border-[#d8eadf] bg-white/70 px-3 py-1 text-[11px] font-medium text-[#64748b]">
                              {caseItem.tag}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] font-medium text-[#16a34a]">
                        {caseItem.time}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1f2939]">
                Gợi ý cho bạn
              </h2>
            </div>

            <div className="grid gap-2">
              {personalizedTips.map((tip) => {
                const TipIcon = tip.icon;

                return (
                  <article
                    key={tip.title}
                    className="flex items-start gap-3 rounded-[22px] border border-[#dfe9e1] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
                      <TipIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#202939]">
                        {tip.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">
                        {tip.detail}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {selectedSymptom ? (
          <SymptomSummarySheet
            symptom={selectedSymptom}
            onClose={() => setSelectedSymptom(null)}
            onStartConsult={() => router.push(getTopicQuery(selectedSymptom))}
          />
        ) : null}
      </div>
    </main>
  );
}

function SymptomSummarySheet({
  symptom,
  onClose,
  onStartConsult,
}: {
  symptom: string;
  onClose: () => void;
  onStartConsult: () => void;
}) {
  const summary = symptomSummaries[symptom];
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3">
      <button
        type="button"
        aria-label="Đóng tóm tắt triệu chứng"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fbfd] text-[#64748b]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="pr-9">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
            Tóm tắt triệu chứng
          </p>
          <h2 className="mt-1 text-[22px] font-bold text-[#10233f]">
            {symptom}
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
            {summary.overview}
          </p>
        </div>

        <SummaryBlock title="Có thể tự chăm sóc ban đầu">
          {summary.selfCare.map((item) => (
            <SummaryBullet key={item}>{item}</SummaryBullet>
          ))}
        </SummaryBlock>

        <SummaryBlock title="Nên đi khám sớm nếu có">
          {summary.warningSigns.map((item) => (
            <SummaryBullet key={item} danger>
              {item}
            </SummaryBullet>
          ))}
        </SummaryBlock>

        <button
          type="button"
          onClick={onStartConsult}
          className="mt-4 min-h-11 w-full rounded-2xl bg-[#16a34a] text-sm font-semibold text-white"
        >
          Bắt đầu tư vấn về {symptom}
        </button>
      </div>
    </div>
  );
}

function SummaryBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-[#d8eadf] bg-[#f8fbfd] p-3">
      <p className="text-[13px] font-bold text-[#10233f]">{title}</p>
      <div className="mt-2 grid gap-2">{children}</div>
    </div>
  );
}

function SummaryBullet({
  children,
  danger = false,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-[13px] leading-5 text-[#475569]">
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
          danger ? "bg-[#dc2626]" : "bg-[#16a34a]"
        }`}
      />
      <span>{children}</span>
    </div>
  );
}
