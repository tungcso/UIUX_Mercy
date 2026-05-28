"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  CornerDownLeft,
  DollarSign,
  Eye,
  FileText,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";

type Timeframe = "7d" | "month" | "quarter" | "year";
type MetricPeriod = "current" | "previous" | "twoPeriodsAgo";

type Transaction = {
  id: number;
  patient: string;
  amt: number;
  date: string;
  status: "paid" | "pending" | "refunded";
};

type SelectedTransaction = Transaction | null;

type KpiView = {
  id: string;
  label: string;
  value: number;
  delta: number;
  spark: number[];
  icon: ReactElement;
  bg: string;
  sparkStroke: string;
  unit: string;
  periodLabel: string;
};

type MetricState = {
  value: number;
  delta: number;
  bar: number;
};

type DashboardConfig = {
  headline: Record<MetricPeriod, MetricState>;
  pipeline: Array<{
    label: string;
    current: MetricState;
    previous: MetricState;
    twoPeriodsAgo: MetricState;
  }>;
  kpis: Array<{
    id: string;
    label: string;
    unit: string;
    icon: ReactElement;
    bg: string;
    sparkStroke: string;
    current: { value: number; delta: number; spark: number[] };
    previous: { value: number; delta: number; spark: number[] };
    twoPeriodsAgo: { value: number; delta: number; spark: number[] };
  }>;
  topServices: Record<MetricPeriod, Array<{ label: string; pct: number }>>;
  doctors: Record<MetricPeriod, Array<{ name: string; value: number }>>;
};

const initialTransactions: Transaction[] = [
  {
    id: 1,
    patient: "Trần Quốc Bảo",
    amt: 450,
    date: "2026-05-20",
    status: "paid",
  },
  {
    id: 2,
    patient: "Lê Thị Mai",
    amt: 120,
    date: "2026-05-21",
    status: "pending",
  },
  {
    id: 3,
    patient: "Phạm Hoàng Nam",
    amt: 0,
    date: "2026-05-22",
    status: "refunded",
  },
];

const riskRows = [
  {
    label: "Cúm A / Siêu vi hô hấp",
    status: "Cao đột biến (+45%)",
    value: 92,
    color: "bg-rose-500",
  },
  {
    label: "Sốt xuất huyết",
    status: "Ổn định (+5%)",
    value: 38,
    color: "bg-amber-500",
  },
  {
    label: "Tiêu hóa mùa mưa",
    status: "Tăng nhẹ (+11%)",
    value: 48,
    color: "bg-blue-500",
  },
];

function buildPoints(values: number[]) {
  const maxValue = Math.max(...values);
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
      const y = 20 - (value / maxValue) * 18;
      return `${x},${y}`;
    })
    .join(" ");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(
    value,
  );
}

function scaleSeries(values: number[], factor: number) {
  return values.map((value) => Number((value * factor).toFixed(2)));
}

