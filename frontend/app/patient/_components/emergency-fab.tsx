"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CircleAlert,
  PhoneCall,
  Stethoscope,
  X,
} from "lucide-react";

export default function EmergencyFab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isSmartBannerVisible, setIsSmartBannerVisible] = useState(false);
  const [loadingChoice, setLoadingChoice] = useState<"doctor" | null>(null);

  const emergencyMode = searchParams.get("emergency") === "1";
  const riskMode = searchParams.get("risk") === "1";
  const highlighted = emergencyMode || riskMode;

  useEffect(() => {
    if (emergencyMode || riskMode) {
      setIsSmartBannerVisible(true);
    }
  }, [emergencyMode, riskMode, pathname]);

  const openDoctorEmergency = () => {
    setLoadingChoice("doctor");
    setTimeout(() => {
      router.push(`/patient/consult/doctor-${Date.now()}?mode=doctor&emergency=1`);
    }, 280);
  };

  const confirmCall = () => {
    window.location.href = "tel:115";
  };

  const closeSheet = () => {
    setIsOpen(false);
    setLoadingChoice(null);
  };

  return (
    <>
      {isSmartBannerVisible ? (
        <div className="fixed left-1/2 top-3 z-50 w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2">
          <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 shadow-[0_14px_40px_rgba(239,68,68,0.14)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626]">
                <CircleAlert className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#991b1b]">
                  Có dấu hiệu khẩn cấp được phát hiện
                </p>
                <p className="mt-0.5 text-[12px] leading-5 text-[#7f1d1d]">
                  Hãy chọn hỗ trợ khẩn hoặc gọi cấp cứu ngay nếu triệu chứng
                  đang nặng lên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSmartBannerVisible(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#991b1b] transition hover:bg-white/70"
                aria-label="Đóng cảnh báo"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="fixed left-1/2 z-50 w-full max-w-97.5 -translate-x-1/2 px-6"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 6px) + 4.25rem)",
        }}
      >
        <button
          type="button"
          aria-label="Mở hỗ trợ khẩn"
          onClick={() => setIsOpen(true)}
          className={`emergency-fab-motion ml-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(220,38,38,0.18)] transition ${
            highlighted ? "animate-pulse bg-[#dc2626]" : "bg-[#fb923c]"
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-label="Đóng hỗ trợ khẩn"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={closeSheet}
          />

          <div className="relative max-h-[88vh] w-full max-w-97.5 overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="pr-9">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#dc2626]">
                Hỗ trợ khẩn cấp
              </p>
              <h2 className="mt-1 text-[20px] font-bold text-[#991b1b]">
                Hỗ trợ khẩn
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#7f1d1d]">
                Nếu có đau ngực dữ dội, khó thở, ngất hoặc chảy máu nhiều, hãy gọi cấp
                cứu ngay.
              </p>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={openDoctorEmergency}
                  disabled={loadingChoice !== null}
                  className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#d8e7ef] bg-[#f8fbfd] px-3 text-left text-sm font-semibold text-[#334155]"
                >
                  <Stethoscope className="h-5 w-5" />
                  {loadingChoice === "doctor" ? "Đang kết nối bác sĩ..." : "Kết nối bác sĩ"}
                </button>
                <button
                  type="button"
                  onClick={confirmCall}
                  className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#fee2e2] px-3 text-left text-sm font-semibold text-[#dc2626]"
                >
                  <PhoneCall className="h-5 w-5" />
                  Gọi cấp cứu 115
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Đóng"
              onClick={closeSheet}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fbfd] text-[#64748b]"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
