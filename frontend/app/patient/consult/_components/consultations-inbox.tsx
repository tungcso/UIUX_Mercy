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
  CalendarDays,
  ChevronRight,
  Clock3,
  FileDown,
  Filter,
  MessageCircle,
  MoreHorizontal,
  PhoneCall,
  Pill,
  Pin,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  Video,
  X,
  Activity,
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
  | "online-consult"
  | "doctor-match"
  | "doctor-directory"
  | null;

type ConsultTab = "cases" | "doctor";
type AppointmentMode = "Online" | "Offline";
type OnlineConsultType = "Chat" | "Gọi thoại" | "Video call";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  consults: string;
  availability: string;
  lastConsult?: string;
};

type OnlineConsult = {
  id: string;
  doctorName: string;
  specialty: string;
  type: OnlineConsultType;
  date: string;
  status: "Đang kết nối" | "Hoàn thành";
};

const doctorSpecialties = [
  "Tất cả",
  "Tim mạch",
  "Hô hấp",
  "Thần kinh",
  "Da liễu",
  "Nhi khoa",
];

const onlineConsultOptions: Array<{
  type: OnlineConsultType;
  responseTime: string;
  description: string;
}> = [
  {
    type: "Chat",
    responseTime: "~5 phút",
    description: "Nhắn tin với bác sĩ phù hợp",
  },
  {
    type: "Gọi thoại",
    responseTime: "10-15 phút",
    description: "Trao đổi nhanh bằng cuộc gọi",
  },
  {
    type: "Video call",
    responseTime: "15-30 phút",
    description: "Tư vấn trực tiếp qua video",
  },
];

const doctorsList: Doctor[] = [
  {
    id: "doctor-nguyen-a",
    name: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    rating: "4.9",
    consults: "2000 lượt tư vấn",
    availability: "Online",
    lastConsult: "24/07",
  },
  {
    id: "doctor-tran-b",
    name: "BS Trần Thị B",
    specialty: "Hô hấp",
    rating: "4.8",
    consults: "1500 lượt tư vấn",
    availability: "Online hôm nay",
    lastConsult: "15/06",
  },
  {
    id: "doctor-le-c",
    name: "BS Lê Minh C",
    specialty: "Thần kinh",
    rating: "4.9",
    consults: "980 lượt tư vấn",
    availability: "Phản hồi 15 phút",
  },
  {
    id: "doctor-pham-d",
    name: "BS Phạm Thu D",
    specialty: "Da liễu",
    rating: "4.7",
    consults: "860 lượt tư vấn",
    availability: "Online",
  },
  {
    id: "doctor-hoang-e",
    name: "BS Hoàng Anh E",
    specialty: "Nhi khoa",
    rating: "4.8",
    consults: "1200 lượt tư vấn",
    availability: "Online hôm nay",
  },
];

