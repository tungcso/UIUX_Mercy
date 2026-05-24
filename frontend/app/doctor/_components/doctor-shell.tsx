"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Settings,
  Users,
  UserCircle2,
  FileText,
  Activity,
  X,
} from "lucide-react";

export type NavigationSection =
  | "overview"
  | "patients"
  | "consult"
  | "prescriptions";

type SidebarItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
  badge?: number | null;
};

export function SidebarItem({
  icon: Icon,
  label,
  active = false,
  compact = false,
  onClick,
  badge = null,
}: SidebarItemProps) {
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

type AppSidebarProps = {
  activeSection: NavigationSection;
  compact?: boolean;
  isAcceptingPatients: boolean;
  onToggleAccepting: () => void;
  onNavigate: (section: NavigationSection) => void;
  consultUnread?: number;
  prescriptionsUnread?: number;
};

export function AppSidebar({
  activeSection,
  compact = false,
  isAcceptingPatients,
  onToggleAccepting,
  onNavigate,
  consultUnread = 0,
  prescriptionsUnread = 0,
}: AppSidebarProps) {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const showSuccessNotice = (actionName: string) => {
    setActionNotice(`${actionName} thành công`);
  };

  const handleToggleAccepting = () => {
    const nextState = !isAcceptingPatients;
    onToggleAccepting();
    showSuccessNotice(
      nextState ? "Bật trạng thái tiếp nhận" : "Tắt trạng thái tiếp nhận",
    );
  };

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

  useEffect(() => {
    if (!actionNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setActionNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  return (
    <>
      {actionNotice ? (
        <div className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white py-4 shadow-[0_0_35px_rgba(15,23,42,0.03)] lg:flex lg:flex-col relative z-50 pointer-events-auto ${compact ? "w-20 px-2" : "w-62.5 px-4"}`}
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
                onClick={handleToggleAccepting}
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
                onClick={handleToggleAccepting}
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
            Danh mục
          </div>
        )}

        <nav className="space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Tổng quan ca trực"
            active={activeSection === "overview"}
            compact={compact}
            onClick={() => {
              onNavigate?.("overview");
              router.push("/doctor");
            }}
          />
          <SidebarItem
            icon={Users}
            label="Quản lý bệnh nhân"
            active={activeSection === "patients"}
            compact={compact}
            onClick={() => {
              onNavigate?.("patients");
              router.push("/doctor/patients");
            }}
          />
          <SidebarItem
            icon={MessagesSquare}
            label="Hội chẩn trực tuyến"
            active={activeSection === "consult"}
            compact={compact}
            onClick={() => {
              onNavigate?.("consult");
              router.push("/doctor/consult");
            }}
            badge={consultUnread}
          />
          <SidebarItem
            icon={FileText}
            label="Đơn thuốc điện tử"
            active={activeSection === "prescriptions"}
            compact={compact}
            onClick={() => {
              onNavigate?.("prescriptions");
              router.push("/doctor/prescriptions");
            }}
            badge={prescriptionsUnread}
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
                <Settings className="h-4 w-4" />
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
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsProfilePopupOpen(false);
                  showSuccessNotice("Cập nhật hồ sơ");
                }}
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
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Nhận cảnh báo ưu tiên
                </p>
                <p className="text-xs text-slate-400">
                  Cảnh báo ca nguy hiểm theo thời gian thực
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Chế độ hiển thị sidebar
                </p>
                <p className="text-xs text-slate-400">
                  Thu gọn hoặc mở rộng theo tác vụ hiện tại
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Ưu tiên danh sách ca bệnh
                </p>
                <p className="text-xs text-slate-400">
                  Tự động ưu tiên ca nguy hiểm lên đầu
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsPopupOpen(false);
                  showSuccessNotice("Lưu cài đặt");
                }}
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
    </>
  );
}
