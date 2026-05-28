"use client";

import { useEffect, useState } from "react";
import {
  Baby,
  Brain,
  Eye,
  HeartPulse,
  CalendarCheck2,
  ChevronRight,
  CircleCheckBig,
  CreditCard,
  QrCode,
} from "lucide-react";

type DoctorCard = {
  id: string;
  name: string;
  specialty: string;
  price?: string;
  avatar?: string;
};

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  doctors?: DoctorCard[];
  onCreated?: (booking: CreatedBooking) => void;
};

type BookingMode = "direct" | "online";
type PaymentMethod = "counter" | "qr";

type CreatedBooking = {
  id: string;
  code: string;
  doctorName: string;
  specialty: string;
  mode: BookingMode;
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

const PAYMENT_QR_PATTERN = [
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

const CHECKIN_QR_PATTERN = [
  "111001111",
  "100001001",
  "101110101",
  "101010101",
  "101110101",
  "100001001",
  "111001111",
  "100100001",
  "111111111",
];

const DEFAULT_DOCTORS: DoctorCard[] = [
  {
    id: "dr-tam",
    name: "ThS. BS. Trần Tâm",
    specialty: "Tim mạch",
    price: "200.000đ",
    avatar: "👨🏿",
  },
  {
    id: "dr-van-b",
    name: "PGS. TS. Lê Văn B",
    specialty: "Nội thần kinh",
    price: "300.000đ",
    avatar: "👩🏻‍⚕️",
  },
  {
    id: "dr-ngoc",
    name: "BS. CKI Nguyễn Thị C",
    specialty: "Nhi khoa",
    price: "150.000đ",
    avatar: "👩🏽",
  },
];

export default function BookingModal({
  open,
  onClose,
  doctors = [],
  onCreated,
}: BookingModalProps) {
  const docList = doctors.length ? doctors : DEFAULT_DOCTORS;
  const times = ["09:00", "09:30", "10:00", "10:30", "13:00", "13:30", "14:00"];
  const dates = ["Hôm nay", "Ngày mai", "Thứ 3"]; // placeholder
  const specialties = [
    {
      key: "cardio",
      label: "Tim mạch",
      icon: HeartPulse,
      accent: "bg-[#fff7ed] text-[#f97316]",
    },
    {
      key: "pedi",
      label: "Nhi khoa",
      icon: Baby,
      accent: "bg-[#eff6ff] text-[#2563eb]",
    },
    {
      key: "neuro",
      label: "Thần kinh",
      icon: Brain,
      accent: "bg-[#f5f3ff] text-[#8b5cf6]",
    },
    {
      key: "eye",
      label: "Mắt",
      icon: Eye,
      accent: "bg-[#ecfdf5] text-[#10b981]",
    },
  ];
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(dates[0]);
  const [step, setStep] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorCard | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<BookingMode>("direct");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");

  const resetFlow = () => {
    setSelectedSpecialty(null);
    setSelectedDate(dates[0]);
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setBookingMode("direct");
    setPaymentMethod("qr");
  };

  useEffect(() => {
    if (open) {
      resetFlow();
    }
  }, [open]);

  if (!open) return null;

  const handleChooseDoctor = (d: DoctorCard) => {
    setSelectedDoctor(d);
    setStep(2);
  };

  const switchMode = (mode: BookingMode) => {
    setBookingMode(mode);
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPaymentMethod("qr");
  };

  const handleConfirm = () => {
    setStep(4);
  };

  const buildCreatedBooking = (): CreatedBooking => {
    const code = `#KB${Date.now().toString().slice(-6)}`;

    return {
      id: `booking-${Date.now()}`,
      code,
      doctorName: selectedDoctor?.name ?? "Chưa chọn bác sĩ",
      specialty: selectedDoctor?.specialty ?? "Chuyên khoa",
      mode: bookingMode,
      dateLabel: selectedDate ?? "Hôm nay",
      timeLabel: selectedSlot ?? "--:--",
      avatar: selectedDoctor?.avatar ?? "👩‍⚕️",
      price: selectedDoctor?.price,
      location:
        bookingMode === "direct"
          ? "Phòng khám đa khoa - Tầng 2"
          : "Tư vấn online trên ứng dụng",
      checkinQrCode: bookingMode === "direct" ? code : undefined,
      summary:
        bookingMode === "direct"
          ? "Lịch khám trực tiếp mới được tạo và đang chờ đến giờ khám."
          : "Lịch tư vấn online mới được tạo, sẵn sàng vào phòng tư vấn.",
      detail:
        bookingMode === "direct"
          ? "Lịch khám trực tiếp này vừa được tạo thành công. Bạn có thể dùng mã QR check-in khi đến phòng khám."
          : "Lịch tư vấn online này vừa được tạo thành công. Khi đến giờ hẹn, bạn vào phòng tư vấn ngay trong ứng dụng.",
    };
  };

  const handlePaymentDone = () => {
    const createdBooking = buildCreatedBooking();

    if (typeof window !== "undefined") {
      const existingRaw = window.localStorage.getItem(
        CREATED_BOOKINGS_STORAGE_KEY,
      );
      const existingBookings = existingRaw ? JSON.parse(existingRaw) : [];
      window.localStorage.setItem(
        CREATED_BOOKINGS_STORAGE_KEY,
        JSON.stringify([createdBooking, ...existingBookings]),
      );
    }

    onCreated?.(createdBooking);
    setStep(5);
  };

  const visitCode = `KB-${selectedDoctor?.id ?? "0000"}-${selectedSlot?.replace(":", "") ?? "0000"}`;

  const renderQr = (pattern: string[]) => {
    return (
      <div className="grid aspect-square grid-cols-9 gap-0.5 rounded-3xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
        {pattern.flatMap((row, rowIndex) =>
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
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4 py-6">
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_rgba(15,23,42,0.32)]">
        <header className="rounded-t-2xl bg-[#2f66dc] px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  onClose();
                } else {
                  setStep(step - 1);
                }
              }}
              className="text-white/90"
            >
              ◂
            </button>
            <h3 className="flex-1 text-lg font-semibold">Đặt lịch khám</h3>
            <div className="flex items-center gap-2 text-[12px]">
              {[1, 2, 3, 4, 5].map((currentStep) => (
                <div
                  key={currentStep}
                  className={`h-6 w-6 rounded-full ${step === currentStep ? "bg-white text-[#2f66dc]" : "bg-white/20 text-white/70"} flex items-center justify-center font-semibold`}
                >
                  {currentStep}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <input
              placeholder="Tìm tên bác sĩ, chuyên khoa..."
              className="w-full rounded-xl border-0 px-3 py-2 text-sm"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === 1 && (
            <>
              <div className="mb-3 rounded-2xl border border-[#e7eef8] bg-[#f4f8ff] p-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => switchMode("direct")}
                    className={`rounded-full px-3 py-2 text-sm shadow-sm transition ${bookingMode === "direct" ? "bg-white font-semibold text-[#2f66dc] shadow-[0_8px_18px_rgba(47,102,220,0.12)]" : "bg-transparent font-medium text-[#667085] hover:bg-white/70"}`}
                  >
                    Khám trực tiếp
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("online")}
                    className={`rounded-full px-3 py-2 text-sm shadow-sm transition ${bookingMode === "online" ? "bg-white font-semibold text-[#2f66dc] shadow-[0_8px_18px_rgba(47,102,220,0.12)]" : "bg-transparent font-medium text-[#667085] hover:bg-white/70"}`}
                  >
                    Tư vấn Online
                  </button>
                </div>
                <p className="mt-2 px-1 text-[12px] text-[#6b7280]">
                  Chọn một trong hai hình thức: khám trực tiếp tại phòng khám
                  hoặc tư vấn online qua video.
                </p>
              </div>

              <div className="mb-4 rounded-2xl bg-[#f8fbff] px-4 py-3">
                <p className="text-[13px] font-semibold text-[#202939]">
                  {bookingMode === "direct"
                    ? "Đặt lịch khám trực tiếp"
                    : "Đặt lịch tư vấn online"}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                  {bookingMode === "direct"
                    ? "Bạn sẽ đến bệnh viện/phòng khám để gặp bác sĩ trực tiếp."
                    : "Bạn sẽ tư vấn với bác sĩ qua cuộc gọi/video ngay trên ứng dụng."}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-4 gap-2">
                {specialties.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedSpecialty(s.key)}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-sm transition ${selectedSpecialty === s.key ? "bg-[#f8fbff] text-[#202939] font-semibold shadow-sm ring-2 ring-[#2f66dc]/20" : "bg-white text-[#4b5568] border border-[#edf2f8]"}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.accent} ${selectedSpecialty === s.key ? "ring-2 ring-[#2f66dc]/20" : ""}`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[12px] leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {docList.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-2xl border border-[#eef2f8] bg-white px-3 py-3"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-[#f1f3f7] flex items-center justify-center text-[26px]">
                          {d.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202939]">
                            {d.name}
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            {d.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-[#2667ea]">
                        {bookingMode === "direct" ? "Phí khám" : "Phí tư vấn"}{" "}
                        <span className="font-semibold">{d.price}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleChooseDoctor(d)}
                      className="rounded-full bg-[#2f66dc] px-3 py-2 text-sm font-medium text-white"
                    >
                      {bookingMode === "direct" ? "Chọn bác sĩ" : "Chọn tư vấn"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && selectedDoctor && (
            <div>
              <p className="mb-2 text-sm text-[#6b7280]">Chọn ngày</p>
              <div className="mb-4 flex gap-2">
                {dates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`rounded-full px-3 py-2 text-sm transition ${selectedDate === d ? "bg-[#2f66dc] font-bold text-white shadow-[0_8px_18px_rgba(47,102,220,0.16)]" : "border border-[#d9e2f0] bg-white font-semibold text-[#475569] hover:border-[#b9c9e3] hover:bg-[#f8fbff]"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <p className="mb-2 text-sm text-[#6b7280]">Chọn khung giờ</p>
              <div className="grid grid-cols-3 gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedSlot(t)}
                    className={`rounded-xl px-3 py-2 text-sm transition ${selectedSlot === t ? "bg-[#2f66dc] font-bold text-white shadow-[0_8px_18px_rgba(47,102,220,0.16)]" : "border border-[#d9e2f0] bg-white font-semibold text-[#475569] hover:border-[#b9c9e3] hover:bg-[#f8fbff]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-[#cfd8e5] bg-white px-4 py-2 font-semibold text-[#202939] shadow-sm transition hover:border-[#9fb3d9] hover:bg-[#f8fbff]"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-white disabled:opacity-60"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedDoctor && (
            <div>
              <p className="text-sm text-[#6b7280]">Xác nhận</p>
              <div className="mt-3 rounded-2xl border border-[#eef2f8] bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#f1f3f7] flex items-center justify-center text-[26px]">
                    {selectedDoctor.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#202939]">
                      {selectedDoctor.name}
                    </p>
                    <p className="text-sm text-[#6b7280]">
                      {selectedDoctor.specialty}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-sm text-[#344054]">
                  <div>
                    Hình thức:{" "}
                    <span className="font-medium">
                      {bookingMode === "direct"
                        ? "Khám trực tiếp"
                        : "Tư vấn online"}
                    </span>
                  </div>
                  <div>
                    Ngày:{" "}
                    <span className="font-medium">
                      {selectedSlot ? "(ngày chọn)" : "-"}
                    </span>
                  </div>
                  <div>
                    Giờ:{" "}
                    <span className="font-medium">{selectedSlot ?? "-"}</span>
                  </div>
                  <div className="mt-2 text-[#2667ea]">
                    {bookingMode === "direct" ? "Phí khám" : "Phí tư vấn"}{" "}
                    <span className="font-semibold">
                      {selectedDoctor.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-full border border-[#cfd8e5] bg-[#f8fbff] px-4 py-2 font-semibold text-[#202939] shadow-sm"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirm}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-white"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}

          {step === 4 && selectedDoctor && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#202939]">
                  Chọn phương thức thanh toán
                </p>
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  Bạn có thể thanh toán tại quầy hoặc quét QR để thanh toán
                  nhanh.
                </p>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("counter")}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === "counter" ? "border-[#2f66dc] bg-[#f4f8ff] shadow-sm" : "border-[#e5e8ee] bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f66dc]">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#202939]">
                        Thanh toán tại quầy
                      </p>
                      <p className="text-[12px] text-[#6b7280]">
                        Thanh toán trực tiếp khi đến khám.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "counter" ? "border-[#2f66dc] bg-[#2f66dc]" : "border-[#cfd7e4] bg-white"}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("qr")}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === "qr" ? "border-[#2f66dc] bg-[#f4f8ff] shadow-sm" : "border-[#e5e8ee] bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eefbf4] text-[#16a34a]">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#202939]">
                        Thanh toán qua QR
                      </p>
                      <p className="text-[12px] text-[#6b7280]">
                        Quét mã để thanh toán ngay trên điện thoại.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "qr" ? "border-[#2f66dc] bg-[#2f66dc]" : "border-[#cfd7e4] bg-white"}`}
                  />
                </button>
              </div>

              {paymentMethod === "qr" ? (
                <div className="rounded-3xl border border-[#e5e8ee] bg-[#f8fbff] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#202939]">
                        Quét mã QR để thanh toán
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {selectedDoctor.name} · {selectedDoctor.price}
                      </p>
                    </div>
                    <div className="rounded-full bg-[#e8f0ff] px-3 py-1 text-[12px] font-semibold text-[#2f66dc]">
                      Đang chờ thanh toán
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <div className="w-56">{renderQr(PAYMENT_QR_PATTERN)}</div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-[12px] leading-5 text-[#5b6575]">
                    Số tiền thanh toán:{" "}
                    <span className="font-semibold">
                      {selectedDoctor.price}
                    </span>
                    <br />
                    Nội dung: <span className="font-semibold">{visitCode}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-[#e5e8ee] bg-[#f8fbff] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f66dc]">
                      <CircleCheckBig className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#202939]">
                        Thanh toán tại quầy
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                        Bạn chỉ cần mang phiếu khám và thanh toán tại quầy trước
                        khi vào khám.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full border px-4 py-2"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handlePaymentDone}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-white"
                >
                  {paymentMethod === "qr"
                    ? "Tôi đã thanh toán"
                    : "Xác nhận thanh toán tại quầy"}
                </button>
              </div>
            </div>
          )}

          {step === 5 && selectedDoctor && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-[#dbe8ff] bg-[#f8fbff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f66dc]">
                      Phiếu khám đã tạo
                    </p>
                    <h4 className="mt-1 text-[18px] font-bold text-[#202939]">
                      {selectedDoctor.name}
                    </h4>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[28px]">
                    {selectedDoctor.avatar}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 rounded-2xl bg-white p-4 text-[13px] text-[#344054] shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Mã phiếu</span>
                    <span className="font-semibold">{visitCode}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Hình thức</span>
                    <span className="font-semibold">
                      {bookingMode === "direct"
                        ? "Khám trực tiếp"
                        : "Tư vấn online"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Ngày</span>
                    <span className="font-semibold">{selectedDate ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Giờ</span>
                    <span className="font-semibold">{selectedSlot ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Thanh toán</span>
                    <span className="font-semibold">
                      {paymentMethod === "qr"
                        ? "Đã thanh toán QR"
                        : "Thanh toán tại quầy"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Phí khám</span>
                    <span className="font-semibold text-[#2f66dc]">
                      {selectedDoctor.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#e5e8ee] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#202939]">
                      Mã QR check-in
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      Dùng mã này khi đến khám để quét nhanh cho bệnh nhân.
                    </p>
                  </div>
                  <div className="rounded-full bg-[#e8f0ff] px-3 py-1 text-[12px] font-semibold text-[#2f66dc]">
                    Sẵn sàng quét
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="w-56">{renderQr(CHECKIN_QR_PATTERN)}</div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#f8fbff] px-4 py-3 text-[12px] leading-5 text-[#5b6575]">
                  Khi đến phòng khám, chỉ cần đưa phiếu này để nhân viên quét mã
                  và đối chiếu nhanh thông tin.
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetFlow();
                  }}
                  className="rounded-full border px-4 py-2"
                >
                  Đặt lịch mới
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
