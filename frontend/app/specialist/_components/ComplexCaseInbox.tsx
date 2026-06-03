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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  status: "pending" | "transferred" | "accepted";
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
  {
    id: "CC-005",
    patientName: "Hoàng Thị Mai",
    age: 72,
    gender: "Nữ",
    waitTime: "15 phút",
    urgency: "critical",
    mainSymptom: "Mất ý thức đột ngột, huyết áp tụt",
    aiSummary:
      "BN nữ 72 tuổi ngất xỉu đột ngột tại nhà, HA khi nhập viện 70/40 mmHg, mạch yếu 120 lần/phút. Tiền sử suy tim EF 35%. Có thể sốc tim hoặc nhồi máu cơ tim thầm lặng. Cần ECG, siêu âm tim khẩn và xem xét truyền vận mạch.",
    medicalHistory: ["Suy tim EF 35%", "Rung nhĩ mãn tính", "Đái tháo đường type 2"],
    symptoms: ["Mất ý thức", "HA 70/40 mmHg", "Mạch 120 lần/phút", "Da tái lạnh", "Khó thở"],
    status: "pending",
  },
  {
    id: "CC-006",
    patientName: "Vũ Đình Bắc",
    age: 58,
    gender: "Nam",
    waitTime: "55 phút",
    urgency: "high",
    mainSymptom: "Ho ra máu lượng nhiều",
    aiSummary:
      "BN nam 58 tuổi, ho ra máu đỏ tươi khoảng 200ml trong 2 giờ. Tiền sử lao phổi điều trị 15 năm trước, hút thuốc 30 gói-năm. SpO2 94%. Nghi ngờ giãn phế quản hoặc tái phát lao. Cần chụp CT ngực cản quang và nội soi phế quản.",
    medicalHistory: ["Lao phổi (đã điều trị)", "Hút thuốc 30 gói-năm", "COPD nhẹ"],
    symptoms: ["Ho ra máu ~200ml", "SpO2 94%", "Ho mãn tính", "Sụt cân 5kg/3 tháng"],
    status: "pending",
  },
  {
    id: "CC-007",
    patientName: "Ngô Thị Thu",
    age: 28,
    gender: "Nữ",
    waitTime: "35 phút",
    urgency: "critical",
    mainSymptom: "Phản ứng phản vệ sau tiêm thuốc",
    aiSummary:
      "BN nữ 28 tuổi xuất hiện ngứa toàn thân, phù mặt, khó thở stridor sau khi tiêm kháng sinh 10 phút. HA 80/50 mmHg, mạch 130/phút, SpO2 91%. Chẩn đoán phản vệ độ III. Đã tiêm epinephrine 0.3mg IM, cần hỗ trợ đường thở và truyền dịch.",
    medicalHistory: ["Dị ứng penicillin (chưa ghi nhận)"],
    symptoms: ["Phù mặt cấp tính", "Stridor", "HA 80/50 mmHg", "SpO2 91%", "Nổi mề đay toàn thân"],
    status: "transferred",
  },
  {
    id: "CC-008",
    patientName: "Đỗ Văn Hùng",
    age: 41,
    gender: "Nam",
    waitTime: "1 giờ 40 phút",
    urgency: "medium",
    mainSymptom: "Đau thắt lưng cấp, không đi lại được",
    aiSummary:
      "BN nam 41 tuổi, đau thắt lưng cấp sau khi bê vật nặng, đau lan xuống chân phải theo đường L5-S1, kèm tê bì mặt ngoài bàn chân. Không tiểu tiện khó. SLR test dương tính 45°. Cần chụp MRI cột sống thắt lưng để đánh giá thoát vị đĩa đệm.",
    medicalHistory: ["Đau lưng mãn tính 3 năm"],
    symptoms: ["Đau thắt lưng cấp", "Đau lan chân phải", "Tê bì bàn chân", "SLR (+) 45°"],
    status: "pending",
  },
  {
    id: "CC-009",
    patientName: "Bùi Thị Ngọc",
    age: 63,
    gender: "Nữ",
    waitTime: "2 giờ 30 phút",
    urgency: "high",
    mainSymptom: "Đường huyết 450 mg/dL, nôn mửa nhiều",
    aiSummary:
      "BN nữ 63 tuổi, ĐTĐ type 2 không kiểm soát tốt. Đường huyết đo tại nhà 450 mg/dL, nôn mửa 5 lần, uống nhiều tiểu nhiều 3 ngày. Hơi thở có mùi acetone. Nghi ngờ nhiễm toan ceto do đái tháo đường. Cần xét nghiệm khí máu động mạch, ketone máu.",
    medicalHistory: ["Đái tháo đường type 2", "Tăng huyết áp", "Béo phì độ II"],
    symptoms: ["Đường huyết 450 mg/dL", "Nôn mửa 5 lần", "Hơi thở mùi acetone", "Uống nhiều tiểu nhiều", "Mệt lả"],
    status: "pending",
  },
  {
    id: "CC-010",
    patientName: "Trịnh Văn Nam",
    age: 37,
    gender: "Nam",
    waitTime: "45 phút",
    urgency: "medium",
    mainSymptom: "Viêm khớp đa ổ, sưng nóng đỏ",
    aiSummary:
      "BN nam 37 tuổi, sưng đau đa khớp (cổ tay, gối, cổ chân) 3 tuần, kèm cứng khớp buổi sáng trên 1 giờ. VS 85 mm/h, CRP 42 mg/L. Nghi ngờ viêm khớp dạng thấp khởi phát. Cần định lượng RF, anti-CCP và chụp X-quang bàn tay.",
    medicalHistory: ["Không tiền sử đặc biệt"],
    symptoms: ["Sưng đau đa khớp", "Cứng khớp buổi sáng >1h", "VS 85 mm/h", "CRP 42 mg/L"],
    status: "pending",
  },
  {
    id: "CC-011",
    patientName: "Lý Thị Bình",
    age: 55,
    gender: "Nữ",
    waitTime: "1 giờ 05 phút",
    urgency: "high",
    mainSymptom: "Suy thận cấp, thiểu niệu",
    aiSummary:
      "BN nữ 55 tuổi, creatinine 5.2 mg/dL (tăng từ 1.1 mg/dL 2 tuần trước), nước tiểu <400 ml/24h. Tiền sử dùng NSAID liều cao 2 tuần. Kali máu 5.8 mEq/L. Nghi ngờ suy thận cấp do thuốc. Cần hội chẩn thận học và đánh giá chỉ định lọc máu.",
    medicalHistory: ["Viêm khớp mãn tính", "Dùng NSAID kéo dài"],
    symptoms: ["Creatinine 5.2 mg/dL", "Thiểu niệu <400ml/24h", "Kali 5.8 mEq/L", "Phù 2 chân", "Mệt mỏi"],
    status: "transferred",
  },
  {
    id: "CC-012",
    patientName: "Cao Văn Thắng",
    age: 48,
    gender: "Nam",
    waitTime: "3 giờ 10 phút",
    urgency: "medium",
    mainSymptom: "Trầm cảm nặng, có ý tưởng tự tử",
    aiSummary:
      "BN nam 48 tuổi, nhập viện theo yêu cầu gia đình. Mất ngủ hoàn toàn 2 tuần, không ăn uống, PHQ-9 = 24 (nặng). Thừa nhận có ý tưởng tự tử nhưng chưa có kế hoạch cụ thể. Cần hội chẩn tâm thần khẩn và đánh giá nguy cơ tự sát theo thang C-SSRS.",
    medicalHistory: ["Trầm cảm tái phát (lần 2)", "Ly hôn 6 tháng trước"],
    symptoms: ["PHQ-9 = 24", "Mất ngủ hoàn toàn", "Không ăn uống", "Ý tưởng tự tử", "Cô lập xã hội"],
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

const PAGE_SIZE_OPTIONS = [3, 5, 10, 20];

export default function ComplexCaseInbox() {
  const [caseList, setCaseList] = useState<ComplexCase[]>(cases);
  const [expandedId, setExpandedId] = useState<string | null>("CC-001");
  const [handoffId, setHandoffId] = useState<string | null>(null);
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<"all" | UrgencyLevel>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const pendingCount = caseList.filter((c) => c.status === "pending").length;
  const criticalCount = caseList.filter((c) => c.urgency === "critical" && c.status === "pending").length;

  const filtered = caseList.filter((c) =>
    filterUrgency === "all" ? true : c.urgency === filterUrgency
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

  const handleFilterChange = (f: "all" | UrgencyLevel) => {
    setFilterUrgency(f);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    setExpandedId(null);
    setPageSizeOpen(false);
  };

  const handleHandoff = (id: string) => {
    setCaseList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "transferred" } : c))
    );
    setHandoffId(null);
  };

  const handleAccept = (id: string) => {
    setCaseList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted" } : c))
    );
    setAcceptId(null);
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (safePage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (safePage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages);
    }
    return pages;
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

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            {(["all", "critical", "high", "medium"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleFilterChange(f)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  filterUrgency === f
                    ? f === "critical"
                      ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                      : f === "high"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                      : f === "medium"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                      : "bg-slate-700 text-white shadow-md shadow-slate-500/25"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f === "all"
                  ? "Tất cả"
                  : f === "critical"
                  ? "Khẩn cấp"
                  : f === "high"
                  ? "Ưu tiên cao"
                  : "Theo dõi"}
              </button>
            ))}
          </div>
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
        {paginated.length === 0 ? (
          <div className="rounded-[1.4rem] border border-slate-100 bg-white px-8 py-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-400">Không có ca bệnh nào phù hợp</p>
          </div>
        ) : (
          paginated.map((c) => {
            const cfg = urgencyConfig[c.urgency];
            const isExpanded = expandedId === c.id;
            const isTransferred = c.status === "transferred";
            const isAccepted = c.status === "accepted";
            const isDone = isTransferred || isAccepted;

            return (
              <div
                key={c.id}
                className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-sm transition-all ${
                  isTransferred ? "border-emerald-200 opacity-75" : isAccepted ? "border-blue-200 opacity-75" : cfg.borderClass
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
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {c.id}
                      </span>
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
                      {isAccepted && (
                        <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          ✓ Đã tiếp nhận
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                      {c.mainSymptom}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Chờ: {c.waitTime}</span>
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
                        {!isDone && (
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
                              onClick={() => setAcceptId(c.id)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-100"
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
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: info + page size selector */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-400">
            Hiển thị{" "}
            <span className="font-semibold text-slate-600">
              {filtered.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + itemsPerPage, filtered.length)}
            </span>{" "}
            trong{" "}
            <span className="font-semibold text-slate-600">{filtered.length}</span> ca
          </p>

          {/* Page size dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPageSizeOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              Hiển thị {itemsPerPage} dòng/trang
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${pageSizeOpen ? "rotate-180" : ""}`}
              />
            </button>

            {pageSizeOpen && (
              <div className="absolute left-0 bottom-[calc(100%+6px)] z-20 min-w-[11rem] overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handlePageSizeChange(size)}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                      size === itemsPerPage
                        ? "bg-rose-50 font-bold text-rose-600"
                        : "font-medium text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {size === itemsPerPage && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    )}
                    <span className={size !== itemsPerPage ? "pl-3.5" : ""}>
                      Hiển thị {size} dòng/trang
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Page controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              type="button"
              onClick={() => { setCurrentPage(1); setExpandedId(null); }}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang đầu"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>

            {/* Prev page */}
            <button
              type="button"
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setExpandedId(null); }}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                >
                  ···
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => { setCurrentPage(page as number); setExpandedId(null); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    safePage === page
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                  aria-label={`Trang ${page}`}
                  aria-current={safePage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )
            )}

            {/* Next page */}
            <button
              type="button"
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); }}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang tiếp"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Last page */}
            <button
              type="button"
              onClick={() => { setCurrentPage(totalPages); setExpandedId(null); }}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang cuối"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
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
                onClick={() => setHandoffId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleHandoff(handoffId)}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all hover:bg-rose-700"
              >
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                Xác nhận chuyển giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {acceptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              onClick={() => setAcceptId(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <User className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Xác nhận tiếp nhận trực tiếp
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Bạn sẽ trực tiếp tiếp nhận và xử lý ca bệnh{" "}
              <strong>{caseList.find((c) => c.id === acceptId)?.patientName}</strong>.{" "}
              Ca bệnh sẽ được gán cho bạn và chuyển sang trạng thái đang xử lý.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setAcceptId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleAccept(acceptId)}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700"
              >
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                Xác nhận tiếp nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
