"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRightCircle,
  CheckCircle2,
  Brain,
  FileText,
  X,
} from "lucide-react";

type UrgencyLevel = "critical" | "high" | "medium";

type ComplexCase = {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  waitTime: string;
  urgency: UrgencyLevel;
  mainSymptom: string;
  aiSummary: string;
  medicalHistory: string[];
  symptoms: string[];
  status: "pending" | "transferred";
};

const cases: ComplexCase[] = [
  {
    id: "CC-001",
    patientName: "Nguyễn Văn Đức",
    age: 68,
    gender: "Nam",
    waitTime: "47 phút",
    urgency: "critical",
    mainSymptom: "Đau ngực dữ dội kèm khó thở",
    aiSummary:
      "BN 68 tuổi, tiền sử THA 10 năm, ĐTĐ type 2. Hiện khởi phát đột ngột đau ngực kiểu thắt ép lan lên vai trái, kèm khó thở và vã mồ hôi lạnh. Chỉ số SpO2 93%. Nghi ngờ cao hội chứng vành cấp. Cần can thiệp khẩn cấp.",
    medicalHistory: ["Tăng huyết áp 10 năm", "Đái tháo đường type 2", "Hút thuốc lá 20 năm"],
    symptoms: ["Đau ngực thắt ép", "Khó thở", "Vã mồ hôi lạnh", "Đau lan vai trái", "SpO2: 93%"],
    status: "pending",
  },
  {
    id: "CC-002",
    patientName: "Trần Thị Hoa",
    age: 45,
    gender: "Nữ",
    waitTime: "1 giờ 12 phút",
    urgency: "high",
    mainSymptom: "Sốt 40°C kéo dài 4 ngày, co giật",
    aiSummary:
      "BN nữ 45 tuổi, sốt cao 40°C dai dẳng 4 ngày kèm cứng gáy, sợ ánh sáng và buồn nôn. Có 1 đợt co giật toàn thể 30 giây. Nghi ngờ viêm màng não vi khuẩn. Cần chụp CT đầu và chọc dịch não tủy khẩn cấp.",
    medicalHistory: ["Không tiền sử đặc biệt"],
    symptoms: ["Sốt 40°C", "Cứng gáy", "Sợ ánh sáng", "Buồn nôn", "Co giật 1 lần"],
    status: "pending",
  },
  {
    id: "CC-003",
    patientName: "Lê Quang Minh",
    age: 52,
    gender: "Nam",
    waitTime: "28 phút",
    urgency: "high",
    mainSymptom: "Đột ngột méo miệng, yếu liệt tay phải",
    aiSummary:
      "BN 52 tuổi xuất hiện đột ngột trong 2 giờ: méo miệng, nói ngọng, yếu liệt tay phải. Điểm NIHSS ước tính 7 điểm. Tiền sử rung nhĩ không được điều trị đầy đủ. Nghi ngờ đột quỵ thiếu máu cục bộ. Cần chụp CT/MRI não và đánh giá rt-PA.",
    medicalHistory: ["Rung nhĩ", "Tăng huyết áp nhẹ"],
    symptoms: ["Méo miệng đột ngột", "Nói ngọng", "Yếu liệt tay phải", "NIHSS ~7"],
    status: "pending",
  },
  {
    id: "CC-004",
    patientName: "Phạm Thị Lan",
    age: 34,
    gender: "Nữ",
    waitTime: "2 giờ 05 phút",
    urgency: "medium",
    mainSymptom: "Đau bụng dưới âm ỉ, buồn nôn nhiều ngày",
    aiSummary:
      "BN nữ 34 tuổi, đau bụng dưới bên phải âm ỉ 5 ngày, tăng dần khi đi lại. Sốt nhẹ 37.8°C, nôn 2 lần. Điểm Alvarado 6/10. Cần siêu âm bụng và xét nghiệm công thức máu để loại trừ viêm ruột thừa.",
    medicalHistory: ["Không tiền sử đặc biệt"],
    symptoms: ["Đau bụng phải dưới", "Sốt nhẹ 37.8°C", "Buồn nôn", "Đau tăng khi vận động"],
    status: "pending",
  },
];

