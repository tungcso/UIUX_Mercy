"use client";

import { useState } from "react";
import {
  Activity,
  Bot,
  Clock,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type TimeRange = "day" | "week" | "month";

const symptomData = {
  day: [
    { name: "Sốt cao", count: 87, pct: 92 },
    { name: "Đau đầu", count: 74, pct: 78 },
    { name: "Ho khan", count: 63, pct: 67 },
    { name: "Khó thở", count: 51, pct: 54 },
    { name: "Đau bụng", count: 44, pct: 46 },
    { name: "Mệt mỏi", count: 38, pct: 40 },
  ],
  week: [
    { name: "Sốt cao", count: 524, pct: 92 },
    { name: "Ho khan", count: 467, pct: 82 },
    { name: "Đau đầu", count: 390, pct: 68 },
    { name: "Mệt mỏi", count: 312, pct: 55 },
    { name: "Khó thở", count: 278, pct: 49 },
    { name: "Đau bụng", count: 195, pct: 34 },
  ],
  month: [
    { name: "Sốt cao", count: 2104, pct: 88 },
    { name: "Ho khan", count: 1876, pct: 79 },
    { name: "Đau đầu", count: 1543, pct: 65 },
    { name: "Mệt mỏi", count: 1290, pct: 54 },
    { name: "Đau ngực", count: 987, pct: 41 },
    { name: "Khó thở", count: 834, pct: 35 },
  ],
};

const kpiData = {
  day: {
    totalConsults: "1,248",
    successRate: "94.2%",
    avgTime: "3m 24s",
    flagged: 18,
  },
  week: {
    totalConsults: "8,712",
    successRate: "92.8%",
    avgTime: "3m 51s",
    flagged: 104,
  },
  month: {
    totalConsults: "34,561",
    successRate: "93.5%",
    avgTime: "3m 38s",
    flagged: 412,
  },
};

const barColors = [
  "bg-emerald-600",
  "bg-emerald-500",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-blue-300",
];

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<TimeRange>("week");
  const symptoms = symptomData[range];
  const kpi = kpiData[range];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
            Dashboard Phân tích
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan hiệu suất hệ thống AI & xu hướng sức khỏe cộng đồng
          </p>
        </div>

        {/* Time filter */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["day", "week", "month"] as TimeRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                range === r
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r === "day" ? "Hôm nay" : r === "week" ? "Tuần này" : "Tháng này"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: Bot,
            label: "Tổng lượt tư vấn",
            value: kpi.totalConsults,
            sub: "Chatbot AI xử lý",
            color: "bg-emerald-50 text-emerald-600",
            trend: "+8.3%",
            trendColor: "text-emerald-600",
          },
          {
            icon: CheckCircle2,
            label: "Tỷ lệ thành công",
            value: kpi.successRate,
            sub: "Chatbot trả lời đúng",
            color: "bg-emerald-50 text-emerald-600",
            trend: "+1.2%",
            trendColor: "text-emerald-600",
          },
          {
            icon: Clock,
            label: "Thời gian xử lý TB",
            value: kpi.avgTime,
            sub: "Trung bình mỗi ca",
            color: "bg-blue-50 text-blue-600",
            trend: "-0.4s",
            trendColor: "text-emerald-600",
          },
          {
            icon: AlertTriangle,
            label: "Phản hồi bị gắn cờ",
            value: kpi.flagged.toString(),
            sub: "Cần xem xét lại",
            color: "bg-rose-50 text-rose-500",
            trend: "-5.1%",
            trendColor: "text-emerald-600",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-[26px] font-bold leading-none text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">{card.sub}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className={`mt-3 text-[11px] font-bold ${card.trendColor}`}>
                ▲ {card.trend}{" "}
                <span className="font-normal text-slate-400">
                  so với kỳ trước
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Bar chart - Symptom ranking */}
        <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Xếp hạng triệu chứng
              </p>
              <h2 className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-slate-900">
                Triệu chứng được báo cáo nhiều nhất
              </h2>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-4">
            {symptoms.map((s, i) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {s.count.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      lượt
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColors[i]}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie / donut visualization */}
        <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Phân bổ loại ca
            </p>
            <h2 className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-slate-900">
              Tỷ lệ xử lý theo phân loại
            </h2>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
                {/* Background circle */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                {/* Segment 1 - Tự động giải quyết 60% */}
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="#10b981" strokeWidth="14"
                  strokeDasharray={`${0.60 * 301.6} ${301.6}`}
                  strokeDashoffset="0"
                />
                {/* Segment 2 - Chuyển bác sĩ 25% */}
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="#06b6d4" strokeWidth="14"
                  strokeDasharray={`${0.25 * 301.6} ${301.6}`}
                  strokeDashoffset={`${-(0.60 * 301.6)}`}
                />
                {/* Segment 3 - Gắn cờ lỗi 15% */}
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="#f43f5e" strokeWidth="14"
                  strokeDasharray={`${0.15 * 301.6} ${301.6}`}
                  strokeDashoffset={`${-(0.85 * 301.6)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">60%</span>
                <span className="text-[10px] font-semibold text-slate-400">Tự động</span>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {[
              { label: "Tự động giải quyết", pct: "60%", color: "bg-emerald-500" },
              { label: "Chuyển tiếp bác sĩ", pct: "25%", color: "bg-cyan-400" },
              { label: "Gắn cờ / Cần xem lại", pct: "15%", color: "bg-rose-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{item.pct}</span>
              </div>
            ))}
          </div>

          {/* Trend summary */}
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Xu hướng tích cực
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-emerald-600">
              Tỷ lệ tự động giải quyết tăng{" "}
              <strong>+3.2%</strong> so với kỳ trước nhờ cập nhật kịch bản.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Heatmap hint */}
      <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Lưu lượng theo giờ
            </p>
            <h2 className="mt-1 text-[17px] font-bold tracking-[-0.02em] text-slate-900">
              Số lượt tư vấn theo khung giờ trong ngày
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">Cập nhật theo thời gian thực</span>
          </div>
        </div>

        <div className="flex items-end gap-1.5">
          {[22, 14, 8, 5, 4, 6, 18, 45, 72, 88, 94, 87, 78, 82, 90, 85, 76, 68, 55, 42, 38, 31, 27, 20].map(
            (v, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    v >= 80
                      ? "bg-emerald-600"
                      : v >= 60
                      ? "bg-emerald-500"
                      : v >= 40
                      ? "bg-emerald-300"
                      : "bg-emerald-100"
                  }`}
                  style={{ height: `${(v / 100) * 80}px` }}
                />
                {i % 4 === 0 && (
                  <span className="mt-1 text-[9px] text-slate-400">
                    {String(i).padStart(2, "0")}h
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
