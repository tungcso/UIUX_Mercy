"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  Clock3,
  Camera,
  QrCode,
  MapPin,
  MessageCircle,
  Mic,
  PhoneOff,
  Plus,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import BookingModal from "../consult/_components/booking-modal";

type AppointmentStatus = "upcoming" | "history";

type AppointmentItem = {
  id: string;
  code: string;
  doctorName: string;
  specialty: string;
  mode: string;
  dateLabel: string;
  timeLabel: string;
  location?: string;
  status: AppointmentStatus;
  statusLabel: string;
  statusTone: string;
  avatar: string;
  summary: string;
  detail: string;
  checkinQrCode?: string;
};

type CreatedBooking = {
  id: string;
  code: string;
  doctorName: string;
  specialty: string;
  mode: "direct" | "online";
  dateLabel: string;
  timeLabel: string;
  avatar: string;
  price?: string;
  location?: string;
  checkinQrCode?: string;
  summary: string;
  detail: string;
};

const CREATED_BOOKINGS_STORAGE_KEY = "mercy-created-bookings";
const QR_PATTERN = [
  "101111001",
  "100000001",
  "101110101",
  "101110101",
  "101110101",
  "100000001",
  "101111001",
  "100010001",
  "111111111",
];

const BASE_APPOINTMENTS: AppointmentItem[] = [
  {
    id: "upcoming-1",
    code: "#KB8821",
    doctorName: "ThS. BS. Trần Tâm",
    specialty: "Tim mạch",
    mode: "Tư vấn Online",
    dateLabel: "Hôm nay, 24/05",
    timeLabel: "14:30 - 15:00",
    status: "upcoming",
    statusLabel: "Sắp diễn ra",
    statusTone: "bg-[#ffeaea] text-[#ef4444]",
    avatar: "👨🏿",
    summary: "Lịch tư vấn online đang chờ bạn vào phòng tư vấn.",
    detail:
      "Đây là lịch tư vấn online sắp diễn ra với ThS. BS. Trần Tâm. Bạn có thể vào phòng tư vấn trước 5 phút, kiểm tra camera, micro và chuẩn bị câu hỏi cần trao đổi.",
  },
  {
    id: "history-1",
    code: "#KB8904",
    doctorName: "PGS. TS. Lê Văn B",
    specialty: "Nội thần kinh",
    mode: "Trực tiếp",
    dateLabel: "T5, 28/05/2026",
    timeLabel: "09:00 - 09:30",
    location: "Phòng 204, Tầng 2, Tòa nhà A - Phòng khám Đa khoa",
    status: "history",
    statusLabel: "Đã xác nhận",
    statusTone: "bg-[#e8f9ef] text-[#15803d]",
    avatar: "👩🏻‍⚕️",
    summary:
      "Lịch khám trực tiếp đã được xác nhận và sẵn sàng đổi lịch nếu cần.",
    detail:
      "Lịch khám trực tiếp đã được xác nhận. Khi đến khám, bạn nên có mặt trước 15 phút, mang theo giấy tờ liên quan và đến đúng phòng đã ghi trong lịch hẹn.",
    checkinQrCode: "#KB8904",
  },
  {
    id: "history-2",
    code: "#KB8740",
    doctorName: "BS. CKI Nguyễn Thị C",
    specialty: "Nhi khoa",
    mode: "Tái khám",
    dateLabel: "T2, 20/05/2026",
    timeLabel: "08:15 - 08:45",
    location: "Khoa Nhi - Tầng 1",
    status: "history",
    statusLabel: "Hoàn thành",
    statusTone: "bg-[#eef2ff] text-[#4f46e5]",
    avatar: "👩🏾",
    summary:
      "Lịch khám trước đó đã hoàn thành, có thể xem lại chi tiết và toa thuốc.",
    detail:
      "Lịch khám này đã hoàn thành. Bạn có thể xem lại ghi chú của bác sĩ, đơn thuốc và các nội dung tư vấn trong hồ sơ khám bệnh.",
  },
];

