"use client";

export default function EmergencyBanner({
  onConnect,
}: {
  onConnect?: () => void;
}) {
  return (
    <div className="fixed left-4 right-4 top-20 z-50 rounded-2xl border border-[#fecaca] bg-[#fff5f5] p-3 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[#991b1b]">
            Triệu chứng có thể khẩn cấp
          </p>
          <p className="text-[13px] text-[#991b1b]">
            Nếu có đau ngực, khó thở hoặc choáng, hãy gọi hỗ trợ ngay.
          </p>
        </div>
        <button
          type="button"
          onClick={onConnect}
          className="min-h-11 rounded-full bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white"
        >
          Kết nối
        </button>
      </div>
    </div>
  );
}
