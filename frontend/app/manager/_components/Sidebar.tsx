import styles from "./sidebar.module.css";
import { BarChart2, Users, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden shrink-0 border-r border-slate-200 bg-white py-4 shadow-[0_0_35px_rgba(15,23,42,0.03)] lg:flex lg:flex-col w-64 px-4">
      <div className="mb-4 flex items-start gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]">
          M
        </div>
        <div>
          <div className="text-sm font-bold leading-none text-slate-900">
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
          <div className="rounded-lg bg-white/70 px-2 py-1 text-xs font-semibold text-rose-600 border border-rose-100">
            🔴 Máy MRI báo Lỗi Đỏ
          </div>
        </div>
      </div>

      <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Màn hình quản lý
      </div>

      <nav className="space-y-2">
        <button className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold bg-blue-50 text-blue-600 shadow-sm transition-transform duration-150">
          <span className="h-7 w-7 flex items-center justify-center rounded-md bg-blue-100 text-blue-600 shadow-sm">
            <BarChart2 className="h-5 w-5" />
          </span>
          <span className="text-blue-600 text-sm">1. Bảng điều hành</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150">
          <span className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-400">
            <Users className="h-5 w-5" />
          </span>
          <span className="text-xs">2. CRM & Kinh tế</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150">
          <span className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-400">
            <Settings className="h-5 w-5" />
          </span>
          <span className="text-xs">3. Thiết bị & Nhân sự</span>
        </button>
      </nav>

      <div className="relative mt-auto">
        <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-sm p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              TN
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-800">
                ThS. Nguyễn Văn Quân
              </div>
              <div className="truncate text-[11px] text-slate-500">
                Giám đốc phòng khám
              </div>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
