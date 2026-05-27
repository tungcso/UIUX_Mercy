"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  Flag,
  GitBranch,
  Inbox,
  Pill,
  LogOut,
  Settings2,
  UserCircle2,
  ChevronUp,
  Brain,
} from "lucide-react";
import AnalyticsDashboard from "./_components/AnalyticsDashboard";
import AccuracyFeedbackMonitor from "./_components/AccuracyFeedbackMonitor";
import ScenarioEditor from "./_components/ScenarioEditor";
import ComplexCaseInbox from "./_components/ComplexCaseInbox";
import DrugLookup from "./_components/DrugLookup";

type Section =
  | "analytics"
  | "feedback"
  | "scenario"
  | "cases"
  | "drugs";

const navItems: {
  section: Section;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  badge?: number;
}[] = [
  {
    section: "analytics",
    icon: BarChart2,
    label: "Dashboard Phân tích",
    sub: "Tổng quan hệ thống AI",
  },
  {
    section: "feedback",
    icon: Flag,
    label: "Theo dõi Phản hồi",
    sub: "Màng lọc chất lượng Chatbot",
    badge: 18,
  },
  {
    section: "scenario",
    icon: GitBranch,
    label: "Chỉnh sửa Kịch bản",
    sub: "Xây dựng luồng hội thoại",
  },
  {
    section: "cases",
    icon: Inbox,
    label: "Ca bệnh Phức tạp",
    sub: "Hộp thư khẩn cấp",
    badge: 3,
  },
  {
    section: "drugs",
    icon: Pill,
    label: "Tra cứu Thuốc",
    sub: "Kho dữ liệu dược phẩm",
  },
];

function SidebarItem({
  section,
  icon: Icon,
  label,
  sub,
  active,
  badge,
  onClick,
}: {
  section: Section;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-emerald-50 text-emerald-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className="relative shrink-0">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            active
              ? "bg-emerald-100 text-emerald-600 shadow-sm"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        {badge ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-sm font-semibold ${active ? "text-emerald-700" : "text-slate-700"}`}
        >
          {label}
        </div>
        <div className="truncate text-[11px] text-slate-400">{sub}</div>
      </div>
    </button>
  );
}

export default function SpecialistPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("analytics");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const sectionComponents: Record<Section, React.ReactNode> = {
    analytics: <AnalyticsDashboard />,
    feedback: <AccuracyFeedbackMonitor />,
    scenario: <ScenarioEditor />,
    cases: <ComplexCaseInbox />,
    drugs: <DrugLookup />,
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        {/* Sidebar */}
        <aside className="hidden shrink-0 border-r border-slate-200 bg-white py-5 shadow-[0_0_35px_rgba(15,23,42,0.03)] lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen w-72 px-4">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="mb-5 flex items-center gap-3 px-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-bold leading-none text-slate-900">
                  MedOS<span className="text-emerald-600">.io</span>
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  Không gian Chuyên gia AI
                </div>
              </div>
            </div>

            {/* Status banner */}
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-bold text-emerald-700">Chuyên gia Đang trực</p>
              </div>
              <p className="mt-0.5 text-[11px] leading-4 text-emerald-600">
                Phân tích & Quản lý hệ thống AI tư vấn
              </p>
            </div>

            {/* Nav label */}
            <div className="mb-2 px-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Chức năng chuyên gia
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1.5 overflow-auto">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.section}
                  {...item}
                  active={activeSection === item.section}
                  onClick={() => setActiveSection(item.section)}
                />
              ))}
            </nav>

            {/* Profile */}
            <div className="relative mt-4">
              {isProfileOpen && (
                <div className="absolute bottom-[calc(100%+0.6rem)] left-0 right-0 z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                  <div className="mb-1 px-2 py-1.5">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      TS. Nguyễn Thành Long
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Chuyên gia AI Y tế
                    </p>
                  </div>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings2 className="h-4 w-4" />
                    Cài đặt
                  </button>
                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/login");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsProfileOpen((p) => !p)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-left shadow-sm transition-colors hover:bg-slate-100"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    NL
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      TS. Nguyễn Thành Long
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      Chuyên gia AI Y tế
                    </div>
                  </div>
                  <ChevronUp
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isProfileOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-7xl">
            {sectionComponents[activeSection]}
          </div>
        </main>
      </div>
    </div>
  );
}