const initialOnlineConsults: OnlineConsult[] = [
  {
    id: "online-chat-cardio",
    doctorName: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    type: "Chat",
    date: "24/07",
    status: "Hoàn thành",
  },
];

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
  const [activeTab, setActiveTab] = useState<ConsultTab>("cases");
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

  // Doctor tab state
  const [onlineConsults, setOnlineConsults] = useState<OnlineConsult[]>(initialOnlineConsults);
  const [doctorFilter, setDoctorFilter] = useState("Tất cả");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [onlineType, setOnlineType] = useState<OnlineConsultType>("Chat");

  const [activeCall, setActiveCall] = useState<{
    doctor: Doctor;
    type: OnlineConsultType;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "doctor"; text: string; time: string }>>([]);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (activeCall && activeCall.type !== "Chat") {
      setCallDuration(0);
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [activeCall]);

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
      // Exclude doctor cases or cases with a doctor assigned from the main "Ca tư vấn" tab
      if (caseItem.type === "doctor" || caseItem.doctor) return false;

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

  const doctorCases = useMemo(() => {
    const query = normalize(debouncedSearch);
    return sortedCases.filter((caseItem) => {
      const isDocCase = caseItem.type === "doctor" || !!caseItem.doctor;
      if (!isDocCase) return false;

      const matchesSearch =
        !query ||
        normalize(caseItem.title).includes(query) ||
        normalize(caseItem.status).includes(query) ||
        caseItem.tag?.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [debouncedSearch, sortedCases]);

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

  const filteredDoctors =
    doctorFilter === "Tất cả"
      ? doctorsList
      : doctorsList.filter((doctor) => doctor.specialty === doctorFilter);
  const myDoctors = doctorsList.filter((doctor) => doctor.lastConsult);

  const openOnlineConsult = (type: OnlineConsultType = "Chat") => {
    setOnlineType(type);
    setDoctorFilter("Tất cả");
    setSheet("doctor-directory");
  };

  const openDoctorDirectory = () => {
    setDoctorFilter("Tất cả");
    setSheet("doctor-directory");
  };

  const openDoctorChat = (doctor: Doctor, type: OnlineConsultType = "Chat") => {
    setSelectedDoctor(doctor);
    setOnlineType(type);
    setSheet("doctor-match");
  };

  const startInteractiveCall = (doctor: Doctor, type: OnlineConsultType) => {
    if (type === "Chat") {
      const caseId = `doctor-${Date.now()}`;
      const newCase = buildConsultCase(caseId, {
        mode: "doctor",
        topic: `Tư vấn với ${doctor.name}`,
      });
      
      newCase.doctor = {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        avatar: doctor.id === "doctor-nguyen-a" ? "👨‍⚕️" : doctor.id === "doctor-tran-b" ? "👩‍⚕️" : "👩🏾",
      };
      newCase.title = `Tư vấn với ${doctor.name}`;
      newCase.subtitle = `${doctor.specialty} · Đang kết nối...`;
      
      newCase.messages = [
        {
          id: `${caseId}-created`,
          role: "system",
          kind: "system",
          text: `NEW → Đang kết nối. Yêu cầu tư vấn trực tuyến đã gửi đến ${doctor.name}.`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        }
      ];

      persistCreatedConsultCase(newCase);
      setCases((current) => [newCase, ...current]);
      setSheet(null);
      router.push(`/patient/consult/${caseId}?mode=doctor`);
      return;
    }

    setActiveCall({ doctor, type });
    setSheet(null);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !activeCall) return;

    const newMsg = {
      sender: "user" as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      if (!activeCall) return;
      const doctorReplies = [
        `Chào bạn, tôi là ${activeCall.doctor.name}. Tôi đã nhận được tin nhắn của bạn. Bạn hãy mô tả rõ hơn về các triệu chứng hiện tại nhé.`,
        "Cảm ơn bạn đã chia sẻ. Tình trạng này xuất hiện lâu chưa và bạn đã dùng thuốc gì chưa?",
        "Tôi hiểu rồi. Bạn có cảm thấy đau đầu, chóng mặt hay khó thở đi kèm không?",
        "Tốt nhất bạn nên nghỉ ngơi và theo dõi sát sao. Tôi sẽ kê đơn thuốc hỗ trợ tạm thời cho bạn.",
        "Nếu triệu chứng trở nên nghiêm trọng hơn, hãy thông báo ngay cho tôi hoặc đến cơ sở y tế gần nhất nhé.",
      ];
      const replyText = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "doctor" as const,
          text: replyText,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  const connectDoctor = () => {
    const doctor = selectedDoctor ?? doctorsList[0];
    const nextConsult: OnlineConsult = {
      id: `online-${Date.now()}`,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      type: onlineType,
      date: "Hôm nay",
      status: "Đang kết nối",
    };
    setOnlineConsults((current) => [nextConsult, ...current]);
    setSheet(null);
    startInteractiveCall(doctor, onlineType);
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
    <main className="relative flex h-full min-h-0 bg-[#e2f1e8] px-2 py-2 sm:px-4 sm:py-5">
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d2eadb] bg-[#f5fbf7] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "cases" ? (
          <div className="px-3 pt-3">
            <div className="mb-2 rounded-2xl border border-[#cfe8d8] bg-gradient-to-br from-white to-[#f0fbf4] p-2.5 shadow-[0_4px_16px_rgba(22,163,74,0.03)] relative overflow-hidden">
              <div className="absolute right-0 top-0 h-10 w-10 bg-[#16a34a]/3 rounded-full blur-xl"></div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#16a34a] bg-[#ecfdf3] px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-pulse" />
                  Sức khỏe của bạn
                </span>
                <span className="text-[9.5px] font-bold text-slate-400">Thời gian thực</span>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-1.5 text-center transition-all hover:bg-red-50">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-wide">Cần chú ý</p>
                  <p className="text-base font-extrabold text-[#dc2626] mt-0.5">{summary.urgent}</p>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-1.5 text-center transition-all hover:bg-amber-50">
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Theo dõi</p>
                  <p className="text-base font-extrabold text-[#b45309] mt-0.5">{summary.monitoring}</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-1.5 text-center transition-all hover:bg-emerald-50">
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide font-sans">Ổn định</p>
                  <p className="text-base font-extrabold text-[#065f46] mt-0.5">{summary.stable}</p>
                </div>
              </div>
            </div>

            <PrimaryCTAButton onClick={() => setSheet("new-case")} />
          </div>
        ) : null}

        <section className="min-h-0 flex-1 overflow-y-auto px-3 pb-28 pt-2">
          {activeTab === "cases" ? (
            <>
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
                          router.push(`/patient/consult/doctor-${Date.now()}?mode=doctor`)
                        }
                        pinned={pinnedCaseIds.includes(caseItem.id)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            // ── Doctor tab ──────────────────────────────────────────────────────
            <>
              <DoctorSectionTitle icon={MessageCircle} title="Tư vấn online với bác sĩ" />
              <div className="mt-3 grid gap-3">
                <OnlineConsultHero />
                <div className="grid grid-cols-3 gap-2">
                  <DoctorQuickAction
                    icon={MessageCircle}
                    label="Chat với bác sĩ"
                    onClick={() => openOnlineConsult("Chat")}
                  />
                  <DoctorQuickAction
                    icon={Video}
                    label="Video call"
                    onClick={() => openOnlineConsult("Video call")}
                  />
                  <DoctorQuickAction
                    icon={CalendarDays}
                    label="Đặt lịch khám"
                    onClick={() => router.push("/patient/appointments")}
                  />
                </div>
              </div>

              <DoctorSectionTitle icon={Stethoscope} title="Chọn bác sĩ" className="mt-7" />
              <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
                {doctorsList.slice(0, 4).map((doctor) => (
                  <DoctorMiniCard
                    key={doctor.id}
                    doctor={doctor}
                    onAction={startInteractiveCall}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={openDoctorDirectory}
                className="mt-3 min-h-11 w-full rounded-2xl border border-[#d8e7ef] bg-white text-sm font-bold text-[#334155]"
              >
                Tìm bác sĩ
              </button>

              <DoctorSectionTitle icon={MessageCircle} title="Bác sĩ đã từng tư vấn" className="mt-7" />
              <div className="mt-3 grid gap-3">
                {myDoctors.map((doctor) => (
                  <MyDoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onAction={startInteractiveCall}
                  />
                ))}
              </div>

              <DoctorSectionTitle icon={MessageCircle} title="Tư vấn online gần đây" className="mt-7" />
              <div className="mt-3 space-y-3">
                {doctorCases.length > 0 ? (
                  doctorCases.map((caseItem) => (
                    <CaseCard
                      key={caseItem.id}
                      caseItem={caseItem}
                      onPress={openCase}
                      onLongPress={openActions}
                      onDelete={deleteCase}
                      onArchive={archiveCase}
                      onBook={() => router.push("/patient/appointments")}
                      onContactDoctor={() =>
                        router.push(`/patient/consult/doctor-${Date.now()}?mode=doctor`)
                      }
                      pinned={pinnedCaseIds.includes(caseItem.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d8e7ef] bg-white/50 p-6 text-center text-sm text-[#64748b]">
                    Chưa có cuộc tư vấn bác sĩ nào gần đây. Hãy chọn bác sĩ bên trên để bắt đầu kết nối.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
        {/* Floating emergency FAB inside the rounded panel (mobile-friendly) */}
        <EmergencyFAB
          highlighted={false}
          onClick={() => setSheet("emergency")}
        />

        {activeCall ? (
          <InteractiveCallOverlay
            call={activeCall}
            messages={chatMessages}
            callDuration={callDuration}
            onClose={() => {
              setActiveCall(null);
              showToast("Cuộc tư vấn đã kết thúc");
            }}
            onSendMessage={handleSendMessage}
          />
        ) : null}

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
                onConnectDoctor={() =>
                  router.push(`/patient/consult/doctor-${Date.now()}?mode=doctor&emergency=1`)
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

            {sheet === "online-consult" ? (
              <OnlineConsultSheet
                selectedType={onlineType}
                onSelectType={setOnlineType}
                onContinue={() => setSheet("doctor-match")}
              />
            ) : null}

            {sheet === "doctor-match" ? (
              <DoctorMatchSheet
                doctor={selectedDoctor ?? doctorsList[0]}
                type={onlineType}
                onConnect={connectDoctor}
              />
            ) : null}

            {sheet === "doctor-directory" ? (
              <DoctorDirectorySheet
                doctors={filteredDoctors}
                filter={doctorFilter}
                onFilterChange={setDoctorFilter}
                consultType={onlineType}
                onAction={startInteractiveCall}
              />
            ) : null}
          </BottomSheet>
        ) : null}

        {toast ? (
          <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#10233f] px-4 py-2 text-[13px] font-semibold text-white shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: ConsultTab;
  onTabChange: (tab: ConsultTab) => void;
}) {
  return (
    <header className="border-b border-[#e3edf3] bg-white px-4 pb-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[25px] font-bold leading-tight text-[#10233f]">
            Tư vấn của tôi
          </h1>
          <p className="mt-1 text-[14px] leading-5 text-[#64748b]">
            Quản lý các vấn đề sức khỏe theo từng ca bệnh
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 rounded-2xl bg-[#f1f5f9] p-1">
        <ConsultTabButton
          active={activeTab === "cases"}
          label="Ca tư vấn"
          onClick={() => onTabChange("cases")}
        />
        <ConsultTabButton
          active={activeTab === "doctor"}
          label="Bác sĩ tư vấn"
          onClick={() => onTabChange("doctor")}
        />
      </div>
    </header>
  );
}

function ConsultTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-xl text-sm font-bold transition ${
        active
          ? "bg-white text-[#10233f] shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
          : "text-[#64748b]"
      }`}
    >
      {label}
    </button>
  );
}

function DoctorSectionTitle({
  icon: Icon,
  title,
  className = "",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[#16a34a]">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <h2 className="text-[18px] font-bold text-[#10233f]">{title}</h2>
    </div>
  );
}

function OnlineConsultHero() {
  return (
    <article className="rounded-[24px] border border-[#bbf7d0] bg-[#ecfdf3] p-4 shadow-[0_12px_28px_rgba(22,163,74,0.08)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#16a34a]">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold text-[#10233f]">Tư vấn trực tuyến</h3>
          <p className="mt-1 text-[14px] leading-6 text-[#475569]">
            Trao đổi qua chat hoặc video với bác sĩ phù hợp.
          </p>
        </div>
      </div>
    </article>
  );
}

function DoctorQuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[22px] border border-[#d8e7ef] bg-white px-2 text-center text-[12px] font-bold leading-4 text-[#334155] shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[#16a34a]">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function DoctorMiniCard({
  doctor,
  onAction,
}: {
  doctor: Doctor;
  onAction: (doctor: Doctor, type: OnlineConsultType) => void;
}) {
  return (
    <article className="w-45 shrink-0 rounded-[24px] border border-[#d8e7ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <h3 className="text-[15px] font-bold leading-5 text-[#10233f] truncate">{doctor.name}</h3>
      <p className="mt-1 text-[13px] text-[#64748b]">{doctor.specialty}</p>
      <div className="mt-3 flex items-center justify-between text-[12px] font-bold">
        <span className="text-[#b45309]">⭐ {doctor.rating}</span>
        <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[#16a34a] text-[10px]">
          {doctor.availability}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onAction(doctor, "Chat")}
          title="Chat"
          className="flex h-9 items-center justify-center rounded-xl bg-[#ecfdf3] text-[#16a34a] transition hover:bg-emerald-100 cursor-pointer"
        >
          <MessageCircle className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={() => onAction(doctor, "Gọi thoại")}
          title="Gọi thoại"
          className="flex h-9 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] transition hover:bg-blue-100 cursor-pointer"
        >
          <PhoneCall className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={() => onAction(doctor, "Video call")}
          title="Video call"
          className="flex h-9 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#7c3aed] transition hover:bg-purple-100 cursor-pointer"
        >
          <Video className="h-4.5 w-4.5" />
        </button>
      </div>
    </article>
  );
}

function MyDoctorCard({
  doctor,
  onAction,
}: {
  doctor: Doctor;
  onAction: (doctor: Doctor, type: OnlineConsultType) => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8e7ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#10233f]">{doctor.name}</h3>
          <p className="mt-1 text-[14px] text-[#64748b]">
            {doctor.specialty} · Lần cuối: {doctor.lastConsult}
          </p>
        </div>
        <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
          {doctor.availability}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onAction(doctor, "Chat")}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#ecfdf3] text-[#16a34a] text-xs font-bold transition hover:bg-emerald-100 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </button>
        <button
          type="button"
          onClick={() => onAction(doctor, "Gọi thoại")}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#eff6ff] text-[#2563eb] text-xs font-bold transition hover:bg-blue-100 cursor-pointer"
        >
          <PhoneCall className="h-4 w-4" />
          Gọi thoại
        </button>
        <button
          type="button"
          onClick={() => onAction(doctor, "Video call")}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#f5f3ff] text-[#7c3aed] text-xs font-bold transition hover:bg-purple-100 cursor-pointer"
        >
          <Video className="h-4 w-4" />
          Video
        </button>
      </div>
    </article>
  );
}

function OnlineConsultRecord({
  consult,
  onClick,
}: {
  consult: OnlineConsult;
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="rounded-[24px] border border-[#d8e7ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] cursor-pointer hover:border-emerald-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#10233f]">{consult.doctorName}</h3>
          <p className="mt-1 text-[14px] text-[#64748b]">
            {consult.specialty} · {consult.type} · {consult.date}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-bold ${
            consult.status === "Đang kết nối"
              ? "bg-[#eff6ff] text-[#2563eb]"
              : "bg-[#f1f5f9] text-[#475569]"
          }`}
        >
          {consult.status}
        </span>
      </div>
    </article>
  );
}

function OnlineConsultSheet({
  selectedType,
  onSelectType,
  onContinue,
}: {
  selectedType: OnlineConsultType;
  onSelectType: (type: OnlineConsultType) => void;
  onContinue: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle
        eyebrow="Tư vấn online"
        title="Bạn muốn trao đổi với bác sĩ bằng cách nào?"
      />
      <div className="mt-4 grid gap-2">
        {onlineConsultOptions.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => onSelectType(item.type)}
            className={`rounded-2xl border px-3 py-3 text-left ${
              selectedType === item.type
                ? "border-[#bbf7d0] bg-[#ecfdf3]"
                : "border-[#d8e7ef] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#10233f]">{item.type}</p>
                <p className="mt-1 text-[13px] text-[#64748b]">{item.description}</p>
              </div>
              <span className="rounded-full bg-[#f8fbfd] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
                {item.responseTime}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 min-h-12 w-full rounded-2xl bg-[#16a34a] text-sm font-bold text-white"
      >
        Tiếp tục
      </button>
    </div>
  );
}

function DoctorMatchSheet({
  doctor,
  type,
  onConnect,
}: {
  doctor: Doctor;
  type: OnlineConsultType;
  onConnect: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Bác sĩ phù hợp" title={`Kết nối ${doctor.name}`} />
      <div className="mt-4 rounded-[24px] border border-[#d8e7ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-[#10233f]">{doctor.name}</h3>
            <p className="mt-1 text-[14px] text-[#64748b]">
              {doctor.specialty} · ⭐ {doctor.rating}
            </p>
          </div>
          <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
            {doctor.availability}
          </span>
        </div>
        <div className="mt-3 rounded-2xl bg-[#f8fbfd] px-3 py-3 text-[13px] leading-5 text-[#475569]">
          AI đã dùng dữ liệu từ consultation hoặc lựa chọn của bạn để chuẩn bị
          kết nối. Hình thức tư vấn: {type}.
        </div>
        <button
          type="button"
          onClick={onConnect}
          className="mt-4 min-h-12 w-full rounded-2xl bg-[#16a34a] text-sm font-bold text-white"
        >
          Bắt đầu kết nối
        </button>
      </div>
    </div>
  );
}

function DoctorDirectorySheet({
  doctors,
  filter,
  onFilterChange,
  consultType,
  onAction,
}: {
  doctors: Doctor[];
  filter: string;
  onFilterChange: (filter: string) => void;
  consultType?: OnlineConsultType;
  onAction: (doctor: Doctor, type: OnlineConsultType) => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Tìm bác sĩ" title="Chọn bác sĩ để tư vấn" />
      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {doctorSpecialties.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            className={`min-h-9 shrink-0 rounded-full px-3 text-[12px] font-bold ${
              filter === item
                ? "bg-[#16a34a] text-white"
                : "border border-[#d8e7ef] bg-white text-[#334155]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        {doctors.map((doctor) => (
          <article
            key={doctor.id}
            className="rounded-[24px] border border-[#d8e7ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-[#10233f]">{doctor.name}</h3>
                <p className="mt-1 text-[14px] text-[#64748b]">
                  {doctor.specialty} · ⭐ {doctor.rating}
                </p>
                <p className="mt-1 text-[13px] text-[#94a3b8]">{doctor.consults}</p>
              </div>
              <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
                {doctor.availability}
              </span>
            </div>
            {consultType === "Chat" ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onAction(doctor, "Chat")}
                  className="w-full min-h-11 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-[0.98]"
                >
                  <MessageCircle className="h-4.5 w-4.5" /> Bắt đầu Chat ngay
                </button>
              </div>
            ) : consultType === "Video call" ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onAction(doctor, "Video call")}
                  className="w-full min-h-11 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-[0.98]"
                >
                  <Video className="h-4.5 w-4.5" /> Bắt đầu Video call
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onAction(doctor, "Chat")}
                  className="min-h-10 rounded-xl bg-[#ecfdf3] text-[#16a34a] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-emerald-100"
                >
                  <MessageCircle className="h-4 w-4" /> Chat
                </button>
                <button
                  type="button"
                  onClick={() => onAction(doctor, "Gọi thoại")}
                  className="min-h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-blue-100"
                >
                  <PhoneCall className="h-4 w-4" /> Gọi thoại
                </button>
                <button
                  type="button"
                  onClick={() => onAction(doctor, "Video call")}
                  className="min-h-10 rounded-xl bg-[#f5f3ff] text-[#7c3aed] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-purple-100"
                >
                  <Video className="h-4 w-4" /> Video
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
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
      className="flex items-center justify-between rounded-xl bg-[#16a34a] px-3.5 py-2 text-left text-white shadow-[0_4px_12px_rgba(22,163,74,0.12)] transition hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer w-full"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Plus className="h-4 w-4 text-white" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-bold">
            Bắt đầu tư vấn mới
          </span>
          <span className="block text-[10px] text-white/85 leading-none mt-0.5">
            Chọn AI, bác sĩ hoặc chế độ khẩn
          </span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/80" />
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
            className="min-h-11 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
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
          label="Ca tư vấn AI"
          onClick={() => toggle("types", "ai")}
        />
        <FilterPill
          active={draft.types.includes("doctor")}
          label="Bác sĩ tư vấn"
          onClick={() => toggle("types", "doctor")}
        />
        <FilterPill
          active={draft.types.includes("emergency")}
          label="Ca khẩn cấp"
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
          label="Thấp"
          onClick={() => toggle("severities", "low")}
        />
        <FilterPill
          active={draft.severities.includes("medium")}
          label="Trung bình"
          tone="warning"
          onClick={() => toggle("severities", "medium")}
        />
        <FilterPill
          active={draft.severities.includes("high")}
          label="Cao"
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
          Áp dụng
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 rounded-2xl border border-[#d8e7ef] bg-white px-5 text-sm font-semibold text-[#334155]"
        >
          Đặt lại
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
            title="Ca khẩn cấp"
            subtitle="Ưu tiên hỗ trợ khẩn"
            danger
            onClick={() => onCreate("emergency", "Ca khẩn cấp")}
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
  onConnectDoctor,
  onCall,
  onOpenChat,
}: {
  caseItem: ConsultCase | null;
  onConnectDoctor: () => void;
  onCall: () => void;
  onOpenChat: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle
        eyebrow="Hỗ trợ khẩn cấp"
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
          icon={Stethoscope}
          label="Kết nối bác sĩ"
          onClick={onConnectDoctor}
        />
        <ActionButton
          icon={PhoneCall}
          label="Gọi cấp cứu 115"
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
      // raised by additional 24px above safe-area/footer to prevent overlaps
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 6px) + 4.5rem)",
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
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[88vh] w-full max-w-97.5 overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
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

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function InteractiveCallOverlay({
  call,
  messages,
  callDuration,
  onClose,
  onSendMessage,
}: {
  call: { doctor: Doctor; type: OnlineConsultType };
  messages: Array<{ sender: "user" | "doctor"; text: string; time: string }>;
  callDuration: number;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}) {
  const [inputText, setInputText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  if (call.type === "Chat") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-[#e2f1e8]">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-[#e3edf3] bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#475569] transition hover:bg-slate-200"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#10233f] truncate">{call.doctor.name}</h3>
            <p className="text-xs text-[#16a34a] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
              {call.doctor.specialty} · Đang hoạt động
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]"
              title="Gọi thoại"
              onClick={() => {
                call.type = "Gọi thoại";
              }}
            >
              <PhoneCall className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          <div className="mx-auto max-w-sm rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-center text-xs text-[#b45309]">
            ⚠️ Đây là phòng tư vấn mô phỏng. Bác sĩ sẽ tự động phản hồi lại tin nhắn của bạn sau vài giây.
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
              <MessageCircle className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs">Bắt đầu cuộc trò chuyện với {call.doctor.name}</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
                    msg.sender === "user"
                      ? "bg-[#16a34a] text-white rounded-tr-none"
                      : "bg-white text-[#1e293b] rounded-tl-none border border-[#e2e8f0]"
                  }`}
                >
                  <p className="leading-5">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="border-t border-[#e3edf3] bg-white p-3 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border border-[#d8e7ef] bg-[#f8fbfd] px-3.5 py-2 text-sm text-[#10233f] outline-none focus:border-[#16a34a] focus:bg-white"
          />
          <button
            type="submit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16a34a] text-white hover:opacity-90 active:scale-95 transition"
          >
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-900 text-white select-none">
      {/* Call Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tư vấn trực tiếp
          </span>
        </div>
        <span className="text-sm font-mono font-medium tracking-widest bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
          {formatDuration(callDuration)}
        </span>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        {call.type === "Video call" && !isVideoOff ? (
          <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="text-center z-10 space-y-4">
              <div className="relative mx-auto h-24 w-24 rounded-full border-2 border-[#16a34a] bg-slate-800 flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.3)] animate-pulse">
                <Stethoscope className="h-10 w-10 text-[#16a34a]" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{call.doctor.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{call.doctor.specialty}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#16a34a]/20 border border-[#16a34a]/30 px-3 py-1 rounded-full text-xs text-[#22c55e] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping"></span>
                Đang truyền video HD
              </div>
            </div>

            <div className="absolute bottom-4 right-4 h-32 w-24 rounded-xl border border-white/20 bg-slate-950/80 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-2 text-center">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mb-1">
                <Plus className="h-5 w-5 text-white/50" />
              </div>
              <p className="text-[10px] text-white/60 font-semibold leading-tight">Bạn</p>
              <div className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-blue-500/20 animate-pulse"></div>
              <div className="h-24 w-24 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center text-3xl font-extrabold text-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                {call.doctor.name.split(" ").pop()?.[0] ?? "D"}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{call.doctor.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{call.doctor.specialty}</p>
              <p className="text-xs text-blue-400/80 mt-3 tracking-wide">Cuộc gọi thoại ẩn danh</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Control Bar */}
      <div className="p-8 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all border ${
            isMuted
              ? "bg-red-500 border-red-400 text-white"
              : "bg-white/10 border-white/15 text-white hover:bg-white/20"
          }`}
          title={isMuted ? "Bật micro" : "Tắt micro"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.5 7.5 0 0 0 5.03 11"/><path d="M9 9a3 3 0 0 0 5.12 2.12"/><path d="M19 10v1a7.93 7.93 0 0 1-1.39 4.43"/><path d="M22 10v1c0 5-4.07 9-9.14 9H12a9 9 0 0 1-4-.97"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(220,38,38,0.4)]"
          title="Kết thúc cuộc gọi"
        >
          <PhoneCall className="h-6 w-6 rotate-[135deg]" />
        </button>

        {call.type === "Video call" ? (
          <button
            type="button"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all border ${
              isVideoOff
                ? "bg-red-500 border-red-400 text-white"
                : "bg-white/10 border-white/15 text-white hover:bg-white/20"
            }`}
            title={isVideoOff ? "Bật camera" : "Tắt camera"}
          >
            {isVideoOff ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video-off"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34"/><path d="m22 8-6 4 1.9 1.27"/><path d="M2 2l20 20"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 16 6-4 1.27.85"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all border ${
              isSpeakerOn
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-white/10 border-white/15 text-white hover:bg-white/20"
            }`}
            title={isSpeakerOn ? "Tắt loa ngoài" : "Bật loa ngoài"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
