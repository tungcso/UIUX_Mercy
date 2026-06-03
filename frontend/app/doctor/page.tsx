"use client";

import { useEffect, useRef, useState } from "react";
import {
  consultPatients,
  consultUnreadCount,
} from "./consult/consult-patients";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Brain,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  X,
  Settings2,
  UserCircle2,
  Users,
  FileText,
  SlidersHorizontal,
  Sparkles,
  Activity,
  CheckCircle2,
  MessageCircle,
  RefreshCw,
  Flag,
  LockKeyhole,
} from "lucide-react";
import { useDoctorAvailability } from "./_components/doctor-availability-context";

type NavigationSection = "overview" | "patients" | "consult" | "prescriptions";

type ToastProps = {
  message: string;
};

function Toast({ message }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      <span>{message}</span>
    </div>
  );
}

function LockToast({ message }: ToastProps) {
  return (
    <div className="fixed right-4 top-16 z-50 flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-amber-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
      <LockKeyhole className="h-5 w-5 text-amber-500" />
      <span>{message}</span>
    </div>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "red" | "slate" | "amber" | "blue";
}) {
  const toneClasses = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : tone === "blue" ? "bg-sky-500" : tone === "green" ? "bg-emerald-500" : "bg-slate-400"
      }`} />
      {children}
    </span>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  compact = false,
  onClick,
  badge = null,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
  badge?: number | null;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all ${
        active
          ? "bg-emerald-50 text-emerald-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      } ${compact ? "justify-center px-2" : ""}`}
    >
      <div className="relative">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-xl ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        {badge ? (
          <span
            className={`absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-rose-600 text-white shadow-sm ${compact ? "h-4 min-w-4 px-1 text-[10px]" : "h-6 min-w-6 px-2 text-xs font-semibold"}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {compact ? null : <span>{label}</span>}
    </button>
  );
}

function AppSidebar({
  activeSection,
  compact = false,
  isAcceptingPatients,
  onToggleAccepting,
  onNavigate,
}: {
  activeSection: NavigationSection;
  compact?: boolean;
  isAcceptingPatients: boolean;
  onToggleAccepting: () => void;
  onNavigate: (section: NavigationSection) => void;
}) {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const unreadConsultCount = (consultPatients || []).reduce(
    (s, p) => s + (p.unread ?? 0),
    0,
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <aside
      className={`hidden shrink-0 border-r border-slate-200 bg-white py-4 shadow-[0_0_35px_rgba(15,23,42,0.03)] lg:flex lg:flex-col ${compact ? "w-20 px-2" : "w-62.5 px-4"}`}
    >
      <div className="mb-4 flex items-start gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]">
          <Activity className="h-5 w-5" />
        </div>
        {compact ? null : (
          <div>
            <div className="text-lg font-bold leading-none text-slate-900">
              MedOS.io
            </div>
            <div className="text-xs font-medium text-slate-400">
              Hệ thống Y tế thông minh
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
        {compact ? (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onToggleAccepting}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm transition-colors hover:bg-emerald-100"
              aria-label={
                isAcceptingPatients ? "Sẵn sàng tiếp nhận" : "Đang ngoại tuyến"
              }
              title={
                isAcceptingPatients ? "Sẵn sàng tiếp nhận" : "Đang ngoại tuyến"
              }
            >
              {isAcceptingPatients ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_6px_14px_rgba(239,68,68,0.28)] ring-2 ring-red-100">
                  <X className="h-4 w-4 stroke-3" />
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${isAcceptingPatients ? "bg-emerald-500" : "bg-rose-500"}`}
                  aria-hidden="true"
                />
                <p className="text-sm font-bold leading-none text-slate-700">
                  {isAcceptingPatients
                    ? "Sẵn sàng tiếp nhận"
                    : "Đang ngoại tuyến"}
                </p>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {isAcceptingPatients
                  ? "Đăng kí hoạt quy trình đón bệnh nhân tự động."
                  : "Bác sĩ hiện offline"}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleAccepting}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                isAcceptingPatients ? "bg-emerald-500" : "bg-slate-300"
              }`}
              aria-label={
                isAcceptingPatients
                  ? "Tắt trạng thái sẵn sàng tiếp nhận"
                  : "Bật trạng thái sẵn sàng tiếp nhận"
              }
              aria-pressed={isAcceptingPatients}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  isAcceptingPatients ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {compact ? null : (
        <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Chức năng
        </div>
      )}

      <nav className="space-y-1">
        <SidebarItem
          icon={LayoutDashboard}
          label="Tổng quan ca trực"
          active={activeSection === "overview"}
          compact={compact}
          onClick={() => onNavigate("overview")}
        />
        <SidebarItem
          icon={Users}
          label="Quản lý bệnh nhân"
          active={activeSection === "patients"}
          compact={compact}
          onClick={() => onNavigate("patients")}
        />
        <SidebarItem
          icon={MessagesSquare}
          label="Hội chẩn trực tuyến"
          active={activeSection === "consult"}
          compact={compact}
          onClick={() => onNavigate("consult")}
          badge={unreadConsultCount}
        />
        <SidebarItem
          icon={FileText}
          label="Đơn thuốc điện tử"
          active={activeSection === "prescriptions"}
          compact={compact}
          onClick={() => onNavigate("prescriptions")}
        />
      </nav>

      <div className="relative mt-auto" ref={profileMenuRef}>
        {isProfileMenuOpen ? (
          <div
            className={`absolute z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)] ${compact ? "bottom-[calc(100%+0.5rem)] left-1/2 w-56 -translate-x-1/2" : "bottom-[calc(100%+0.65rem)] left-0 right-0"}`}
          >
            <div className="mb-1 px-2 py-1.5">
              <p className="truncate text-sm font-semibold text-slate-800">
                BS. Nguyễn Minh Trí
              </p>
              <p className="truncate text-xs text-slate-500">
                Khoa Hồi sức tích cực
              </p>
            </div>

            <div className="my-1 h-px bg-slate-100" />

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              onClick={() => {
                setIsProfileMenuOpen(false);
                router.push("/doctor");
              }}
            >
              <UserCircle2 className="h-4 w-4" />
              Hồ sơ cá nhân
            </button>

            <button
              type="button"
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              onClick={() => {
                setIsProfileMenuOpen(false);
                router.push("/doctor?panel=settings");
              }}
            >
              <Settings2 className="h-4 w-4" />
              Cài đặt
            </button>

            <button
              type="button"
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
              onClick={() => {
                setIsProfileMenuOpen(false);
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          className={`w-full rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-sm transition-colors hover:bg-slate-100 ${compact ? "p-2" : "p-3"}`}
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
          aria-label="Mở menu tài khoản"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              MT
            </div>
            {compact ? null : (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-800">
                  BS. Nguyễn Minh Trí
                </div>
                <div className="truncate text-xs text-slate-500">
                  Khoa Hồi sức tích cực
                </div>
              </div>
            )}
            <ChevronUp
              className={`h-4 w-4 text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-0" : "rotate-180"}`}
            />
          </div>
        </button>
      </div>
    </aside>
  );
}

