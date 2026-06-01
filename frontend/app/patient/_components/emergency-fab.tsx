"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BellRing,
  Bot,
  ChevronRight,
  CircleAlert,
  Clock3,
  HeartPulse,
  Mic,
  PhoneCall,
  Stethoscope,
  X,
} from "lucide-react";

type EmergencyChoice = "ai" | "doctor" | "call";

type DoctorOnline = {
  id: string;
  name: string;
  specialty: string;
  eta: string;
  avatar: string;
};

const quickRedFlags = [
  "Khó thở",
  "Đau ngực",
  "Chảy máu",
  "Sốt cao",
  "Bất tỉnh",
  "Khác",
];

const onlineDoctors: DoctorOnline[] = [
  {
    id: "em-doctor-1",
    name: "ThS. BS. Trần Tâm",
    specialty: "Tim mạch",
    eta: "Phản hồi trong 1 phút",
    avatar: "👨🏿",
  },
  {
    id: "em-doctor-2",
    name: "BS. Lan",
    specialty: "Nội tổng quát",
    eta: "Phản hồi trong 3 phút",
    avatar: "👩🏾",
  },
  {
    id: "em-doctor-3",
    name: "BS. Hùng",
    specialty: "Tai Mũi Họng",
    eta: "Phản hồi trong 4 phút",
    avatar: "👩🏻‍🦰",
  },
];

function EmergencyIcon({ className }: { className?: string }) {
  return <AlertTriangle className={className} />;
}

export default function EmergencyFab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isSmartBannerVisible, setIsSmartBannerVisible] = useState(false);
  const [loadingChoice, setLoadingChoice] = useState<EmergencyChoice | null>(
    null,
  );
  const [showCallWarning, setShowCallWarning] = useState(false);

  const emergencyMode = searchParams.get("emergency") === "1";
  const riskMode = searchParams.get("risk") === "1";
  const highlighted = emergencyMode || riskMode;

  useEffect(() => {
    if (emergencyMode || riskMode) {
      setIsSmartBannerVisible(true);
    }
  }, [emergencyMode, riskMode, pathname]);

  const openAiEmergency = () => {
    setLoadingChoice("ai");
    setTimeout(() => {
      router.push("/patient/consult/emergency-new?mode=ai&emergency=1");
    }, 280);
  };

  const openDoctorEmergency = () => {
    setLoadingChoice("doctor");
    setTimeout(() => {
      router.push("/patient/consult/emergency-new?mode=doctor&emergency=1");
    }, 280);
  };

  const openCallWarning = () => {
    setLoadingChoice("call");
    setShowCallWarning(true);
    setIsOpen(false);
  };

  const confirmCall = () => {
    setIsCalling(true);
    window.location.href = "tel:115";
  };

  const closeSheet = () => {
    setIsOpen(false);
    setLoadingChoice(null);
  };

  const doctorList = useMemo(() => onlineDoctors, []);

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
          <EmergencyIcon className="h-6 w-6" />
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3 sm:items-center sm:pb-0">
          <button
            type="button"
            aria-label="Đóng hỗ trợ khẩn"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={closeSheet}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="bg-linear-to-br from-[#ffedd5] via-[#fff7ed] to-white px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fb923c] text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)]">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#9a3412]">
                      Bạn cần hỗ trợ khẩn?
                    </p>
                    <p className="mt-0.5 text-[12px] leading-5 text-[#7c2d12]">
                      Nếu bạn đang gặp tình trạng sức khỏe nghiêm trọng, hãy
                      chọn hình thức hỗ trợ phù hợp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#9a3412] shadow-sm transition hover:bg-[#fff7ed]"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 px-5 py-4">
              <button
                type="button"
                onClick={openAiEmergency}
                disabled={loadingChoice !== null}
                className="flex w-full items-center justify-between rounded-2xl border border-[#d7eadf] bg-[#f0fbf4] px-4 py-3 text-left transition hover:border-[#86efac] hover:bg-[#eafaf1] disabled:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#16a34a] shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#14532d]">
                      Tư vấn AI ngay
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#4b5563]">
                      Hỏi nhanh, sàng lọc nhanh, không lan man
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#16a34a]" />
              </button>

              <button
                type="button"
                onClick={openDoctorEmergency}
                disabled={loadingChoice !== null}
                className="flex w-full items-center justify-between rounded-2xl border border-[#d7eadf] bg-white px-4 py-3 text-left transition hover:border-[#86efac] hover:bg-[#f8fbff] disabled:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a] shadow-sm">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#14532d]">
                      Kết nối bác sĩ trực tuyến
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#4b5563]">
                      Kết nối với bác sĩ đang trực để hỗ trợ chuyên sâu
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#16a34a]" />
              </button>

              <button
                type="button"
                onClick={openCallWarning}
                disabled={loadingChoice !== null}
                className="flex w-full items-center justify-between rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-left transition hover:border-[#fca5a5] hover:bg-[#ffe4e6] disabled:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#ef4444] shadow-sm">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#991b1b]">
                      Gọi cấp cứu
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#7f1d1d]">
                      Dành cho khó thở nghiêm trọng, đau ngực dữ dội, mất ý thức
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#ef4444]" />
              </button>

              <button
                type="button"
                onClick={closeSheet}
                className="flex w-full items-center justify-center rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] font-medium text-[#4b5563] transition hover:bg-[#f9fafb]"
              >
                Đóng
              </button>
            </div>

            {loadingChoice ? (
              <div className="border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-3 text-[12px] text-[#64748b]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#fb923c]" />
                  <span>Đang mở hỗ trợ khẩn...</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showCallWarning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
          <button
            type="button"
            aria-label="Đóng cảnh báo gọi cấp cứu"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowCallWarning(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.3)]">
            <div className="bg-[#fff1f2] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ef4444] text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#991b1b]">
                    Hãy gọi cấp cứu ngay nếu có:
                  </p>
                  <ul className="mt-2 space-y-1 text-[13px] leading-5 text-[#7f1d1d]">
                    <li>• Khó thở nghiêm trọng</li>
                    <li>• Đau ngực dữ dội</li>
                    <li>• Mất ý thức</li>
                    <li>• Chảy máu nhiều</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-[13px] leading-6 text-[#4b5563]">
                Ứng dụng chỉ hỗ trợ hướng dẫn ban đầu. Nếu tình trạng đang nguy
                hiểm, hãy gọi cấp cứu ngay và tìm hỗ trợ y tế gần nhất.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={confirmCall}
                  disabled={isCalling}
                  className="flex-1 rounded-2xl bg-[#ef4444] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(239,68,68,0.22)] transition hover:bg-[#dc2626] disabled:opacity-70"
                >
                  {isCalling ? "Đang gọi 115..." : "Gọi 115"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCallWarning(false)}
                  className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] font-medium text-[#374151] transition hover:bg-[#f9fafb]"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