function generateDashboardConfig(
  pCurr: number,
  iCurr: number,
  pMarginCurr: number,
  pPrev: number,
  iPrev: number,
  pMarginPrev: number,
  pOlder: number,
  iOlder: number,
  pMarginOlder: number,
): DashboardConfig {
  const revCurr = pCurr * iCurr;
  const revPrev = pPrev * iPrev;
  const revOlder = pOlder * iOlder;

  const profCurr = revCurr * pMarginCurr;
  const profPrev = revPrev * pMarginPrev;
  const profOlder = revOlder * pMarginOlder;

  // Deltas
  const revDeltaCurr = ((revCurr - revPrev) / revPrev) * 100;
  const revDeltaPrev = ((revPrev - revOlder) / revOlder) * 100;

  const profDeltaCurr = ((profCurr - profPrev) / profPrev) * 100;
  const profDeltaPrev = ((profPrev - profOlder) / profOlder) * 100;

  const patDeltaCurr = ((pCurr - pPrev) / pPrev) * 100;
  const patDeltaPrev = ((pPrev - pOlder) / pOlder) * 100;

  const invDeltaCurr = ((iCurr - iPrev) / iPrev) * 100;
  const invDeltaPrev = ((iPrev - iOlder) / iOlder) * 100;

  const sparkScale = (endVal: number) => {
    return [
      endVal * 0.72,
      endVal * 0.78,
      endVal * 0.82,
      endVal * 0.88,
      endVal * 0.94,
      endVal * 0.91,
      endVal,
    ].map((v) => Number(v.toFixed(1)));
  };

  return {
    headline: {
      current: {
        value: Number(revCurr.toFixed(1)),
        delta: Number(revDeltaCurr.toFixed(1)),
        bar: 72,
      },
      previous: {
        value: Number(revPrev.toFixed(1)),
        delta: Number(revDeltaPrev.toFixed(1)),
        bar: 67,
      },
      twoPeriodsAgo: {
        value: Number(revOlder.toFixed(1)),
        delta: 9.5,
        bar: 61,
      },
    },
    pipeline: [
      {
        label: "Tỷ lệ chatbot chuyển đổi sang đặt lịch",
        current: { value: 72.4, delta: 4.3, bar: 72 },
        previous: { value: 68.1, delta: 3.8, bar: 68 },
        twoPeriodsAgo: { value: 64.3, delta: 3.2, bar: 64 },
      },
      {
        label: "Tối ưu hóa tỷ lệ booking trực tuyến",
        current: { value: 58.6, delta: 1.8, bar: 59 },
        previous: { value: 56.8, delta: 3.4, bar: 57 },
        twoPeriodsAgo: { value: 53.4, delta: 2.1, bar: 53 },
      },
    ],
    kpis: [
      {
        id: "revenue",
        label: "Tổng doanh thu",
        unit: "triệu",
        icon: <DollarSign className="h-5 w-5 text-emerald-700" />,
        bg: "bg-emerald-50",
        sparkStroke: "#10b981",
        current: {
          value: Number(revCurr.toFixed(1)),
          delta: Number(revDeltaCurr.toFixed(1)),
          spark: sparkScale(revCurr),
        },
        previous: {
          value: Number(revPrev.toFixed(1)),
          delta: Number(revDeltaPrev.toFixed(1)),
          spark: sparkScale(revPrev),
        },
        twoPeriodsAgo: {
          value: Number(revOlder.toFixed(1)),
          delta: 8.5,
          spark: sparkScale(revOlder),
        },
      },
      {
        id: "profit",
        label: "Lợi nhuận",
        unit: "triệu",
        icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
        bg: "bg-blue-50",
        sparkStroke: "#2563eb",
        current: {
          value: Number(profCurr.toFixed(1)),
          delta: Number(profDeltaCurr.toFixed(1)),
          spark: sparkScale(profCurr),
        },
        previous: {
          value: Number(profPrev.toFixed(1)),
          delta: Number(profDeltaPrev.toFixed(1)),
          spark: sparkScale(profPrev),
        },
        twoPeriodsAgo: {
          value: Number(profOlder.toFixed(1)),
          delta: 9.8,
          spark: sparkScale(profOlder),
        },
      },
      {
        id: "patients",
        label: "Số bệnh nhân",
        unit: "bn",
        icon: <Users className="h-5 w-5 text-sky-600" />,
        bg: "bg-sky-50",
        sparkStroke: "#0284c7",
        current: {
          value: pCurr,
          delta: Number(patDeltaCurr.toFixed(1)),
          spark: sparkScale(pCurr),
        },
        previous: {
          value: pPrev,
          delta: Number(patDeltaPrev.toFixed(1)),
          spark: sparkScale(pPrev),
        },
        twoPeriodsAgo: { value: pOlder, delta: 6.2, spark: sparkScale(pOlder) },
      },
      {
        id: "avgInvoice",
        label: "TB Hóa đơn",
        unit: "triệu",
        icon: <FileText className="h-5 w-5 text-violet-600" />,
        bg: "bg-violet-50",
        sparkStroke: "#7c3aed",
        current: {
          value: Number(iCurr.toFixed(2)),
          delta: Number(invDeltaCurr.toFixed(1)),
          spark: sparkScale(iCurr),
        },
        previous: {
          value: Number(iPrev.toFixed(2)),
          delta: Number(invDeltaPrev.toFixed(1)),
          spark: sparkScale(iPrev),
        },
        twoPeriodsAgo: {
          value: Number(iOlder.toFixed(2)),
          delta: 3.4,
          spark: sparkScale(iOlder),
        },
      },
    ],
    topServices: {
      current: [
        { label: "Răng sứ", pct: 42 },
        { label: "Niềng răng", pct: 35 },
        { label: "Nhổ răng khôn", pct: 23 },
      ],
      previous: [
        { label: "Răng sứ", pct: 40 },
        { label: "Niềng răng", pct: 34 },
        { label: "Nhổ răng khôn", pct: 26 },
      ],
      twoPeriodsAgo: [
        { label: "Răng sứ", pct: 38 },
        { label: "Niềng răng", pct: 33 },
        { label: "Nhổ răng khôn", pct: 29 },
      ],
    },
    doctors: {
      current: [
        {
          name: "TS.BS. Hoàng Anh",
          value: Number((revCurr * 0.45).toFixed(1)),
        },
        {
          name: "ThS.BS. Lan Phương",
          value: Number((revCurr * 0.35).toFixed(1)),
        },
        { name: "BS. Minh Tú", value: Number((revCurr * 0.2).toFixed(1)) },
      ],
      previous: [
        {
          name: "TS.BS. Hoàng Anh",
          value: Number((revPrev * 0.44).toFixed(1)),
        },
        {
          name: "ThS.BS. Lan Phương",
          value: Number((revPrev * 0.36).toFixed(1)),
        },
        { name: "BS. Minh Tú", value: Number((revPrev * 0.2).toFixed(1)) },
      ],
      twoPeriodsAgo: [
        {
          name: "TS.BS. Hoàng Anh",
          value: Number((revOlder * 0.42).toFixed(1)),
        },
        {
          name: "ThS.BS. Lan Phương",
          value: Number((revOlder * 0.36).toFixed(1)),
        },
        { name: "BS. Minh Tú", value: Number((revOlder * 0.22).toFixed(1)) },
      ],
    },
  };
}

