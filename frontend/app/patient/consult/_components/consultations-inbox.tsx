"use client";

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type TouchEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  Bot,
  CalendarCheck2,
  ChevronRight,
  Clock3,
  FileDown,
  Filter,
  MoreHorizontal,
  PhoneCall,
  Pill,
  Pin,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import {
  buildConsultCase,
  consultCases,
  type ConsultCase,
  type ConsultCaseSeverity,
  type ConsultCaseType,
} from "./consult-case-data";

type StatusBucket = "ongoing" | "completed" | "monitoring" | "emergency";
type SheetState =
  | "filter"
  | "new-case"
  | "case-actions"
  | "case-details"
  | "export-report"
  | "emergency"
  | null;

type FilterState = {
  types: ConsultCaseType[];
  statuses: StatusBucket[];
  severities: ConsultCaseSeverity[];
};

const emptyFilters: FilterState = {
  types: [],
  statuses: [],
  severities: [],
};

const storedConsultCasesKey = "mercy-patient-consult-cases";

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

function persistCreatedConsultCase(newCase: ConsultCase) {
  const storedCases = readStoredConsultCases();
  const nextCases = [
    newCase,
    ...storedCases.filter((caseItem) => caseItem.id !== newCase.id),
  ];

  window.localStorage.setItem(storedConsultCasesKey, JSON.stringify(nextCases));
}

function removeStoredConsultCase(caseId: string) {
  if (typeof window === "undefined") return;

  const nextCases = readStoredConsultCases().filter(
    (caseItem) => caseItem.id !== caseId,
  );
  window.localStorage.setItem(storedConsultCasesKey, JSON.stringify(nextCases));
}

const symptomOptions = [
  "Đau đầu",
  "Ho",
  "Sốt",
  "Đau ngực",
  "Khó thở",
  "Đau bụng",
];

const supportOptions = [
  {
    key: "symptom",
    icon: AlertTriangle,
    title: "Tôi đang có triệu chứng",
    subtitle: "AI hỏi triage và tạo consultation theo triệu chứng",
  },
  {
    key: "condition",
    icon: Bot,
    title: "Muốn hỏi về bệnh",
    subtitle: "Đặt câu hỏi về bệnh hoặc tình trạng đang theo dõi",
  },
  {
    key: "medicine",
    icon: Pill,
    title: "Hỏi về thuốc",
    subtitle: "Kiểm tra cách dùng, lưu ý và tác dụng phụ",
  },
  {
    key: "lab",
    icon: FileDown,
    title: "Muốn đọc kết quả xét nghiệm",
    subtitle: "Tải PDF hoặc hình ảnh kết quả để AI đọc sơ bộ",
  },
  {
    key: "doctor",
    icon: Stethoscope,
    title: "Muốn gặp bác sĩ",
    subtitle: "Tạo case kết nối bác sĩ theo chuyên khoa",
  },
  {
    key: "other",
    icon: MoreHorizontal,
    title: "Khác",
    subtitle: "Mô tả tự do để AI tạo consultation phù hợp",
  },
];

const specialtyOptions = [
  "Tim mạch",
  "Thần kinh",
  "Hô hấp",
  "Nội tổng quát",
  "Tai Mũi Họng",
];

function getCaseIcon(type: ConsultCase["type"]) {
  if (type === "doctor") return Stethoscope;
  if (type === "emergency") return AlertTriangle;
  return Bot;
}

function getStatusBucket(caseItem: ConsultCase): StatusBucket {
  const status = caseItem.status.toLowerCase();

  if (caseItem.type === "emergency" || caseItem.severity === "high") {
    return "emergency";
  }

  if (status.includes("hoàn") || status.includes("completed")) {
    return "completed";
  }

  if (status.includes("theo dõi") || status.includes("monitor")) {
    return "monitoring";
  }

  return "ongoing";
}

function getSeverityRank(severity: ConsultCaseSeverity) {
  if (severity === "high") return 0;
  if (severity === "medium") return 1;
  return 2;
}

function assessmentLabel(severity: ConsultCaseSeverity) {
  if (severity === "high") return "Nguy cơ cao";
  if (severity === "medium") return "Nguy cơ trung bình";
  return "Nguy cơ thấp";
}

