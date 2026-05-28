"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";
import {
  Bell,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  MessageCircle,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  Video,
  Star,
} from "lucide-react";

type ServiceKey = "exam" | "consult" | "medicine" | "records";

type ServiceItem = {
  key: ServiceKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
};

type FeaturedDoctor = {
  name: string;
  specialty: string;
  rating: string;
  reviews: string;
  avatar: string;
};

type NotificationKind = "system" | "appointment" | "chatbot" | "medicine";

type NotificationItem = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  time: string;
  badge?: string;
  kind: NotificationKind;
};

const services: ServiceItem[] = [
  {
    key: "exam",
    label: "Khám bệnh",
    icon: Stethoscope,
    iconColor: "text-[#3a74eb]",
    bgColor: "bg-[#e7f0ff]",
  },
  {
    key: "consult",
    label: "Tư vấn Online",
    icon: Video,
    iconColor: "text-[#18a39a]",
    bgColor: "bg-[#d9f6ee]",
  },
  {
    key: "medicine",
    label: "Mua thuốc",
    icon: Pill,
    iconColor: "text-[#e7791f]",
    bgColor: "bg-[#fff0da]",
  },
  {
    key: "records",
    label: "Hồ sơ y tế",
    icon: FileText,
    iconColor: "text-[#8f63d8]",
    bgColor: "bg-[#eee5ff]",
  },
];

const featuredDoctors: FeaturedDoctor[] = [
  {
    name: "PGS. TS. Lê Văn B",
    specialty: "Nội thần kinh",
    rating: "4.9",
    reviews: "128 đánh giá",
    avatar: "👩🏻‍⚕️",
  },
  {
    name: "BS. CKI Nguyễn Thị C",
    specialty: "Nhi khoa",
    rating: "4.8",
    reviews: "95 đánh giá",
    avatar: "👩🏾",
  },
];

const notifications: NotificationItem[] = [
  {
    id: "chatbot-01",
    title: "Chatbot MedOS có tin nhắn mới",
    summary: "Bạn có câu hỏi về triệu chứng? Chatbot đã gửi gợi ý chăm sóc.",
    detail:
      "Chatbot MedOS đã phân tích câu hỏi gần nhất của bạn và gửi các gợi ý chăm sóc ban đầu, lịch theo dõi triệu chứng, cùng các dấu hiệu cần đi khám sớm.",
    time: "2 phút trước",
    badge: "Mới",
    kind: "chatbot",
  },
  {
    id: "appointment-01",
    title: "Nhắc lịch khám sắp tới",
    summary: "Lịch khám của bạn với ThS. BS. Trần Tâm vào 14:30 hôm nay.",
    detail:
      "Bạn có một lịch khám sắp tới với ThS. BS. Trần Tâm lúc 14:30 - 15:00 hôm nay. Vui lòng chuẩn bị sẵn kết quả xét nghiệm nếu có và vào phòng khám Online đúng giờ.",
    time: "10 phút trước",
    kind: "appointment",
  },
  {
    id: "medicine-01",
    title: "Đơn thuốc mới đã được cập nhật",
    summary: "Đơn thuốc của bạn đã được bác sĩ bổ sung và lưu vào hồ sơ.",
    detail:
      "Đơn thuốc mới đã được cập nhật vào hồ sơ cá nhân của bạn. Bạn có thể xem lại liều dùng, thời gian uống và lịch nhắc thuốc trong mục Đơn thuốc của tôi.",
    time: "Hôm qua",
    kind: "medicine",
  },
  {
    id: "system-01",
    title: "Cập nhật hệ thống MedOS",
    summary:
      "Ứng dụng vừa được cập nhật tính năng nhắn tin nhanh và theo dõi lịch khám.",
    detail:
      "MedOS vừa cập nhật phiên bản mới với tối ưu hiệu năng, cải thiện nhắn tin giữa bệnh nhân và bác sĩ, và đồng bộ lịch khám tốt hơn.",
    time: "T2",
    kind: "system",
  },
];

function NotificationIcon({ kind }: { kind: NotificationKind }) {
  if (kind === "chatbot") {
    return <MessageCircle className="h-5 w-5" />;
  }

  if (kind === "appointment") {
    return <CalendarCheck2 className="h-5 w-5" />;
  }

  if (kind === "medicine") {
    return <Pill className="h-5 w-5" />;
  }

  return <Bell className="h-5 w-5" />;
}

