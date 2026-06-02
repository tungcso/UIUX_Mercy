"use client";

import {
  useMemo,
  useState,
  useEffect,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Bot,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartPulse,
  Plus,
  X,
  Video,
  MessageSquare,
  Mic,
  MicOff,
  VideoOff,
  MapPin,
  Building2,
  Sparkles,
  Stethoscope,
  Star,
  Timer,
  Bell,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  PhoneOff,
  Volume2,
  VolumeX,
  Send,
  Navigation,
} from "lucide-react";
import {
  consultCases,
  type ConsultCase,
} from "../consult/_components/consult-case-data";

type AppointmentStatus =
  | "ai-recommended"
  | "draft"
  | "booked"
  | "upcoming"
  | "in-progress"
  | "completed"
  | "follow-up";

type AppointmentMode = "Online" | "Offline";

type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  mode: AppointmentMode;
  reason: string;
  aiSummary: string[];
  risk: "Thấp" | "Trung bình" | "Cao";
  status: AppointmentStatus;
  facility?: string;
  fee?: string;
};

type Recommendation = {
  id: string;
  title: string;
  specialty: string;
  timeframe: string;
  tone: "danger" | "warning";
  summary: string[];
};

type BookingDoctor = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  note: string;
  onlineSlot?: string;
  offlineSlot?: string;
  fee?: string;
};

type Facility = {
  id: string;
  name: string;
  distance: string;
  specialty: string;
  slots: string[];
};

type Sheet =
  | "booking"
  | "unknown"
  | "recommendation-reason"
  | "care-update"
  | "reschedule"
  | null;

const initialAppointments: Appointment[] = [
  {
    id: "upcoming-cardio",
    doctorName: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    date: "24/07/2025",
    time: "14:30",
    mode: "Online",
    reason: "Từ consultation: Đau ngực nhẹ",
    aiSummary: [
      "Đau ngực nhẹ 1 ngày",
      "Triệu chứng đau tức lan nhẹ tay trái",
      "Khuyến nghị từ consultation AI",
      "Nguy cơ trung bình",
    ],
    risk: "Trung bình",
    status: "upcoming",
    fee: "150.000đ",
  },
  {
    id: "upcoming-offline-cardio",
    doctorName: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    date: "24/07/2025",
    time: "14:00",
    mode: "Offline",
    reason: "Khám trực tiếp định kỳ",
    aiSummary: [
      "Khám lâm sàng đánh giá đau ngực",
      "Theo dõi huyết áp trực tiếp tại bệnh viện",
      "Kiểm tra điện tâm đồ (ECG)",
    ],
    risk: "Trung bình",
    status: "upcoming",
    facility: "Bệnh viện A",
  },
  {
    id: "done-resp",
    doctorName: "BS Trần Thị B",
    specialty: "Hô hấp",
    date: "15/06/2025",
    time: "09:00",
    mode: "Offline",
    reason: "Ho và sốt đã được khám",
    aiSummary: ["Ho khan 5 ngày", "Sốt nhẹ", "Đã được bác sĩ kê đơn"],
    risk: "Thấp",
    status: "completed",
    facility: "Bệnh viện A",
  },
];

const specialties = [
  "Tim mạch",
  "Hô hấp",
  "Thần kinh",
  "Tiêu hóa",
  "Da liễu",
  "Khác",
];

const bookingDoctors: BookingDoctor[] = [
  {
    id: "doctor-nguyen-a",
    name: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    rating: "4.9",
    note: "Gợi ý tốt nhất cho đau ngực",
    onlineSlot: "14:30 hôm nay",
    offlineSlot: "14:00 hôm nay",
    fee: "150.000đ",
  },
  {
    id: "doctor-tran-b",
    name: "BS Trần Văn B",
    specialty: "Tim mạch",
    rating: "4.8",
    note: "Lịch gần nhất",
    onlineSlot: "15:00 hôm nay",
    offlineSlot: "10:00 ngày mai",
    fee: "120.000đ",
  },
  {
    id: "doctor-tran-b-resp",
    name: "BS Trần Thị B",
    specialty: "Hô hấp",
    rating: "4.8",
    note: "Phù hợp triệu chứng hô hấp",
    onlineSlot: "16:00 hôm nay",
    offlineSlot: "09:00 ngày mai",
    fee: "130.000đ",
  },
  {
    id: "doctor-le-c",
    name: "BS Lê Minh C",
    specialty: "Thần kinh",
    rating: "4.9",
    note: "Chuyên xử trí đau đầu, chóng mặt",
    onlineSlot: "08:30 ngày mai",
    offlineSlot: "10:30 ngày mai",
    fee: "180.000đ",
  },
  {
    id: "doctor-pham-d",
    name: "BS Phạm Thu D",
    specialty: "Da liễu",
    rating: "4.7",
    note: "Theo dõi bệnh da liễu",
    onlineSlot: "10:00 hôm nay",
    offlineSlot: "15:30 hôm nay",
    fee: "120.000đ",
  },
];

const facilitiesList: Facility[] = [
  {
    id: "facility-hosp-a",
    name: "Bệnh viện A",
    distance: "3 km",
    specialty: "Tim mạch",
    slots: ["09:00", "10:00", "14:00"],
  },
  {
    id: "facility-clinic-b",
    name: "Phòng khám B",
    distance: "1.5 km",
    specialty: "Tim mạch",
    slots: ["09:00", "10:00", "14:00"],
  },
];

const symptomRouting = [
  { symptom: "Đau đầu", specialty: "Thần kinh" },
  { symptom: "Đau ngực", specialty: "Tim mạch" },
  { symptom: "Ho", specialty: "Hô hấp" },
  { symptom: "Đau bụng", specialty: "Tiêu hóa" },
  { symptom: "Mất ngủ", specialty: "Thần kinh" },
  { symptom: "Khác", specialty: "Nội tổng quát" },
];

const careStatusOptions = [
  "Đỡ hơn",
  "Không thay đổi",
  "Nặng hơn",
  "Có triệu chứng mới",
];

const storedConsultCasesKey = "mercy-patient-consult-cases";

function getStoredConsultCasesSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(storedConsultCasesKey) ?? "[]";
}