function isFilterActive(filters: FilterState) {
  return (
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.severities.length > 0
  );
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export default function ConsultationsInbox() {
  const router = useRouter();
  const [cases, setCases] = useState<ConsultCase[]>(consultCases);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [selectedCase, setSelectedCase] = useState<ConsultCase | null>(null);
  const [pinnedCaseIds, setPinnedCaseIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedCases = readStoredConsultCases();
    if (storedCases.length === 0) return;

    setCases([
      ...storedCases,
      ...consultCases.filter(
        (caseItem) =>
          !storedCases.some((storedCase) => storedCase.id === caseItem.id),
      ),
    ]);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const sortedCases = useMemo(
    () =>
      [...cases].sort(
        (a, b) =>
          Number(pinnedCaseIds.includes(b.id)) -
            Number(pinnedCaseIds.includes(a.id)) ||
          getSeverityRank(a.severity) - getSeverityRank(b.severity),
      ),
    [cases, pinnedCaseIds],
  );

  const filteredCases = useMemo(() => {
    const query = normalize(debouncedSearch);

    return sortedCases.filter((caseItem) => {
      const statusBucket = getStatusBucket(caseItem);
      const matchesSearch =
        !query ||
        normalize(caseItem.title).includes(query) ||
        normalize(caseItem.status).includes(query) ||
        caseItem.tag?.toLowerCase().includes(query);
      const matchesType =
        filters.types.length === 0 || filters.types.includes(caseItem.type);
      const matchesStatus =
        filters.statuses.length === 0 ||
        filters.statuses.includes(statusBucket);
      const matchesSeverity =
        filters.severities.length === 0 ||
        filters.severities.includes(caseItem.severity);

      return matchesSearch && matchesType && matchesStatus && matchesSeverity;
    });
  }, [debouncedSearch, filters, sortedCases]);

  const emergencyExists = cases.some(
    (caseItem) => caseItem.severity === "high",
  );

  const summary = useMemo(() => {
    const total = cases.length;
    const urgent = cases.filter((c) => c.severity === "high").length;
    const monitoring = cases.filter(
      (c) =>
        c.severity !== "high" &&
        getStatusBucket(c) !== "completed",
    ).length;
    const stable = cases.filter((c) => c.severity !== "high").length;
    return { total, urgent, monitoring, stable };
  }, [cases]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const openCase = (caseItem: ConsultCase) => {
    if (caseItem.severity === "high") {
      setSelectedCase(caseItem);
      setSheet("emergency");
      return;
    }

    const isCompleted = getStatusBucket(caseItem) === "completed";
    router.push(
      isCompleted
        ? `/patient/consult/${caseItem.id}?review=1`
        : `/patient/consult/${caseItem.id}`,
    );
  };

  const openChat = (caseItem: ConsultCase) => {
    const isCompleted = getStatusBucket(caseItem) === "completed";
    router.push(
      isCompleted
        ? `/patient/consult/${caseItem.id}?review=1`
        : `/patient/consult/${caseItem.id}`,
    );
  };

  const createCase = (mode: ConsultCaseType, topic?: string) => {
    const caseId = `${mode}-${Date.now()}`;
    const newCase = buildConsultCase(caseId, {
      mode,
      topic,
      emergency: mode === "emergency",
    });

    persistCreatedConsultCase(newCase);
    setCases((current) => [newCase, ...current]);
    setSheet(null);
    router.push(
      `/patient/consult/${caseId}?mode=${mode}${topic ? `&topic=${encodeURIComponent(topic)}` : ""}${mode === "emergency" ? "&emergency=1" : ""}`,
    );
  };

  const deleteCase = (caseId: string) => {
    removeStoredConsultCase(caseId);
    setCases((current) => current.filter((caseItem) => caseItem.id !== caseId));
    setSheet(null);
    showToast("Đã xóa ca tư vấn");
  };

  const archiveCase = (caseId: string) => {
    setCases((current) => current.filter((caseItem) => caseItem.id !== caseId));
    showToast("Đã lưu trữ ca tư vấn");
  };

  const pinCase = (caseId: string) => {
    setPinnedCaseIds((current) =>
      current.includes(caseId) ? current : [caseId, ...current],
    );
    setCases((current) => {
      const target = current.find((caseItem) => caseItem.id === caseId);
      if (!target) return current;
      return [target, ...current.filter((caseItem) => caseItem.id !== caseId)];
    });
    setSheet(null);
    showToast("Đã ghim ca tư vấn");
  };

  const renameCase = (caseItem: ConsultCase) => {
    const nextTitle = window.prompt("Tên mới của ca tư vấn", caseItem.title);
    if (!nextTitle?.trim()) return;

    setCases((current) =>
      current.map((item) =>
        item.id === caseItem.id ? { ...item, title: nextTitle.trim() } : item,
      ),
    );
    setSheet(null);
  };

  const openActions = (caseItem: ConsultCase) => {
    setSelectedCase(caseItem);
    setSheet("case-actions");
  };

  return (
    <main className="relative flex h-full min-h-0 bg-[#edf6fb] px-2 py-2 sm:px-4 sm:py-5">
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#dbeaf1] bg-[#f8fbfd] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <Header
          searchOpen={searchOpen}
          searchInput={searchInput}
          filtersActive={isFilterActive(filters)}
          onSearchOpen={() => setSearchOpen(true)}
          onSearchClose={() => {
            setSearchOpen(false);
            setSearchInput("");
          }}
          onSearchChange={setSearchInput}
          onFilterOpen={() => setSheet("filter")}
        />

        <div className="px-4 pt-4">
          <div className="mb-3 rounded-2xl border border-[#e6f3f0] bg-white px-4 py-3">
            <p className="text-[13px] font-semibold text-[#10233f]">
              Sức khỏe của bạn
            </p>
            <div className="mt-2 flex items-center gap-3 text-[13px] text-[#475569]">
              <span className="font-semibold text-[#dc2626]">
                {summary.urgent} cần chú ý
              </span>
              <span className="text-[#334155">
                {summary.monitoring} đang theo dõi
              </span>
              <span className="text-[#065f46]">{summary.stable} ổn định</span>
            </div>
          </div>

          <PrimaryCTAButton onClick={() => setSheet("new-case")} />
        </div>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
          {loading ? <LoadingSkeleton /> : null}

          {!loading && error ? (
            <ErrorState message={error} onRetry={() => setError(null)} />
          ) : null}

          {!loading && !error && filteredCases.length === 0 ? (
            debouncedSearch || isFilterActive(filters) ? (
              <EmptySearchState
                onReset={() => {
                  setSearchInput("");
                  setFilters(emptyFilters);
                }}
              />
            ) : (
              <EmptyState onCreate={() => setSheet("new-case")} />
            )
          ) : null}

          {!loading && !error && filteredCases.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#334155]">
                  {filteredCases.length} ca tư vấn
                </p>
                <p className="text-[12px] font-medium text-[#64748b]">
                  Ca khẩn luôn ở đầu
                </p>
              </div>

              <div className="space-y-3">
                {filteredCases.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    caseItem={caseItem}
                    onPress={openCase}
                    onLongPress={openActions}
                    onDelete={deleteCase}
                    onArchive={archiveCase}
                    onBook={() => router.push("/patient/appointments")}
                    onContactDoctor={() =>
                      router.push("/patient/consult/new?mode=doctor")
                    }
                    pinned={pinnedCaseIds.includes(caseItem.id)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </section>
        {/* Floating emergency FAB inside the rounded panel (mobile-friendly) */}
        <EmergencyFAB
          highlighted={false}
          onClick={() => setSheet("emergency")}
        />
      </div>

      {sheet ? (
        <BottomSheet onClose={() => setSheet(null)}>
          {sheet === "filter" ? (
            <FilterBottomSheet
              filters={filters}
              onApply={(nextFilters) => {
                setFilters(nextFilters);
                setSheet(null);
              }}
              onReset={() => {
                setFilters(emptyFilters);
                setSheet(null);
              }}
            />
          ) : null}

          {sheet === "new-case" ? (
            <NewCaseSheet
              onCreate={createCase}
              onEmergency={() => {
                setSelectedCase(null);
                setSheet("emergency");
              }}
            />
          ) : null}

          {sheet === "case-actions" && selectedCase ? (
            <CaseActionsSheet
              caseItem={selectedCase}
              onPin={() => pinCase(selectedCase.id)}
              onExport={() => setSheet("export-report")}
              onDelete={() => deleteCase(selectedCase.id)}
            />
          ) : null}

          {sheet === "export-report" && selectedCase ? (
            <ExportReportSheet
              caseItem={selectedCase}
              onExport={(format) => {
                setSheet(null);
                showToast(`Đã xuất báo cáo ${format.toUpperCase()} thành công`);
              }}
            />
          ) : null}

          {sheet === "case-details" && selectedCase ? (
            <CaseDetailsSheet
              caseItem={selectedCase}
              onOpenChat={() => openChat(selectedCase)}
            />
          ) : null}

          {sheet === "emergency" ? (
            <EmergencySheet
              caseItem={selectedCase}
              onUrgentAi={() => createCase("emergency", "Hỗ trợ khẩn")}
              onConnectDoctor={() =>
                router.push("/patient/consult/new?mode=doctor&emergency=1")
              }
              onCall={() => {
                window.location.href = "tel:115";
              }}
              onOpenChat={() => {
                if (selectedCase) {
                  openChat(selectedCase);
                }
              }}
            />
          ) : null}
        </BottomSheet>
      ) : null}

      {toast ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#10233f] px-4 py-2 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function Header({
  searchOpen,
  searchInput,
  filtersActive,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  onFilterOpen,
}: {
  searchOpen: boolean;
  searchInput: string;
  filtersActive: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (value: string) => void;
  onFilterOpen: () => void;
}) {
  return (
    <header className="border-b border-[#e3edf3] bg-white px-4 pb-4 pt-4">
      {searchOpen ? (
        <SearchBar
          value={searchInput}
          onChange={onSearchChange}
          onClose={onSearchClose}
        />
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[25px] font-bold leading-tight text-[#10233f]">
              Tư vấn của tôi
            </h1>
            <p className="mt-1 text-[14px] leading-5 text-[#64748b]">
              Quản lý các vấn đề sức khỏe theo từng ca bệnh
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <IconButton label="Tìm kiếm" icon={Search} onClick={onSearchOpen} />
            <IconButton
              label="Bộ lọc"
              icon={Filter}
              onClick={onFilterOpen}
              active={filtersActive}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function SearchBar({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex min-h-11 flex-1 items-center gap-2 rounded-2xl border border-[#d8e7ef] bg-[#f8fbfd] px-3">
        <Search className="h-5 w-5 text-[#64748b]" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoFocus
          placeholder="Tìm theo triệu chứng, tag, trạng thái..."
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#10233f] outline-none placeholder:text-[#94a3b8]"
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng tìm kiếm"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function PrimaryCTAButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between rounded-[22px] bg-[#16a34a] px-4 py-4 text-left text-white shadow-[0_18px_32px_rgba(22,163,74,0.22)] transition hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Plus className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[16px] font-semibold">
            Bắt đầu tư vấn mới
          </span>
          <span className="mt-0.5 block text-[12px] text-white/80">
            Chọn AI, bác sĩ hoặc chế độ khẩn
          </span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-white/90" />
    </button>
  );
}

const CaseCard = memo(function CaseCard({
  caseItem,
  pinned,
  onPress,
  onLongPress,
  onDelete,
  onArchive,
  onBook,
  onContactDoctor,
}: {
  caseItem: ConsultCase;
  pinned: boolean;
  onPress: (caseItem: ConsultCase) => void;
  onLongPress: (caseItem: ConsultCase) => void;
  onDelete: (caseId: string) => void;
  onArchive: (caseId: string) => void;
  onBook: () => void;
  onContactDoctor: () => void;
}) {
  const [swipeMode, setSwipeMode] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const didLongPress = useRef(false);
  const Icon = getCaseIcon(caseItem.type);
  const isEmergency = caseItem.severity === "high";
  const isCompleted = getStatusBucket(caseItem) === "completed";

  const startLongPress = () => {
    didLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      didLongPress.current = true;
      onLongPress(caseItem);
    }, 550);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    startLongPress();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    clearLongPress();
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX == null || endX == null) return;

    const delta = endX - startX;
    if (delta < -54) {
      setSwipeMode("left");
    } else if (delta > 54) {
      setSwipeMode("right");
    }
  };

  const handlePress = () => {
    if (didLongPress.current) return;
    if (swipeMode) {
      setSwipeMode(null);
      return;
    }

    onPress(caseItem);
  };

  return (
    <article
      className={`rounded-[24px] border p-4 transition duration-200 ${
        pinned
          ? "border-[#bbf7d0] bg-white shadow-[0_18px_38px_rgba(22,163,74,0.16)] translate-y-[-2px] ring-2 ring-[#bbf7d0]/70"
          : isEmergency
          ? "border-[#fecaca] bg-[#fff7f7] shadow-[0_12px_30px_rgba(239,68,68,0.08)]"
          : getStatusBucket(caseItem) === "monitoring"
            ? "border-[#fde68a] bg-[#fffbeb] shadow-[0_10px_24px_rgba(245,158,11,0.08)]"
            : "border-[#d8e7ef] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
      }${isCompleted ? " opacity-70" : ""}`}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress(caseItem);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={clearLongPress}
    >
      <button
        type="button"
        onClick={handlePress}
        className="group w-full text-left"
        aria-label={`Mở chi tiết ca tư vấn ${caseItem.title}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isEmergency
                ? "animate-pulse bg-[#fee2e2] text-[#dc2626]"
                : caseItem.type === "doctor"
                  ? "bg-[#dcfce7] text-[#16a34a]"
                  : "bg-[#ecfdf3] text-[#16a34a]"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[17px] font-semibold text-[#10233f]">
                  {caseItem.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#64748b]">
                  {caseItem.messages[caseItem.messages.length - 1]?.text ||
                    caseItem.subtitle}
                </p>
              </div>
              <button
                type="button"
                aria-label="Mở tác vụ ca tư vấn"
                onClick={(event) => {
                  event.stopPropagation();
                  onLongPress(caseItem);
                }}
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-[#f1f5f9] active:scale-95"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={getStatusBucket(caseItem)}
                label={caseItem.status}
              />
              {/* AI insight badge */}
              <span className="rounded-full border border-[#e6f3f0] bg-[#f0fdfa] px-3 py-1 text-[11px] font-semibold text-[#065f46]">
                AI đánh giá: {assessmentLabel(caseItem.severity)}
              </span>
              {getStatusBucket(caseItem) === "monitoring" ? (
                <span className="rounded-full border border-[#f0ead6] bg-[#fffdf0] px-3 py-1 text-[11px] font-semibold text-[#92400e]">
                  🔔 Theo dõi sau tư vấn
                </span>
              ) : null}
              <span className="flex items-center gap-1 rounded-full border border-[#d8e7ef] bg-white px-3 py-1 text-[11px] font-medium text-[#64748b]">
                <Clock3 className="h-3.5 w-3.5" />
                {caseItem.time}
              </span>
              {caseItem.tag ? <TagChip label={caseItem.tag} /> : null}
              <TagChip label={caseItem.typeLabel} />
            </div>
          </div>
        </div>
      </button>

      {/* Primary CTA for chat-first flow */}
      <div className="mt-3 flex items-center justify-end">
        {isCompleted ? (
          <button
            type="button"
            onClick={() => onPress(caseItem)}
            className="min-h-11 rounded-2xl bg-[#f1f5f9] px-4 py-2 text-sm font-semibold text-[#475569] border border-[#e6e9ee] shadow-none"
          >
            Xem lại đoạn chat
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPress(caseItem)}
            className="min-h-11 rounded-2xl bg-[#0ea5a4] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            💬 Tiếp tục tư vấn
          </button>
        )}
      </div>

      {swipeMode === "left" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SwipeAction
            icon={Archive}
            label="Lưu trữ"
            onClick={() => onArchive(caseItem.id)}
          />
          <SwipeAction
            icon={Trash2}
            label="Xóa"
            danger
            onClick={() => onDelete(caseItem.id)}
          />
        </div>
      ) : null}

      {swipeMode === "right" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SwipeAction
            icon={CalendarCheck2}
            label="Đặt lịch"
            onClick={onBook}
          />
          <SwipeAction
            icon={Stethoscope}
            label="Bác sĩ"
            onClick={onContactDoctor}
          />
        </div>
      ) : null}
    </article>
  );
});

function StatusBadge({
  status,
  label,
}: {
  status: StatusBucket;
  label: string;
}) {
  const classes = {
    ongoing: "bg-[#ecfdf3] text-[#16a34a]",
    completed: "bg-[#f1f5f9] text-[#475569]",
    monitoring: "bg-[#fef3c7] text-[#b45309]",
    emergency: "bg-[#fee2e2] text-[#dc2626]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${classes[status]}`}
    >
      {label}
    </span>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[#d8e7ef] bg-[#f8fbfd] px-3 py-1 text-[11px] font-medium text-[#64748b]">
      {label}
    </span>
  );
}

function SwipeAction({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl text-[13px] font-semibold ${
        danger ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#ecfdf3] text-[#16a34a]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  active = false,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition active:scale-95 ${
        active
          ? "border-[#bbf7d0] bg-[#ecfdf3] text-[#16a34a]"
          : "border-[#d8e7ef] bg-white text-[#64748b]"
      }`}
    >
      <Icon className="h-5 w-5" />
      {active ? (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#16a34a]" />
      ) : null}
    </button>
  );
}

function FilterBottomSheet({
  filters,
  onApply,
  onReset,
}: {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<FilterState>(filters);

  const toggle = <T extends keyof FilterState>(
    key: T,
    value: FilterState[T][number],
  ) => {
    setDraft((current) => {
      const values = current[key] as string[];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return { ...current, [key]: nextValues };
    });
  };

  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Bộ lọc" title="Lọc ca tư vấn" />
      <FilterGroup title="Loại tư vấn">
        <FilterPill
          active={draft.types.includes("ai")}
          label="AI cases"
          onClick={() => toggle("types", "ai")}
        />
        <FilterPill
          active={draft.types.includes("doctor")}
          label="Doctor cases"
          onClick={() => toggle("types", "doctor")}
        />
        <FilterPill
          active={draft.types.includes("emergency")}
          label="Emergency cases"
          tone="danger"
          onClick={() => toggle("types", "emergency")}
        />
      </FilterGroup>
      <FilterGroup title="Trạng thái">
        <FilterPill
          active={draft.statuses.includes("ongoing")}
          label="Đang tư vấn"
          onClick={() => toggle("statuses", "ongoing")}
        />
        <FilterPill
          active={draft.statuses.includes("monitoring")}
          label="Cần theo dõi"
          tone="warning"
          onClick={() => toggle("statuses", "monitoring")}
        />
        <FilterPill
          active={draft.statuses.includes("completed")}
          label="Hoàn thành"
          onClick={() => toggle("statuses", "completed")}
        />
        <FilterPill
          active={draft.statuses.includes("emergency")}
          label="Khẩn cấp"
          tone="danger"
          onClick={() => toggle("statuses", "emergency")}
        />
      </FilterGroup>
      <FilterGroup title="Mức độ">
        <FilterPill
          active={draft.severities.includes("low")}
          label="Low"
          onClick={() => toggle("severities", "low")}
        />
        <FilterPill
          active={draft.severities.includes("medium")}
          label="Medium"
          tone="warning"
          onClick={() => toggle("severities", "medium")}
        />
        <FilterPill
          active={draft.severities.includes("high")}
          label="High"
          tone="danger"
          onClick={() => toggle("severities", "high")}
        />
      </FilterGroup>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="min-h-11 flex-1 rounded-2xl bg-[#16a34a] text-sm font-semibold text-white"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 rounded-2xl border border-[#d8e7ef] bg-white px-5 text-sm font-semibold text-[#334155]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[13px] font-semibold text-[#334155]">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  tone = "normal",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "normal" | "warning" | "danger";
}) {
  const activeClass =
    tone === "danger"
      ? "border-[#fecaca] bg-[#fee2e2] text-[#dc2626]"
      : tone === "warning"
        ? "border-[#fde68a] bg-[#fef3c7] text-[#b45309]"
        : "border-[#bbf7d0] bg-[#ecfdf3] text-[#16a34a]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-[13px] font-semibold ${
        active ? activeClass : "border-[#d8e7ef] bg-white text-[#64748b]"
      }`}
    >
      {label}
    </button>
  );
}

function NewCaseSheet({
  onCreate,
  onEmergency,
}: {
  onCreate: (mode: ConsultCaseType, topic?: string) => void;
  onEmergency: () => void;
}) {
  const [step, setStep] = useState<
    "support" | "symptom" | "doctor" | "upload" | "free-text"
  >("support");
  const [supportTitle, setSupportTitle] = useState("Tư vấn mới");
  const [freeText, setFreeText] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredSymptoms = symptomOptions.filter((symptom) =>
    symptom.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  const createFreeTextCase = () => {
    const topic = freeText.trim();
    if (!topic) return;
    onCreate("ai", topic);
  };

  if (step === "support") {
    return (
      <div className="pr-9">
        <SheetTitle
          eyebrow="Bắt đầu tư vấn mới"
          title="Hôm nay bạn cần hỗ trợ gì?"
        />
        <div className="mt-4 grid gap-2">
          {supportOptions.map((option) => (
            <ChoiceButton
              key={option.key}
              icon={option.icon}
              title={option.title}
              subtitle={option.subtitle}
              onClick={() => {
                setSupportTitle(option.title);
                if (option.key === "symptom") setStep("symptom");
                if (option.key === "doctor") onCreate("doctor", "Gặp bác sĩ");
                if (option.key === "lab") onCreate("ai", "Đọc kết quả xét nghiệm");
                if (option.key === "condition") onCreate("ai", "Hỏi về bệnh");
                if (option.key === "medicine") {
                  onCreate("ai", "Tư vấn thuốc");
                }
                if (option.key === "other") onCreate("ai", "Khác");
              }}
            />
          ))}
          <ChoiceButton
            icon={AlertTriangle}
            title="Emergency case"
            subtitle="Ưu tiên hỗ trợ khẩn"
            danger
            onClick={() => onCreate("emergency", "Emergency case")}
          />
        </div>
      </div>
    );
  }

  if (step === "symptom") {
    return (
      <div className="pr-9">
        <button
          type="button"
          onClick={() => setStep("support")}
          className="mb-3 text-[13px] font-semibold text-[#64748b]"
        >
          Quay lại
        </button>
        <SheetTitle eyebrow="Triệu chứng" title="Bạn đang gặp vấn đề gì?" />
        <div className="mt-4 rounded-2xl border border-[#d8e7ef] bg-[#f8fbfd] px-3 py-3">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Nhập triệu chứng"
            className="w-full bg-transparent text-[14px] text-[#10233f] outline-none placeholder:text-[#94a3b8]"
          />
        </div>
        <div className="mt-4 grid gap-2">
          {(filteredSymptoms.length ? filteredSymptoms : symptomOptions).map((symptom) => (
            <ChoiceButton
              key={symptom}
              icon={Bot}
              title={symptom}
              subtitle="AI tạo consultation và hỏi triage ngay"
              onClick={() => onCreate("ai", symptom)}
            />
          ))}
        </div>
        {searchText.trim() &&
        !symptomOptions.some(
          (symptom) => symptom.toLowerCase() === searchText.trim().toLowerCase(),
        ) ? (
          <button
            type="button"
            onClick={() => onCreate("ai", searchText.trim())}
            className="mt-3 min-h-11 w-full rounded-2xl bg-[#16a34a] text-sm font-semibold text-white"
          >
            Tạo consultation cho "{searchText.trim()}"
          </button>
        ) : null}
      </div>
    );
  }

  if (step === "doctor") {
    return (
      <div className="pr-9">
        <button
          type="button"
          onClick={() => setStep("support")}
          className="mb-3 text-[13px] font-semibold text-[#64748b]"
        >
          Quay lại
        </button>
        <SheetTitle eyebrow="Gặp bác sĩ" title="Chọn chuyên khoa" />
        <div className="mt-4 grid gap-2">
          {specialtyOptions.map((specialty) => (
            <ChoiceButton
              key={specialty}
              icon={Stethoscope}
              title={specialty}
              subtitle="Tạo case với bác sĩ chuyên khoa"
              onClick={() => onCreate("doctor", specialty)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === "upload") {
    return (
      <div className="pr-9">
        <button
          type="button"
          onClick={() => setStep("support")}
          className="mb-3 text-[13px] font-semibold text-[#64748b]"
        >
          Quay lại
        </button>
        <SheetTitle eyebrow="Kết quả xét nghiệm" title="Bạn muốn AI đọc loại nào?" />
        <div className="mt-4 grid gap-2">
          <ChoiceButton
            icon={FileDown}
            title="PDF kết quả xét nghiệm"
            subtitle="Tạo consultation đọc kết quả xét nghiệm"
            onClick={() => onCreate("ai", "Đánh giá xét nghiệm máu")}
          />
          <ChoiceButton
            icon={FileDown}
            title="Hình ảnh kết quả"
            subtitle="Tạo case để tải ảnh trong màn chat"
            onClick={() => onCreate("ai", "Đọc hình ảnh kết quả xét nghiệm")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pr-9">
      <button
        type="button"
        onClick={() => setStep("support")}
        className="mb-3 text-[13px] font-semibold text-[#64748b]"
      >
        Quay lại
      </button>
      <SheetTitle eyebrow={supportTitle} title="Mô tả điều bạn muốn hỏi" />
        <div className="mt-4 rounded-2xl border border-[#d8e7ef] bg-[#f8fbfd] p-3">
        <input
          value={freeText}
          onChange={(event) => setFreeText(event.target.value)}
          placeholder="Ví dụ: Tôi muốn hỏi về viêm xoang, đau dạ dày, cách dùng thuốc..."
          className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#94a3b8]"
        />
      </div>
      <button
        type="button"
        disabled={!freeText.trim()}
        onClick={createFreeTextCase}
        className="mt-3 min-h-11 w-full rounded-2xl bg-[#16a34a] text-sm font-semibold text-white disabled:bg-[#d8e7ef] disabled:text-[#94a3b8]"
      >
        Tạo consultation
      </button>
    </div>
  );
}

function CaseActionsSheet({
  caseItem,
  onPin,
  onExport,
  onDelete,
}: {
  caseItem: ConsultCase;
  onPin: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Tác vụ ca bệnh" title={caseItem.title} />
      <div className="mt-4 grid gap-2">
        <ActionButton icon={Pin} label="Ghim ca" onClick={onPin} />
        <ActionButton icon={FileDown} label="Xuất báo cáo" onClick={onExport} />
        <ActionButton icon={Trash2} label="Xóa ca" danger onClick={onDelete} />
      </div>
    </div>
  );
}

function ExportReportSheet({
  caseItem,
  onExport,
}: {
  caseItem: ConsultCase;
  onExport: (format: "pdf" | "png" | "csv") => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Xuất báo cáo" title={caseItem.title} />
      <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
        Chọn định dạng báo cáo bạn muốn xuất.
      </p>
      <div className="mt-4 grid gap-2">
        <ActionButton
          icon={FileDown}
          label="Xuất dạng PDF"
          onClick={() => onExport("pdf")}
        />
        <ActionButton
          icon={FileDown}
          label="Xuất dạng PNG"
          onClick={() => onExport("png")}
        />
        <ActionButton
          icon={FileDown}
          label="Xuất dữ liệu CSV"
          onClick={() => onExport("csv")}
        />
      </div>
    </div>
  );
}

function CaseDetailsSheet({
  caseItem,
  onOpenChat,
}: {
  caseItem: ConsultCase;
  onOpenChat: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Chi tiết ca tư vấn" title={caseItem.title} />
      <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
        {caseItem.subtitle}
      </p>
      <div className="mt-4 grid gap-2 text-[14px]">
        <InfoRow label="Loại" value={caseItem.typeLabel} />
        <InfoRow label="Trạng thái" value={caseItem.status} />
        <InfoRow label="Mức độ" value={caseItem.severity} />
        <InfoRow label="Tag" value={caseItem.tag ?? "Chưa xác định"} />
      </div>
      <button
        type="button"
        onClick={onOpenChat}
        className="mt-4 min-h-11 w-full rounded-2xl bg-[#16a34a] text-sm font-semibold text-white"
      >
        Mở chat chi tiết
      </button>
    </div>
  );
}

function EmergencySheet({
  caseItem,
  onUrgentAi,
  onConnectDoctor,
  onCall,
  onOpenChat,
}: {
  caseItem: ConsultCase | null;
  onUrgentAi: () => void;
  onConnectDoctor: () => void;
  onCall: () => void;
  onOpenChat: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle
        eyebrow="Emergency support"
        title={caseItem ? caseItem.title : "Hỗ trợ khẩn"}
        danger
      />
      <p className="mt-2 text-[14px] leading-6 text-[#7f1d1d]">
        Nếu có đau ngực dữ dội, khó thở, ngất hoặc chảy máu nhiều, hãy gọi cấp
        cứu ngay.
      </p>
      <div className="mt-4 grid gap-2">
        {caseItem ? (
          <ActionButton
            icon={AlertTriangle}
            label="Mở chat khẩn"
            onClick={onOpenChat}
          />
        ) : null}
        <ActionButton
          icon={Bot}
          label="AI urgent help"
          onClick={onUrgentAi}
          danger
        />
        <ActionButton
          icon={Stethoscope}
          label="Connect doctor"
          onClick={onConnectDoctor}
        />
        <ActionButton
          icon={PhoneCall}
          label="Call emergency 115"
          onClick={onCall}
          danger
        />
      </div>
    </div>
  );
}

function EmergencyFAB({
  highlighted,
  onClick,
}: {
  highlighted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Mở hỗ trợ khẩn"
      onClick={onClick}
      // absolute inside the rounded panel so it floats within the UI on mobile
      className={`emergency-fab-motion absolute right-6 bottom-6 sm:bottom-8 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(220,38,38,0.18)] transition ${
        highlighted ? "animate-pulse bg-[#dc2626]" : "bg-[#fb923c]"
      }`}
      // raised by additional 6px above safe-area/footer
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 6px) + 3rem - 2px)",
      }}
    >
      <AlertTriangle className="h-6 w-6" />
    </button>
  );
}

function BottomSheet({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fbfd] text-[#64748b]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function SheetTitle({
  eyebrow,
  title,
  danger = false,
}: {
  eyebrow: string;
  title: string;
  danger?: boolean;
}) {
  return (
    <>
      <p
        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
          danger ? "text-[#dc2626]" : "text-[#16a34a]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-1 text-[20px] font-bold ${
          danger ? "text-[#991b1b]" : "text-[#10233f]"
        }`}
      >
        {title}
      </h2>
    </>
  );
}

function ChoiceButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 text-left ${
        danger
          ? "border-[#fecaca] bg-[#fff5f5] text-[#991b1b]"
          : "border-[#d8e7ef] bg-[#f8fbfd] text-[#10233f]"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#16a34a]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[14px] font-semibold">{title}</span>
        <span className="text-[12px] text-[#64748b]">{subtitle}</span>
      </span>
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold ${
        danger
          ? "bg-[#fee2e2] text-[#dc2626]"
          : "border border-[#d8e7ef] bg-[#f8fbfd] text-[#334155]"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8fbfd] px-3 py-2">
      <span className="text-[#64748b]">{label}</span>
      <span className="text-right font-semibold text-[#10233f]">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-[24px] border border-[#d8e7ef] bg-white"
        />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf3] text-[#16a34a]">
        <Stethoscope className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-[20px] font-semibold text-[#10233f]">
        Bạn chưa có tư vấn nào
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-6 text-[#64748b]">
        Tạo một case mới để lưu lại từng vấn đề sức khỏe, theo dõi tiến trình và
        quay lại sau dễ dàng.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#16a34a] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(22,163,74,0.22)]"
      >
        <Plus className="h-4.5 w-4.5" />
        Bắt đầu tư vấn đầu tiên
      </button>
    </div>
  );
}

function EmptySearchState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]">
        <Search className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-[#10233f]">
        Không tìm thấy ca tư vấn
      </h2>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 min-h-10 rounded-full border border-[#d8e7ef] bg-white px-4 text-sm font-semibold text-[#334155]"
      >
        Xóa tìm kiếm và bộ lọc
      </button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[#fecaca] bg-[#fff5f5] p-4 text-center">
      <p className="text-sm font-semibold text-[#991b1b]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 min-h-10 rounded-full bg-[#dc2626] px-4 text-sm font-semibold text-white"
      >
        Thử lại
      </button>
    </div>
  );
}
