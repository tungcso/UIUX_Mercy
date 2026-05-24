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
  tone: "green" | "red" | "slate";
}) {
  const toneClasses = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
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
  statusTone: "green" | "red" | "slate";
  accent: "green" | "red" | "slate";
  actionLabel: string;
  onActionClick: () => void;
}) {
  const accentClasses = {
    green: "border-emerald-300 bg-white",
    red: "border-red-300 bg-white",
    slate: "border-slate-200 bg-white",
  };

  const initialsClasses = {
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-500",
    slate: "bg-slate-100 text-slate-500",
  };

  const actionButtonClasses =
    statusTone === "red"
      ? "bg-red-600 text-white shadow-[0_12px_24px_rgba(239,68,68,0.22)] hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_14px_28px_rgba(239,68,68,0.28)]"
      : "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_20px_rgba(16,185,129,0.12)]";

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] ${accentClasses[accent]}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${initialsClasses[accent]}`}
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
          className={`text-base font-bold ${statusTone === "red" ? "text-red-500" : statusTone === "green" ? "text-emerald-700" : "text-slate-700"}`}
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
  statusTone: "green" | "red" | "slate";
  accent: "green" | "red" | "slate";
  actionLabel: string;
  patientId: string;
};

export default function DoctorDashboardPage() {
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("overview");
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const [isQuickAlertOpen, setIsQuickAlertOpen] = useState(false);
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

  const appointments: Appointment[] = [
    {
      initials: "TB",
      name: "Trần Quốc Bảo",
      details:
        "Nam, 32T · Chấn thương mạch máu · Mạch ổn định · Đang truyền dịch",
      time: "10:32",
      status: "Dữ liệu bình thường",
      statusTone: "green" as const,
      accent: "green" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9083",
    },
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
      initials: "PN",
      name: "Phạm Hoàng Nam",
      details:
        "Nam, 56T · Khám nội định kỳ · Sức khỏe bình thường · Chưa xử trị",
      time: "09:15",
      status: "Đang chờ",
      statusTone: "slate" as const,
      accent: "slate" as const,
      actionLabel: "Xem chi tiết",
      patientId: "BN-9082",
    },
  ];

  const visibleAppointments = layoutConfig.priorityList
    ? [...appointments].sort((left, right) => {
        if (sortMode === "urgent") {
          const order = { red: 0, slate: 1, green: 2 } as const;

          return order[left.statusTone] - order[right.statusTone];
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
    setLayoutConfig((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const promptOpenActivity = () => {
    if (isAcceptingPatients) {
      return;
    }

    setLockNotice("Hãy mở hoạt động để thao tác");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {showLoginSuccess ? <Toast message="Đăng nhập thành công" /> : null}
      {lockNotice ? <LockToast message={lockNotice} /> : null}

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
                className={`absolute z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)] ${layoutConfig.compactSidebar ? "bottom-[calc(100%+0.5rem)] left-1/2 w-56 -translate-x-1/2" : "bottom-[calc(100%+0.65rem)] left-0 right-0"}`}
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
          <div className="relative mx-auto max-w-280">
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

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Brain className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              Lê Thị Mai
                            </div>
                            <div className="truncate text-xs text-slate-400">
                              Nữ • 62 tuổi • Tăng huyết áp, đau đầu vùng chẩm
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        {[
                          [
                            "Cơn tăng huyết áp cấp",
                            "Độ phù hợp: 96%",
                            "emerald",
                          ],
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
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                          AI nhận định
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          Dựa trên huyết áp 180/120 mmHg, đau vùng chẩm và nhịp
                          tim tăng, hệ thống ưu tiên cơn tăng huyết áp cấp, đồng
                          thời đề nghị loại trừ biến cố thần kinh cấp tính.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Gợi ý hành động
                          </p>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            3 bước
                          </span>
                        </div>

                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <ClipboardList className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-700">
                                Xác nhận chẩn đoán sơ bộ
                              </div>
                              <div className="text-xs text-slate-400">
                                So sánh với bệnh án nền
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-700">
                                Mở hội chẩn nếu có dấu hiệu thần kinh
                              </div>
                              <div className="text-xs text-slate-400">
                                Ưu tiên ngay
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Activity className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-700">
                                Theo dõi vitals mỗi 5 phút
                              </div>
                              <div className="text-xs text-slate-400">
                                Bắt buộc
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              Ưu tiên 1: Lê Thị Mai
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Cần theo dõi chỉ số sinh tồn ngay, chuyển sang
                              luồng khẩn cấp nếu có triệu chứng thần kinh.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDiagnosisPopupOpen(false);
                        setActionNotice("Áp dụng chẩn đoán thành công");
                      }}
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

            <div className="fixed bottom-4 right-4 z-40 w-md max-w-[calc(100vw-2rem)] animate-alert-pulse rounded-[1.35rem] border border-rose-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)] ring-1 ring-rose-100">
              <div className="flex items-start gap-3">
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
