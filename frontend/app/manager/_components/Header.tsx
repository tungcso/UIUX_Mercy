export default function Header() {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-slate-900">
          Bảng điều hành
        </h1>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-[13px] font-medium text-slate-500 shadow-sm">
          Hôm nay: Thứ Sáu, 22 tháng 5, 2026
        </span>
      </div>

      <div className="flex justify-start lg:justify-end">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)]">
          Hệ thống hoạt động ổn định
        </span>
      </div>
    </div>
  );
}
