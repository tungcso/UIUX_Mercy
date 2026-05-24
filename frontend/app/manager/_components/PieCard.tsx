export default function PieCard() {
  // Four segments to match reference layout
  const segments = [
    { label: "Tim mạch", value: 35, color: "#2b83f6" },
    { label: "Nhi khoa", value: 25, color: "#05b28a" },
    { label: "Chấn thương", value: 10, color: "#f59e0b" },
    { label: "Nội tổng quát", value: 30, color: "#ef476f" },
  ];

  const centerLabel = "72% TẢI";

  const radius = 22; // larger ring for better visual
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;

  // convert values to stroke lengths and include small gaps between segments
  const gap = 1.8; // small gap length in SVG units
  const segs = segments.map((s) => ({
    ...s,
    length: (s.value / 100) * circumference,
  }));

  // cumulative offset (start at 0)
  let offset = 0;

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-4">
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center"
          style={{ width: 220 }}
        >
          <svg width="160" height="160" viewBox="0 0 64 64">
            <defs>
              <filter
                id="innerShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#0f172a"
                  floodOpacity="0.06"
                />
              </filter>
            </defs>

            {/* background ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={stroke}
            />

            {/* colored segments with rounded caps */}
            {segs.map((s, i) => {
              // subtract small gap so segments have breathing room
              const len = Math.max(0, s.length - gap);
              const dasharray = `${len} ${circumference - len}`;
              const dashoffset = -offset;
              offset += s.length;
              return (
                <circle
                  key={s.label}
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="transparent"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                  transform="rotate(-90 32 32)"
                />
              );
            })}

            {/* inner white circle to create donut hole with subtle border */}
            <circle
              cx="32"
              cy="32"
              r={radius - stroke - 1}
              fill="#ffffff"
              filter="url(#innerShadow)"
            />
            <circle
              cx="32"
              cy="32"
              r={radius - stroke - 1}
              fill="transparent"
              stroke="#f8fafc"
              strokeWidth={1.2}
            />

            {/* center text */}
            <text
              x="32"
              y="26"
              textAnchor="middle"
              className="fill-slate-400"
              fontSize="4"
            >
              HỆ SỐ
            </text>
            <text
              x="32"
              y="36"
              textAnchor="middle"
              className="fill-slate-900"
              fontSize="6"
              fontWeight={700}
            >
              {centerLabel}
            </text>
          </svg>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-2 gap-3 text-sm max-w-md mx-auto">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: s.color,
                    borderRadius: 999,
                  }}
                />
                <div className="text-slate-700 text-sm">
                  {s.label} <span className="text-slate-400">{s.value}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs uppercase font-semibold text-slate-300 text-center">
            Nhấn để xem số lượng theo chuyên khoa
          </div>
        </div>
      </div>
    </div>
  );
}