const urgencyConfig: Record<UrgencyLevel, { label: string; class: string; dot: string; borderClass: string }> = {
  critical: {
    label: "Khẩn cấp",
    class: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500 animate-pulse",
    borderClass: "border-red-300",
  },
  high: {
    label: "Ưu tiên cao",
    class: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-400 animate-pulse",
    borderClass: "border-orange-300",
  },
  medium: {
    label: "Theo dõi",
    class: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    borderClass: "border-amber-200",
  },
};

export default function ComplexCaseInbox() {
  const [caseList, setCaseList] = useState<ComplexCase[]>(cases);
  const [expandedId, setExpandedId] = useState<string | null>("CC-001");
  const [handoffId, setHandoffId] = useState<string | null>(null);

  const pendingCount = caseList.filter((c) => c.status === "pending").length;
  const criticalCount = caseList.filter((c) => c.urgency === "critical" && c.status === "pending").length;

  const handleHandoff = (id: string) => {
    setCaseList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "transferred" } : c))
    );
    setHandoffId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
            Hộp thư Ca bệnh Phức tạp
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Can thiệp kịp thời vào các tình huống y khoa nguy hiểm
          </p>
        </div>

        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {criticalCount} ca khẩn cấp
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng ca chờ", value: pendingCount, color: "text-slate-900" },
          {
            label: "Khẩn cấp",
            value: caseList.filter((c) => c.urgency === "critical" && c.status === "pending").length,
            color: "text-red-600",
          },
          {
            label: "Đã chuyển giao",
            value: caseList.filter((c) => c.status === "transferred").length,
            color: "text-emerald-600",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-[1.4rem] border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {s.label}
            </p>
            <p className={`mt-1.5 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {caseList.map((c) => {
          const cfg = urgencyConfig[c.urgency];
          const isExpanded = expandedId === c.id;
          const isTransferred = c.status === "transferred";

          return (
            <div
              key={c.id}
              className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-sm transition-all ${
                isTransferred ? "border-emerald-200 opacity-75" : cfg.borderClass
              }`}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${cfg.dot}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{c.patientName}</span>
                    <span className="text-xs text-slate-400">
                      {c.gender} • {c.age} tuổi
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cfg.class}`}>
                      {cfg.label}
                    </span>
                    {isTransferred && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        ✓ Đã chuyển giao
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                    {c.mainSymptom}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Chờ: {c.waitTime}</span>
                    <span>•</span>
                    <span>#{c.id}</span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                    {/* AI Summary */}
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-emerald-500" />
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                          Tóm tắt bệnh sử (AI tổng hợp)
                        </p>
                      </div>
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        {c.aiSummary}
                      </div>

                      <div className="mt-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Tiền sử bệnh
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.medicalHistory.map((h) => (
                            <span
                              key={h}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms + Actions */}
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            Triệu chứng ghi nhận
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          {c.symptoms.map((s) => (
                            <div
                              key={s}
                              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                            >
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {!isTransferred && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setHandoffId(c.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all hover:-translate-y-0.5 hover:bg-rose-700"
                          >
                            <ArrowRightCircle className="h-4 w-4" />
                            Chuyển giao cho Bác sĩ chuyên khoa
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <User className="h-4 w-4" />
                            Tiếp nhận trực tiếp
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Handoff Confirmation Modal */}
      {handoffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              onClick={() => setHandoffId(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <ArrowRightCircle className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Xác nhận chuyển giao ca bệnh
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Toàn bộ hồ sơ ca bệnh{" "}
              <strong>{caseList.find((c) => c.id === handoffId)?.patientName}</strong>{" "}
              sẽ được đóng gói và chuyển tiếp đến Bác sĩ chuyên khoa trực. Hành động này không thể hoàn tác.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => handleHandoff(handoffId)}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all hover:bg-rose-700"
              >
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                Xác nhận chuyển giao
              </button>
              <button
                type="button"
                onClick={() => setHandoffId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