const dashboardByTimeframe: Record<Timeframe, DashboardConfig> = {
  "7d": generateDashboardConfig(
    180,
    1.38,
    0.22, // Current
    166,
    1.31,
    0.212, // Previous
    155,
    1.26,
    0.204, // Two Periods Ago
  ),
  month: generateDashboardConfig(
    842,
    1.48,
    0.2568, // Current
    778,
    1.405,
    0.2489, // Previous
    728,
    1.35,
    0.241, // Two Periods Ago
  ),
  quarter: generateDashboardConfig(
    2580,
    1.52,
    0.2615, // Current
    2382,
    1.442,
    0.2532, // Previous
    2200,
    1.385,
    0.245, // Two Periods Ago
  ),
  year: generateDashboardConfig(
    10520,
    1.58,
    0.2683, // Current
    9712,
    1.498,
    0.2596, // Previous
    8968,
    1.44,
    0.251, // Two Periods Ago
  ),
};

export default function CrmEconomyDashboard() {
  const [selected, setSelected] = useState<SelectedTransaction>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [metricPeriod, setMetricPeriod] = useState<MetricPeriod>("current");
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const active = dashboardByTimeframe[timeframe];
  const currentHeadline = active.headline[metricPeriod];
  const currentPipeline = active.pipeline.map((item) => ({
    label: item.label,
    ...item[metricPeriod],
  }));
  const topServices = active.topServices[metricPeriod];
  const doctorContribution = active.doctors[metricPeriod];

  const currentKpiSet: KpiView[] = active.kpis.map((kpi) => {
    const state = kpi[metricPeriod];

    return {
      id: kpi.id,
      label: kpi.label,
      value: state.value,
      delta: state.delta,
      spark: state.spark,
      icon: kpi.icon,
      bg: kpi.bg,
      sparkStroke: kpi.sparkStroke,
      unit: kpi.unit,
      periodLabel:
        metricPeriod === "current"
          ? "Kỳ hiện tại"
          : metricPeriod === "previous"
            ? "Kỳ trước"
            : "2 kỳ trước",
    };
  });

  const exportCsv = () => {
    const rows = [
      ["id", "patient", "amt", "date", "status"],
      ...transactions.map((t) => [t.id, t.patient, t.amt, t.date, t.status]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openPrintView = (transaction: Transaction) => {
    const printWindow = window.open("", "_blank", "width=720,height=720");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Biên lai ${transaction.patient}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; }
            .row { display: flex; justify-content: space-between; gap: 16px; margin-top: 10px; }
            .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
            .value { font-size: 14px; font-weight: 600; }
            .title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">Biên lai thanh toán</div>
            <div class="row"><div><div class="label">Bệnh nhân</div><div class="value">${transaction.patient}</div></div><div><div class="label">Ngày</div><div class="value">${transaction.date}</div></div></div>
            <div class="row"><div><div class="label">Số tiền</div><div class="value">${transaction.amt} triệu</div></div><div><div class="label">Trạng thái</div><div class="value">${transaction.status}</div></div></div>
          </div>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRefund = (transaction: Transaction) => {
    if (transaction.status === "refunded") {
      window.alert("Giao dịch này đã hoàn tiền rồi.");
      return;
    }

    const confirmed = window.confirm(`Hoàn tiền cho ${transaction.patient}?`);
    if (!confirmed) {
      return;
    }

    setTransactions((current) =>
      current.map((item) =>
        item.id === transaction.id ? { ...item, status: "refunded" } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section matching other tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.02)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            CRM & Kinh tế phòng khám
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Hôm nay: Thứ Bảy, 23 tháng 5, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100/50">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống hoạt động ổn định
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentKpiSet.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg}`}
                >
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-xs text-slate-400">{kpi.label}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {formatMoney(kpi.value)}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      {kpi.unit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${kpi.delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  {kpi.delta >= 0 ? "▲" : "▼"} {Math.abs(kpi.delta).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-400">
              {kpi.periodLabel}
            </div>
            <div className="mt-3">
              <svg
                className="h-6 w-full"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id={`spark-${kpi.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={kpi.sparkStroke}
                      stopOpacity="0.35"
                    />
                    <stop
                      offset="100%"
                      stopColor={kpi.sparkStroke}
                      stopOpacity="0.95"
                    />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke={`url(#spark-${kpi.id})`}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={buildPoints(kpi.spark)}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Hiệu năng kênh vào
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-800">
            Tỷ lệ Chatbot chuyển đổi sang đặt lịch khám
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2">
            <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Kỳ xem
            </span>
            <button
              type="button"
              onClick={() => setMetricPeriod("current")}
              className={`rounded-full px-3 py-1 text-xs ${metricPeriod === "current" ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}
            >
              Hiện tại
            </button>
            <button
              type="button"
              onClick={() => setMetricPeriod("previous")}
              className={`rounded-full px-3 py-1 text-xs ${metricPeriod === "previous" ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}
            >
              Kỳ trước
            </button>
            <button
              type="button"
              onClick={() => setMetricPeriod("twoPeriodsAgo")}
              className={`rounded-full px-3 py-1 text-xs ${metricPeriod === "twoPeriodsAgo" ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}
            >
              2 kỳ trước
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTimeframe("7d")}
              className={`rounded-full px-3 py-1 text-xs ${timeframe === "7d" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("month")}
              className={`rounded-full px-3 py-1 text-xs ${timeframe === "month" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
            >
              Tháng này
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("quarter")}
              className={`rounded-full px-3 py-1 text-xs ${timeframe === "quarter" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
            >
              Quý này
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("year")}
              className={`rounded-full px-3 py-1 text-xs ${timeframe === "year" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
            >
              Năm nay
            </button>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <div className="text-5xl font-bold tracking-[-0.04em] text-blue-600">
              {formatMoney(currentHeadline.value)}%
            </div>
            <div className="pb-1 text-xs font-semibold text-emerald-600">
              {currentHeadline.delta >= 0
                ? `▲ Tăng ${currentHeadline.delta.toFixed(1)}% so với kỳ trước`
                : "Kỳ tham chiếu cũ hơn"}
            </div>
          </div>

          <div className="mt-8 rounded-full bg-slate-100 p-1">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: `${currentHeadline.bar}%` }}
            />
          </div>

          <div className="mt-6 space-y-3">
            {currentPipeline.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">
                      {formatMoney(item.value)}%
                    </div>
                  </div>
                  <div className="text-right text-xs font-semibold text-emerald-600">
                    {item.delta >= 0
                      ? `+${item.delta.toFixed(1)}%`
                      : `${item.delta.toFixed(1)}%`}
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${item.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Y tế dự phòng
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-800">
            Thống kê xu hướng bệnh lý đang tăng cao trong cộng đồng
          </h3>
          <div className="mt-6 space-y-5">
            {riskRows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-700">
                  <span>{row.label}</span>
                  <span
                    className={`font-semibold ${row.color.replace("bg-", "text-")}`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${row.color}`}
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
            Danh sách bệnh nhân đồng bộ từ cổng đăng ký
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> API
              Realtime Connected
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
            >
              Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="mt-5 w-full overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="py-2">Bệnh nhân</th>
                <th className="py-2">Số tiền</th>
                <th className="py-2">Ngày</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(transaction)}
                      className="font-medium text-slate-800 hover:underline"
                    >
                      {transaction.patient}
                    </button>
                  </td>
                  <td className="py-3 font-semibold text-slate-700">
                    {formatMoney(transaction.amt)} triệu
                  </td>
                  <td className="py-3 text-xs text-slate-400">
                    {transaction.date}
                  </td>
                  <td className="py-3">
                    {transaction.status === "paid" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Đã thanh toán
                      </span>
                    ) : transaction.status === "pending" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Chờ xử lý
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                        Đã hoàn tiền
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => setSelected(transaction)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Xem</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openPrintView(transaction)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Printer className="h-4 w-4" />
                        <span className="hidden sm:inline">In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefund(transaction)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        <CornerDownLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Hoàn tiền</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.65rem] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
              Doanh thu cơ cấu
            </span>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">
              Top dịch vụ đóng góp doanh số chính
            </h3>
          </div>
          <div className="mt-6 space-y-4">
            {topServices.map((service) => (
              <div key={service.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{service.label}</span>
                  <span>{service.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${service.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.65rem] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
              Năng suất nhân sự
            </span>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">
              Hiệu suất doanh thu đóng góp của Bác Sĩ
            </h3>
          </div>
          <div className="mt-5 space-y-3.5">
            {doctorContribution.map((doctor, index) => (
              <div
                key={doctor.name}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-50 bg-[#fafcff]/40 transition hover:bg-[#fafcff]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 font-bold text-xs text-blue-600 border border-blue-100">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {doctor.name}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                      Trưởng bộ phận chuyên môn
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">
                    {formatMoney(doctor.value)} triệu
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                    Đạt chỉ tiêu
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-2xl animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              aria-label="Đóng chi tiết bệnh nhân"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              ×
            </button>
            <h3 className="text-sm font-semibold text-slate-700">
              Thông tin đồng bộ bệnh nhân
            </h3>
            <div className="mt-2 text-lg font-bold text-slate-900">
              {selected.patient}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-100 p-3">
                <div className="text-xs text-slate-400">Mã BHXH</div>
                <div className="mt-1 font-medium text-slate-800">
                  #VN-49204-2026
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <div className="text-xs text-slate-400">Lần đồng bộ cuối</div>
                <div className="mt-1 font-medium text-slate-800">
                  20/05/2026 15:12
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-slate-100 p-3">
                <div className="text-xs text-slate-400">Nguồn</div>
                <div className="mt-1 text-sm text-slate-700">
                  Cổng đăng ký trực tuyến
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-slate-100 p-3">
                <div className="text-xs text-slate-400">Ghi chú</div>
                <div className="mt-1 text-sm text-slate-700">
                  Thực nối kết BHXH, đã gắn kênh chăm sóc VIP.
                </div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
