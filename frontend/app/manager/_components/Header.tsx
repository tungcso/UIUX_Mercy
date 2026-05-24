export default function Header() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.02)] mb-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">
          Bảng điều hành
        </h2>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Hôm nay: Thứ Sáu, 22 tháng 5, 2026
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100/50">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Hệ thống hoạt động ổn định
        </div>
      </div>
    </div>
  );
}
