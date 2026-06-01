"use client";

import {
  useEffect,
  useMemo,
  useState,
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
  MessageCircle,
  Plus,
  Stethoscope,
  Video,
  X,
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
type OnlineConsultType = "Chat" | "Gọi thoại" | "Video call";
type AppointmentTab = "booking" | "doctor";

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
};

type Recommendation = {
  id: string;
  title: string;
  specialty: string;
  timeframe: string;
  tone: "danger" | "warning";
  summary: string[];
};

type OnlineConsult = {
  id: string;
  doctorName: string;
  specialty: string;
  type: OnlineConsultType;
  date: string;
  status: "Đang kết nối" | "Hoàn thành";
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  consults: string;
  availability: string;
  lastConsult?: string;
};

const initialAppointments: Appointment[] = [
  {
    id: "upcoming-cardio",
    doctorName: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    date: "24/07/2025",
    time: "15:30",
    mode: "Online",
    reason: "Từ consultation: Đau ngực kéo dài",
    aiSummary: ["Đau ngực 3 ngày", "Không sốt", "Có khó thở nhẹ", "Nguy cơ trung bình"],
    risk: "Trung bình",
    status: "upcoming",
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
  },
];

const specialties = ["Tim mạch", "Hô hấp", "Thần kinh", "Tiêu hóa", "Da liễu", "Khác"];
const symptomRouting = [
  { symptom: "Đau đầu", specialty: "Thần kinh" },
  { symptom: "Đau ngực", specialty: "Tim mạch" },
  { symptom: "Ho", specialty: "Hô hấp" },
  { symptom: "Đau bụng", specialty: "Tiêu hóa" },
  { symptom: "Mất ngủ", specialty: "Thần kinh" },
  { symptom: "Khác", specialty: "Nội tổng quát" },
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

const doctorSpecialties = [
  "Tất cả",
  "Tim mạch",
  "Hô hấp",
  "Thần kinh",
  "Da liễu",
  "Nhi khoa",
];

const doctors: Doctor[] = [
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

function getEmergencyConsultCases() {
  const merged = [...readStoredConsultCases(), ...consultCases];
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
    timeframe: "càng sớm càng tốt",
    tone: "danger",
    summary: [
      caseItem.subtitle,
      emergencyMessage?.title ?? caseItem.status,
      "AI đánh giá: nguy cơ cao",
    ],
  };
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [onlineConsults, setOnlineConsults] =
    useState<OnlineConsult[]>(initialOnlineConsults);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sheet, setSheet] = useState<
    | "booking"
    | "unknown"
    | "online"
    | "doctor-match"
    | "doctor-directory"
    | "recommendation-reason"
    | null
  >(null);
  const [bookingSpecialty, setBookingSpecialty] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<AppointmentMode>("Online");
  const [onlineType, setOnlineType] = useState<OnlineConsultType>("Chat");
  const [activeTab, setActiveTab] = useState<AppointmentTab>("booking");
  const [doctorFilter, setDoctorFilter] = useState("Tất cả");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const upcoming = appointments.filter((item) => item.status === "upcoming");
  const completed = appointments.filter((item) => item.status === "completed");
  const filteredDoctors =
    doctorFilter === "Tất cả"
      ? doctors
      : doctors.filter((doctor) => doctor.specialty === doctorFilter);
  const myDoctors = doctors.filter((doctor) => doctor.lastConsult);

  useEffect(() => {
    setRecommendations(
      getEmergencyConsultCases().map(recommendationFromEmergencyCase),
    );
  }, []);

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

  const openBooking = (specialty?: string) => {
    setBookingSpecialty(specialty ?? null);
    setBookingMode("Online");
    setSheet("booking");
  };

  const openOnlineConsult = (type: OnlineConsultType = "Chat") => {
    setOnlineType(type);
    setSheet("online");
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

  const connectDoctor = () => {
    const doctor = selectedDoctor ?? doctors[0];
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
    showToast("Đang tìm bác sĩ phù hợp");
  };

  const createAppointment = () => {
    const specialty = bookingSpecialty ?? "Nội tổng quát";
    const nextAppointment: Appointment = {
      id: `appointment-${Date.now()}`,
      doctorName: "BS tư vấn trực tuyến",
      specialty,
      date: "Ngày mai",
      time: "15:30",
      mode: bookingMode,
      reason: `Từ AI recommendation: Khám ${specialty}`,
      aiSummary: [
        `AI đề xuất khám ${specialty}`,
        "Cần bác sĩ đánh giá thêm",
        "Đã tạo lịch từ luồng tư vấn",
      ],
      risk: specialty === "Tim mạch" ? "Trung bình" : "Thấp",
      status: "upcoming",
    };

    setAppointments((current) => [nextAppointment, ...current]);
    setSheet(null);
    showToast("Đã đặt lịch khám thành công");
  };

  return (
    <main className="flex h-full min-h-0 justify-center bg-[#e9f5ed] px-2 py-2 sm:px-4 sm:py-5">
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d7eadf] bg-[#f7fbf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <header className="border-b border-[#d8eadf] bg-white px-4 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-[#10233f]">
                Lịch khám của tôi
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-[13px] font-semibold">
                <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[#16a34a]">
                  AI đang theo dõi: {summary.tracked} ca
                </span>
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[#2563eb]">
                  Lịch sắp tới: {summary.upcoming}
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Đặt lịch"
              onClick={() => openBooking()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-[0_12px_26px_rgba(22,163,74,0.22)]"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 rounded-2xl bg-[#f1f5f9] p-1">
            <TabButton
              active={activeTab === "booking"}
              label="Đặt lịch"
              onClick={() => setActiveTab("booking")}
            />
            <TabButton
              active={activeTab === "doctor"}
              label="Bác sĩ tư vấn"
              onClick={() => setActiveTab("doctor")}
            />
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
          {activeTab === "booking" ? (
            <>
              <SectionTitle icon={HeartPulse} title="Tiếp tục chăm sóc" />
              <div className="mt-3">
                <CareFollowUpCard
                  onUpdate={() => showToast("Đã mở cập nhật tình trạng")}
                />
              </div>

              <SectionTitle
                icon={Bot}
                title="AI khuyến nghị khám"
                className="mt-7"
              />
              <div className="mt-3 grid gap-3">
                {recommendations.length > 0 ? (
                  recommendations.map((item) => (
                    <RecommendationCard
                      key={item.id}
                      recommendation={item}
                      onBook={() => openBooking(item.specialty)}
                      onExplain={() => {
                        setSelectedRecommendation(item);
                        setSheet("recommendation-reason");
                      }}
                    />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-[#d8eadf] bg-white p-4 text-[14px] leading-6 text-[#64748b] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    Chưa có ca khẩn cấp nào cần AI khuyến nghị đặt lịch khám.
                  </div>
                )}
              </div>

              <SectionTitle
                icon={CalendarDays}
                title="Sắp tới"
                className="mt-7"
              />
              <div className="mt-3 grid gap-3">
                {upcoming.map((item) => (
                  <AppointmentCard
                    key={item.id}
                    appointment={item}
                    onDetail={() => setDetail(item)}
                    onReschedule={() => showToast("Đã mở yêu cầu đổi lịch")}
                  />
                ))}
              </div>

              <SectionTitle
                icon={CalendarCheck2}
                title="Đã khám"
                className="mt-7"
              />
              <div className="mt-3 grid gap-3">
                {completed.map((item) => (
                  <CompletedCard
                    key={item.id}
                    appointment={item}
                    onDetail={() => setDetail(item)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <SectionTitle
                icon={MessageCircle}
                title="Tư vấn online với bác sĩ"
              />
              <div className="mt-3 grid gap-3">
                <OnlineConsultHero
                  onChat={() => openOnlineConsult("Chat")}
                  onVideo={() => openOnlineConsult("Video call")}
                  onChooseDoctor={openDoctorDirectory}
                />
                <div className="grid grid-cols-3 gap-2">
                  <QuickActionButton
                    icon={MessageCircle}
                    label="Chat với bác sĩ"
                    onClick={() => openOnlineConsult("Chat")}
                  />
                  <QuickActionButton
                    icon={Video}
                    label="Video call"
                    onClick={() => openOnlineConsult("Video call")}
                  />
                  <QuickActionButton
                    icon={CalendarDays}
                    label="Đặt lịch khám"
                    onClick={() => {
                      setActiveTab("booking");
                      openBooking();
                    }}
                  />
                </div>
              </div>

              <SectionTitle
                icon={Stethoscope}
                title="Chọn bác sĩ"
                className="mt-7"
              />
              <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
                {doctors.slice(0, 4).map((doctor) => (
                  <DoctorMiniCard
                    key={doctor.id}
                    doctor={doctor}
                    onChat={() => openDoctorChat(doctor, "Chat")}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={openDoctorDirectory}
                className="mt-3 min-h-11 w-full rounded-2xl border border-[#d8eadf] bg-white text-sm font-bold text-[#334155]"
              >
                Tìm bác sĩ
              </button>

              <SectionTitle
                icon={MessageCircle}
                title="Bác sĩ đã từng tư vấn"
                className="mt-7"
              />
              <div className="mt-3 grid gap-3">
                {myDoctors.map((doctor) => (
                  <MyDoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onChat={() => openDoctorChat(doctor, "Chat")}
                  />
                ))}
              </div>

              <SectionTitle
                icon={MessageCircle}
                title="Tư vấn online gần đây"
                className="mt-7"
              />
              <div className="mt-3 grid gap-3">
                {onlineConsults.map((item) => (
                  <OnlineConsultRecord key={item.id} consult={item} />
                ))}
              </div>
            </>
          )}
        </section>

      </div>

      {sheet === "booking" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <BookingSheet
            specialty={bookingSpecialty}
            mode={bookingMode}
            onSpecialtyChange={setBookingSpecialty}
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
              setSheet("booking");
            }}
          />
        </BottomSheet>
      ) : null}

      {sheet === "online" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <OnlineConsultSheet
            selectedType={onlineType}
            onSelectType={setOnlineType}
            onContinue={() => setSheet("doctor-match")}
          />
        </BottomSheet>
      ) : null}

      {sheet === "doctor-match" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <DoctorMatchSheet
            doctor={selectedDoctor ?? doctors[0]}
            type={onlineType}
            onConnect={connectDoctor}
          />
        </BottomSheet>
      ) : null}

      {sheet === "doctor-directory" ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <DoctorDirectorySheet
            doctors={filteredDoctors}
            filter={doctorFilter}
            onFilterChange={setDoctorFilter}
            onChat={(doctor) => openDoctorChat(doctor, "Chat")}
            onVideo={(doctor) => openDoctorChat(doctor, "Video call")}
          />
        </BottomSheet>
      ) : null}

      {sheet === "recommendation-reason" && selectedRecommendation ? (
        <BottomSheet onClose={() => setSheet(null)}>
          <RecommendationReasonSheet recommendation={selectedRecommendation} />
        </BottomSheet>
      ) : null}

      {detail ? (
        <AppointmentDetail appointment={detail} onClose={() => setDetail(null)} />
      ) : null}

      {toast ? (
        <div className="fixed left-1/2 top-4 z-60 -translate-x-1/2 rounded-full bg-[#10233f] px-4 py-2 text-[13px] font-semibold text-white shadow-lg">
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
      <h2 className="text-[18px] font-bold text-[#10233f]">{title}</h2>
    </div>
  );
}

function TabButton({
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

function CareFollowUpCard({ onUpdate }: { onUpdate: () => void }) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-bold text-[#10233f]">Khó thở</h3>
          <p className="mt-1 text-[14px] text-[#64748b]">
            AI đang theo dõi · Cập nhật cuối: 2 giờ trước
          </p>
        </div>
        <span className="rounded-full bg-[#fffbeb] px-3 py-1 text-[12px] font-bold text-[#b45309]">
          Theo dõi
        </span>
      </div>
      <button
        type="button"
        onClick={onUpdate}
        className="mt-3 min-h-10 w-full rounded-2xl border border-[#d8eadf] bg-white text-sm font-bold text-[#334155]"
      >
        Cập nhật tình trạng
      </button>
    </article>
  );
}

function OnlineConsultHero({
  onChat,
  onVideo,
  onChooseDoctor,
}: {
  onChat: () => void;
  onVideo: () => void;
  onChooseDoctor: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#bbf7d0] bg-[#ecfdf3] p-4 shadow-[0_12px_28px_rgba(22,163,74,0.08)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#16a34a]">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold text-[#10233f]">
            Tư vấn trực tuyến
          </h3>
          <p className="mt-1 text-[14px] leading-6 text-[#475569]">
            Trao đổi qua chat hoặc video với bác sĩ phù hợp.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onChat}
          className="min-h-11 rounded-2xl bg-[#16a34a] px-2 text-xs font-bold text-white"
        >
          Chat với bác sĩ
        </button>
        <button
          type="button"
          onClick={onVideo}
          className="min-h-11 rounded-2xl border border-[#bbf7d0] bg-white px-2 text-xs font-bold text-[#166534]"
        >
          Video call
        </button>
        <button
          type="button"
          onClick={onChooseDoctor}
          className="min-h-11 rounded-2xl border border-[#bbf7d0] bg-white px-2 text-xs font-bold text-[#166534]"
        >
          Chọn bác sĩ
        </button>
      </div>
    </article>
  );
}

function QuickActionButton({
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
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[22px] border border-[#d8eadf] bg-white px-2 text-center text-[12px] font-bold leading-4 text-[#334155] shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[#16a34a]">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function OnlineConsultRecord({ consult }: { consult: OnlineConsult }) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#10233f]">
            {consult.doctorName}
          </h3>
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

function DoctorMiniCard({
  doctor,
  onChat,
}: {
  doctor: Doctor;
  onChat: () => void;
}) {
  return (
    <article className="w-45 shrink-0 rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <h3 className="text-[15px] font-bold leading-5 text-[#10233f]">
        {doctor.name}
      </h3>
      <p className="mt-1 text-[13px] text-[#64748b]">{doctor.specialty}</p>
      <div className="mt-3 flex items-center justify-between text-[12px] font-bold">
        <span className="text-[#b45309]">⭐ {doctor.rating}</span>
        <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[#16a34a]">
          {doctor.availability}
        </span>
      </div>
      <button
        type="button"
        onClick={onChat}
        className="mt-3 min-h-10 w-full rounded-2xl bg-[#16a34a] text-sm font-bold text-white"
      >
        Chat
      </button>
    </article>
  );
}

function MyDoctorCard({
  doctor,
  onChat,
}: {
  doctor: Doctor;
  onChat: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
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
      <button
        type="button"
        onClick={onChat}
        className="mt-3 min-h-10 w-full rounded-2xl border border-[#d8eadf] bg-white text-sm font-bold text-[#334155]"
      >
        Nhắn tin lại
      </button>
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
                : "border-[#d8eadf] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#10233f]">{item.type}</p>
                <p className="mt-1 text-[13px] text-[#64748b]">
                  {item.description}
                </p>
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
      <SheetTitle
        eyebrow="Bác sĩ phù hợp"
        title={`Kết nối ${doctor.name}`}
      />
      <div className="mt-4 rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-[#10233f]">
              {doctor.name}
            </h3>
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
  onChat,
  onVideo,
}: {
  doctors: Doctor[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onChat: (doctor: Doctor) => void;
  onVideo: (doctor: Doctor) => void;
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
                : "border border-[#d8eadf] bg-white text-[#334155]"
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
            className="rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-[#10233f]">
                  {doctor.name}
                </h3>
                <p className="mt-1 text-[14px] text-[#64748b]">
                  {doctor.specialty} · ⭐ {doctor.rating}
                </p>
                <p className="mt-1 text-[13px] text-[#94a3b8]">
                  {doctor.consults}
                </p>
              </div>
              <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
                {doctor.availability}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChat(doctor)}
                className="min-h-10 rounded-2xl bg-[#16a34a] text-sm font-bold text-white"
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => onVideo(doctor)}
                className="min-h-10 rounded-2xl border border-[#d8eadf] bg-white text-sm font-bold text-[#334155]"
              >
                Video call
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RecommendationReasonSheet({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Vì sao?" title="Lý do AI khuyến nghị khám" />
      <div className="mt-4 rounded-[24px] border border-[#fecaca] bg-[#fff7f7] p-4">
        <h3 className="text-[17px] font-bold text-[#10233f]">
          {recommendation.title}
        </h3>
        <div className="mt-3 grid gap-2">
          {recommendation.summary.map((item) => (
            <div key={item} className="flex items-start gap-2 text-[14px] text-[#475569]">
              <span className="mt-2 h-2 w-2 rounded-full bg-[#dc2626]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] font-semibold text-[#b45309]">
          AI đề xuất khám {recommendation.specialty} {recommendation.timeframe}.
        </p>
      </div>
    </div>
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
      className={`rounded-[24px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
        danger ? "border-[#fecaca] bg-[#fff7f7]" : "border-[#fde68a] bg-[#fffbeb]"
      }`}
    >
      <p
        className={`text-[12px] font-bold uppercase tracking-[0.12em] ${
          danger ? "text-[#dc2626]" : "text-[#b45309]"
        }`}
      >
        AI khuyến nghị khám
      </p>
      <h3 className="mt-1 text-[17px] font-bold text-[#10233f]">
        {recommendation.title}
      </h3>
      <p className="mt-2 text-[14px] leading-6 text-[#475569]">
        AI đề xuất: Khám {recommendation.specialty} {recommendation.timeframe}
      </p>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={onBook}
          className="min-h-11 rounded-2xl bg-[#16a34a] text-sm font-semibold text-white"
        >
          Đặt lịch
        </button>
        <button
          type="button"
          onClick={onExplain}
          className="min-h-11 rounded-2xl border border-[#fecaca] bg-white px-4 text-sm font-semibold text-[#dc2626]"
        >
          Giải thích
        </button>
      </div>
    </article>
  );
}

function AppointmentCard({
  appointment,
  onDetail,
  onReschedule,
}: {
  appointment: Appointment;
  onDetail: () => void;
  onReschedule: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-bold text-[#10233f]">
            {appointment.doctorName}
          </h3>
          <p className="mt-1 text-[14px] text-[#64748b]">
            {appointment.specialty}
          </p>
        </div>
        <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
          {appointment.mode}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#f8fbfd] px-3 py-3 text-[14px] text-[#334155]">
        <span className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[#16a34a]" />
          {appointment.time}
        </span>
        <span className="flex items-center justify-end gap-2">
          <CalendarDays className="h-4 w-4 text-[#16a34a]" />
          {appointment.date}
        </span>
      </div>
      <div className="mt-3 rounded-2xl bg-[#f8fbfd] px-3 py-2 text-[13px] leading-5 text-[#64748b]">
        <span className="font-semibold text-[#334155]">Lý do khám: </span>
        {appointment.reason.replace("Từ consultation: ", "").replace("Từ AI recommendation: ", "")}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDetail}
          className="min-h-10 rounded-2xl border border-[#d8eadf] bg-white text-sm font-semibold text-[#334155]"
        >
          Chi tiết
        </button>
        <button
          type="button"
          onClick={onReschedule}
          className="min-h-10 rounded-2xl bg-[#f1f5f9] text-sm font-semibold text-[#475569]"
        >
          Đổi lịch
        </button>
      </div>
    </article>
  );
}

function CompletedCard({
  appointment,
  onDetail,
}: {
  appointment: Appointment;
  onDetail: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8eadf] bg-white p-4 opacity-80 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#10233f]">
            {appointment.doctorName}
          </h3>
          <p className="mt-1 text-[14px] text-[#64748b]">
            {appointment.specialty} · {appointment.date}
          </p>
        </div>
        <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[12px] font-bold text-[#475569]">
          Đã khám
        </span>
      </div>
      <button
        type="button"
        onClick={onDetail}
        className="mt-3 min-h-10 w-full rounded-2xl border border-[#d8eadf] bg-white text-sm font-semibold text-[#334155]"
      >
        Biên bản khám
      </button>
    </article>
  );
}

function BookingSheet({
  specialty,
  mode,
  onSpecialtyChange,
  onModeChange,
  onUnknown,
  onConfirm,
}: {
  specialty: string | null;
  mode: AppointmentMode;
  onSpecialtyChange: (specialty: string) => void;
  onModeChange: (mode: AppointmentMode) => void;
  onUnknown: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="pr-9">
      <SheetTitle eyebrow="Đặt lịch" title="Bạn muốn khám chuyên khoa nào?" />
      <div className="mt-4 grid gap-2">
        {specialties.map((item) => (
          <ChoiceButton
            key={item}
            active={specialty === item}
            label={item}
            onClick={() => onSpecialtyChange(item)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onUnknown}
        className="mt-3 min-h-11 w-full rounded-2xl border border-[#d8eadf] bg-white text-sm font-semibold text-[#334155]"
      >
        Tôi không biết khám khoa nào
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["Online", "Offline"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onModeChange(item)}
            className={`min-h-11 rounded-2xl text-sm font-bold ${
              mode === item
                ? "bg-[#16a34a] text-white"
                : "border border-[#d8eadf] bg-white text-[#334155]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={!specialty}
        className="mt-4 min-h-12 w-full rounded-2xl bg-[#16a34a] text-sm font-bold text-white disabled:bg-[#d8e7ef] disabled:text-[#94a3b8]"
      >
        Tiếp tục
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
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3">
      <button
        type="button"
        aria-label="Đóng chi tiết lịch khám"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fbfd] text-[#64748b]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <SheetTitle eyebrow="Appointment detail" title={`Khám ${appointment.specialty}`} />
        <div className="mt-4 grid gap-2 text-[14px]">
          <InfoRow label="Doctor" value={appointment.doctorName} />
          <InfoRow label="Date" value={`${appointment.date} · ${appointment.time}`} />
          <InfoRow label="Location" value={appointment.mode} />
          <InfoRow label="Reason" value={appointment.reason} />
        </div>
        <div className="mt-4 rounded-2xl border border-[#d8eadf] bg-[#f8fbfd] p-3">
          <p className="text-[13px] font-bold text-[#10233f]">
            AI Summary - Tóm tắt cho bác sĩ
          </p>
          <div className="mt-2 grid gap-2">
            {appointment.aiSummary.map((item) => (
              <div key={item} className="flex items-start gap-2 text-[13px] text-[#475569]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#16a34a]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] font-semibold text-[#b45309]">
            Nguy cơ: {appointment.risk}
          </p>
        </div>
        {appointment.status === "completed" ? (
          <div className="mt-4 rounded-2xl bg-[#ecfdf3] px-3 py-3 text-[13px] leading-5 text-[#166534]">
            Bác sĩ đã khám xong. Bạn có muốn AI tiếp tục theo dõi tình trạng này không?
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="min-h-10 rounded-xl bg-[#16a34a] text-white" type="button">
                Có
              </button>
              <button className="min-h-10 rounded-xl bg-white text-[#334155]" type="button">
                Không
              </button>
            </div>
          </div>
        ) : null}
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

function SheetTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[20px] font-bold text-[#10233f]">{title}</h2>
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
      className={`flex min-h-12 items-center justify-between rounded-2xl border px-3 text-left text-sm font-semibold ${
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
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8fbfd] px-3 py-2">
      <span className="text-[#64748b]">{label}</span>
      <span className="text-right font-semibold text-[#10233f]">{value}</span>
    </div>
  );
}
