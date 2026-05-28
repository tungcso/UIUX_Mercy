"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bell,
  Camera,
  CalendarCheck2,
  ChevronRight,
  CircleHelp,
  Cog,
  Copy,
  CreditCard,
  FileText,
  HeartHandshake,
  LogOut,
  MapPin,
  MessageCircle,
  Pill,
  Shield,
  Smartphone,
  Stethoscope,
  User,
  UserRound,
} from "lucide-react";

type ProfilePanel =
  | "settings"
  | "edit"
  | "security"
  | "notifications"
  | "avatar"
  | "medical"
  | "prescriptions"
  | "family"
  | "payment"
  | "support"
  | "logout";

type ProfileAction = {
  label: string;
  description: string;
  icon: typeof Shield;
  tone: string;
  panel: ProfilePanel;
};

type ContactFormState = {
  fullName: string;
  phone: string;
  dob: string;
  address: string;
  emergencyContact: string;
};

type SecurityPopup = "password" | "twoFactor" | "devices";

export default function PatientProfilePage() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<ProfilePanel | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    appointment: true,
    medicine: true,
    message: true,
  });
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [contactDraft, setContactDraft] = useState<ContactFormState>({
    fullName: "Nguyễn Văn An",
    phone: "0901 234 567",
    dob: "1998-05-24",
    address: "Thanh Xuân, Hà Nội",
    emergencyContact: "Trần Thu H - 0912 345 678",
  });
  const [activeSecurityPopup, setActiveSecurityPopup] =
    useState<SecurityPopup | null>(null);
  const [securityDraft, setSecurityDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    trustedDeviceName: "iPhone 15 Pro · Hà Nội",
    deviceCode: "MED-24-9182",
  });
  const noticeTimerRef = useRef<number | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const openAppointments = () => {
    setActivePanel(null);
    router.push("/patient/appointments");
  };

  const openConsult = () => {
    setActivePanel(null);
    router.push("/patient/consult");
  };

  const showNotice = (message: string) => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotice(successMessage);
    } catch {
      showNotice("Không thể sao chép ngay lúc này.");
    }
  };

  const handleAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setAvatarPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return nextPreview;
    });
    showNotice(`Đã cập nhật ảnh từ ${file.name}`);
    event.target.value = "";
  };

  const handleCaptureAvatar = () => {
    avatarInputRef.current?.setAttribute("capture", "user");
    avatarInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return null;
    });
    showNotice("Đã khôi phục ảnh đại diện mặc định.");
  };

  const openContactPopup = () => {
    setIsContactPopupOpen(true);
    setActivePanel(null);
  };

  const closeContactPopup = () => {
    setIsContactPopupOpen(false);
  };

  const saveContactInfo = () => {
    setIsContactPopupOpen(false);
    showNotice("Đã lưu thông tin liên hệ.");
  };

  const openSecurityPopup = (popup: SecurityPopup) => {
    setActivePanel(null);
    setActiveSecurityPopup(popup);
  };

  const closeSecurityPopup = () => {
    setActiveSecurityPopup(null);
  };

  const saveSecurityChange = (message: string) => {
    setActiveSecurityPopup(null);
    showNotice(message);
  };

  const profileActions: ProfileAction[] = [
    {
      label: "Chỉnh sửa hồ sơ",
      description: "Cập nhật ảnh, số điện thoại, ngày sinh và địa chỉ",
      icon: User,
      tone: "text-[#2f66dc] bg-[#e8f0ff]",
      panel: "edit",
    },
    {
      label: "Bảo mật tài khoản",
      description: "Đổi mật khẩu, xác thực 2 bước và quản lý thiết bị",
      icon: Shield,
      tone: "text-[#0f766e] bg-[#dcf7f3]",
      panel: "security",
    },
    {
      label: "Thông báo",
      description: "Bật/tắt nhắc lịch khám, đơn thuốc và tin nhắn",
      icon: Bell,
      tone: "text-[#b45309] bg-[#fff0da]",
      panel: "notifications",
    },
  ];

  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-1 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-2 pt-3 text-white">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-[24px] font-bold">Hồ sơ cá nhân</h1>
            <button
              type="button"
              aria-label="Cài đặt"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3c74ea]"
              onClick={() => setActivePanel("settings")}
            >
              <Cog className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="-mt-1 flex items-center gap-3">
            <button
              type="button"
              aria-label="Cập nhật ảnh đại diện"
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[24px]"
              onClick={() => setActivePanel("avatar")}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Ảnh đại diện"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-[#2f66dc]" />
              )}
              <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-white text-[12px] text-[#2f66dc]">
                📷
              </span>
            </button>

            <div>
              <div className="text-[18px] font-semibold">Nguyễn Văn An</div>
              <div className="mt-1 text-[13px] text-white/90">
                Nam • 28 Tuổi • Nhóm máu: O
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[12px] text-white"
                onClick={() => setActivePanel("security")}
              >
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                Đã xác thực
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 pt-2">
          <div className="mt-3 grid grid-cols-3 gap-3">
            <button
              type="button"
              className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm"
              onClick={openAppointments}
            >
              <div className="text-[18px] font-bold text-[#2f66dc]">12</div>
              <div className="text-[12px] text-[#6b7280]">Lượt khám</div>
            </button>
            <button
              type="button"
              className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm"
              onClick={() => setActivePanel("prescriptions")}
            >
              <div className="text-[18px] font-bold text-[#2f66dc]">03</div>
              <div className="text-[12px] text-[#6b7280]">Đơn thuốc</div>
            </button>
            <button
              type="button"
              className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm"
              onClick={() => setActivePanel("medical")}
            >
              <div className="text-[18px] font-bold text-[#2f66dc]">A+</div>
              <div className="text-[12px] text-[#6b7280]">BHYT</div>
            </button>
          </div>

          <div className="mt-4 rounded-3xl border border-[#e4e8ef] bg-white p-2.5 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-3 text-left"
              onClick={() => setActivePanel("medical")}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#3b82f6]" />
                <div>
                  <div className="text-[15px] font-semibold text-[#202939]">
                    Hồ sơ bệnh án
                  </div>
                  <div className="text-[13px] text-[#6b7280]">
                    Kết quả xét nghiệm, chẩn đoán
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-3 text-left"
              onClick={() => setActivePanel("prescriptions")}
            >
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-[#10b981]" />
                <div>
                  <div className="text-[15px] font-semibold text-[#202939]">
                    Đơn thuốc của tôi
                  </div>
                  <div className="text-[13px] text-[#6b7280]">
                    Lịch sử mua và nhắc uống thuốc
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-3 text-left"
              onClick={() => setActivePanel("family")}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#fb923c]" />
                <div>
                  <div className="text-[15px] font-semibold text-[#202939]">
                    Người thân
                  </div>
                  <div className="text-[13px] text-[#6b7280]">
                    Quản lý hồ sơ thành viên gia đình
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </button>
          </div>

          <div className="mt-6 text-[12px] text-[#94a3b8]">
            TÀI KHOẢN & HỖ TRỢ
          </div>

          <div className="mt-3 rounded-3xl border border-[#e4e8ef] bg-white p-2.5 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-3 text-left"
              onClick={() => setActivePanel("payment")}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[#64748b]" />
                <div className="text-[15px] text-[#202939]">
                  Phương thức thanh toán
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-3 text-left"
              onClick={() => setActivePanel("support")}
            >
              <div className="flex items-center gap-3">
                <Cog className="h-5 w-5 text-[#64748b]" />
                <div className="text-[15px] text-[#202939]">
                  Trung tâm trợ giúp
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </button>

            <button
              type="button"
              className="mt-3 block w-full rounded-2xl bg-white px-2 py-3 text-center text-[15px] font-medium text-[#ef4444]"
              onClick={() => setActivePanel("logout")}
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className="h-4.5 w-4.5 text-[#ef4444]" />
                Đăng xuất
              </div>
            </button>
          </div>

          <div className="mt-4 rounded-3xl border border-[#e4e8ef] bg-white p-2.5 shadow-sm">
            {profileActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl px-2 py-3 text-left ${
                    index < profileActions.length - 1
                      ? "border-b border-[#eef2f7]"
                      : ""
                  }`}
                  onClick={() => setActivePanel(action.panel)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${action.tone}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <div className="text-[15px] font-semibold text-[#202939]">
                        {action.label}
                      </div>
                      <div className="text-[12px] leading-5 text-[#6b7280]">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
                </button>
              );
            })}
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-2 py-1 backdrop-blur">
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
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <UserRound className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Cá nhân</span>
              </Link>
            </li>
          </ul>
        </nav>

        {activePanel ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng cửa sổ hồ sơ"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setActivePanel(null)}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              {activePanel === "avatar" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Ảnh đại diện
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Cập nhật ảnh hồ sơ
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2f66dc] shadow-sm">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#202939]">
                          Thay đổi ảnh đại diện
                        </p>
                        <p className="text-[13px] text-[#64748b]">
                          Chụp ảnh mới, tải ảnh từ thiết bị hoặc dùng ảnh hiện
                          tại.
                        </p>
                      </div>
                    </div>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                        onClick={handleCaptureAvatar}
                      >
                        Chụp ảnh
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={handleAvatarUpload}
                      >
                        Tải ảnh lên
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={handleRemoveAvatar}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "medical" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Hồ sơ bệnh án
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Kết quả và chẩn đoán gần nhất
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#202939]">
                          Lần khám gần nhất
                        </span>
                        <span className="rounded-full bg-[#e8f0ff] px-2 py-1 text-[11px] font-semibold text-[#2f66dc]">
                          Đã lưu
                        </span>
                      </div>
                      <div className="text-[#334155]">
                        Chẩn đoán: tăng huyết áp mức độ nhẹ, theo dõi tại nhà.
                      </div>
                      <div className="text-[#334155]">
                        Xét nghiệm: công thức máu, đường huyết và mỡ máu.
                      </div>
                      <div className="text-[#334155]">
                        Ghi chú: tái khám sau 30 ngày hoặc khi có triệu chứng
                        bất thường.
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                        onClick={openAppointments}
                      >
                        Xem lịch khám liên quan
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={() =>
                          copyToClipboard(
                            "Nguyễn Văn An | Chẩn đoán: tăng huyết áp mức độ nhẹ | Lần khám gần nhất",
                            "Đã sao chép hồ sơ bệnh án.",
                          )
                        }
                      >
                        Sao chép hồ sơ
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "prescriptions" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Đơn thuốc
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Quản lý toa thuốc và nhắc uống
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                      <div className="flex items-center gap-2 text-[#202939]">
                        <Pill className="h-4 w-4 text-[#10b981]" />
                        <span className="font-semibold">Đơn gần nhất</span>
                      </div>
                      <div>Amlodipine 5mg, uống 1 viên sáng sau ăn.</div>
                      <div>Vitamin tổng hợp, uống sau bữa tối.</div>
                      <div>Nhắc uống thuốc: 07:30 và 20:00 mỗi ngày.</div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                        onClick={openConsult}
                      >
                        Hỏi bác sĩ về toa thuốc
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={() =>
                          copyToClipboard(
                            "Amlodipine 5mg - 1 viên sáng sau ăn\nVitamin tổng hợp - sau bữa tối",
                            "Đã sao chép toa thuốc.",
                          )
                        }
                      >
                        Sao chép toa
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "family" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Người thân
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Hồ sơ người thân trong gia đình
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                      <div className="flex items-center gap-2 text-[#202939]">
                        <HeartHandshake className="h-4 w-4 text-[#fb923c]" />
                        <span className="font-semibold">
                          2 hồ sơ đang liên kết
                        </span>
                      </div>
                      <div>
                        Con: Nguyễn Minh An - Nhắc tiêm chủng và tái khám nhi.
                      </div>
                      <div>
                        Vợ: Trần Thu H - Theo dõi thai kỳ và lịch siêu âm.
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                        onClick={() => {
                          setActivePanel("family");
                          showNotice("Đã mở luồng thêm người thân.");
                        }}
                      >
                        Thêm người thân
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={openAppointments}
                      >
                        Quản lý hồ sơ
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "payment" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Thanh toán
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Phương thức thanh toán đang lưu
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[#202939]">
                          <CreditCard className="h-4 w-4 text-[#64748b]" />
                          <span className="font-semibold">
                            Vietcombank •••• 3821
                          </span>
                        </div>
                        <span className="rounded-full bg-[#e8f0ff] px-2 py-1 text-[11px] font-semibold text-[#2f66dc]">
                          Mặc định
                        </span>
                      </div>
                      <div>Hạn mức thanh toán Online: 10.000.000đ</div>
                      <div>Đã bật lưu tự động cho lịch hẹn tiếp theo.</div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                        onClick={() =>
                          showNotice(
                            "Đã thêm phương thức thanh toán mới (mô phỏng).",
                          )
                        }
                      >
                        Thêm phương thức mới
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={() =>
                          showNotice("Đã đặt phương thức này làm mặc định.")
                        }
                      >
                        Đặt mặc định
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "support" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Trợ giúp
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Trung tâm hỗ trợ MedOS
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                      <div className="flex items-center gap-2 text-[#202939]">
                        <CircleHelp className="h-4 w-4 text-[#2f66dc]" />
                        <span className="font-semibold">
                          Các kênh hỗ trợ nhanh
                        </span>
                      </div>
                      <div>
                        Chat tổng đài: 24/7 cho lỗi tài khoản và thanh toán.
                      </div>
                      <div>Hotline: 1900 1234 - hỗ trợ từ 7:00 đến 22:00.</div>
                      <div>
                        FAQ: câu hỏi thường gặp về đặt lịch, tư vấn và đơn
                        thuốc.
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                        onClick={openConsult}
                      >
                        Chat hỗ trợ
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                        onClick={() =>
                          showNotice(
                            "FAQ đã được mở trong luồng hỗ trợ mô phỏng.",
                          )
                        }
                      >
                        Xem FAQ
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "settings" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Cài đặt tài khoản
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Quản lý hồ sơ và bảo mật
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                      onClick={() => setActivePanel("edit")}
                    >
                      <div>
                        <p className="font-semibold text-[#202939]">
                          Chỉnh sửa thông tin
                        </p>
                        <p className="text-[13px] text-[#6b7280]">
                          Tên, số điện thoại, ngày sinh và địa chỉ
                        </p>
                      </div>
                      <ChevronRight className="h-4.5 w-4.5 text-[#2f66dc]" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                      onClick={() => setActivePanel("security")}
                    >
                      <div>
                        <p className="font-semibold text-[#202939]">
                          Bảo mật tài khoản
                        </p>
                        <p className="text-[13px] text-[#6b7280]">
                          Mật khẩu, 2 bước và thiết bị đăng nhập
                        </p>
                      </div>
                      <Shield className="h-4.5 w-4.5 text-[#2f66dc]" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                      onClick={() => setActivePanel("notifications")}
                    >
                      <div>
                        <p className="font-semibold text-[#202939]">
                          Thông báo
                        </p>
                        <p className="text-[13px] text-[#6b7280]">
                          Nhắc lịch, tin nhắn và đơn thuốc
                        </p>
                      </div>
                      <Bell className="h-4.5 w-4.5 text-[#2f66dc]" />
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "edit" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Chỉnh sửa hồ sơ
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Cập nhật thông tin cá nhân
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                      onClick={openContactPopup}
                    >
                      Sửa thông tin liên hệ
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                      onClick={() =>
                        copyToClipboard(
                          "Bệnh nhân Nguyễn Văn An",
                          "Đã sao chép mã hồ sơ.",
                        )
                      }
                    >
                      Sao chép mã hồ sơ
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "security" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Bảo mật
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Quản lý đăng nhập và xác thực
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      className="rounded-2xl bg-[#2f66dc] px-4 py-3 text-[14px] font-medium text-white"
                      onClick={() => openSecurityPopup("password")}
                    >
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                      onClick={() => openSecurityPopup("twoFactor")}
                    >
                      Bật xác thực 2 bước
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] font-medium text-[#202939]"
                      onClick={() => openSecurityPopup("devices")}
                    >
                      Quản lý thiết bị
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "notifications" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f66dc]">
                        Thông báo
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Tùy chỉnh nhắc lịch và tin nhắn
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {[
                      {
                        key: "appointment" as const,
                        label: "Nhắc lịch khám",
                        description: "Thông báo trước giờ hẹn",
                      },
                      {
                        key: "medicine" as const,
                        label: "Nhắc uống thuốc",
                        description: "Nhắc theo đơn thuốc đã lưu",
                      },
                      {
                        key: "message" as const,
                        label: "Tin nhắn bác sĩ",
                        description: "Báo khi có phản hồi mới",
                      },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className="flex items-center justify-between rounded-2xl border border-[#e5e8ee] px-4 py-3 text-left"
                        onClick={() => {
                          setNotificationSettings((currentSettings) => ({
                            ...currentSettings,
                            [item.key]: !currentSettings[item.key],
                          }));
                          showNotice(
                            `${item.label} ${notificationSettings[item.key] ? "đã tắt" : "đã bật"}.`,
                          );
                        }}
                      >
                        <div>
                          <p className="font-semibold text-[#202939]">
                            {item.label}
                          </p>
                          <p className="text-[13px] text-[#6b7280]">
                            {item.description}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            notificationSettings[item.key]
                              ? "bg-[#dcf7f3] text-[#0f766e]"
                              : "bg-[#f3f4f6] text-[#64748b]"
                          }`}
                        >
                          {notificationSettings[item.key] ? "Bật" : "Tắt"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === "logout" ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#ef4444]">
                        Xác nhận đăng xuất
                      </p>
                      <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                        Bạn muốn thoát khỏi tài khoản?
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#fff7f7] p-4 text-[14px] leading-6 text-[#475569]">
                    Sau khi đăng xuất, bạn sẽ quay lại màn hình đăng nhập. Phiên
                    hiện tại trên thiết bị này sẽ được kết thúc.
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                    >
                      Hủy
                    </button>
                    <Link
                      href="/login"
                      className="rounded-full bg-[#ef4444] px-4 py-2 text-[14px] font-medium text-white"
                    >
                      Đăng xuất
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {isContactPopupOpen ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng popup chỉnh sửa liên hệ"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={closeContactPopup}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Sửa thông tin liên hệ
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Chỉnh sửa hồ sơ cá nhân
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeContactPopup}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-1.5 text-left">
                  <span className="text-[13px] font-medium text-[#475569]">
                    Họ và tên
                  </span>
                  <input
                    type="text"
                    value={contactDraft.fullName}
                    onChange={(event) =>
                      setContactDraft((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                  />
                </label>

                <label className="grid gap-1.5 text-left">
                  <span className="text-[13px] font-medium text-[#475569]">
                    Số điện thoại
                  </span>
                  <input
                    type="tel"
                    value={contactDraft.phone}
                    onChange={(event) =>
                      setContactDraft((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                  />
                </label>

                <label className="grid gap-1.5 text-left">
                  <span className="text-[13px] font-medium text-[#475569]">
                    Ngày sinh
                  </span>
                  <input
                    type="date"
                    value={contactDraft.dob}
                    onChange={(event) =>
                      setContactDraft((current) => ({
                        ...current,
                        dob: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                  />
                </label>

                <label className="grid gap-1.5 text-left">
                  <span className="text-[13px] font-medium text-[#475569]">
                    Địa chỉ
                  </span>
                  <input
                    type="text"
                    value={contactDraft.address}
                    onChange={(event) =>
                      setContactDraft((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                  />
                </label>

                <label className="grid gap-1.5 text-left">
                  <span className="text-[13px] font-medium text-[#475569]">
                    Liên hệ khẩn cấp
                  </span>
                  <input
                    type="text"
                    value={contactDraft.emergencyContact}
                    onChange={(event) =>
                      setContactDraft((current) => ({
                        ...current,
                        emergencyContact: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dbe4f3] bg-white px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeContactPopup}
                  className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={saveContactInfo}
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeSecurityPopup === "password" ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng popup đổi mật khẩu"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={closeSecurityPopup}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Bảo mật
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Đổi mật khẩu đăng nhập
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeSecurityPopup}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  value={securityDraft.currentPassword}
                  onChange={(event) =>
                    setSecurityDraft((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#dbe4f3] px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={securityDraft.newPassword}
                  onChange={(event) =>
                    setSecurityDraft((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#dbe4f3] px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={securityDraft.confirmPassword}
                  onChange={(event) =>
                    setSecurityDraft((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#dbe4f3] px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                />
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeSecurityPopup}
                  className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveSecurityChange("Đã gửi yêu cầu đổi mật khẩu.")
                  }
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeSecurityPopup === "twoFactor" ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng popup xác thực 2 bước"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={closeSecurityPopup}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Bảo mật
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Xác thực 2 bước
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeSecurityPopup}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-[#dbe4f3] bg-[#f8fbff] p-4 text-[14px] leading-6 text-[#475569]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#202939]">
                      Xác thực qua SMS
                    </p>
                    <p className="text-[13px] text-[#6b7280]">
                      Số điện thoại {contactDraft.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                      securityDraft.twoFactorEnabled
                        ? "bg-[#dcf7f3] text-[#0f766e]"
                        : "bg-[#f3f4f6] text-[#64748b]"
                    }`}
                    onClick={() =>
                      setSecurityDraft((current) => ({
                        ...current,
                        twoFactorEnabled: !current.twoFactorEnabled,
                      }))
                    }
                  >
                    {securityDraft.twoFactorEnabled ? "Đang bật" : "Đang tắt"}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeSecurityPopup}
                  className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveSecurityChange(
                      securityDraft.twoFactorEnabled
                        ? "Đã cập nhật trạng thái xác thực 2 bước."
                        : "Đã tắt xác thực 2 bước.",
                    )
                  }
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeSecurityPopup === "devices" ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
            <button
              type="button"
              aria-label="Đóng popup quản lý thiết bị"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={closeSecurityPopup}
            />

            <div className="relative w-full max-w-md rounded-[30px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#2f66dc]">
                    Bảo mật
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold text-[#202939]">
                    Quản lý thiết bị đăng nhập
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeSecurityPopup}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[#dbe4f3] bg-[#f8fbff] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#202939]">
                        {securityDraft.trustedDeviceName}
                      </p>
                      <p className="mt-1 text-[13px] text-[#6b7280]">
                        Mã thiết bị: {securityDraft.deviceCode}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#dcf7f3] px-2 py-1 text-[11px] font-semibold text-[#0f766e]">
                      Thiết bị hiện tại
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#dbe4f3] bg-white p-4">
                  <p className="text-[13px] font-medium text-[#475569]">
                    Tên thiết bị hiển thị
                  </p>
                  <input
                    type="text"
                    value={securityDraft.trustedDeviceName}
                    onChange={(event) =>
                      setSecurityDraft((current) => ({
                        ...current,
                        trustedDeviceName: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-[#dbe4f3] px-4 py-3 text-[14px] text-[#202939] outline-none focus:border-[#2f66dc]"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeSecurityPopup}
                  className="rounded-full border border-[#dbe4f3] bg-white px-4 py-2 text-[14px] font-medium text-[#202939]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveSecurityChange("Đã lưu thay đổi thiết bị đăng nhập.")
                  }
                  className="rounded-full bg-[#2f66dc] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {notice ? (
          <div className="fixed bottom-24 left-1/2 z-50 w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-full bg-[#202939] px-4 py-2 text-center text-[13px] text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)]">
            {notice}
          </div>
        ) : null}
      </div>
    </main>
  );
}
