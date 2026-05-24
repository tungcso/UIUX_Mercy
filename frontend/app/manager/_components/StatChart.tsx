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
          fill={b.color}
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
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-slate-900">
          Thống kê doanh thu phòng khám thời gian thực
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
          onClick={() => {
            // simple refresh: generate new random heights/values and replay animation
            if (!barsState) return;
            setLoaded(false);

            const newBars = barsState.map((b) => {
              const delta = Math.round(Math.random() * 40 - 20);
              const newVal = Math.max(20, b.value + delta);
              // map value to height roughly
              const newH = Math.max(40, Math.round((newVal / 220) * 160));
              return { ...b, value: newVal, h: newH };
            });

            // small delay so CSS transform animates from tiny to final
            setBarsState(newBars);
            setTimeout(() => setLoaded(true), 20);
          }}
        >
          Cập nhật tự động
        </button>
      </div>

      <div className="w-full">
        <svg
          className="w-full"
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <rect
            x={padding}
            y={rectY}
            width={innerW}
            height={rectH}
            rx={16}
            fill="#f8fafc"
          />

          {barElements.map((el, idx) =>
            // clone element and add onClick to the rect inside via index
            React.cloneElement(el as any, {
              key: idx,
              onClick: () => setSelectedBar(barsForRender[idx]),
            })
          )}
        </svg>

        <div className="mt-3 flex items-center text-sm text-slate-400">
          <div className="pl-2">Đơn vị: Triệu VND</div>
        </div>
      </div>

      {selectedBar ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng chi tiết doanh thu"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setSelectedBar(null)}
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

            <h3 className="text-sm font-semibold text-slate-700">Chi tiết khoản thu</h3>
            <div className="mt-1 text-xs text-slate-400">{selectedBar.label} — Tổng: {selectedBar.value} triệu</div>

            <div className="mt-4 space-y-3 max-h-[300px] overflow-auto">
              {[
                { item: "Khám tư vấn", amt: Math.round(selectedBar.value * 0.35), date: "01/05/2026" },
                { item: "Dịch vụ cận lâm sàng", amt: Math.round(selectedBar.value * 0.25), date: "05/05/2026" },
                { item: "Thuốc & vật tư", amt: Math.round(selectedBar.value * 0.2), date: "10/05/2026" },
                { item: "Tiền khám chuyên khoa", amt: Math.round(selectedBar.value * 0.2), date: "12/05/2026" },
              ].map((r, i) => (
                <div key={i} className="flex items-start justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <div className="font-medium text-slate-800">{r.item}</div>
                    <div className="text-xs text-slate-400 mt-1">{r.date}</div>
                  </div>
                  <div className="font-semibold text-slate-700">{r.amt} triệu</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button onClick={() => setSelectedBar(null)} className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm">ĐÓNG</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
