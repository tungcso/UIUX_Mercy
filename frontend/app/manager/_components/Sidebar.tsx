import { BarChart2, Bot, Settings, Users } from "lucide-react";
import DoctorDropdown from "./DoctorDropdown";

type SidebarSection = "overview" | "crm" | "hr" | "chatbot";

type SidebarProps = {
  activeSection?: SidebarSection;
  onSectionChange?: (section: SidebarSection) => void;
  hasMriError?: boolean;
};

export default function Sidebar({
  activeSection = "overview",
  onSectionChange,
  hasMriError = false,
}: SidebarProps) {
  const baseItemClass =
    "flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium transition-colors duration-150";
  const activeItemClass = "bg-blue-50 text-blue-600 shadow-sm font-semibold";
  const inactiveItemClass =
    "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  const activeIconClass = "bg-blue-100 text-blue-600 shadow-sm";
  const inactiveIconClass = "bg-slate-100 text-slate-400";

  return (
    <aside className="hidden shrink-0 border-r border-slate-200 bg-white py-4 shadow-[0_0_35px_rgba(15,23,42,0.03)] lg:flex lg:flex-col lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:self-start w-64 px-4">
      <div className="h-full flex flex-col">
        <div className="mb-4 flex items-start gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]">
            M
          </div>
          <div>
            <div className="text-xs font-semibold leading-none text-slate-900">
              Bảng điều hành
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              MedOS Clinic
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <p className="text-xs font-bold leading-none text-slate-700">
              Bộ giám sát sự cố
            </p>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-white/70 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
              ⚠️ Khoa Nội Quá Tải (&gt;85%)
            </div>
            {hasMriError && (
              <div className="rounded-lg bg-white/70 px-2 py-1 text-xs font-semibold text-rose-600 border border-rose-100 animate-pulse">
                🔴 Máy MRI báo Lỗi Đỏ
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 px-2">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Màn hình quản lý
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2">
          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => onSectionChange?.("overview")}
              className={`${baseItemClass} ${activeSection === "overview" ? activeItemClass : inactiveItemClass}`}
            >
              <span
                className={`h-7 w-7 flex items-center justify-center rounded-md ${activeSection === "overview" ? activeIconClass : inactiveIconClass}`}
              >
                <BarChart2 className="h-5 w-5" />
              </span>
              <span
                className={`text-sm ${activeSection === "overview" ? "text-blue-600" : "text-slate-600"}`}
              >
                1. Bảng điều hành
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSectionChange?.("crm")}
              className={`${baseItemClass} ${activeSection === "crm" ? activeItemClass : inactiveItemClass}`}
            >
              <span
                className={`h-7 w-7 flex items-center justify-center rounded-md ${activeSection === "crm" ? activeIconClass : inactiveIconClass}`}
              >
                <Users className="h-5 w-5" />
              </span>
              <span
                className={`text-xs ${activeSection === "crm" ? "text-blue-600" : "text-slate-600"}`}
              >
                2. CRM & Kinh tế
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSectionChange?.("hr")}
              className={`${baseItemClass} ${activeSection === "hr" ? activeItemClass : inactiveItemClass}`}
            >
              <span
                className={`h-7 w-7 flex items-center justify-center rounded-md ${activeSection === "hr" ? activeIconClass : inactiveIconClass}`}
              >
                <Settings className="h-5 w-5" />
              </span>
              <span
                className={`text-xs ${activeSection === "hr" ? "text-blue-600" : "text-slate-600"}`}
              >
                3. Thiết bị & Nhân sự
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSectionChange?.("chatbot")}
              className={`${baseItemClass} ${activeSection === "chatbot" ? activeItemClass : inactiveItemClass}`}
            >
              <span
                className={`h-7 w-7 flex items-center justify-center rounded-md ${activeSection === "chatbot" ? activeIconClass : inactiveIconClass}`}
              >
                <Bot className="h-5 w-5" />
              </span>
              <span
                className={`text-xs ${activeSection === "chatbot" ? "text-blue-600" : "text-slate-600"}`}
              >
                4. Chatbot & Vận hành AI
              </span>
            </button>
          </nav>
        </div>

        <div className="mt-4 px-2">
          <DoctorDropdown />
        </div>
      </div>
    </aside>
  );
}
