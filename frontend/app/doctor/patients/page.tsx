"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Brain,
  ClipboardList,
  Flag,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import {
  AppSidebar,
  type NavigationSection,
} from "../_components/doctor-shell";
import {
  consultPatients,
  consultUnreadCount,
} from "../consult/consult-patients";
import {
  DoctorOfflineNotice,
  useDoctorAvailability,
} from "../_components/doctor-availability-context";

export default function PatientDetailPage() {
  const router = useRouter();
  const { isAcceptingPatients, toggleAcceptingPatients } =
    useDoctorAvailability();
  const [isDiagnosisPopupOpen, setIsDiagnosisPopupOpen] = useState(false);
  const [isAiErrorPopupOpen, setIsAiErrorPopupOpen] = useState(false);

  const handleNavigate = (section: NavigationSection) => {
    if (section === "overview") {
      router.push("/doctor");
      return;
    }

    if (section === "patients") {
      router.push("/doctor/patients");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AppSidebar
          activeSection="patients"
          isAcceptingPatients={isAcceptingPatients}
          onToggleAccepting={toggleAcceptingPatients}
          onNavigate={handleNavigate}
          consultUnread={consultUnreadCount}
        />

        <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          <div className="relative mx-auto max-w-[1420px]">
            <DoctorOfflineNotice />
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
                  Chi tiết ca bệnh &amp; Chẩn đoán tự động
                </h1>

                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-medium text-slate-500 shadow-sm">
                  Hôm nay: Thứ Năm, 21 tháng 5, 2026
                </span>
              </div>

              <div className="flex justify-start lg:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-red-500 shadow-[0_8px_20px_rgba(239,68,68,0.08)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Có chỉ số đo từ xa khẩn cấp!
                </span>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_500px]">
              <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Hồ sơ y tế hiện hành
                    </p>
                    <h2 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[26px]">
                      Bệnh nhân: Lê Thị Mai
                    </h2>
                    <p className="mt-2 text-[14px] text-slate-500">
                      Nữ • 62 Tuổi • Hồ sơ do thông số tự động #BN-9081
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/doctor/consult")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[14px] font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-[18px] w-[18px]" />
                    Chat trực tiếp với bệnh nhân
                  </button>
                </div>

                <div className="my-5 h-px w-full bg-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Ghi nhận triệu chứng &amp; chẩn đoán
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDiagnosisPopupOpen(true)}
                    className="inline-flex items-center gap-2 text-[14px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    Đề xuất chẩn đoán sâu bằng Gemini AI
                  </button>
                </div>

                <textarea
                  defaultValue=""
                  placeholder="Gõ triệu chứng lâm sàng hoặc từ khóa (VD: tăng huyết áp, đau đầu vùng chẩm)..."
                  className="mt-3 min-h-28 w-full resize-none rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] leading-6 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </section>

              <aside className="rounded-[1.65rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-500 shadow-sm">
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">
                      Bảng trợ lý AI co-pilot
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    PRO V1.5
                  </span>
                </div>

                <div className="my-4 h-px w-full bg-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <p className="text-[14px] font-semibold text-slate-700">
                    Tóm tắt bệnh sử từ Gemini AI
                  </p>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-3-6.7" />
                        <path d="M21 3v6h-6" />
                      </svg>
                    </span>
                    Tạo bảng AI
                  </button>
                </div>

                <div className="mt-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] leading-7 text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                  <p className="text-[14px] font-semibold text-slate-900">
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
                  className="mt-4 flex w-full items-center gap-4 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] px-4 py-3.5 text-left shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:bg-[#fff4e6]"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ff8a1f] text-white shadow-[0_14px_28px_rgba(249,115,22,0.28)]">
                    <Flag className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="text-[16px] font-bold leading-6 text-[#f97316]">
                      Báo cáo lỗi
                      <br />
                      kịch bản AI
                    </div>
                  </div>
                </button>

                {isAiErrorPopupOpen ? (
                  <div className="mt-3 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <p className="text-[13px] font-semibold text-slate-700">
                      Ghi chú lỗi y khoa/Ban chỉ đạo AI
                    </p>

                    <textarea
                      placeholder="Vui lòng nêu chi tiết lỗi chẩn đoán hoặc dữ liệu đề xuất không đúng thực tế..."
                      className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-orange-200 bg-white px-4 py-2.5 text-[13px] leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
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
                <button
                  type="button"
                  aria-label="Đóng popup đề xuất chẩn đoán"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                  onClick={() => setIsDiagnosisPopupOpen(false)}
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
