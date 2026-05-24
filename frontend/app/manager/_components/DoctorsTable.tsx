"use client";

import { useState } from "react";

type Doctor = {
  name: string;
  spec: string;
  cases: number;
  rating: number;
  status: string;
};

export default function DoctorsTable() {
  const doctors: Doctor[] = [
    {
      name: "Thầy thuốc ưu tú Nguyễn Văn A",
      spec: "Tim Mạch",
      cases: 142,
      rating: 4.9,
      status: "Đang Khám",
    },
    {
      name: "BS. Trần Thị B",
      spec: "Nội Tổng Quát",
      cases: 98,
      rating: 4.7,
      status: "Đang Khám",
    },
    {
      name: "ThS. BS. Lê Hoàng C",
      spec: "Nhi Khoa",
      cases: 215,
      rating: 4.8,
      status: "Nghỉ Cả",
    },
  ];

  const [selected, setSelected] = useState<Doctor | null>(null);

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
          Đội ngũ y bác sĩ
        </span>
        <h3 className="text-sm font-bold text-slate-800 mt-0.5">
          Đo lường số ca hoàn thành & Lượt đánh giá bác sĩ trực ban
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="px-6 py-3">Họ và tên bác sĩ</th>
              <th className="px-6 py-3">Chuyên khoa</th>
              <th className="px-6 py-3">Số ca hoàn thành</th>
              <th className="px-6 py-3">Đánh giá sao</th>
              <th className="px-6 py-3">Trạng thái trực tế</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((d, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-6 py-4">
                  <button
                    className="text-emerald-600 hover:underline"
                    onClick={() => setSelected(d)}
                  >
                    {d.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-slate-500">{d.spec}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {d.cases} ca
                </td>
                <td className="px-6 py-4 text-amber-500">★ {d.rating}/5.0</td>
                <td className="px-6 py-4">
                  {(() => {
                    const base =
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";
                    let cls =
                      base +
                      " border-emerald-200 bg-emerald-50 text-emerald-700";
                    let label = d.status;
                    if (d.status === "Nghỉ Cả") {
                      cls = base + " border-slate-200 bg-white text-slate-700";
                      label = "nghỉ ca";
                    }
                    return <span className={cls}>{label}</span>;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />

          <div className="relative w-full max-w-md animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              aria-label="Đóng thông tin bác sĩ"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              ×
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Lịch sử ca hoàn thành
                </h3>
                <div className="mt-1 text-xs text-slate-400">
                  {selected.name}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3 max-h-[380px] overflow-auto">
              {[
                {
                  patient: "Nguyễn Thị H",
                  note: "Can thiệp đặt stent thành công.",
                  date: "19/05/2026",
                },
                {
                  patient: "Phan Văn K",
                  note: "Suy tim độ II. Tăng liều thuốc ức chế men chuyển.",
                  date: "17/05/2026",
                },
                {
                  patient: "Lê Thị M",
                  note: "Rung nhĩ. Ổn định nhịp tim sau thuốc chống đông.",
                  date: "15/05/2026",
                },
                {
                  patient: "Trần Văn D",
                  note: "Tăng huyết áp kháng trị. Tái cấu trúc thuốc và theo dõi chăm sóc.",
                  date: "13/05/2026",
                },
                {
                  patient: "Hà Thị L",
                  note: "Đau thắt ngực ổn định. Tư vấn lối sống và điều chỉnh thuốc nitrate.",
                  date: "11/05/2026",
                },
              ].map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 11h10M7 15h6M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 3v4M8 3v4"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-slate-800">
                        {c.patient}
                      </div>
                      <div className="text-xs text-slate-400 ml-3">
                        {c.date}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{c.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