function notificationTone(kind: NotificationKind) {
  if (kind === "chatbot") {
    return "bg-[#dfeafb] text-[#2f66dc]";
  }

  if (kind === "appointment") {
    return "bg-[#e7f0ff] text-[#2f66dc]";
  }

  if (kind === "medicine") {
    return "bg-[#f0fdf4] text-[#16a34a]";
  }

  return "bg-[#f3f4f6] text-[#64748b]";
}

export default function PatientPage() {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchActionsOpen, setIsSearchActionsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<FeaturedDoctor | null>(
    null,
  );

  const goToAppointments = () => {
    setIsSearchActionsOpen(false);
    setIsNotificationsOpen(false);
    router.push("/patient/appointments");
  };

  const goToConsult = () => {
    setIsSearchActionsOpen(false);
    setIsNotificationsOpen(false);
    router.push("/patient/consult");
  };

  const goToConsultAi = () => {
    setIsSearchActionsOpen(false);
    setIsNotificationsOpen(false);
    router.push("/patient/consult?mode=ai");
  };

  const goToProfile = () => {
    setIsSearchActionsOpen(false);
    setIsNotificationsOpen(false);
    router.push("/patient/profile");
  };

  const openService = (serviceKey: ServiceKey) => {
    setIsSearchActionsOpen(false);
    setIsNotificationsOpen(false);

    if (serviceKey === "exam") {
      router.push("/patient/appointments");
      return;
    }

    if (serviceKey === "consult") {
      router.push("/patient/consult");
      return;
    }

    if (serviceKey === "medicine") {
      router.push("/patient/profile");
      return;
    }

    router.push("/patient/profile");
  };

  const openDoctorDetail = (doctor: FeaturedDoctor) => {
    setSelectedDoctor(doctor);
    setSelectedNotification(null);
    setIsNotificationsOpen(false);
    setIsSearchActionsOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-2 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3 pt-4 text-white">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[24px]">
                👨🏻
              </div>
              <div>
                <p className="text-sm text-white/85">Chào buổi sáng,</p>
                <h1 className="text-[26px] font-semibold leading-tight">
                  Nguyễn Văn An
                </h1>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                aria-label="Thông báo"
                aria-expanded={isNotificationsOpen}
                onClick={() => setIsNotificationsOpen((value) => !value)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#3c74ea]"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ff4a4a] ring-2 ring-[#3c74ea]" />
              </button>

              {isNotificationsOpen ? (
                <div className="absolute right-0 top-12 z-40 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
                    <div>
                      <div className="text-[15px] font-bold text-[#1f2939]">
                        Thông báo
                      </div>
                      <div className="text-[12px] text-[#94a3b8]">
                        {notifications.length} thông báo mới nhất
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[12px] font-medium text-[#64748b]"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="max-h-96 overflow-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border-b border-[#eef2f7] px-4 py-3 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${notificationTone(notification.kind)}`}
                          >
                            <NotificationIcon kind={notification.kind} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-[14px] font-semibold text-[#202939]">
                                    {notification.title}
                                  </p>
                                  {notification.badge ? (
                                    <span className="rounded-full bg-[#fee2e2] px-2 py-0.5 text-[10px] font-semibold text-[#ef4444]">
                                      {notification.badge}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#6b7280]">
                                  {notification.summary}
                                </p>
                                <p className="mt-1 text-[11px] text-[#94a3b8]">
                                  {notification.time}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedNotification(notification)
                                }
                                className="rounded-full bg-[#2f66dc] px-3 py-1.5 text-[12px] font-medium text-white"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-left text-[#9aa4b5] shadow-sm"
            onClick={() => setIsSearchActionsOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="text-[14px]">
              Tìm bác sĩ, chuyên khoa, triệu chứng...
            </span>
          </button>
        </section>

        <section className="px-4 pb-24 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#1f2939]">
              Lịch hẹn sắp tới
            </h2>
            <button
              type="button"
              className="text-[16px] font-medium text-[#2667ea]"
              onClick={goToAppointments}
            >
              Xem tất cả
            </button>
          </div>

          <div className="rounded-3xl border border-[#e5e8ee] bg-white p-3 shadow-[0_5px_18px_rgba(148,163,184,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcecff] text-[28px]">
                  👨🏿
                </div>
                <div>
                  <p className="text-[16px] font-bold leading-tight text-[#202939]">
                    ThS. BS. Trần Tâm
                  </p>
                  <p className="mt-0.5 text-[14px] text-[#66758a]">
                    Chuyên khoa Tim mạch
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Gọi video"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#2f66dc]"
              >
                <Video className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f7fb] px-3 py-2.5 text-[#3f4c5f]">
              <div className="flex items-center gap-1.5 text-[14px]">
                <CalendarDays className="h-4 w-4 text-[#2d67e7]" />
                <span>Hôm nay, 24/05</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[14px]">
                <Clock3 className="h-4 w-4 text-[#2d67e7]" />
                <span>14:30 - 15:00</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 w-full rounded-2xl bg-[#2f66dc] px-4 py-2.5 text-[15px] font-medium text-white"
              onClick={goToConsult}
            >
              Vào phòng khám Online
            </button>
          </div>

          <div className="mt-7">
            <h3 className="text-[18px] font-bold text-[#1f2939]">
              Dịch vụ y tế
            </h3>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    key={service.label}
                    type="button"
                    className="text-center"
                    onClick={() => openService(service.key)}
                  >
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${service.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${service.iconColor}`} />
                    </div>
                    <p className="mt-1 text-[13px] text-[#4a5568]">
                      {service.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#1f2939]">
                Bác sĩ nổi bật
              </h3>
              <button
                type="button"
                className="text-[16px] font-medium text-[#2667ea]"
                onClick={goToConsult}
              >
                Xem thêm
              </button>
            </div>

            <div className="space-y-2">
              {featuredDoctors.map((doctor) => (
                <article
                  key={doctor.name}
                  className="flex items-center justify-between rounded-3xl border border-[#e5e8ee] bg-white px-3 py-2.5 shadow-[0_4px_14px_rgba(148,163,184,0.1)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[30px]">
                      {doctor.avatar}
                    </div>
                    <div>
                      <p className="text-[16px] font-bold leading-tight text-[#202939]">
                        {doctor.name}
                      </p>
                      <p className="mt-0.5 text-[14px] text-[#66758a]">
                        {doctor.specialty}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[14px] text-[#8d99aa]">
                        <Star className="h-4 w-4 fill-[#f6bf38] text-[#f6bf38]" />
                        <span className="text-[#334155]">{doctor.rating}</span>
                        <span>({doctor.reviews})</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Xem thông tin ${doctor.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ff] text-[#2f66dc]"
                    onClick={() => openDoctorDetail(doctor)}
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-3 py-2 backdrop-blur">
          <ul className="grid grid-cols-4 text-center">
            <li>
              <Link
                href="/patient"
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <Stethoscope className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Trang chủ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/appointments"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <CalendarCheck2 className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Lịch khám</span>
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

        {/* Floating Chatbot Shortcut - always present on patient home */}
        <button
          type="button"
          aria-label="Mở tư vấn chatbot"
          onClick={goToConsultAi}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#2f66dc] text-white shadow-[0_18px_40px_rgba(47,102,220,0.28)] ring-4 ring-white/90 transition hover:scale-105 hover:bg-[#2459d6] sm:bottom-28 sm:right-5"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {selectedNotification ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Đóng popup thông báo"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setSelectedNotification(null)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Chi tiết thông báo
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {selectedNotification.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                <p>{selectedNotification.detail}</p>
                <p className="mt-3 text-[12px] text-[#94a3b8]">
                  {selectedNotification.time}
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isSearchActionsOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng menu tìm nhanh"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setIsSearchActionsOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Tìm nhanh
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Chọn tác vụ bạn muốn thực hiện
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchActionsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={goToConsult}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Tìm bác sĩ để tư vấn
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Mở trang tư vấn và trò chuyện ngay
                    </p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>

                <button
                  type="button"
                  onClick={goToAppointments}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Xem lịch khám của tôi
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Kiểm tra các lịch hẹn sắp tới và lịch sử
                    </p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>

                <button
                  type="button"
                  onClick={goToProfile}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Xem hồ sơ y tế
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Truy cập đơn thuốc, lịch sử khám và giấy tờ
                    </p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-[#2f66dc]" />
                </button>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSearchActionsOpen(false)}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {selectedDoctor ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Đóng popup bác sĩ"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setSelectedDoctor(null)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Hồ sơ bác sĩ
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    {selectedDoctor.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[32px]">
                    {selectedDoctor.avatar}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#202939]">
                      {selectedDoctor.specialty}
                    </p>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      Đánh giá {selectedDoctor.rating} ·{" "}
                      {selectedDoctor.reviews}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={goToConsult}
                    className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                  >
                    Nhắn tư vấn
                  </button>
                  <button
                    type="button"
                    onClick={goToAppointments}
                    className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                  >
                    Đặt lịch khám
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
