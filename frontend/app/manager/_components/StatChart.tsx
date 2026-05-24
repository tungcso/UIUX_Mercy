"use client";

import React, { useEffect, useState } from "react";

type Bar = {
  p: number;
  h: number;
  color: string;
  label: string;
  value: number;
};

export default function StatChart() {
  const [loaded, setLoaded] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [barsState, setBarsState] = useState<Bar[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const padding = 8;
  const svgW = 900;
  const svgH = 220;
  const innerW = svgW - padding * 2; // 884
  const rectY = 8;
  const rectH = 144;
  const baseline = rectY + rectH; // bottom Y for bars (152)
  const chartInnerH = 128; // available height for bars inside the background

  const initialBars: Bar[] = [
    { p: 0.11, h: 80, color: "#7fb3ff", label: "Tháng 2", value: 120 },
    { p: 0.33, h: 95, color: "#7fb3ff", label: "Tháng 3", value: 150 },
    { p: 0.5, h: 70, color: "#7fb3ff", label: "Tháng 4", value: 110 },
    { p: 0.67, h: 110, color: "#7fb3ff", label: "Tháng 5", value: 170 },
    { p: 0.89, h: 130, color: "#2563eb", label: "Tháng này", value: 200 },
  ];

  // store bars in state so we can update on demand
  useEffect(() => {
    setBarsState(initialBars);
  }, []);

  const barWidth = innerW * 0.14; // relative width

  // precompute bar elements to keep JSX clean
  const barsForRender = barsState ?? initialBars;
  const slotsForRender = barsForRender.length;
  const gapForRender = innerW / (slotsForRender + 1);
  const maxValForRender = Math.max(...barsForRender.map((x) => x.value), 1);
  const barElements = barsForRender.map((b, i) => {
    const cx = padding + gapForRender * (i + 1);
    const computedBarWidth = Math.min(innerW * 0.14, gapForRender * 0.6);
    const x = cx - computedBarWidth / 2;
    const finalHeight = Math.max(
      28,
      Math.round((b.value / maxValForRender) * chartInnerH),
    );
    const yFinal = baseline - finalHeight;
    const scaleY = loaded ? 1 : 0.02;

    return (
      <g key={i}>
        <rect
          x={x}
          y={yFinal}
          width={computedBarWidth}
          height={finalHeight}
          rx={20}
          fill={
            b.label === "Tháng này"
              ? "url(#barActiveGradient)"
              : "url(#barBlueGradient)"
          }
          transform={`translate(0,${yFinal + finalHeight}) scale(1,${scaleY}) translate(0,${-(yFinal + finalHeight)})`}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center bottom",
            transition: "transform 700ms cubic-bezier(.2,.9,.3,1)",
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        />

        <text
          x={cx}
          y={184}
          textAnchor="middle"
          fontSize={14}
          fill={b.label === "Tháng này" ? "#0f172a" : "#64748b"}
          fontWeight={b.label === "Tháng này" ? 700 : 400}
        >
          {b.label}
        </text>

        {hover === i && (
          <g>
            <rect
              x={cx - 36}
              y={yFinal - 34}
              rx={6}
              width={72}
              height={26}
              fill="#0f172a"
              opacity={0.95}
            />
            <text
              x={cx}
              y={yFinal - 16}
              textAnchor="middle"
              fontSize={12}
              fill="#fff"
            >
              {b.value} triệu
            </text>
          </g>
        )}
      </g>
    );
  });

  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
            Doanh thu phòng khám
          </span>
          <h3 className="text-sm font-bold text-slate-800 mt-0.5">
            Thống kê doanh thu thời gian thực (5 tháng qua)
          </h3>
        </div>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-50 active:scale-95 shadow-sm"
          onClick={() => {
            if (!barsState) return;
            setLoaded(false);

            const newBars = barsState.map((b) => {
              const delta = Math.round(Math.random() * 40 - 20);
              const newVal = Math.max(20, b.value + delta);
              const newH = Math.max(40, Math.round((newVal / 220) * 160));
              return { ...b, value: newVal, h: newH };
            });

            setBarsState(newBars);
            setTimeout(() => setLoaded(true), 20);
          }}
        >
          <svg
            className="h-3.5 w-3.5 animate-spin-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19"
            />
          </svg>
          Cập nhật tự động
        </button>
      </div>

      <div className="w-full relative">
        <svg
          className="w-full"
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="barBlueGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="barActiveGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>

          {/* Clean canvas background */}
          <rect
            x={padding}
            y={rectY}
            width={innerW}
            height={rectH}
            rx={16}
            fill="#f8fafc"
          />

          {/* Horizontal grid lines */}
          <line
            x1={padding}
            y1={baseline - 30}
            x2={innerW + padding}
            y2={baseline - 30}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={baseline - 65}
            x2={innerW + padding}
            y2={baseline - 65}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={baseline - 100}
            x2={innerW + padding}
            y2={baseline - 100}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Grid line labels */}
          <text
            x={padding + 10}
            y={baseline - 34}
            fontSize="8"
            fontWeight="bold"
            fill="#94a3b8"
          >
            50M
          </text>
          <text
            x={padding + 10}
            y={baseline - 69}
            fontSize="8"
            fontWeight="bold"
            fill="#94a3b8"
          >
            100M
          </text>
          <text
            x={padding + 10}
            y={baseline - 104}
            fontSize="8"
            fontWeight="bold"
            fill="#94a3b8"
          >
            150M
          </text>

          {barElements.map((el, idx) =>
            React.cloneElement(el as any, {
              key: idx,
              onClick: () => setSelectedBar(barsForRender[idx]),
            }),
          )}
        </svg>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-semibold pl-2">
          <span>Đơn vị: Triệu VND</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" /> Tháng này
            <span className="h-2 w-2 rounded-full bg-blue-300 ml-2" /> Tháng
            trước
          </span>
        </div>
      </div>

      {selectedBar ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />

          <div className="relative w-full max-w-md animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              aria-label="Đóng chi tiết doanh thu"
              onClick={() => setSelectedBar(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              ×
            </button>

            <h3 className="text-sm font-semibold text-slate-700">
              Chi tiết khoản thu
            </h3>
            <div className="mt-1 text-xs text-slate-400">
              {selectedBar.label} — Tổng: {selectedBar.value} triệu
            </div>

            <div className="mt-4 space-y-3 max-h-[300px] overflow-auto">
              {[
                {
                  item: "Khám tư vấn",
                  amt: Math.round(selectedBar.value * 0.35),
                  date: "01/05/2026",
                },
                {
                  item: "Dịch vụ cận lâm sàng",
                  amt: Math.round(selectedBar.value * 0.25),
                  date: "05/05/2026",
                },
                {
                  item: "Thuốc & vật tư",
                  amt: Math.round(selectedBar.value * 0.2),
                  date: "10/05/2026",
                },
                {
                  item: "Tiền khám chuyên khoa",
                  amt: Math.round(selectedBar.value * 0.2),
                  date: "12/05/2026",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div>
                    <div className="font-medium text-slate-800">{r.item}</div>
                    <div className="text-xs text-slate-400 mt-1">{r.date}</div>
                  </div>
                  <div className="font-semibold text-slate-700">
                    {r.amt} triệu
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedBar(null)}
                className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm"
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