function PatientDetailScreen({
  onNavigate,
}: {
  onNavigate: (section: NavigationSection) => void;
}) {
  const { isAcceptingPatients, toggleAcceptingPatients } =
    useDoctorAvailability();
  const [isDiagnosisPopupOpen, setIsDiagnosisPopupOpen] = useState(false);
  const [isAiErrorPopupOpen, setIsAiErrorPopupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AppSidebar
          activeSection="patients"
          isAcceptingPatients={isAcceptingPatients}
          onToggleAccepting={toggleAcceptingPatients}
          onNavigate={onNavigate}
        />

        <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          <div className="mx-auto max-w-370">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] font-bold tracking-[-0.03em] text-slate-900">
                  Chi tiết ca bệnh &amp; Chẩn đoán tự động
                </h1>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-[13px] font-medium text-slate-500 shadow-sm">
                  Hôm nay: Thứ Năm, 21 tháng 5, 2026
                </span>
              </div>

              <div className="flex justify-start lg:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-[13px] font-semibold text-red-500 shadow-[0_8px_20px_rgba(239,68,68,0.08)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Có chỉ số đo từ xa khẩn cấp!
                </span>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_520px]">
              <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Hồ sơ y tế hiện hành
                    </p>
                    <h2 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[28px]">
                      Bệnh nhân: Lê Thị Mai
                    </h2>
                    <p className="mt-2 text-[15px] text-slate-500">
                      Nữ • 62 Tuổi • Hồ sơ do thông số tự động #BN-9081
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat trực tiếp với bệnh nhân
                  </button>
                </div>

                <div className="my-6 h-px w-full bg-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Ghi nhận triệu chứng &amp; chẩn đoán
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDiagnosisPopupOpen(true)}
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    Đề xuất chẩn đoán sâu bằng Gemini AI
                  </button>
                </div>

                <textarea
                  defaultValue=""
                  placeholder="Gõ triệu chứng lâm sàng hoặc từ khóa (VD: tăng huyết áp, đau đầu vùng chẩm)..."
                  className="mt-3 min-h-28 w-full resize-none rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] leading-6 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </section>

              <aside className="rounded-[1.65rem] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-500 shadow-sm">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h2 className="text-[18px] font-bold tracking-[-0.02em] text-slate-900">
                      Bảng trợ lý AI co-pilot
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    PRO V1.5
                  </span>
                </div>

                <div className="my-5 h-px w-full bg-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <p className="text-[15px] font-semibold text-slate-700">
                    Tóm tắt bệnh sử từ Gemini AI
                  </p>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[14px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tạo bảng AI
                  </button>
                </div>

                <div className="mt-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] leading-7 text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                  <p className="font-semibold text-slate-900">
                    **TÓM TẮT BỆNH ÁN**
                  </p>
                  <p className="mt-2">
                    Bệnh nhân Lê Thị Mai có tiền sử tăng huyết áp nguyên phát 5
                    năm nhưng tuân thủ điều trị kém. Hiện tại, bệnh nhân nhập
                    viện với tình trạng đau buốt vùng chẩm sau tai kèm hồi hộp
                    trống ngực dữ dội, ghi nhận chỉ số huyết áp đạt ngưỡng
                    180/120 mmHg. Với chẩn đoán nghi ngờ cơn tăng huyết áp
                    cấp/theo dõi tai biến mạch máu não nhẹ, cần lập tức kiểm
                    soát huyết áp bằng thuốc hạ áp phù hợp và theo dõi sát các
                    dấu hiệu thần kinh khu trú cùng tri giác để có hướng xử trí
                    kịp thời.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAiErrorPopupOpen((value) => !value)}
                  className="mt-5 flex w-full items-center gap-4 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] px-4 py-4 text-left shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:bg-[#fff4e6]"
                >
                  <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-[#ff8a1f] text-white shadow-[0_14px_28px_rgba(249,115,22,0.28)]">
                    <Flag className="h-8 w-8" />
                  </div>

                  <div>
                    <div className="text-[18px] font-bold leading-6 text-[#f97316]">
                      Báo cáo lỗi
                      <br />
                      kịch bản AI
                    </div>
                  </div>
                </button>

                {isAiErrorPopupOpen ? (
                  <div className="mt-3 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <p className="text-sm font-semibold text-slate-700">
                      Ghi chú lỗi y khoa/Ban chỉ đạo AI
                    </p>

                    <textarea
                      placeholder="Vui lòng nêu chi tiết lỗi chẩn đoán hoặc dữ liệu đề xuất không đúng thực tế..."
                      className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    />

                    <div className="mt-4 rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            Thông tin gửi đi sẽ được ghi nhận để huấn luyện lại
                            luồng gợi ý.
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Chỉ dùng nội bộ, ưu tiên phân loại lỗi chẩn đoán,
                            lỗi dữ liệu và lỗi giao diện.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAiErrorPopupOpen(false)}
                        className="flex-1 rounded-2xl bg-[#ff8a1f] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#f97316]"
                      >
                        Gửi báo cáo
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAiErrorPopupOpen(false)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>

            {isDiagnosisPopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-3xl animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)] lg:p-7">
                  <button
                    type="button"
                    aria-label="Đóng popup đề xuất chẩn đoán"
                    onClick={() => setIsDiagnosisPopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex items-start justify-between gap-4 pr-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                        Đề xuất chẩn đoán
                      </p>
                      <h2 className="mt-1 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                        Gemini gợi ý các chẩn đoán ưu tiên
                      </h2>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                      4 đề xuất
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    {[
                      ["Cơn tăng huyết áp cấp", "Độ phù hợp: 96%", "emerald"],
                      [
                        "Tai biến mạch máu não nhẹ cần loại trừ",
                        "Độ phù hợp: 84%",
                        "amber",
                      ],
                      [
                        "Đau đầu do tăng huyết áp kèm rối loạn giao cảm",
                        "Độ phù hợp: 76%",
                        "slate",
                      ],
                      [
                        "Theo dõi hội chứng mạch vành cấp",
                        "Độ phù hợp: 62%",
                        "slate",
                      ],
                    ].map(([label, meta, tone], index) => (
                      <div
                        key={label}
                        className={`rounded-2xl border bg-white p-4 shadow-sm ${index === 0 ? "border-emerald-200" : "border-slate-100"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-semibold text-slate-800">
                              {index + 1}. {label}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              {meta}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${tone === "emerald" ? "bg-emerald-100 text-emerald-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            Ưu tiên
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDiagnosisPopupOpen(false)}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Áp dụng chẩn đoán
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDiagnosisPopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function PatientCard({
  initials,
  name,
  details,
  time,
  status,
  statusTone,
  accent,
  actionLabel,
  onActionClick,
}: {
  initials: string;
  name: string;
  details: string;
  time: string;
  status: string;
  statusTone: "green" | "red" | "slate" | "amber" | "blue";
  accent: "green" | "red" | "slate" | "amber" | "blue";
  actionLabel: string;
  onActionClick: () => void;
}) {
  const accentClasses: Record<string, string> = {
    green: "border-emerald-300 bg-white",
    red: "border-red-300 bg-white",
    slate: "border-slate-200 bg-white",
    amber: "border-amber-200 bg-white",
    blue: "border-sky-200 bg-white",
  };

  const initialsClasses: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-500",
    slate: "bg-slate-100 text-slate-500",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-sky-100 text-sky-600",
  };

  const actionButtonClasses =
    statusTone === "red"
      ? "bg-red-600 text-white shadow-[0_12px_24px_rgba(239,68,68,0.22)] hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_14px_28px_rgba(239,68,68,0.28)]"
      : "border border-slate-300 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]";

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] ${accentClasses[accent] ?? accentClasses.slate}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${initialsClasses[accent] ?? initialsClasses.slate}`}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
          <span className="text-sm text-slate-400">-</span>
          <p className="text-sm text-slate-500">{details}</p>
        </div>
      </div>

      <div className="hidden min-w-35 text-right md:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Thời gian thực
        </p>
        <p
          className={`text-base font-bold ${statusTone === "red" ? "text-red-500" : statusTone === "amber" ? "text-amber-600" : statusTone === "blue" ? "text-sky-700" : statusTone === "green" ? "text-emerald-700" : "text-slate-700"}`}
        >
          {time}
        </p>
      </div>

      <StatusPill tone={statusTone}>{status}</StatusPill>

      <button
        type="button"
        onClick={onActionClick}
        className={`hidden items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all md:inline-flex ${actionButtonClasses}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

type Appointment = {
  initials: string;
  name: string;
  details: string;
  time: string;
  status: string;
  statusTone: "green" | "red" | "slate" | "amber" | "blue";
  accent: "green" | "red" | "slate" | "amber" | "blue";
  actionLabel: string;
  patientId: string;
};

export default function DoctorDashboardPage() {
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("overview");
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const [isQuickAlertOpen, setIsQuickAlertOpen] = useState(false);
  const [isDismissedQuickAlert, setIsDismissedQuickAlert] = useState(false);
  const [isLayoutPopupOpen, setIsLayoutPopupOpen] = useState(false);
  const [isDiagnosisPopupOpen, setIsDiagnosisPopupOpen] = useState(false);
  const [isAiErrorPopupOpen, setIsAiErrorPopupOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"urgent" | "recent" | "status">(
    "urgent",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortMode, pageSize]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "detail" | "emergency" | null
  >(null);
  const [layoutConfig, setLayoutConfig] = useState({
    priorityList: true,
    floatingAlert: true,
    compactSidebar: false,
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { isAcceptingPatients, toggleAcceptingPatients } =
    useDoctorAvailability();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("loginSuccess") === "1") {
      setShowLoginSuccess(true);
      const timer = window.setTimeout(() => setShowLoginSuccess(false), 3000);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, []);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("doctor_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLayoutConfig({
            priorityList: parsed.prioritizePatientList ?? true,
            floatingAlert: parsed.receivePriorityAlerts ?? true,
            compactSidebar: parsed.compactSidebar ?? false,
          });
        } catch (e) {
          // ignore
        }
      }
    };

    loadSettings();
    window.addEventListener("doctor_settings_changed", loadSettings);
    return () => {
      window.removeEventListener("doctor_settings_changed", loadSettings);
    };
  }, []);

  useEffect(() => {
    if (!lockNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setLockNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [lockNotice]);

  useEffect(() => {
    if (!actionNotice) return undefined;
    const t = window.setTimeout(() => setActionNotice(null), 2200);
    return () => window.clearTimeout(t);
  }, [actionNotice]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      initials: "LM",
      name: "Lê Thị Mai",
      details:
        "Nữ, 62T · Bệnh án tim mạch huyết áp cấp · Huyết áp tăng đột biến",
      time: "10:30",
      status: "NGUY HIỂM",
      statusTone: "red" as const,
      accent: "red" as const,
      actionLabel: "Xử trí khẩn cấp",
      patientId: "BN-9081",
    },
    {
      initials: "TB",
      name: "Trần Quốc Bảo",
      details:
        "Nam, 32T · Chấn thương mạch máu · Mạch ổn định · Đang truyền dịch",
      time: "10:32",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9083",
    },
    {
      initials: "PN",
      name: "Phạm Hoàng Nam",
      details:
        "Nam, 56T · Khám nội định kỳ · Sức khỏe bình thường · Chưa xử trị",
      time: "09:15",
      status: "Đang chờ",
      statusTone: "amber" as const,
      accent: "amber" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9082",
    },
    {
      initials: "VH",
      name: "Nguyễn Văn Hùng",
      details:
        "Nam, 45T · Nghi ngờ viêm ruột thừa cấp · Đau hố chậu phải · Theo dõi sát",
      time: "10:45",
      status: "NGUY HIỂM",
      statusTone: "red" as const,
      accent: "red" as const,
      actionLabel: "Xử trí khẩn cấp",
      patientId: "BN-9084",
    },
    {
      initials: "HL",
      name: "Hoàng Thị Lan",
      details:
        "Nữ, 28T · Sốt xuất huyết Dengue ngày 4 · Tiểu cầu giảm nhẹ · Theo dõi mạch",
      time: "10:15",
      status: "Đang chờ",
      statusTone: "amber" as const,
      accent: "amber" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9085",
    },
    {
      initials: "MĐ",
      name: "Bùi Minh Đức",
      details:
        "Nam, 50T · Hen phế quản ác tính · Khó thở nhẹ · Đang khí dung",
      time: "09:50",
      status: "NGUY HIỂM",
      statusTone: "red" as const,
      accent: "red" as const,
      actionLabel: "Xử trí khẩn cấp",
      patientId: "BN-9086",
    },
    {
      initials: "VH",
      name: "Vũ Thị Hồng",
      details:
        "Nữ, 70T · Suy tim độ III · Khó thở khi nằm · Phù nhẹ hai chi dưới",
      time: "09:40",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9087",
    },
    {
      initials: "AT",
      name: "Đỗ Anh Tuấn",
      details:
        "Nam, 38T · Ngộ độc thực phẩm cấp · Nôn mửa, tiêu chảy · Đang bù dịch",
      time: "09:30",
      status: "Đang chờ",
      statusTone: "amber" as const,
      accent: "amber" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9088",
    },
    {
      initials: "TH",
      name: "Phan Thanh Hải",
      details:
        "Nam, 48T · Cơn đau thắt ngực ổn định · Theo dõi ECG · Mạch ổn định",
      time: "09:10",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9089",
    },
    {
      initials: "TD",
      name: "Trần Thị Dung",
      details:
        "Nữ, 55T · Đái tháo đường type 2 · Đường huyết tăng nhẹ · Đang chỉnh insulin",
      time: "08:55",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9090",
    },
    {
      initials: "QK",
      name: "Ngô Quốc Khánh",
      details:
        "Nam, 25T · Tràn khí màng phổi tự phát · Đã dẫn lưu · Trạng thái ổn định",
      time: "08:40",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9091",
    },
    {
      initials: "TV",
      name: "Phạm Thảo Vy",
      details:
        "Nữ, 19T · Viêm amygdale cấp · Sốt nhẹ · Chờ cấp đơn thuốc",
      time: "08:30",
      status: "Đang chờ",
      statusTone: "amber" as const,
      accent: "amber" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9092",
    },
    {
      initials: "HL",
      name: "Lê Hoàng Long",
      details:
        "Nam, 42T · Gút cấp · Sưng đau khớp ngón chân cái · Ổn định",
      time: "08:15",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9093",
    },
    {
      initials: "TM",
      name: "Nguyễn Tuyết Mai",
      details:
        "Nữ, 65T · Thoái hóa khớp gối · Đau nhiều khi vận động · Chờ vật lý trị liệu",
      time: "08:00",
      status: "Đang chờ",
      statusTone: "amber" as const,
      accent: "amber" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9094",
    },
    {
      initials: "HQ",
      name: "Trịnh Hồng Quân",
      details:
        "Nam, 35T · Rối loạn lo âu lan tỏa · Trạng thái bình thường · Tư vấn tâm lý",
      time: "07:45",
      status: "Dữ liệu bình thường",
      statusTone: "blue" as const,
      accent: "blue" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9095",
    },
  ]);

  const sortedAppointments = layoutConfig.priorityList
    ? [...appointments].sort((left, right) => {
        if (sortMode === "urgent") {
          const order: Record<string, number> = { red: 0, amber: 1, blue: 2, slate: 1, green: 2 };

          return (order[left.statusTone] ?? 2) - (order[right.statusTone] ?? 2);
        }

        if (sortMode === "recent") {
          return right.time.localeCompare(left.time);
        }

        const statusOrder = ["NGUY HIỂM", "Đang chờ", "Dữ liệu bình thường"];

        return (
          statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status)
        );
      })
    : [];

  const totalItems = sortedAppointments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const visibleAppointments = sortedAppointments.slice(startIndex, endIndex);

  const openPatientAction = (
    appointment: Appointment,
    action: "detail" | "emergency",
  ) => {
    setSelectedAppointment(appointment);
    setSelectedAction(action);
  };

  const updateLayoutConfig = (
    key: keyof typeof layoutConfig,
    value: boolean,
  ) => {
    setLayoutConfig((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      const savedSettings = {
        receivePriorityAlerts: next.floatingAlert,
        compactSidebar: next.compactSidebar,
        prioritizePatientList: next.priorityList,
      };
      localStorage.setItem("doctor_settings", JSON.stringify(savedSettings));
      window.dispatchEvent(new Event("doctor_settings_changed"));

      return next;
    });
  };

  const promptOpenActivity = () => {
    if (isAcceptingPatients) {
      return;
    }

    setLockNotice("Hãy mở hoạt động để thao tác");
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {showLoginSuccess ? <Toast message="Đăng nhập thành công" /> : null}
      {lockNotice ? <LockToast message={lockNotice} /> : null}
      {actionNotice ? <Toast message={actionNotice} /> : null}

      <div className="flex min-h-screen">
        <aside
          className={`hidden shrink-0 border-r border-slate-200 bg-white py-4 shadow-[0_0_35px_rgba(15,23,42,0.03)] lg:flex lg:flex-col ${layoutConfig.compactSidebar ? "w-20 px-2" : "w-62.5 px-4"}`}
        >
          <div className="mb-4 flex items-start gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]">
              <Activity className="h-5 w-5" />
            </div>
            {layoutConfig.compactSidebar ? null : (
              <div>
                <div className="text-lg font-bold leading-none text-slate-900">
                  MedOS.io
                </div>
                <div className="text-xs font-medium text-slate-400">
                  Hệ thống Y tế thông minh
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            {layoutConfig.compactSidebar ? (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={toggleAcceptingPatients}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm transition-colors hover:bg-emerald-100"
                  aria-label={
                    isAcceptingPatients
                      ? "Sẵn sàng tiếp nhận"
                      : "Đang ngoại tuyến"
                  }
                  title={
                    isAcceptingPatients
                      ? "Sẵn sàng tiếp nhận"
                      : "Đang ngoại tuyến"
                  }
                >
                  {isAcceptingPatients ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_6px_14px_rgba(239,68,68,0.28)] ring-2 ring-red-100">
                      <X className="h-4 w-4 stroke-3" />
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${isAcceptingPatients ? "bg-emerald-500" : "bg-rose-500"}`}
                      aria-hidden="true"
                    />
                    <p className="text-sm font-bold leading-none text-slate-700">
                      {isAcceptingPatients
                        ? "Sẵn sàng tiếp nhận"
                        : "Đang ngoại tuyến"}
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    {isAcceptingPatients
                      ? "Đăng kí hoạt quy trình đón bệnh nhân tự động."
                      : "Bác sĩ hiện offline"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleAcceptingPatients}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                    isAcceptingPatients ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  aria-label={
                    isAcceptingPatients
                      ? "Tắt trạng thái sẵn sàng tiếp nhận"
                      : "Bật trạng thái sẵn sàng tiếp nhận"
                  }
                  aria-pressed={isAcceptingPatients}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isAcceptingPatients ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {layoutConfig.compactSidebar ? null : (
            <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Danh mục
            </div>
          )}
          <nav className="space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="Tổng quan ca trực"
              active={activeSection === "overview"}
              compact={layoutConfig.compactSidebar}
              onClick={() => {
                setActiveSection("overview");
                router.push("/doctor");
              }}
            />
            <SidebarItem
              icon={Users}
              label="Quản lý bệnh nhân"
              compact={layoutConfig.compactSidebar}
              active={activeSection === "patients"}
              onClick={() => {
                setActiveSection("patients");
                router.push("/doctor/patients");
              }}
            />
            <SidebarItem
              icon={MessagesSquare}
              label="Hội chẩn trực tuyến"
              compact={layoutConfig.compactSidebar}
              active={activeSection === "consult"}
              onClick={() => {
                setActiveSection("consult");
                router.push("/doctor/consult");
              }}
              badge={consultUnreadCount}
            />
            <SidebarItem
              icon={FileText}
              label="Đơn thuốc điện tử"
              compact={layoutConfig.compactSidebar}
              active={activeSection === "prescriptions"}
              onClick={() => {
                setActiveSection("prescriptions");
                router.push("/doctor/prescriptions");
              }}
            />
          </nav>

          <div className="relative mt-auto" ref={profileMenuRef}>
          {isProfileMenuOpen ? (
            <div
              className={`absolute z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)] ${layoutConfig.compactSidebar ? "bottom-0 left-[calc(100%+0.5rem)] w-56" : "bottom-[calc(100%+0.65rem)] left-0 right-0"}`}
            >
                <div className="mb-1 px-2 py-1.5">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    BS. Nguyễn Minh Trí
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Khoa Hồi sức tích cực
                  </p>
                </div>

                <div className="my-1 h-px bg-slate-100" />

                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfilePopupOpen(true);
                  }}
                >
                  <UserCircle2 className="h-4 w-4" />
                  Hồ sơ cá nhân
                </button>

                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSettingsPopupOpen(true);
                  }}
                >
                  <Settings2 className="h-4 w-4" />
                  Cài đặt
                </button>

                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/login");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={`w-full rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-sm transition-colors hover:bg-slate-100 ${layoutConfig.compactSidebar ? "p-2" : "p-3"}`}
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              aria-label="Mở menu tài khoản"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  MT
                </div>
                {layoutConfig.compactSidebar ? null : (
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      BS. Nguyễn Minh Trí
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      Khoa Hồi sức tích cực
                    </div>
                  </div>
                )}
                <ChevronUp
                  className={`h-4 w-4 text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-0" : "rotate-180"}`}
                />
              </div>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          <div className="relative mx-auto max-w-[1800px]">
            {!isAcceptingPatients ? (
              <button
                type="button"
                onClick={promptOpenActivity}
                className="absolute inset-0 z-30 flex items-center justify-center rounded-[2rem] bg-slate-950/10 px-4 py-6 backdrop-blur-[1px]"
                aria-label="Hãy mở hoạt động để thao tác"
              >
                <div className="max-w-md rounded-[1.75rem] border border-amber-200 bg-white/95 px-6 py-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-900">
                    Đang ở trạng thái offline
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Hãy mở hoạt động để thao tác các chức năng trong màn hình
                    này.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Bấm công tắc tiếp nhận ở thanh bên để bật
                  </div>
                </div>
              </button>
            ) : null}

            <div className="relative mb-4 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold tracking-[-0.03em] text-slate-900">
                  Tổng quan ca trực &amp; Giám sát y tế
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Hôm nay, Thứ Sáu, 19 tháng 5, 2023
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLayoutPopupOpen(true)}
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Tùy chỉnh bố cục màn hình
              </button>
            </div>

            <section className="relative mb-5 overflow-hidden rounded-[1.6rem] bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-500 px-5 py-5 text-white shadow-[0_18px_45px_rgba(16,185,129,0.25)] sm:px-6 sm:py-6">
              <div className="max-w-[70%]">
                <h2 className="text-[17px] font-bold sm:text-[18px]">
                  Chào mừng trở lại ca trực, Bác sĩ Trí
                </h2>
                <p className="mt-1.5 max-w-170 text-xs leading-5 text-white/80 sm:text-sm">
                  Hệ thống đã ghi nhận 3 ca bệnh sáng sớm và phát đi AI cảnh
                  báo. Sử dụng Gemini AI bên dưới để phân tích dữ liệu ưu tiên
                  ca trực tự động.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDiagnosisPopupOpen(true)}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/18 hover:shadow-[0_16px_34px_rgba(15,23,42,0.16)]"
              >
                <Sparkles className="mr-2 inline-block h-4 w-4" />
                Phân tích ca trực bằng AI
              </button>
            </section>

            {isLayoutPopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-md animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <button
                    type="button"
                    aria-label="Đóng popup tùy chỉnh bố cục"
                    onClick={() => setIsLayoutPopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                    Tùy chỉnh bố cục
                  </p>
                  <h2 className="mt-1 pr-8 text-[1.6rem] font-bold tracking-[-0.03em] text-slate-900">
                    Bố cục màn hình hiện tại
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Bạn có thể chọn nhóm thành phần muốn ưu tiên hiển thị trên
                    giao diện ca trực.
                  </p>

                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span className="text-sm font-medium text-slate-700">
                        Danh sách ca bệnh ưu tiên
                      </span>
                      <input
                        type="checkbox"
                        checked={layoutConfig.priorityList}
                        onChange={(event) =>
                          updateLayoutConfig(
                            "priorityList",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span className="text-sm font-medium text-slate-700">
                        Khối cảnh báo AI nổi
                      </span>
                      <input
                        type="checkbox"
                        checked={layoutConfig.floatingAlert}
                        onChange={(event) =>
                          updateLayoutConfig(
                            "floatingAlert",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span className="text-sm font-medium text-slate-700">
                        Thanh bên thu gọn
                      </span>
                      <input
                        type="checkbox"
                        checked={layoutConfig.compactSidebar}
                        onChange={(event) =>
                          updateLayoutConfig(
                            "compactSidebar",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsLayoutPopupOpen(false)}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Lưu thay đổi
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLayoutPopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {isDiagnosisPopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-5xl animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)] lg:p-7">
                  <button
                    type="button"
                    aria-label="Đóng popup đề xuất chẩn đoán"
                    onClick={() => setIsDiagnosisPopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex items-start justify-between gap-4 pr-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                        BÁO CÁO GIÁM SÁT LÂM SÀNG BẰNG AI
                      </p>
                      <h2 className="mt-1 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                        Phân tích ca trực &amp; Cảnh báo khẩn cấp bằng Gemini AI
                      </h2>
                    </div>

                    <span className="rounded-full bg-rose-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700">
                      CẢNH BÁO CA TRỰC
                    </span>
                  </div>

                  {/* Overview Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tải trọng ca trực</div>
                      <div className="mt-1 text-lg font-extrabold text-rose-600">85% (Rất Cao)</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ca khẩn cấp cần xử lý</div>
                      <div className="mt-1 text-lg font-extrabold text-red-600">3 Ca bệnh</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ca ưu tiên số 1</div>
                      <div className="mt-1 text-lg font-extrabold text-slate-900">Lê Thị Mai</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nhân lực khuyến nghị</div>
                      <div className="mt-1 text-lg font-extrabold text-emerald-600">1 BS + 2 ĐD</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    {/* Left Column: Priority Cases list */}
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Danh sách ca cần can thiệp ngay
                      </p>

                      {/* Case 1: Lê Thị Mai */}
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                            🔴 Ưu tiên 1 - NGUY HIỂM
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">BN-9081</span>
                        </div>
                        <h4 className="mt-2 text-[15px] font-bold text-slate-900">Lê Thị Mai - Nữ, 62 tuổi</h4>
                        <p className="mt-1 text-xs text-slate-500">Tiền sử: Tăng huyết áp nguyên phát 5 năm, tuân thủ điều trị kém.</p>
                        
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                          <div className="rounded-xl bg-white p-2.5 border border-rose-100">
                            <span className="font-semibold text-rose-700">AI Chẩn đoán:</span>
                            <p className="mt-0.5 text-slate-700">Cơn tăng huyết áp cấp / Theo dõi tai biến mạch máu não nhẹ (Độ tin cậy: 96%)</p>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-rose-100">
                            <span className="font-semibold text-rose-700">Chỉ định lâm sàng:</span>
                            <p className="mt-0.5 text-slate-700">Theo dõi sinh tồn mỗi 5 phút, dùng thuốc hạ áp tĩnh mạch khẩn cấp.</p>
                          </div>
                        </div>
                      </div>

                      {/* Case 2: Nguyễn Văn Hùng */}
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                            🟡 Ưu tiên 2 - THEO DÕI SÁT
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">BN-9084</span>
                        </div>
                        <h4 className="mt-2 text-[15px] font-bold text-slate-900">Nguyễn Văn Hùng - Nam, 45 tuổi</h4>
                        <p className="mt-1 text-xs text-slate-500">Triệu chứng: Đau hố chậu phải dữ dội, sốt nhẹ 38.2°C, có phản ứng thành bụng.</p>
                        
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                          <div className="rounded-xl bg-white p-2.5 border border-amber-100">
                            <span className="font-semibold text-amber-700">AI Chẩn đoán:</span>
                            <p className="mt-0.5 text-slate-700">Theo dõi viêm ruột thừa cấp giờ thứ 12 (Độ tin cậy: 88%)</p>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-amber-100">
                            <span className="font-semibold text-amber-700">Chỉ định lâm sàng:</span>
                            <p className="mt-0.5 text-slate-700">Siêu âm ổ bụng khẩn cấp, nhịn ăn uống chuẩn bị phẫu thuật ngoại khoa.</p>
                          </div>
                        </div>
                      </div>

                      {/* Case 3: Trần Quốc Bảo */}
                      <div className="rounded-2xl border border-sky-200 bg-sky-50/20 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-sky-700">
                            🔵 Ưu tiên 3 - ĐANG THEO DÕI
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">BN-9083</span>
                        </div>
                        <h4 className="mt-2 text-[15px] font-bold text-slate-900">Trần Quốc Bảo - Nam, 32 tuổi</h4>
                        <p className="mt-1 text-xs text-slate-500">Tình trạng: Nhập viện do tai nạn giao thông chấn thương vùng ngực.</p>
                        
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                          <div className="rounded-xl bg-white p-2.5 border border-sky-100">
                            <span className="font-semibold text-sky-700">AI Chẩn đoán:</span>
                            <p className="mt-0.5 text-slate-700">Theo dõi sốc mất máu / Tràn khí màng phổi nhẹ (Độ tin cậy: 92%)</p>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-sky-100">
                            <span className="font-semibold text-sky-700">Chỉ định lâm sàng:</span>
                            <p className="mt-0.5 text-slate-700">Theo dõi sát SpO2, lập 2 đường truyền tĩnh mạch lớn bù dịch đẳng trương.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: AI Insight and Shift actions */}
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                          Nhận định tổng hợp ca trực
                        </p>
                        <p className="mt-2 text-xs leading-6 text-slate-700">
                          Gemini đã đối chiếu toàn bộ 15 hồ sơ bệnh án trong ca trực. Ghi nhận 3 trường hợp nguy cơ tiến triển khẩn cấp cần can thiệp. Đề xuất bác sĩ tập trung kiểm soát huyết áp cho BN-9081 Lê Thị Mai trước để hạn chế nguy cơ đột quỵ tai biến mạch máu não, song song đó điều phối nhân sự chuẩn bị phòng mổ cho BN-9084 Nguyễn Văn Hùng phòng ngừa vỡ ruột thừa.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Gợi ý điều phối nhân sự
                          </p>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Ca trực
                          </span>
                        </div>

                        <div className="mt-3 space-y-2.5">
                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                              1
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-800">
                                Ê-kíp Hồi sức cấp cứu
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Theo dõi và tiêm hạ áp tĩnh mạch cho Lê Thị Mai
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                              2
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-800">
                                Bố trí siêu âm đầu giường
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Siêu âm khẩn cấp ổ bụng cho Nguyễn Văn Hùng
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                              3
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-800">
                                Bàn giao ca trực phụ
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Kê đơn xuất viện cho các ca ổn định (BN-9082)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDiagnosisPopupOpen(false);
                        setActionNotice("Áp dụng kế hoạch điều phối ca trực thành công");
                      }}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Áp dụng kế hoạch điều phối ca trực
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDiagnosisPopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {isAiErrorPopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-140 animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-5 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-6">
                  <button
                    type="button"
                    aria-label="Đóng popup báo lỗi kịch bản AI"
                    onClick={() => setIsAiErrorPopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-3 pr-8">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff8a1f] text-white shadow-[0_14px_28px_rgba(249,115,22,0.25)]">
                      <Flag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                        Báo cáo lỗi kịch bản AI
                      </p>
                      <h2 className="mt-1 text-[1.45rem] font-bold tracking-[-0.03em] text-slate-900">
                        Gửi phản hồi cho Ban chỉ đạo AI
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Ghi chú lỗi y khoa/Ban chỉ đạo AI
                    </p>
                    <textarea
                      placeholder="Vui lòng nêu chi tiết lỗi chẩn đoán hoặc dữ liệu đề xuất không đúng thực tế..."
                      className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div className="mt-4 rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          Thông tin gửi đi sẽ được ghi nhận để huấn luyện lại
                          luồng gợi ý.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Chỉ dùng nội bộ, ưu tiên phân loại lỗi chẩn đoán, lỗi
                          dữ liệu và lỗi giao diện.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiErrorPopupOpen(false);
                        setActionNotice("Gửi báo cáo thành công");
                      }}
                      className="flex-1 rounded-2xl bg-[#ff8a1f] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#f97316]"
                    >
                      Gửi báo cáo
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAiErrorPopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {isProfilePopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-xl animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <button
                    type="button"
                    aria-label="Đóng popup hồ sơ cá nhân"
                    onClick={() => setIsProfilePopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                    Hồ sơ cá nhân
                  </p>
                  <h2 className="mt-1 pr-8 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                    Thông tin bác sĩ phụ trách
                  </h2>

                  <div className="mt-5 rounded-[1.3rem] border border-emerald-100 bg-linear-to-r from-emerald-50 to-cyan-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                        MT
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-bold text-slate-900">
                          BS. Nguyễn Minh Trí
                        </p>
                        <p className="truncate text-sm text-slate-600">
                          Khoa Hồi sức tích cực
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Đang trong ca trực
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Mã nhân sự
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        DOC-ICTC-021
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Liên hệ nội bộ
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        ext. 214
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Số ca hôm nay
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        12 ca theo dõi
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Kỹ năng chính
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        Hồi sức cấp cứu, ECMO
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsProfilePopupOpen(false)}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Cập nhật hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProfilePopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {isSettingsPopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-lg animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <button
                    type="button"
                    aria-label="Đóng popup cài đặt"
                    onClick={() => setIsSettingsPopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                    Cài đặt tài khoản
                  </p>
                  <h2 className="mt-1 pr-8 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                    Tùy chỉnh phiên làm việc
                  </h2>

                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Nhận cảnh báo ưu tiên
                        </p>
                        <p className="text-xs text-slate-400">
                          Cảnh báo ca nguy hiểm theo thời gian thực
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={layoutConfig.floatingAlert}
                        onChange={(event) =>
                          updateLayoutConfig(
                            "floatingAlert",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Sidebar thu gọn
                        </p>
                        <p className="text-xs text-slate-400">
                          Hiển thị thanh bên ở chế độ compact
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={layoutConfig.compactSidebar}
                        onChange={(event) =>
                          updateLayoutConfig(
                            "compactSidebar",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Ưu tiên danh sách ca bệnh
                        </p>
                        <p className="text-xs text-slate-400">
                          Luôn đẩy ca nguy hiểm lên đầu
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={layoutConfig.priorityList}
                        onChange={(event) =>
                          updateLayoutConfig(
                            "priorityList",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                        <Settings2 className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-slate-700">
                        Cài đặt sẽ được áp dụng ngay trong phiên làm việc hiện
                        tại để bác sĩ thao tác nhanh hơn.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSettingsPopupOpen(false)}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Lưu cài đặt
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSettingsPopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Danh sách ca bệnh trực tiếp hôm nay
              </h3>

              <button
                type="button"
                onClick={() => setIsFilterOpen((value) => !value)}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Lọc/Sắp xếp
                <ChevronDown className="h-4 w-4" />
              </button>

              {isFilterOpen ? (
                <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Chọn chế độ
                  </p>

                  <div className="mt-2 space-y-2">
                    {[
                      { key: "urgent", label: "Ưu tiên ca nguy hiểm" },
                      { key: "recent", label: "Mới nhất trước" },
                      { key: "status", label: "Theo trạng thái" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setSortMode(option.key as typeof sortMode);
                          setIsFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-colors ${sortMode === option.key ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                      >
                        <span>{option.label}</span>
                        <span className="text-xs font-semibold text-slate-400">
                          Chọn
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <section className="space-y-3">
              {visibleAppointments.map((item) => (
                <PatientCard
                  key={item.name}
                  {...item}
                  onActionClick={() =>
                    openPatientAction(
                      item,
                      item.statusTone === "red" ? "emergency" : "detail",
                    )
                  }
                />
              ))}
            </section>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hiển thị:</span>
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="appearance-none rounded-full border border-emerald-100 bg-white pl-4 pr-9 py-1.5 text-xs font-bold text-slate-700 shadow-sm outline-none cursor-pointer transition-all hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value={5}>5 ca / trang</option>
                      <option value={10}>10 ca / trang</option>
                      <option value={20}>20 ca / trang</option>
                      <option value={30}>30 ca / trang</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Hiển thị {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} trong số {totalItems} ca bệnh
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:cursor-not-allowed"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="inline-flex h-8 w-8 items-center justify-center text-xs font-semibold text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(page))}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        activePage === page
                          ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:cursor-not-allowed"
                  title="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {selectedAppointment && selectedAction === "detail" ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-xl animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <button
                    type="button"
                    aria-label="Đóng popup xem chi tiết"
                    onClick={() => setSelectedAppointment(null)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                    Xem chi tiết ca bệnh
                  </p>
                  <h2 className="mt-1 pr-8 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                    Hồ sơ nhanh của {selectedAppointment.name}
                  </h2>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">
                          {selectedAppointment.initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {selectedAppointment.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {selectedAppointment.details}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                          <span>Trạng thái</span>
                          <span className="font-semibold text-slate-800">
                            {selectedAppointment.status}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                          <span>Thời gian</span>
                          <span className="font-semibold text-slate-800">
                            {selectedAppointment.time}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                          <span>Phân loại</span>
                          <span className="font-semibold text-emerald-700">
                            Theo dõi
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                          Gợi ý nhanh
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          Mở hồ sơ đầy đủ, kiểm tra lịch sử thuốc và ghi chú
                          theo dõi tiếp theo.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                          Thao tác đề xuất
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                            Mở hồ sơ bệnh án
                          </div>
                          <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                            Ghi nhận diễn biến ca trực
                          </div>
                          <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                            Đặt lịch nhắc lại theo dõi
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/doctor/patients?id=${selectedAppointment?.patientId}`,
                        );
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Mở hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(null)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedAppointment && selectedAction === "emergency" ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-xl animate-alert-modal rounded-[1.75rem] border border-red-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <button
                    type="button"
                    aria-label="Đóng popup khẩn cấp"
                    onClick={() => setSelectedAppointment(null)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
                    Xử trí khẩn cấp
                  </p>
                  <h2 className="mt-1 pr-8 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                    {selectedAppointment.name} đang ở mức báo động
                  </h2>

                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Cần điều dưỡng và bác sĩ trực hỗ trợ ngay
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Hệ thống khuyến nghị bật quy trình ưu tiên, khóa luồng
                          xử lý thường và mở hội chẩn tức thì.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Bước 1
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        Gọi điều dưỡng trực
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Bước 2
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        Kích hoạt hội chẩn
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Bước 3
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        Theo dõi 5 phút/lần
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAppointment) return;
                        setAppointments((prev) =>
                          prev.map((app) => {
                            if (app.patientId === selectedAppointment.patientId) {
                              return {
                                ...app,
                                status: "Đang cấp cứu...",
                                statusTone: "red" as const,
                              };
                            }
                            return app;
                          })
                        );
                        setActionNotice(
                          `Kích hoạt quy trình khẩn cấp cho bệnh nhân ${selectedAppointment.name} thành công!`
                        );
                        setSelectedAppointment(null);
                        setTimeout(() => {
                          router.push("/doctor/consult");
                        }, 1200);
                      }}
                      className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(239,68,68,0.22)] transition-all hover:-translate-y-0.5 hover:bg-red-700"
                    >
                      Kích hoạt khẩn cấp
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(null)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {layoutConfig.floatingAlert && !isDismissedQuickAlert ? (
              <div className="fixed bottom-4 right-4 z-40 w-md max-w-[calc(100vw-2rem)] animate-alert-pulse rounded-[1.35rem] border border-rose-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)] ring-1 ring-rose-100">
                <button
                  type="button"
                  aria-label="Đóng cảnh báo nhanh"
                  onClick={() => setIsDismissedQuickAlert(true)}
                  className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start gap-3 pr-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-inner shadow-red-100">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-red-500">
                      Hệ thống phát hiện AI
                    </p>
                    <p className="mt-1 font-sans text-[15px] font-medium leading-6 text-slate-700">
                      Cảnh báo nhịp tim bất thường bệnh nhân Lê Thị Mai - Cần xử
                      lý khẩn cấp!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickAlertOpen(true)}
                    className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_14px_24px_rgba(16,185,129,0.32)]"
                  >
                    Xem nhanh
                  </button>
                </div>
              </div>
            ) : null}

            {isQuickAlertOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-lg animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                  <button
                    type="button"
                    aria-label="Đóng popup cảnh báo"
                    onClick={() => setIsQuickAlertOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                    ĐO CHỈ SỐ TỪ XA
                  </p>
                  <h2 className="mt-1 pr-8 text-[1.6rem] font-bold tracking-[-0.03em] text-slate-900">
                    Chỉ số sinh tồn báo động
                  </h2>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-[13px] font-extrabold text-red-500">
                        LM
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          Lê Thị Mai
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          Nữ • 62 tuổi • Bệnh án tim mạch huyết áp cấp
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
                    <div className="absolute right-3 top-3 opacity-10">
                      <Activity className="h-18 w-18 text-rose-500" />
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
                      Chỉ số báo động
                    </p>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-end justify-between gap-4">
                        <p className="text-sm text-slate-700">
                          Huyết áp tâm thu/tâm trương:
                        </p>
                        <p className="text-[18px] font-bold leading-none text-red-500">
                          180/120
                          <span className="text-sm font-semibold">mmHg</span>
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <p className="text-sm text-slate-700">
                          Nhịp tim do nhanh từ xa:
                        </p>
                        <p className="text-[18px] font-bold leading-none text-red-500">
                          140 <span className="text-sm font-semibold">bpm</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/doctor/consult");
                        setIsQuickAlertOpen(false);
                      }}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Chat khẩn cấp
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/doctor/patients?id=${selectedAppointment?.patientId}`,
                        );
                        setIsQuickAlertOpen(false);
                      }}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Xem bệnh án
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="lg:hidden">
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      MT
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        BS. Nguyễn Minh Trí
                      </div>
                      <div className="text-xs text-slate-500">
                        Khoa Hồi sức tích cực
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 p-2 text-slate-500"
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        body {
          background: #f6f8fc;
        }

        @keyframes alert-pulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
          }
          50% {
            transform: scale(1.015);
            box-shadow: 0 20px 46px rgba(15, 23, 42, 0.14);
          }
        }

        .animate-alert-pulse {
          animation: alert-pulse 3.2s ease-in-out infinite;
        }

        @keyframes alert-modal {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-alert-modal {
          animation: alert-modal 220ms ease-out both;
        }
      `}</style>
    </div>
  );
}
