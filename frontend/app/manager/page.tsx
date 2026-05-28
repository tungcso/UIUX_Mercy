"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import StatChart from "./_components/StatChart";
import PieCard from "./_components/PieCard";
import DoctorsTable from "./_components/DoctorsTable";
import CrmEconomyDashboard from "./_components/CrmEconomyDashboard";
import HrEquipmentDashboard, {
  INITIAL_MACHINES,
  type Machine,
} from "./_components/HrEquipmentDashboard";
import ChatbotOperationsDashboard from "./_components/ChatbotOperationsDashboard";

type ManagerSection = "overview" | "crm" | "hr" | "chatbot";

export const dynamic = "force-dynamic";

export default function ManagerPage() {
  return (
    <Suspense fallback={null}>
      <ManagerPageContent />
    </Suspense>
  );
}

function ManagerPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);

  // Derived: is any machine currently in error state?
  const hasMriError = machines.some(
    (m) => m.code === "EQ-MRI-02" && m.status === "error",
  );

  const sectionParam = searchParams.get("section");
  const activeSection: ManagerSection =
    sectionParam === "crm" ||
    sectionParam === "hr" ||
    sectionParam === "chatbot" ||
    sectionParam === "overview"
      ? sectionParam
      : "overview";

  const handleSectionChange = (section: ManagerSection) => {
    const nextUrl =
      section === "overview" ? pathname : `${pathname}?section=${section}`;
    router.push(nextUrl, { scroll: false });
  };

  const specData = [
    {
      title: "Tim mạch",
      subtitle: "Chiếm tỉ lệ cao nhất do bệnh nhân tim mạch cấp cứu",
      count: 35,
    },
    {
      title: "Nhi khoa",
      subtitle: "Nhu cầu khám nhi tăng sau mùa dịch",
      count: 25,
    },
    {
      title: "Chấn thương",
      subtitle: "Khám chấn thương chuyên đang nhanh",
      count: 18,
    },
    {
      title: "Nội tổng quát",
      subtitle: "Tăng do số lượng khám định kỳ",
      count: 22,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          hasMriError={hasMriError}
        />

        <main className="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            {activeSection === "overview" ? (
              <>
                <Header />

                {/* Highly logical KPI Grid at the top */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  {/* KPI 1 */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          Tổng Lượt Khám Hôm Nay
                        </div>
                        <div className="mt-1.5 text-2xl font-bold text-slate-900">
                          142 lượt
                        </div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold text-emerald-600">
                      ▲ +12.4%{" "}
                      <span className="text-slate-400 font-normal">
                        so với hôm qua
                      </span>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          Hệ Số Tải Phòng Khám
                        </div>
                        <div className="mt-1.5 text-2xl font-bold text-slate-900">
                          72%
                        </div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold text-slate-400">
                      Mức tải tối ưu{" "}
                      <span className="text-slate-400 font-normal">
                        • Trạng thái ổn định
                      </span>
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          Bác Sĩ Đang Trực
                        </div>
                        <div className="mt-1.5 text-2xl font-bold text-slate-900">
                          18 / 24 BS
                        </div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold text-violet-600">
                      Đạt 100%{" "}
                      <span className="text-slate-400 font-normal">
                        lịch phân bổ ca trực
                      </span>
                    </div>
                  </div>

                  {/* KPI 4 */}
                  <div
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-rose-200"
                    onClick={() => handleSectionChange("hr")}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          Thiết Bị Khả Dụng
                        </div>
                        <div className="mt-1.5 text-2xl font-bold text-slate-900">
                          3 / 4 máy
                        </div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 animate-pulse">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <span>🔴 1 máy MRI lỗi</span>
                      <span className="text-slate-400 font-normal hover:underline">
                        • Nhấp để điều phối
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                    <StatChart />
                  </section>

                  <aside className="rounded-[1.65rem] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                    <PieCard onOpen={() => setIsSpecModalOpen(true)} />
                  </aside>
                </div>

                {isSpecModalOpen ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                    />

                    <div className="relative w-full max-w-md animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                      <button
                        type="button"
                        aria-label="Đóng popup số lượng chuyên khoa"
                        onClick={() => setIsSpecModalOpen(false)}
                        className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        ×
                      </button>

                      <h3 className="text-lg font-semibold">
                        Số lượng cuộc hẹn
                      </h3>
                      <p className="text-sm text-slate-400">
                        Theo từng chuyên khoa
                      </p>

                      <div className="mt-4 space-y-3">
                        {specData.map((s) => (
                          <div
                            key={s.title}
                            className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                          >
                            <div>
                              <div className="font-medium">{s.title}</div>
                              <div className="text-xs text-slate-400">
                                {s.subtitle}
                              </div>
                            </div>
                            <div className="font-semibold text-slate-700">
                              {s.count} lượt
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 text-right">
                        <button
                          onClick={() => setIsSpecModalOpen(false)}
                          className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm"
                        >
                          ĐÓNG
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <section className="mt-6 rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                  <DoctorsTable />
                </section>
              </>
            ) : null}

            {activeSection === "crm" ? <CrmEconomyDashboard /> : null}

            {activeSection === "hr" ? (
              <HrEquipmentDashboard
                machines={machines}
                setMachines={setMachines}
              />
            ) : null}

            {activeSection === "chatbot" ? (
              <ChatbotOperationsDashboard />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