const tabTitles: Record<AppointmentStatus, string> = {
  upcoming: "Sắp tới",
  history: "Lịch sử",
};

const mergeAppointments = (
  baseList: AppointmentItem[],
  createdBookings: CreatedBooking[],
) => {
  const createdAppointments: AppointmentItem[] = createdBookings.map(
    (booking) => ({
      id: booking.id,
      code: booking.code,
      doctorName: booking.doctorName,
      specialty: booking.specialty,
      mode: booking.mode === "direct" ? "Khám trực tiếp" : "Tư vấn Online",
      dateLabel: booking.dateLabel,
      timeLabel: booking.timeLabel,
      location: booking.location,
      status: "upcoming",
      statusLabel: "Sắp diễn ra",
      statusTone: "bg-[#ffeaea] text-[#ef4444]",
      avatar: booking.avatar,
      summary: booking.summary,
      detail: booking.detail,
      checkinQrCode: booking.checkinQrCode,
    }),
  );

  const merged = [...createdAppointments, ...baseList];
  const seen = new Set<string>();

  return merged.filter((item) => {
    if (seen.has(item.code)) {
      return false;
    }

    seen.add(item.code);
    return true;
  });
};

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<AppointmentStatus>("upcoming");
  const [appointmentsList, setAppointmentsList] =
    useState<AppointmentItem[]>(BASE_APPOINTMENTS);
  const [rescheduledAppointmentId, setRescheduledAppointmentId] = useState<
    string | null
  >(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentItem | null>(null);
  const [activeAction, setActiveAction] = useState<AppointmentItem | null>(
    null,
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callTarget, setCallTarget] = useState<AppointmentItem | null>(null);
  const [qrTarget, setQrTarget] = useState<AppointmentItem | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isReschedulePending, setIsReschedulePending] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<AppointmentItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("Hôm nay");
  const [rescheduleTime, setRescheduleTime] = useState("14:30");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(CREATED_BOOKINGS_STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const createdBookings = JSON.parse(raw) as CreatedBooking[];
      setAppointmentsList((current) =>
        mergeAppointments(current, createdBookings),
      );
    } catch {
      window.localStorage.removeItem(CREATED_BOOKINGS_STORAGE_KEY);
    }
  }, []);

  const visibleAppointments = useMemo(
    () =>
      appointmentsList.filter(
        (appointment) => appointment.status === selectedTab,
      ),
    [appointmentsList, selectedTab],
  );

  const upcomingAppointment = appointmentsList.find(
    (appointment) => appointment.status === "upcoming",
  );

  const persistCreatedBooking = (booking: CreatedBooking) => {
    setAppointmentsList((current) => mergeAppointments(current, [booking]));

    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(CREATED_BOOKINGS_STORAGE_KEY);
      const existingBookings = raw ? (JSON.parse(raw) as CreatedBooking[]) : [];
      window.localStorage.setItem(
        CREATED_BOOKINGS_STORAGE_KEY,
        JSON.stringify([booking, ...existingBookings]),
      );
    }

    setSelectedTab("upcoming");
  };

  const openAppointmentActions = (appointment: AppointmentItem) => {
    setActiveAction(appointment);
    setSelectedAppointment(null);
  };

  const openAppointmentDetail = (appointment: AppointmentItem) => {
    setSelectedAppointment(appointment);
    setActiveAction(null);
  };

  const openRescheduleModal = (appointment: AppointmentItem) => {
    setRescheduleTarget(appointment);
    setRescheduleDate("Hôm nay");
    setRescheduleTime("14:30");
    setIsRescheduleOpen(true);
    setActiveAction(null);
  };

  const confirmReschedule = () => {
    setIsRescheduleOpen(false);
    setIsReschedulePending(true);
    if (rescheduleTarget) {
      setRescheduledAppointmentId(rescheduleTarget.id);
    }
    setSelectedAppointment(null);
    setActiveAction(null);
  };

  const goToConsult = () => {
    router.push("/patient/consult");
  };

  const openCallPopup = (appointment: AppointmentItem) => {
    setCallTarget(appointment);
    setIsCallOpen(true);
  };

  const openQrPopup = (appointment: AppointmentItem) => {
    setQrTarget(appointment);
  };

  const openPrimaryAction = (appointment: AppointmentItem) => {
    if (appointment.checkinQrCode) {
      openQrPopup(appointment);
      return;
    }

    openCallPopup(appointment);
  };

  const isOnlineAppointment = (appointment: AppointmentItem) =>
    appointment.mode.toLowerCase().includes("online");

  const changeTab = (tab: AppointmentStatus) => {
    setSelectedTab(tab);
    setSelectedAppointment(null);
    setActiveAction(null);
  };

  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-1.5 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3.5 pt-4.5 text-white">
          <div className="mb-3.5 flex items-center justify-between">
            <h1 className="text-[32px] font-bold leading-tight">
              Lịch khám của tôi
            </h1>
            <button
              type="button"
              aria-label="Đặt lịch khám"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3c74ea] text-white shadow-[0_10px_24px_rgba(47,102,220,0.22)]"
              onClick={() => setIsBookingOpen(true)}
            >
              <CalendarCheck2 className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 rounded-2xl bg-[#255ad0] p-1">
            <button
              type="button"
              className={`rounded-xl py-2 text-[17px] ${
                selectedTab === "upcoming"
                  ? "bg-white font-semibold text-[#2f66dc]"
                  : "font-medium text-white/90"
              }`}
              onClick={() => changeTab("upcoming")}
            >
              Sắp tới
            </button>
            <button
              type="button"
              className={`rounded-xl py-2 text-[17px] ${
                selectedTab === "history"
                  ? "bg-white font-semibold text-[#2f66dc]"
                  : "font-medium text-white/90"
              }`}
              onClick={() => changeTab("history")}
            >
              Lịch sử
            </button>
          </div>
        </section>

        <BookingModal
          open={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onCreated={persistCreatedBooking}
        />

        {isCallOpen && callTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4">
            <button
              type="button"
              aria-label="Đóng cuộc gọi"
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-xl animate-call-backdrop"
              onClick={() => setIsCallOpen(false)}
            />

            <div className="relative flex h-[min(92vh,860px)] w-full max-w-md flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#050816] shadow-[0_36px_120px_rgba(0,0,0,0.55)] animate-call-shell">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,250,0.35),transparent_36%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.18),transparent_30%)] animate-call-ambient" />

              <div className="relative z-10 flex items-center justify-between px-4 py-4 text-white">
                <div>
                  <p className="inline-flex items-center gap-1 text-[13px] font-medium text-white/70">
                    <span>Đang kết nối với</span>
                    <span
                      className="inline-flex items-end gap-0.5 text-white/60 animate-call-dots"
                      aria-hidden="true"
                    >
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </p>
                  <h3 className="text-[18px] font-semibold">
                    {callTarget.doctorName}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCallOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                >
                  ×
                </button>
              </div>

              <div className="relative z-10 flex flex-1 flex-col px-4 pb-4">
                <div className="relative flex flex-1 items-end overflow-hidden rounded-4xl border border-white/10 bg-linear-to-b from-slate-900 via-slate-800 to-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(96,165,250,0.25),transparent_22%),radial-gradient(circle_at_75%_25%,rgba(14,165,233,0.2),transparent_18%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.65))]" />

                  <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/90 backdrop-blur animate-call-chip">
                    <span className="inline-flex items-end gap-0.5 text-white/75">
                      <span className="animate-call-dot">.</span>
                      <span className="animate-call-dot animate-call-dot-delay-1">
                        .
                      </span>
                      <span className="animate-call-dot animate-call-dot-delay-2">
                        .
                      </span>
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-emerald-400/20 px-3 py-1 text-[12px] font-semibold text-emerald-200 backdrop-blur animate-call-chip">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                      Video call
                    </span>
                  </div>

                  <div className="absolute inset-x-0 top-[18%] flex justify-center animate-call-float">
                    <div className="flex flex-col items-center gap-3 text-center text-white">
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/15 bg-linear-to-br from-white/20 to-white/8 text-[56px] shadow-[0_24px_70px_rgba(0,0,0,0.3)] animate-call-avatar">
                        {callTarget.avatar}
                      </div>
                      <div>
                        <p className="text-[17px] font-semibold tracking-tight">
                          {callTarget.doctorName}
                        </p>
                        <p className="mt-1 text-[13px] text-white/70">
                          {callTarget.specialty} · Đang trực tuyến
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-4 bottom-28 h-32 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-700 shadow-[0_16px_40px_rgba(0,0,0,0.35)] animate-call-self">
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-600 to-slate-800 text-[34px]">
                      👤
                    </div>
                  </div>

                  <div className="absolute left-4 bottom-28 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white/90 backdrop-blur animate-call-status">
                    <p className="text-[12px] font-medium">
                      Bác sĩ đang kết nối
                    </p>
                    <p className="text-[11px] text-white/65">
                      Chất lượng mạng ổn định
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 animate-call-controls">
                  <button
                    type="button"
                    className="flex h-14 flex-col items-center justify-center rounded-[1.25rem] bg-white/10 text-white backdrop-blur"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="mt-1 text-[11px]">Camera</span>
                  </button>
                  <button
                    type="button"
                    className="flex h-14 flex-col items-center justify-center rounded-[1.25rem] bg-white/10 text-white backdrop-blur"
                  >
                    <Mic className="h-5 w-5" />
                    <span className="mt-1 text-[11px]">Mic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCallOpen(false)}
                    className="flex h-14 flex-col items-center justify-center rounded-[1.25rem] bg-[#ef4444] text-white shadow-[0_12px_30px_rgba(239,68,68,0.28)]"
                  >
                    <PhoneOff className="h-5 w-5" />
                    <span className="mt-1 text-[11px]">Ngắt kết nối</span>
                  </button>
                </div>

                <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-white/85 backdrop-blur animate-call-summary">
                  <p className="text-[13px] font-medium">
                    {callTarget.summary}
                  </p>
                  <p className="mt-1 text-[12px] text-white/60">
                    Nhấn nút đỏ để ngắt kết nối cuộc gọi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {qrTarget?.checkinQrCode ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4">
            <button
              type="button"
              aria-label="Đóng mã QR"
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
              onClick={() => setQrTarget(null)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Trình mã QR
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {qrTarget.doctorName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQrTarget(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-3xl border border-[#e5e8ee] bg-[#f8fbff] p-4">
                <p className="text-[13px] font-semibold text-[#202939]">
                  Mã quét khi đến phòng khám
                </p>
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  Đưa mã này cho nhân viên quầy lễ tân để xác nhận nhanh.
                </p>

                <div className="mt-4 flex justify-center">
                  <div className="grid aspect-square w-56 grid-cols-9 gap-0.5 rounded-3xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
                    {QR_PATTERN.flatMap((row, rowIndex) =>
                      row
                        .split("")
                        .map((cell, cellIndex) => (
                          <div
                            key={`${rowIndex}-${cellIndex}`}
                            className={`rounded-xs ${cell === "1" ? "bg-slate-950" : "bg-slate-200/70"}`}
                          />
                        )),
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-[13px] leading-6 text-[#344054] shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Mã lịch</span>
                    <span className="font-semibold">{qrTarget.code}</span>
                  </div>
                  <div className="mt-2 flex justify-between gap-3">
                    <span className="text-[#6b7280]">Hình thức</span>
                    <span className="font-semibold">{qrTarget.mode}</span>
                  </div>
                  <div className="mt-2 flex justify-between gap-3">
                    <span className="text-[#6b7280]">Thời gian</span>
                    <span className="font-semibold">
                      {qrTarget.dateLabel} · {qrTarget.timeLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setQrTarget(null)}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isReschedulePending && rescheduleTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Đóng trạng thái chờ xác nhận"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setIsReschedulePending(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Đổi lịch đã gửi
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {rescheduleTarget.doctorName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReschedulePending(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                <p className="font-semibold text-[#202939]">
                  Lịch mới: {rescheduleDate} · {rescheduleTime}
                </p>
                <p className="mt-2">
                  Chờ Bác sĩ xác nhận lịch hẹn mới. Bạn sẽ nhận thông báo khi
                  bác sĩ phản hồi.
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsReschedulePending(false)}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isRescheduleOpen && rescheduleTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Đóng đổi lịch"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setIsRescheduleOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Đổi lịch với Bác sĩ
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {rescheduleTarget.doctorName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-[14px] font-semibold text-[#202939]">
                    Chọn ngày mới
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Hôm nay", "Ngày mai", "Thứ 3"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setRescheduleDate(day)}
                        className={`rounded-full px-3 py-2 text-[14px] ${rescheduleDate === day ? "bg-[#2f66dc] font-semibold text-white" : "border border-[#dbe4f3] bg-white text-[#4b5565]"}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[14px] font-semibold text-[#202939]">
                    Chọn giờ mới
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map(
                      (time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setRescheduleTime(time)}
                          className={`rounded-xl px-3 py-2 text-[14px] ${rescheduleTime === time ? "bg-[#2f66dc] font-semibold text-white" : "border border-[#dbe4f3] bg-white text-[#4b5565]"}`}
                        >
                          {time}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                  <p className="font-semibold text-[#202939]">Lưu ý</p>
                  <p className="mt-1">
                    Sau khi xác nhận, lịch sẽ chuyển sang trạng thái chờ Bác sĩ
                    xác nhận.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmReschedule}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Xác nhận đổi lịch
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="px-4 pb-23 pt-4">
          <div className="space-y-3">
            {visibleAppointments.map((appointment) => {
              const isWaitingDoctorConfirmation =
                appointment.id === rescheduledAppointmentId;

              return (
                <article
                  key={appointment.id}
                  className={`rounded-3xl border border-[#e4e8ef] border-l-6 bg-white p-2.5 shadow-[0_4px_14px_rgba(148,163,184,0.1)] ${
                    appointment.status === "upcoming"
                      ? "border-l-[#ef4444]"
                      : "border-l-[#22c55e]"
                  }`}
                >
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[14px] font-semibold ${
                        isWaitingDoctorConfirmation
                          ? "bg-[#fff3cd] text-[#b45309]"
                          : appointment.statusTone
                      }`}
                    >
                      {appointment.status === "upcoming" &&
                      !isWaitingDoctorConfirmation ? (
                        <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                      ) : null}
                      {isWaitingDoctorConfirmation
                        ? "Chờ Bác sĩ xác nhận"
                        : appointment.statusLabel}
                    </span>
                    <span className="text-[14px] text-[#96a0b1]">
                      Mã: {appointment.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-[27px] ${
                          appointment.status === "upcoming"
                            ? "bg-[#dcecff]"
                            : "bg-[#f1f3f7]"
                        }`}
                      >
                        {appointment.avatar}
                      </div>
                      <div>
                        <p className="text-[16px] font-bold leading-tight text-[#202939]">
                          {appointment.doctorName}
                        </p>
                        <p className="mt-0.5 text-[14px] text-[#66758a]">
                          {appointment.specialty} • {appointment.mode}
                        </p>
                      </div>
                    </div>

                    {appointment.status === "upcoming" ? (
                      <button
                        type="button"
                        aria-label={
                          appointment.checkinQrCode
                            ? "Trình mã QR"
                            : "Vào phòng tư vấn"
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3ff] text-[#2f66dc]"
                        onClick={() => openPrimaryAction(appointment)}
                      >
                        {appointment.checkinQrCode ? (
                          <QrCode className="h-4 w-4" />
                        ) : (
                          <Video className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f7fb] px-3 py-2 text-[#3f4c5f]">
                    <div className="flex items-center gap-1.5 text-[14px]">
                      <CalendarDays className="h-4 w-4 text-[#2d67e7]" />
                      <span>{appointment.dateLabel}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-[14px] font-semibold text-[#4b5565]">
                      <Clock3 className="h-4 w-4 text-[#6b7280]" />
                      <span>{appointment.timeLabel}</span>
                    </div>
                  </div>

                  {appointment.location ? (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[14px] text-[#6b7280]">
                      <MapPin className="h-4 w-4" />
                      <span>{appointment.location}</span>
                    </div>
                  ) : null}

                  <p className="mt-2.5 text-[13px] leading-5 text-[#66758a]">
                    {appointment.summary}
                  </p>

                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="rounded-2xl bg-[#f2f4f8] px-4 py-2 text-[15px] font-medium text-[#4b5565]"
                      onClick={() => openRescheduleModal(appointment)}
                    >
                      Đổi lịch
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-[#d2d8e3] bg-white px-4 py-2 text-[15px] font-medium text-[#2f66dc]"
                      onClick={() => openAppointmentDetail(appointment)}
                    >
                      Chi tiết
                    </button>
                  </div>

                  {appointment.status === "upcoming" &&
                  !isWaitingDoctorConfirmation ? (
                    <button
                      type="button"
                      className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f66dc] px-4 py-2 text-[15px] font-medium text-white"
                      onClick={() => openPrimaryAction(appointment)}
                    >
                      {appointment.checkinQrCode ? (
                        <QrCode className="h-4 w-4" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      {appointment.checkinQrCode
                        ? "Trình mã QR"
                        : "Vào phòng tư vấn"}
                    </button>
                  ) : isWaitingDoctorConfirmation ? (
                    <div className="mt-2.5 rounded-2xl bg-[#fff9e8] px-4 py-2 text-[13px] leading-5 text-[#9a6700]">
                      Bạn đã đổi lịch. Hiện lịch này đang chờ Bác sĩ xác nhận.
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-2.5 py-1.5 backdrop-blur">
          <ul className="grid grid-cols-4 text-center">
            <li>
              <Link
                href="/patient"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <Stethoscope className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Trang chủ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/appointments"
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <CalendarCheck2 className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Lịch khám</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/consult"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <MessageCircle className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Tư vấn</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/profile"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <UserRound className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Cá nhân</span>
              </Link>
            </li>
          </ul>
        </nav>

        {selectedAppointment ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Đóng chi tiết lịch khám"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setSelectedAppointment(null)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Chi tiết lịch khám
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {selectedAppointment.doctorName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[32px]">
                    {selectedAppointment.avatar}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#202939]">
                      {selectedAppointment.specialty} •{" "}
                      {selectedAppointment.mode}
                    </p>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      Mã lịch: {selectedAppointment.code}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                  <div className="flex items-center gap-2 text-[#334155]">
                    <CalendarDays className="h-4 w-4 text-[#2d67e7]" />
                    <span>{selectedAppointment.dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#334155]">
                    <Clock3 className="h-4 w-4 text-[#2d67e7]" />
                    <span>{selectedAppointment.timeLabel}</span>
                  </div>
                  {selectedAppointment.location ? (
                    <div className="flex items-start gap-2 text-[#334155]">
                      <MapPin className="mt-0.5 h-4 w-4 text-[#2d67e7]" />
                      <span>{selectedAppointment.location}</span>
                    </div>
                  ) : null}
                </div>

                <p className="mt-4">{selectedAppointment.detail}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointment(null);
                      openAppointmentActions(selectedAppointment);
                    }}
                    className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                  >
                    Thao tác nhanh
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeAction ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng menu thao tác lịch khám"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setActiveAction(null)}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Hành động lịch khám
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {activeAction.doctorName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => openPrimaryAction(activeAction)}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      {activeAction.checkinQrCode
                        ? "Trình mã QR"
                        : "Vào phòng tư vấn"}
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      {activeAction.checkinQrCode
                        ? "Hiển thị mã QR để quét tại quầy"
                        : "Mở nhanh phòng tư vấn trực tuyến"}
                    </p>
                  </div>
                  {activeAction.checkinQrCode ? (
                    <QrCode className="h-4.5 w-4.5 text-[#2f66dc]" />
                  ) : (
                    <Video className="h-4.5 w-4.5 text-[#2f66dc]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openRescheduleModal(activeAction);
                  }}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">Đổi lịch</p>
                    <p className="text-[13px] text-[#6b7280]">
                      Chọn lại lịch với Bác sĩ và chờ xác nhận
                    </p>
                  </div>
                  <Clock3 className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <style jsx global>{`
          @keyframes call-backdrop {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          @keyframes call-shell {
            0% {
              opacity: 0;
              transform: translateY(22px) scale(0.97);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes call-ambient {
            0%,
            100% {
              opacity: 0.72;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.06);
            }
          }

          @keyframes call-float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-6px);
            }
          }

          @keyframes call-avatar {
            0%,
            100% {
              transform: scale(1);
              box-shadow:
                0 0 0 0 rgba(96, 165, 250, 0.18),
                0 24px 70px rgba(0, 0, 0, 0.3);
            }
            50% {
              transform: scale(1.03);
              box-shadow:
                0 0 0 10px rgba(96, 165, 250, 0.05),
                0 24px 80px rgba(0, 0, 0, 0.36);
            }
          }

          @keyframes call-self {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-4px);
            }
          }

          @keyframes call-status {
            0%,
            100% {
              transform: translateX(0);
              opacity: 0.9;
            }
            50% {
              transform: translateX(4px);
              opacity: 1;
            }
          }

          @keyframes call-dots {
            0%,
            20% {
              opacity: 0.25;
              transform: translateY(0);
            }
            40% {
              opacity: 0.7;
              transform: translateY(-1px);
            }
            60% {
              opacity: 1;
              transform: translateY(0);
            }
            80%,
            100% {
              opacity: 0.35;
              transform: translateY(0);
            }
          }

          @keyframes call-summary {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
          }

          @keyframes call-chip {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-1px);
            }
          }

          @keyframes call-dot {
            0%,
            100% {
              opacity: 0.3;
              transform: translateY(0) scale(0.9);
            }
            40% {
              opacity: 1;
              transform: translateY(-2px) scale(1.08);
            }
            70% {
              opacity: 0.7;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes call-controls {
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-call-backdrop {
            animation: call-backdrop 220ms ease-out both;
          }

          .animate-call-shell {
            animation: call-shell 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
          }

          .animate-call-ambient {
            animation: call-ambient 7s ease-in-out infinite;
          }

          .animate-call-float {
            animation: call-float 4.2s ease-in-out infinite;
          }

          .animate-call-avatar {
            animation: call-avatar 3.8s ease-in-out infinite;
          }

          .animate-call-self {
            animation: call-self 3.6s ease-in-out infinite;
          }

          .animate-call-status {
            animation: call-status 3.8s ease-in-out infinite;
          }

          .animate-call-dots {
            animation: call-dots 1.2s ease-in-out infinite;
          }

          .animate-call-summary {
            animation: call-summary 4.6s ease-in-out infinite;
          }

          .animate-call-chip {
            animation: call-chip 3.2s ease-in-out infinite;
          }

          .animate-call-dot {
            display: inline-block;
            animation: call-dot 1.1s ease-in-out infinite;
          }

          .animate-call-dot-delay-1 {
            animation-delay: 140ms;
          }

          .animate-call-dot-delay-2 {
            animation-delay: 280ms;
          }

          .animate-call-controls {
            animation: call-controls 520ms ease-out both;
            animation-delay: 120ms;
          }
        `}</style>
      </div>
    </main>
  );
}