function subscribeStoredConsultCases(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readStoredConsultCases(raw: string) {
  try {
    const parsed = raw ? (JSON.parse(raw) as ConsultCase[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getEmergencyConsultCases(storedCasesSnapshot: string) {
  const merged = [
    ...readStoredConsultCases(storedCasesSnapshot),
    ...consultCases,
  ];
  const byId = new Map<string, ConsultCase>();

  merged.forEach((caseItem) => {
    if (caseItem.severity === "high" || caseItem.type === "emergency") {
      byId.set(caseItem.id, caseItem);
    }
  });

  return Array.from(byId.values());
}

function specialtyFromCase(caseItem: ConsultCase) {
  const title = caseItem.title.toLowerCase();
  if (caseItem.tag) return caseItem.tag;
  if (title.includes("ngực") || title.includes("tim")) return "Tim mạch";
  if (title.includes("thở") || title.includes("ho")) return "Hô hấp";
  if (title.includes("đầu") || title.includes("chóng mặt")) return "Thần kinh";
  if (title.includes("bụng") || title.includes("dạ dày")) return "Tiêu hóa";
  return "Nội tổng quát";
}

function recommendationFromEmergencyCase(caseItem: ConsultCase): Recommendation {
  const emergencyMessage = caseItem.messages.find(
    (message) => message.kind === "emergency",
  );

  return {
    id: `rec-${caseItem.id}`,
    title: caseItem.title,
    specialty: specialtyFromCase(caseItem),
    timeframe: "trong 24h",
    tone: "danger",
    summary: [
      caseItem.subtitle,
      emergencyMessage?.title ?? "Chưa cải thiện sau theo dõi",
    ],
  };
}

function doctorsForSpecialty(specialty: string | null) {
  const matched = bookingDoctors.filter(
    (doctor) => !specialty || doctor.specialty === specialty,
  );
  return matched.length > 0 ? matched : bookingDoctors.slice(0, 2);
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [bookingSpecialty, setBookingSpecialty] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<AppointmentMode>("Online");
  const [bookingFromAi, setBookingFromAi] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [careStatus, setCareStatus] = useState<string | null>(null);
  const [confirmedCareStatus, setConfirmedCareStatus] = useState<string | null>(
    null,
  );
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // States for UX Flow simulation (Dynamic notification parameters)
  const [demoAlertActive, setDemoAlertActive] = useState(true); // Default to ON for quick demo visibility
  const [demoAlertType, setDemoAlertType] = useState<"Online" | "Offline">("Online");
  const [demoAlertMinutes, setDemoAlertMinutes] = useState(15);
  const [showOfflineMapSheet, setShowOfflineMapSheet] = useState(false);

  const [activeConsultationSession, setActiveConsultationSession] =
    useState<Appointment | null>(null);
  const [sessionTab, setSessionTab] = useState<"video" | "chat">("video");
  const [callMuted, setCallMuted] = useState(false);
  const [videoDisabled, setVideoDisabled] = useState(false);
  const [volumeMuted, setVolumeMuted] = useState(false);

  // Chat conversation simulation
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    role: "doctor" | "patient";
    text: string;
    time: string;
  }[]>([
    {
      id: "m1",
      role: "doctor",
      text: "Xin chào, tôi là BS Nguyễn Văn A. Tôi đã tiếp nhận hồ sơ sức khỏe và phân tích AI về triệu chứng 'Đau ngực nhẹ' của bạn.",
      time: "14:30",
    },
    {
      id: "m2",
      role: "doctor",
      text: "Cơn đau ngực trái của bạn còn tiếp diễn không? Bạn có cảm giác khó thở hay lan nhẹ xuống cánh tay trái không?",
      time: "14:31",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const storedCasesSnapshot = useSyncExternalStore(
    subscribeStoredConsultCases,
    getStoredConsultCasesSnapshot,
    () => "[]",
  );

  const recommendations = useMemo(
    () =>
      getEmergencyConsultCases(storedCasesSnapshot).map(
        recommendationFromEmergencyCase,
      ),
    [storedCasesSnapshot],
  );

  // Filter list of appointments based on their dynamic state
  const upcoming = useMemo(() => {
    return appointments.filter((item) => item.status === "upcoming");
  }, [appointments]);

  const completed = appointments.filter((item) => item.status === "completed");

  const availableDoctors = doctorsForSpecialty(bookingSpecialty);
  
  const summary = useMemo(
    () => ({
      tracked: recommendations.length,
      upcoming: upcoming.length,
    }),
    [recommendations.length, upcoming.length],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const openBooking = (specialty?: string, doctorName?: string) => {
    const nextSpecialty = specialty ?? null;
    const suggestedDoctor = doctorName
      ? bookingDoctors.find((doctor) => doctor.name === doctorName)
      : doctorsForSpecialty(nextSpecialty)[0];

    setBookingSpecialty(nextSpecialty);
    setSelectedDoctorId(suggestedDoctor?.id ?? null);
    setBookingMode("Online");
    setBookingFromAi(Boolean(specialty && !doctorName));
    setSheet("booking");
  };

  const createAppointment = (customFields?: {
    mode: AppointmentMode;
    doctorName: string;
    specialty: string;
    time: string;
    date: string;
    facility?: string;
    fee?: string;
  }) => {
    if (customFields) {
      const nextAppointment: Appointment = {
        id: `appointment-${Date.now()}`,
        doctorName: customFields.doctorName,
        specialty: customFields.specialty,
        date: customFields.date,
        time: customFields.time,
        mode: customFields.mode,
        reason: `Đặt lịch khám ${customFields.specialty}`,
        aiSummary: [
          `Đau ngực nhẹ - Khuyến nghị từ AI`,
          `Hình thức: ${customFields.mode === "Online" ? "Khám Online trực tuyến" : `Khám trực tiếp tại ${customFields.facility}`}`,
          `Thời gian: ${customFields.date} lúc ${customFields.time}`,
        ],
        risk: customFields.specialty === "Tim mạch" ? "Trung bình" : "Thấp",
        status: "upcoming",
        facility: customFields.facility,
        fee: customFields.fee,
      };
      setAppointments((current) => [nextAppointment, ...current]);
    } else {
      const specialty = bookingSpecialty ?? "Nội tổng quát";
      const doctor =
        bookingDoctors.find((item) => item.id === selectedDoctorId) ??
        doctorsForSpecialty(specialty)[0];
      const nextAppointment: Appointment = {
        id: `appointment-${Date.now()}`,
        doctorName: doctor?.name ?? "BS trực lịch",
        specialty,
        date: "24/07/2025",
        time: "14:30",
        mode: bookingMode,
        reason: `Khám chuyên khoa ${specialty}`,
        aiSummary: [
          `AI đề xuất khám chuyên khoa ${specialty}`,
          "Chuyên khoa và bác sĩ đã được chọn sẵn",
          "Ngày gần nhất: 24/07 - 14:30",
        ],
        risk: specialty === "Tim mạch" ? "Trung bình" : "Thấp",
        status: "upcoming",
        fee: bookingMode === "Online" ? doctor.fee ?? "150.000đ" : undefined,
      };
      setAppointments((current) => [nextAppointment, ...current]);
    }
    setSheet(null);
    showToast("Đã đặt lịch khám thành công!");
  };

  const confirmCareUpdate = () => {
    if (!careStatus) return;
    setConfirmedCareStatus(careStatus);
    setSheet(null);
    showToast(`Đã cập nhật: ${careStatus}`);
  };

  const confirmReschedule = (action: string) => {
    setSheet(null);
    showToast(action);
  };

  // Simulate physician responses in live chat
  const handleSendChat = (text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    const newMsgs = [
      ...chatMessages,
      { id: `pat-${Date.now()}`, role: "patient" as const, text, time: timeStr },
    ];
    setChatMessages(newMsgs);
    setChatInput("");

    // Simulate doctor thinking and replying in 1.2 seconds
    setTimeout(() => {
      let docReply = "Tôi ghi nhận tình trạng của bạn. Bạn hãy tiếp tục thư giãn và làm theo hướng dẫn của tôi nhé.";
      const t = text.toLowerCase();
      if (t.includes("đau") || t.includes("tức")) {
        docReply = "Đau nhẹ ở ngực trái lan xuống tay có thể liên quan tới co thắt cơ hoặc tim mạch nhẹ. Bạn hãy thở chậm sâu và giữ tư thế ngồi thẳng thoải mái nhé. Tôi sẽ hướng dẫn chi tiết thêm.";
      } else if (t.includes("đỡ") || t.includes("khỏe")) {
        docReply = "Tuyệt vời, việc triệu chứng giảm bớt là dấu hiệu rất khả quan. Hãy tiếp tục nghỉ ngơi và theo dõi nhịp thở.";
      } else if (t.includes("gọi") || t.includes("video")) {
        docReply = "Nhất trí, tôi sẽ mở kết nối hình ảnh trực tiếp ngay để tiện đánh giá nhịp thở và da niêm mạc của bạn.";
        setSessionTab("video");
      }

      setChatMessages((prev) => [
        ...prev,
        { id: `doc-${Date.now()}`, role: "doctor" as const, text: docReply, time: timeStr },
      ]);
    }, 1200);
  };

  // Function to finish active call session
  const finishConsultation = () => {
    if (activeConsultationSession) {
      // Mark this specific appointment as completed
      setAppointments((current) =>
        current.map((item) =>
          item.id === activeConsultationSession.id
            ? { ...item, status: "completed" as const }
            : item,
        ),
      );
      showToast("Cuộc khám trực tuyến đã hoàn thành và lưu biên bản!");
    }
    setActiveConsultationSession(null);
    setDemoAlertActive(false);
  };

  return (
    <main className="flex h-full min-h-0 justify-center bg-[#e2f1e8] px-2 py-2 sm:px-4 sm:py-5 font-sans">
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d2eadb] bg-[#f5fbf7] shadow-[0_24px_64px_rgba(15,23,42,0.16)]">
        
        {/* Header toolbar for simulating dynamic notifications */}
        <div className="bg-[#10233f] px-3 py-2.5 flex flex-col gap-2 text-xs border-b border-slate-800">
          <div className="flex items-center justify-between text-emerald-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
              <span>Chế độ Demo Tương Tác:</span>
            </div>
            
            {/* Main Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                setDemoAlertActive(!demoAlertActive);
                showToast(
                  !demoAlertActive
                    ? `Đã bật thông báo khám ${demoAlertType} (${demoAlertMinutes} phút)`
                    : "Đã tắt thông báo"
                );
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                demoAlertActive
                  ? "bg-emerald-500 text-white font-bold shadow-[0_0_8px_#10b981]"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {demoAlertActive ? "🟢 ĐANG BẬT THÔNG BÁO" : "🔴 ĐANG TẮT THÔNG BÁO"}
            </button>
          </div>

          {/* Sub-controls when active */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span>Hình thức:</span>
              <button
                type="button"
                onClick={() => {
                  const nextType = demoAlertType === "Online" ? "Offline" : "Online";
                  setDemoAlertType(nextType);
                  if (demoAlertActive) {
                    showToast(`Đổi sang thông báo khám ${nextType}`);
                  }
                }}
                className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-extrabold hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
              >
                {demoAlertType === "Online" ? "🟢 Online" : "🏥 Offline"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span>Thời gian:</span>
              <div className="flex gap-1">
                {[5, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setDemoAlertMinutes(mins);
                      if (demoAlertActive) {
                        showToast(`Đặt thời gian còn lại: ${mins} phút`);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
                      demoAlertMinutes === mins
                        ? "bg-emerald-500 text-white font-extrabold"
                        : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Alert Banner */}
        {demoAlertActive && !activeConsultationSession && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 flex items-center justify-between shadow-md relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-emerald-400 animate-pulse"></div>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Bell className="h-3.5 w-3.5 text-emerald-200 animate-bounce" />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Thông báo cuộc họp</p>
                <p className="text-[12px] font-semibold truncate leading-tight pr-1">
                  {demoAlertType === "Online" 
                    ? `Còn ${demoAlertMinutes} phút nữa sẽ đến cuộc họp Online với BS Nguyễn Văn A!`
                    : `Còn ${demoAlertMinutes} phút nữa sẽ đến cuộc khám Offline tại Bệnh viện A!`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (demoAlertType === "Online") {
                  const upcomingOnline = appointments.find(
                    (a) => a.status === "upcoming" && a.mode === "Online"
                  );
                  if (upcomingOnline) {
                    setActiveConsultationSession(upcomingOnline);
                  } else {
                    showToast("Vui lòng đặt lịch Online trước!");
                  }
                } else {
                  setShowOfflineMapSheet(true);
                }
              }}
              className="px-2.5 py-1 bg-white text-teal-800 text-[11px] font-extrabold rounded-lg shadow-sm hover:bg-emerald-50 cursor-pointer active:scale-95 transition-all shrink-0 ml-2"
            >
              {demoAlertType === "Online" ? "Tham gia" : "Bản đồ"}
            </button>
          </div>
        )}

        <header className="border-b border-[#d8eadf] bg-white px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-extrabold leading-tight text-[#10233f] tracking-tight">
                Lịch khám của tôi
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-[12px] font-bold">
                <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[#16a34a] border border-emerald-100 flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5" />
                  AI theo dõi: {summary.tracked} ca
                </span>
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[#2563eb] border border-blue-100 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Sắp tới: {summary.upcoming}
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Đặt lịch khám mới"
              onClick={() => openBooking()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white hover:bg-emerald-700 transition-all shadow-[0_10px_20px_rgba(22,163,74,0.3)] active:scale-95 cursor-pointer"
            >
              <Plus className="h-5.5 w-5.5" />
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 scroll-pb-[calc(7rem+env(safe-area-inset-bottom))]">
          <SectionTitle icon={HeartPulse} title="Tiếp tục chăm sóc" />
          <div className="mt-3">
            <CareFollowUpCard
              status={confirmedCareStatus}
              onUpdate={() => {
                setCareStatus(confirmedCareStatus);
                setSheet("care-update");
              }}
            />
          </div>

          <SectionTitle
            icon={Bot}
            title="AI khuyến nghị khám"
            className="mt-6"
          />
          <div className="mt-3 grid gap-3">
            {recommendations.length > 0 ? (
              recommendations.map((item) => (
                <RecommendationCard
                  key={item.id}
                  recommendation={item}
                  onBook={() => {
                    setBookingSpecialty(item.specialty);
                    setSelectedDoctorId("doctor-nguyen-a");
                    setBookingMode("Online");
                    setBookingFromAi(true);
                    setSheet("booking");
                  }}
                  onExplain={() => {
                    setSelectedRecommendation(item);
                    setSheet("recommendation-reason");
                  }}
                />
              ))
            ) : (
              <div className="rounded-[24px] border border-[#d8eadf] bg-white p-4 text-[14px] leading-6 text-[#64748b] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                Chưa có ca cần AI khuyến nghị đặt lịch khám.
              </div>
            )}
          </div>

          <SectionTitle
            icon={CalendarDays}
            title="Sắp tới"
            className="mt-6"
          />
          <div className="mt-3 grid gap-3">
            {upcoming.length > 0 ? (
              upcoming.map((item) => (
                <AppointmentCard
                  key={item.id}
                  appointment={item}
                  demoAlertActive={demoAlertActive}
                  demoAlertType={demoAlertType}
                  demoAlertMinutes={demoAlertMinutes}
                  onDetail={() => setDetail(item)}
                  onJoin={() => {
                    setActiveConsultationSession(item);
                  }}
                  onShowMap={() => setShowOfflineMapSheet(true)}
                  onReschedule={() => {
                    setSelectedAppointment(item);
                    setSheet("reschedule");
                  }}
                />
              ))
            ) : (
              <div className="text-center py-6 px-4 rounded-3xl border border-dashed border-slate-200 bg-white/50 text-slate-400 text-sm">
                Không có lịch khám sắp tới
              </div>
            )}
          </div>

          <SectionTitle
            icon={CalendarCheck2}
            title="Đã khám"
            className="mt-6"
          />
          <div className="mt-3 grid gap-3">
            {completed.map((item) => (
              <CompletedCard
                key={item.id}
                appointment={item}
                onDetail={() => setDetail(item)}
                onRebook={() => openBooking(item.specialty, item.doctorName)}
              />
            ))}
          </div>
        </section>

        {/* High fidelity interactive Video Call and Chat Room simulation */}
        {activeConsultationSession && (
          <div className="absolute inset-0 bg-[#0f172a] z-50 flex flex-col transition-all duration-300">
            {/* Session Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (confirm("Bạn có muốn tạm dừng phiên khám để quay lại sau?")) {
                      setActiveConsultationSession(null);
                    }
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {activeConsultationSession.doctorName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] text-emerald-400 font-medium">Khám trực tuyến · Tim mạch</span>
                  </div>
                </div>
              </div>
              <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setSessionTab("video")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    sessionTab === "video"
                      ? "bg-[#16a34a] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  Video
                </button>
                <button
                  onClick={() => setSessionTab("chat")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    sessionTab === "chat"
                      ? "bg-[#16a34a] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </button>
              </div>
            </div>

            {/* Content Area based on Tabs */}
            <div className="flex-1 min-h-0 relative flex flex-col">
              {sessionTab === "video" ? (
                // Video Room interface
                <div className="flex-1 bg-[#101726] flex flex-col justify-between p-4 relative overflow-hidden">
                  
                  {/* Doctor Main Video Frame (High fidelity mockup) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1b263b] to-[#0d131f]">
                    {/* Animated network indicators */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-xs text-white border border-white/10 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>BS. Nguyễn Văn A (Đang nói)</span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-xs text-white border border-white/10 backdrop-blur-md">
                      <Timer className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="font-mono">01:45</span>
                    </div>

                    {/* Doctor Avatar representation */}
                    <div className="relative flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                        <div className="relative h-28 w-28 rounded-full border-4 border-emerald-500/50 bg-[#16a34a] flex items-center justify-center shadow-2xl">
                          <Stethoscope className="h-14 w-14 text-white animate-pulse" />
                        </div>
                      </div>
                      <h4 className="mt-4 text-lg font-bold text-white">{activeConsultationSession.doctorName}</h4>
                      <p className="text-xs text-slate-400">Tim mạch · Chuyên viên cao cấp</p>
                      
                      {/* Fake live subtitle stream */}
                      <div className="mt-8 bg-slate-950/80 px-4 py-2.5 rounded-2xl max-w-xs border border-slate-800 text-center backdrop-blur-md">
                        <p className="text-xs text-emerald-400 font-semibold mb-0.5">Bác sĩ dặn:</p>
                        <p className="text-sm text-slate-200 leading-snug">"Tôi đã xem tóm tắt AI bệnh sử đau ngực của bạn. Hãy thả lỏng và hít vào sâu, thở ra đều để tôi đánh giá nhé."</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient PIP Frame (Small floating layout) */}
                  <div className="absolute bottom-24 right-4 h-36 w-26 bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 shadow-xl flex flex-col justify-end p-2 transition-all">
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      {videoDisabled ? (
                        <VideoOff className="h-6 w-6 text-slate-600" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold">
                            BẠN
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="relative z-10 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded text-center truncate">
                      Camera của bạn
                    </span>
                  </div>

                  {/* Call control action bar */}
                  <div className="mt-auto relative z-10 w-full flex items-center justify-center gap-4 py-4 px-2 bg-gradient-to-t from-slate-950 to-transparent">
                    <button
                      onClick={() => setCallMuted(!callMuted)}
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        callMuted ? "bg-red-500/80 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                      title={callMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      {callMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setVideoDisabled(!videoDisabled)}
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        videoDisabled ? "bg-red-500/80 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                      title={videoDisabled ? "Turn on Camera" : "Turn off Camera"}
                    >
                      {videoDisabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setVolumeMuted(!volumeMuted)}
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        volumeMuted ? "bg-red-500/80 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {volumeMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={finishConsultation}
                      className="h-12 w-28 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm shadow-lg flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                    >
                      <PhoneOff className="h-4.5 w-4.5" />
                      Gác máy
                    </button>
                  </div>
                </div>
              ) : (
                // Chat Room interface
                <div className="flex-1 bg-slate-950 flex flex-col min-h-0 justify-between">
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-end">
                    <div className="text-center text-[11px] text-slate-500 mb-2">
                      Mã hóa bảo mật cuộc thoại y khoa 🔒
                    </div>
                    
                    {chatMessages.map((msg) => {
                      const isDoc = msg.role === "doctor";
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isDoc ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            isDoc
                              ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60"
                              : "bg-[#16a34a] text-white rounded-tr-none"
                          }`}>
                            <p className="leading-snug">{msg.text}</p>
                            <span className="text-[9px] block text-right mt-1 opacity-60">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Suggestion Chips */}
                  <div className="px-4 py-2 border-t border-slate-900 bg-slate-900/60 flex gap-2 overflow-x-auto scrollbar-none">
                    {["Tôi đã đỡ tức ngực", "Vẫn hơi nhói tay trái", "Bác sĩ ơi, có nguy hiểm không?", "Đưa tôi toa thuốc"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendChat(suggestion)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 whitespace-nowrap cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Chat input box */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendChat(chatInput);
                        }
                      }}
                      placeholder="Nhập câu trả lời hoặc câu hỏi..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendChat(chatInput)}
                      disabled={!chatInput.trim()}
                      className="h-9 w-9 bg-[#16a34a] text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-90"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Offline map interactive simulation modal */}
        {showOfflineMapSheet && (
          <div className="absolute inset-0 bg-[#0f172a]/95 z-55 flex items-end justify-center px-3 pb-3 backdrop-blur-sm transition-all duration-300">
            <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-[28px] bg-slate-900 p-4 border border-slate-800 text-white shadow-2xl flex flex-col justify-between">
              
              <button
                type="button"
                onClick={() => setShowOfflineMapSheet(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">📍 Hướng dẫn di chuyển</p>
                <h3 className="text-base font-extrabold mt-0.5">Bản đồ đến Bệnh viện A</h3>
                <p className="text-xs text-slate-400 mt-1">Khoảng cách: <span className="text-blue-400 font-bold">3 km</span> · Thời gian đi xe dự kiến: <span className="text-emerald-400 font-bold">8 phút</span></p>
              </div>

              {/* Graphic Mock Map */}
              <div className="flex-1 min-h-[220px] rounded-2xl bg-slate-950 border border-slate-800/80 p-4 relative overflow-hidden flex flex-col justify-between mb-4">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
                
                {/* SVG/CSS Mock roads */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-slate-800 rotate-12 relative"></div>
                  <div className="w-full h-1 bg-slate-800 -rotate-45 relative"></div>
                  <div className="absolute h-full w-1 bg-slate-800 left-1/3"></div>
                  <div className="absolute h-full w-1 bg-slate-800 right-1/4"></div>

                  {/* Route Green Path */}
                  <svg className="absolute inset-0 h-full w-full">
                    <path
                      d="M 60,200 Q 150,180 180,100 T 320,60"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="8 4"
                      className="animate-[dash_8s_linear_infinite]"
                    />
                  </svg>
                </div>

                {/* You Pin */}
                <div className="absolute left-[50px] bottom-[30px] flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full bg-blue-500/30 blur-sm animate-ping"></span>
                    <div className="h-5 w-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-md">
                      B
                    </div>
                  </div>
                  <span className="text-[9px] bg-blue-900 border border-blue-700 px-1.5 py-0.2 rounded mt-1 shadow-sm">Bạn</span>
                </div>

                {/* Hospital Pin */}
                <div className="absolute right-[65px] top-[35px] flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute -inset-3 rounded-full bg-red-500/20 blur-md animate-pulse"></span>
                    <MapPin className="h-6 w-6 text-red-500 animate-bounce" />
                  </div>
                  <span className="text-[9px] bg-red-950 border border-red-900 px-1.5 py-0.2 rounded mt-0.5 shadow-sm text-center">Bệnh viện A</span>
                </div>

                {/* Compass HUD */}
                <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-right">
                  <p className="text-[10px] text-slate-400 font-medium">Bản đồ vệ tinh</p>
                  <p className="text-xs text-white font-extrabold mt-0.5 flex items-center gap-1 justify-end">
                    <Navigation className="h-3 w-3 text-emerald-400 rotate-45" />
                    ĐÔNG BẮC
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    // Mark upcoming Offline appointment as completed
                    setAppointments((current) =>
                      current.map((item) =>
                        item.mode === "Offline" && item.status === "upcoming"
                          ? { ...item, status: "completed" as const }
                          : item
                      )
                    );
                    setShowOfflineMapSheet(false);
                    setDemoAlertActive(false);
                    showToast("Đã Check-in thành công tại Bệnh viện A! Đang vào khám...");
                  }}
                  className="w-full min-h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                  Đã đến nơi & Check-in tại quầy
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfflineMapSheet(false)}
                  className="w-full min-h-11 border border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold text-xs cursor-pointer active:scale-95 transition-all"
                >
                  Đóng bản đồ
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {sheet === "booking" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <BookingSheet
            specialty={bookingSpecialty}
            mode={bookingMode}
            fromAi={bookingFromAi}
            doctors={availableDoctors}
            selectedDoctorId={selectedDoctorId}
            onSpecialtyChange={(specialty) => {
              setBookingSpecialty(specialty);
              setSelectedDoctorId(doctorsForSpecialty(specialty)[0]?.id ?? null);
            }}
            onDoctorChange={setSelectedDoctorId}
            onModeChange={setBookingMode}
            onUnknown={() => setSheet("unknown")}
            onConfirm={createAppointment}
          />
        </BottomSheet>
      ) : null}

      {sheet === "unknown" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <UnknownSpecialtySheet
            onSelect={(specialty) => {
              setBookingSpecialty(specialty);
              setSelectedDoctorId(doctorsForSpecialty(specialty)[0]?.id ?? null);
              setSheet("booking");
            }}
          />
        </BottomSheet>
      ) : null}

      {sheet === "recommendation-reason" && selectedRecommendation ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <RecommendationReasonSheet
            recommendation={selectedRecommendation}
            onBook={() => {
              setBookingSpecialty(selectedRecommendation.specialty);
              setSelectedDoctorId("doctor-nguyen-a");
              setBookingMode("Online");
              setBookingFromAi(true);
              setSheet("booking");
            }}
          />
        </BottomSheet>
      ) : null}

      {sheet === "care-update" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <CareUpdateSheet
            selected={careStatus}
            onSelect={setCareStatus}
            onConfirm={confirmCareUpdate}
          />
        </BottomSheet>
      ) : null}

      {sheet === "reschedule" && selectedAppointment ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <RescheduleSheet
            appointment={selectedAppointment}
            onAction={confirmReschedule}
          />
        </BottomSheet>
      ) : null}

      {detail ? (
        <AppointmentDetail appointment={detail} onClose={() => setDetail(null)} />
      ) : null}

      {toast ? (
        <div className="fixed left-1/2 top-14 z-60 -translate-x-1/2 rounded-full bg-[#10233f] px-4 py-2 text-[12px] font-bold text-white shadow-lg border border-slate-700 transition-all duration-300">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function SectionTitle({
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
      <h2 className="text-[17px] font-extrabold text-[#10233f]">{title}</h2>
    </div>
  );
}

function CareFollowUpCard({
  status,
  onUpdate,
}: {
  status: string | null;
  onUpdate: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onUpdate} className="min-w-0 text-left cursor-pointer">
          <h3 className="text-[16px] font-extrabold text-[#10233f]">Khó thở</h3>
          <p className="mt-1 text-[13px] text-[#64748b]">
            AI đang theo dõi · Cập nhật cuối: 2 giờ trước
          </p>
        </button>
        <span className="rounded-full bg-[#fffbeb] px-3 py-1 text-[11px] font-extrabold text-[#b45309]">
          Theo dõi
        </span>
      </div>
      {status ? (
        <div className="mt-3 rounded-2xl bg-[#ecfdf3] px-3 py-2.5 text-[12px] font-bold text-[#166534] border border-emerald-100 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Tình trạng hiện tại: {status}</span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onUpdate}
        className="mt-3 min-h-11 w-full rounded-2xl bg-[#16a34a] hover:bg-emerald-700 active:scale-98 transition-all text-xs font-extrabold text-white cursor-pointer"
      >
        Cập nhật tình trạng
      </button>
    </article>
  );
}

function RecommendationCard({
  recommendation,
  onBook,
  onExplain,
}: {
  recommendation: Recommendation;
  onBook: () => void;
  onExplain: () => void;
}) {
  const danger = recommendation.tone === "danger";

  return (
    <article
      className={`rounded-[24px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:shadow-md transition-all ${
        danger ? "border-[#fecaca] bg-[#fff7f7]" : "border-[#fde68a] bg-[#fffbeb]"
      }`}
    >
      <button type="button" onClick={onExplain} className="w-full text-left cursor-pointer">
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
            danger ? "text-[#dc2626]" : "text-[#b45309]"
          }`}
        >
          AI khuyến nghị khám
        </p>
        <h3 className="mt-1 text-[16px] font-extrabold text-[#10233f]">
          {recommendation.title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#475569]">
          Khám chuyên khoa <span className="font-bold text-slate-800">{recommendation.specialty}</span> {recommendation.timeframe}
        </p>
      </button>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={onBook}
          className="min-h-11 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-xs font-bold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-sm"
        >
          <CalendarDays className="h-4 w-4" />
          Đặt lịch ngay
        </button>
        <button
          type="button"
          onClick={onExplain}
          className="min-h-11 rounded-2xl border border-[#fecaca] bg-white px-4 text-xs font-bold text-[#dc2626] hover:bg-red-50 transition-all cursor-pointer active:scale-95"
        >
          Giải thích lý do
        </button>
      </div>
    </article>
  );
}

function AppointmentCard({
  appointment,
  demoAlertActive,
  demoAlertType,
  demoAlertMinutes,
  onDetail,
  onJoin,
  onShowMap,
  onReschedule,
}: {
  appointment: Appointment;
  demoAlertActive: boolean;
  demoAlertType: "Online" | "Offline";
  demoAlertMinutes: number;
  onDetail: () => void;
  onJoin: () => void;
  onShowMap: () => void;
  onReschedule: () => void;
}) {
  const isOnline = appointment.mode === "Online";
  
  // Highlight Online card if online demo is active and time is low
  const canJoin = isOnline && 
                  demoAlertActive && 
                  demoAlertType === "Online" && 
                  appointment.status === "upcoming" && 
                  demoAlertMinutes <= 15;

  // Highlight Offline card if offline demo is active and time is low
  const canShowMap = !isOnline && 
                     demoAlertActive && 
                     demoAlertType === "Offline" && 
                     appointment.status === "upcoming" && 
                     demoAlertMinutes <= 15;

  // Check if upcoming but warning (minutes > 15)
  const isWarningOffline = !isOnline && 
                           demoAlertActive && 
                           demoAlertType === "Offline" && 
                           appointment.status === "upcoming" && 
                           demoAlertMinutes > 15;

  const isWarningOnline = isOnline && 
                          demoAlertActive && 
                          demoAlertType === "Online" && 
                          appointment.status === "upcoming" && 
                          demoAlertMinutes > 15;

  return (
    <article className={`rounded-[24px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:shadow-md transition-all ${
      canJoin 
        ? "border-emerald-400 bg-gradient-to-b from-white to-emerald-50/20" 
        : canShowMap
          ? "border-blue-400 bg-gradient-to-b from-white to-blue-50/20"
          : "border-[#d8eadf] bg-white"
    }`}>
      <button type="button" onClick={onDetail} className="w-full text-left cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-extrabold text-[#10233f]">
              {appointment.doctorName}
            </h3>
            <p className="mt-0.5 text-[13px] font-semibold text-[#64748b]">
              Chuyên khoa: {appointment.specialty}
            </p>
          </div>
          {canJoin ? (
            <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[11px] font-extrabold text-white flex items-center gap-1 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              Có thể tham gia
            </span>
          ) : canShowMap ? (
            <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-extrabold text-white flex items-center gap-1 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              Đến giờ khám
            </span>
          ) : isWarningOffline ? (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-white flex items-center gap-1">
              ⏳ Còn {demoAlertMinutes}p
            </span>
          ) : isWarningOnline ? (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-white flex items-center gap-1">
              ⏳ Còn {demoAlertMinutes}p
            </span>
          ) : (
            <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[11px] font-extrabold text-[#16a34a]">
              {appointment.mode}
            </span>
          )}
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f8fbfd] px-3.5 py-3 text-[13px] font-semibold text-[#334155] border border-slate-100">
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-[#16a34a]" />
            {appointment.time}
          </span>
          <span className="flex items-center justify-end gap-1.5">
            <CalendarDays className="h-4 w-4 text-[#16a34a]" />
            {appointment.date}
          </span>
        </div>
        {appointment.facility && (
          <div className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>Địa điểm: {appointment.facility}</span>
          </div>
        )}
      </button>
      
      <div className="mt-4">
        {canJoin ? (
          <button
            type="button"
            onClick={onJoin}
            className="min-h-11 w-full rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-sm font-extrabold text-white transition-all cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(22,163,74,0.3)] animate-bounce flex items-center justify-center gap-2"
          >
            <Video className="h-4 w-4" />
            Tham gia phòng khám
          </button>
        ) : canShowMap ? (
          <button
            type="button"
            onClick={onShowMap}
            className="min-h-11 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white transition-all cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(37,99,235,0.3)] animate-bounce flex items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            📍 Xem bản đồ & Chỉ đường
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDetail}
              className="min-h-11 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
            >
              Chi tiết
            </button>
            <button
              type="button"
              onClick={onReschedule}
              className="min-h-11 rounded-2xl border border-[#d8eadf] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
            >
              Đổi lịch
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function CompletedCard({
  appointment,
  onDetail,
  onRebook,
}: {
  appointment: Appointment;
  onDetail: () => void;
  onRebook: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 opacity-90 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <button type="button" onClick={onDetail} className="w-full text-left cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#10233f]">
              {appointment.doctorName}
            </h3>
            <p className="mt-1 text-[13px] text-[#64748b]">
              {appointment.specialty} · {appointment.date}
            </p>
          </div>
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-extrabold text-[#475569]">
            Đã khám
          </span>
        </div>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDetail}
          className="min-h-10 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
        >
          Biên bản khám
        </button>
        <button
          type="button"
          onClick={onRebook}
          className="min-h-10 rounded-2xl border border-[#d8eadf] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
        >
          Đặt lại lịch
        </button>
      </div>
    </article>
  );
}

function CareUpdateSheet({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: string | null;
  onSelect: (status: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle
        eyebrow="Cập nhật tình trạng"
        title="Tình trạng hiện tại của bạn?"
      />
      <div className="mt-4 grid gap-2">
        {careStatusOptions.map((item) => (
          <ChoiceButton
            key={item}
            active={selected === item}
            label={item}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={!selected}
        className="mt-4 min-h-12 w-full rounded-2xl bg-[#16a34a] text-sm font-bold text-white disabled:bg-[#d8e7ef] disabled:text-[#94a3b8]"
      >
        Xác nhận
      </button>
    </div>
  );
}

function RecommendationReasonSheet({
  recommendation,
  onBook,
}: {
  recommendation: Recommendation;
  onBook: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="AI phát hiện" title="Lý do khuyến nghị khám" />
      <div className="mt-4 rounded-[24px] border border-[#fecaca] bg-[#fff7f7] p-4">
        <div className="grid gap-2">
          {recommendation.summary.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 text-[13px] text-[#475569] leading-relaxed"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#dc2626] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
          <div className="flex items-start gap-2 text-[13px] text-[#475569] leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#dc2626] shrink-0" />
            <span>Chưa cải thiện sau theo dõi</span>
          </div>
        </div>
        <p className="mt-3.5 text-[12px] font-bold text-[#b45309] bg-[#fffbeb] p-2 rounded-xl border border-amber-100">
          Khuyến nghị: Nên liên hệ trực tiếp Tim mạch sớm.
        </p>
      </div>
      <button
        type="button"
        onClick={onBook}
        className="mt-4 min-h-12 w-full rounded-2xl bg-[#16a34a] text-sm font-bold text-white cursor-pointer hover:bg-emerald-700 transition-all"
      >
        Đặt lịch ngay
      </button>
    </div>
  );
}

function RescheduleSheet({
  appointment,
  onAction,
}: {
  appointment: Appointment;
  onAction: (message: string) => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Đổi lịch" title={`Khám ${appointment.specialty}`} />
      <div className="mt-4 grid gap-2">
        <ChoiceButton
          label="Đổi ngày"
          onClick={() => onAction("Đã mở chọn ngày mới")}
        />
        <ChoiceButton
          label="Đổi giờ"
          onClick={() => onAction("Đã mở chọn giờ mới")}
        />
        <ChoiceButton label="Hủy lịch" onClick={() => onAction("Đã gửi yêu cầu hủy lịch")} />
      </div>
    </div>
  );
}

// Sleek Booking Sheet implementing Flow 1 and Flow 2 with extremely optimized steps
function BookingSheet({
  specialty,
  mode,
  fromAi,
  doctors,
  selectedDoctorId,
  onSpecialtyChange,
  onDoctorChange,
  onModeChange,
  onUnknown,
  onConfirm,
}: {
  specialty: string | null;
  mode: AppointmentMode;
  fromAi: boolean;
  doctors: BookingDoctor[];
  selectedDoctorId: string | null;
  onSpecialtyChange: (specialty: string) => void;
  onDoctorChange: (doctorId: string) => void;
  onModeChange: (mode: AppointmentMode) => void;
  onUnknown: () => void;
  onConfirm: (custom?: any) => void;
}) {
  const [internalMode, setInternalMode] = useState<AppointmentMode>("Online");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(selectedDoctorId || "doctor-nguyen-a");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("facility-hosp-a");
  const [selectedHour, setSelectedHour] = useState<string>("14:00");

  const activeSpecialty = specialty || "Tim mạch";
  const filteredDoctors = bookingDoctors.filter((doc) => doc.specialty === activeSpecialty);
  const activeDoctor = filteredDoctors.find((doc) => doc.id === selectedDocId) || filteredDoctors[0] || bookingDoctors[0];

  const handleBookingSubmit = () => {
    if (internalMode === "Online") {
      // Flow 1 Online Booking logic
      onConfirm({
        mode: "Online",
        doctorName: activeDoctor.name,
        specialty: activeSpecialty,
        time: activeDoctor.onlineSlot?.split(" ")[0] || "14:30",
        date: "24/07/2025",
        fee: activeDoctor.fee || "150.000đ",
      });
    } else {
      // Flow 2 Offline Booking logic
      const facilityObj = facilitiesList.find((f) => f.id === selectedFacilityId) || facilitiesList[0];
      onConfirm({
        mode: "Offline",
        doctorName: activeDoctor.name,
        specialty: activeSpecialty,
        time: selectedHour,
        date: "24/07/2025",
        facility: facilityObj.name,
      });
    }
  };

  return (
    <div className="pr-9 font-sans">
      <SheetTitle
        eyebrow="Đặt lịch thông minh"
        title={`Khám chuyên khoa: ${activeSpecialty}`}
      />
      
      {fromAi && (
        <div className="mt-3.5 rounded-2xl border border-[#bbf7d0] bg-[#ecfdf3] px-3.5 py-3 text-xs text-emerald-800 leading-relaxed">
          <p className="font-extrabold uppercase tracking-widest text-[#16a34a] text-[10px] mb-0.5">Triệu chứng:</p>
          <p className="font-extrabold text-slate-800 text-[13px] mb-1">Đau ngực nhẹ (Tim mạch)</p>
          <p className="text-slate-600 text-[12px]">AI tự động điền chuyên khoa thích hợp. Không cần lựa chọn lại.</p>
        </div>
      )}

      {/* Specialty selection (Only if general booking and not recommended) */}
      {!fromAi && !specialty && (
        <div className="mt-4">
          <p className="text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">1. Chọn Chuyên khoa</p>
          <div className="grid grid-cols-3 gap-1.5">
            {specialties.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSpecialtyChange(item)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  activeSpecialty === item
                    ? "bg-[#16a34a] border-[#16a34a] text-white"
                    : "bg-[#f8fbfd] border-[#d8eadf] text-[#334155]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode selection (Online vs Offline) */}
      <div className="mt-4">
        <p className="text-[12px] font-bold text-slate-500 mb-2.5 uppercase tracking-wide">Hình thức khám</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setInternalMode("Online")}
            className={`py-3.5 rounded-2xl text-sm font-extrabold transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
              internalMode === "Online"
                ? "bg-[#ecfdf3] border-[#16a34a] text-[#16a34a] shadow-[0_0_12px_rgba(22,163,74,0.1)]"
                : "bg-white border-[#d8eadf] text-[#475569] hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">🟢</span>
            <span>Khám Online (Trực tuyến)</span>
          </button>
          <button
            type="button"
            onClick={() => setInternalMode("Offline")}
            className={`py-3.5 rounded-2xl text-sm font-extrabold transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
              internalMode === "Offline"
                ? "bg-[#eff6ff] border-[#2563eb] text-[#2563eb] shadow-[0_0_12px_rgba(37,99,235,0.1)]"
                : "bg-white border-[#d8eadf] text-[#475569] hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">🏥</span>
            <span>Khám Offline (Trực tiếp)</span>
          </button>
        </div>
      </div>

      {internalMode === "Online" ? (
        // FLOW 1 - ONLINE SELECTION PANEL (Reduced UX steps: Quick confirm)
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Bác sĩ phù hợp & Slot sớm nhất hôm nay</p>
            <div className="space-y-2">
              {filteredDoctors.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedDocId === doc.id
                      ? "border-emerald-500 bg-[#ecfdf3]/40 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#10233f]">{doc.name}</span>
                      <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.2 flex items-center gap-0.5">
                        ★ {doc.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Slot khả dụng: <span className="text-[#16a34a] font-bold">{doc.onlineSlot}</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">Chọn</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Confirmation summary */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Thông tin xác nhận đặt lịch</h4>
            <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
              <span className="text-slate-500 font-semibold">Hình thức:</span>
              <span className="text-[#10233f] font-extrabold flex items-center gap-1">🟢 Khám Online</span>

              <span className="text-slate-500 font-semibold">Bác sĩ khám:</span>
              <span className="text-[#10233f] font-extrabold">{activeDoctor.name}</span>

              <span className="text-slate-500 font-semibold">Thời gian hẹn:</span>
              <span className="text-[#16a34a] font-extrabold">{activeDoctor.onlineSlot}</span>

              <span className="text-slate-500 font-semibold">Phí tư vấn:</span>
              <span className="text-[#10233f] font-extrabold bg-[#ecfdf3] px-2 py-0.5 rounded text-xs">{activeDoctor.fee || "150.000đ"}</span>
            </div>
          </div>
        </div>
      ) : (
        // FLOW 2 - OFFLINE SELECTION PANEL
        <div className="mt-4 space-y-4">
          {/* Step 1: Facility choice */}
          <div>
            <p className="text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">1. Chọn cơ sở khám gần nhất</p>
            <div className="grid grid-cols-2 gap-2">
              {facilitiesList.map((fac) => (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => setSelectedFacilityId(fac.id)}
                  className={`p-3 text-left rounded-2xl border transition-all cursor-pointer ${
                    selectedFacilityId === fac.id
                      ? "border-blue-500 bg-[#eff6ff]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-[#10233f]">{fac.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Khoảng cách:</span>
                    <span className="font-bold text-slate-700">{fac.distance}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose Doctor */}
          <div>
            <p className="text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">2. Chọn bác sĩ trực tại cơ sở</p>
            <select
              value={selectedDocId || ""}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-[#f8fbfd] border border-[#d8eadf] rounded-2xl px-3.5 py-3 text-sm font-semibold text-[#334155] focus:outline-none focus:border-blue-500"
            >
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} (⭐ {doc.rating})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Choose slot/hour */}
          <div>
            <p className="text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">3. Chọn giờ khám phù hợp</p>
            <div className="grid grid-cols-3 gap-2">
              {facilitiesList
                .find((f) => f.id === selectedFacilityId)
                ?.slots.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => setSelectedHour(hour)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                      selectedHour === hour
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
            </div>
          </div>

          {/* Step 4: Quick Confirmation summary */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Thông tin xác nhận đặt lịch</h4>
            <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
              <span className="text-slate-500 font-semibold">Hình thức:</span>
              <span className="text-[#10233f] font-extrabold flex items-center gap-1">🏥 Khám trực tiếp</span>

              <span className="text-slate-500 font-semibold">Cơ sở khám:</span>
              <span className="text-[#10233f] font-extrabold">
                {facilitiesList.find((f) => f.id === selectedFacilityId)?.name}
              </span>

              <span className="text-slate-500 font-semibold">Bác sĩ khám:</span>
              <span className="text-[#10233f] font-extrabold">{activeDoctor.name}</span>

              <span className="text-slate-500 font-semibold">Thời gian hẹn:</span>
              <span className="text-[#2563eb] font-extrabold">24/07/2025 lúc {selectedHour}</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Call to action */}
      <button
        type="button"
        onClick={handleBookingSubmit}
        className={`mt-5 min-h-12 w-full rounded-2xl text-sm font-extrabold text-white cursor-pointer transition-all active:scale-95 shadow-md ${
          internalMode === "Online"
            ? "bg-[#16a34a] hover:bg-emerald-700 shadow-emerald-200/50"
            : "bg-blue-600 hover:bg-blue-700 shadow-blue-200/50"
        }`}
      >
        Xác nhận đặt lịch khám
      </button>
    </div>
  );
}

function UnknownSpecialtySheet({
  onSelect,
}: {
  onSelect: (specialty: string) => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle
        eyebrow="AI chọn chuyên khoa"
        title="Bạn đang gặp vấn đề gì?"
      />
      <div className="mt-4 grid gap-2">
        {symptomRouting.map((item) => (
          <ChoiceButton
            key={item.symptom}
            label={item.symptom}
            onClick={() => onSelect(item.specialty)}
          />
        ))}
      </div>
    </div>
  );
}

function AppointmentDetail({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const completed = appointment.status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3">
      <button
        type="button"
        aria-label="Đóng chi tiết lịch khám"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.28)] z-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fbfd] text-[#64748b]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <SheetTitle
          eyebrow={completed ? "Biên bản khám" : "Chi tiết lịch"}
          title={`Khám chuyên khoa: ${appointment.specialty}`}
        />
        <div className="mt-4 grid gap-2 text-[14px]">
          <InfoRow label="Bác sĩ khám" value={appointment.doctorName} />
          <InfoRow label="Thời gian" value={`${appointment.date} · ${appointment.time}`} />
          <InfoRow label="Hình thức" value={appointment.mode} />
          <InfoRow label="Lý do" value={appointment.reason} />
          {appointment.facility && <InfoRow label="Địa điểm khám" value={appointment.facility} />}
          {appointment.fee && <InfoRow label="Phí tư vấn" value={appointment.fee} />}
        </div>
        {completed ? (
          <div className="mt-4 grid gap-3 max-h-72 overflow-y-auto pr-1">
            <MedicalRecordBlock
              title="Tóm tắt khám"
              items={["Triệu chứng đau tức ngực đã giảm ổn định sau khám tư vấn", "Không phát hiện dấu hiệu co thắt mạch vành hay biến cố tim cấp tính"]}
            />
            <MedicalRecordBlock
              title="Chẩn đoán lâm sàng"
              items={["Đau tức ngực nhẹ do căng thẳng / co thắt cơ tim nhẹ chức năng"]}
            />
            <MedicalRecordBlock
              title="Đơn thuốc"
              items={["Uống nhiều nước ấm, bổ sung Magie B6 khi mệt mỏi", "Nghỉ ngơi hợp lý, tránh thức khuya"]}
            />
            <MedicalRecordBlock
              title="Khuyến nghị theo dõi"
              items={["Tái khám định kỳ qua app sau 2 tuần", "Liên hệ khẩn cấp nếu có cơn đau nhói tăng dần"]}
            />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-[#d8eadf] bg-[#f8fbfd] p-3">
            <p className="text-[13px] font-bold text-[#10233f]">
              Tóm tắt AI cho bác sĩ
            </p>
            <div className="mt-2 grid gap-2">
              {appointment.aiSummary.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-[#475569]"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#16a34a]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] font-semibold text-[#b45309]">
              Nguy cơ lâm sàng: {appointment.risk}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MedicalRecordBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#d8eadf] bg-[#f8fbfd] p-3">
      <p className="text-[13px] font-bold text-[#10233f]">{title}</p>
      <div className="mt-2 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-[13px] text-[#475569]">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#16a34a] shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
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

function SheetTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[18px] font-extrabold text-[#10233f]">{title}</h2>
    </>
  );
}

function ChoiceButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center justify-between rounded-2xl border px-3 text-left text-sm font-semibold cursor-pointer transition-all active:scale-98 ${
        active
          ? "border-[#bbf7d0] bg-[#ecfdf3] text-[#16a34a]"
          : "border-[#d8eadf] bg-[#f8fbfd] text-[#334155]"
      }`}
    >
      {label}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8fbfd] px-3 py-2 border border-slate-100/50">
      <span className="text-[#64748b] text-[13px] font-medium">{label}</span>
      <span className="text-right text-[13px] font-bold text-[#10233f]">{value}</span>
    </div>
  );
}
