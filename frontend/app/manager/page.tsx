"use client";

import { useState } from "react";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import StatChart from "./_components/StatChart";
import PieCard from "./_components/PieCard";
import DoctorsTable from "./_components/DoctorsTable";

export default function ManagerPage() {
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
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
        <Sidebar />

        <main className="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Header />

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
                <button
                  type="button"
                  aria-label="Đóng popup số lượng chuyên khoa"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                  onClick={() => setIsSpecModalOpen(false)}
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

                  <h3 className="text-lg font-semibold">Số lượng cuộc hẹn</h3>
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
          </div>
        </main>
      </div>
    </div>
  );
}
