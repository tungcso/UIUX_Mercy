"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Bug,
  Gauge,
  MessageSquareMore,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Wrench,
} from "lucide-react";

type ActionType = "knowledge" | "monitoring" | null;

const baseProductivitySeries = [62, 68, 71, 73, 76, 78, 81];

const baseIncidentFeed = [
  {
    title: "Fallback tăng khi hỏi về lịch khám chuyên khoa",
    severity: "Trung bình",
    detail: "12% câu hỏi được chuyển sang nhân viên thật trong 24h qua.",
  },
  {
    title: "Một số câu trả lời thiếu ngữ cảnh bệnh án",
    severity: "Cao",
    detail: "Cần bổ sung bộ dữ liệu huấn luyện cho câu hỏi lặp lại.",
  },
  {
    title: "Độ trễ phản hồi vượt chuẩn giờ cao điểm",
    severity: "Thấp",
    detail: "Latency trung bình 2.8s, cao hơn mức mục tiêu 2.0s.",
  },
];

const upgradeItems = [
  {
    title: "Nâng cấp tri thức nội bộ",
    description: "Đồng bộ thêm FAQ, giá dịch vụ, và quy trình chuyển tuyến.",
    impact: "+18% độ chính xác",
  },
  {
    title: "Tối ưu fallback routing",
    description: "Gửi các phiên rủi ro sang nhân viên CSKH theo mức ưu tiên.",
    impact: "Giảm 30% chuyển tay",
  },
  {
    title: "Theo dõi chất lượng trả lời",
    description: "Gắn scoring cho từng hội thoại để phát hiện mẫu lỗi sớm.",
    impact: "Cảnh báo sớm lỗi",
  },
];

const baseHealthItems = [
  {
    label: "Tỉ lệ tự xử lí",
    value: "84%",
    status: "Tốt",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    label: "Tỉ lệ fallback",
    value: "12%",
    status: "Cần theo dõi",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    label: "Tỉ lệ lỗi câu trả lời",
    value: "3.1%",
    status: "Cảnh báo",
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "Thời gian phản hồi",
    value: "2.8s",
    status: "Ổn định",
    tone: "bg-sky-50 text-sky-700 border-sky-100",
  },
];

const doctorFeedbacks = [
  {
    doctor: "BS. Nguyễn Minh Anh",
    department: "Nội tổng quát",
    issue:
      "Chatbot trả lời thiếu chính xác về liều dùng thuốc hạ sốt cho trẻ em.",
    severity: "Cao",
    status: "Đang phân tích",
  },
  {
    doctor: "BS. Trần Thu Hà",
    department: "Tim mạch",
    issue:
      "Bot đôi lúc nhầm lịch tái khám khi bệnh nhân hỏi cùng lúc nhiều thông tin.",
    severity: "Trung bình",
    status: "Đã ghi nhận",
  },
  {
    doctor: "BS. Lê Hoàng Nam",
    department: "Nhi khoa",
    issue:
      "Một số phản hồi hướng dẫn chưa đủ rõ với phụ huynh lần đầu sử dụng.",
    severity: "Cần cải thiện",
    status: "Chờ cập nhật",
  },
];

function formatPercent(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function ChatbotOperationsDashboard() {
  const [currentScore, setCurrentScore] = useState(91);
  const [targetScore] = useState(95);
  const [productivitySeries, setProductivitySeries] = useState(
    baseProductivitySeries,
  );
  const [healthItems, setHealthItems] = useState(baseHealthItems);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("Chưa làm mới");
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [resolvedIncidents, setResolvedIncidents] = useState<string[]>([]);

  const incidentFeed = baseIncidentFeed;

  const handleRefresh = () => {
    const nextSeries = productivitySeries.map((value, index) => {
      const drift = index % 2 === 0 ? 2 : -1;
      return Math.max(45, Math.min(98, value + drift));
    });

    const nextCurrentScore = Math.min(100, currentScore + 1);
    const selfServiceValue = Math.min(
      94,
      Number(healthItems[0].value.replace("%", "")) + 1,
    );

    const fallbackValue = Math.max(
      7,
      Number(healthItems[1].value.replace("%", "")) - 1,
    );

    const errorRateValue = Math.max(
      1.8,
      Number(healthItems[2].value.replace("%", "")) - 0.1,
    );

    const latencyValue = Math.max(
      2.1,
      Number(healthItems[3].value.replace("s", "")) - 0.1,
    );

    setProductivitySeries(nextSeries);
    setCurrentScore(nextCurrentScore);
    setHealthItems([
      {
        ...healthItems[0],
        value: `${selfServiceValue}%`,
      },
      {
        ...healthItems[1],
        value: `${fallbackValue}%`,
      },
      {
        ...healthItems[2],
        value: `${errorRateValue.toFixed(1)}%`,
      },
      {
        ...healthItems[3],
        value: `${latencyValue.toFixed(1)}s`,
      },
    ]);
    setLastRefreshedAt(new Date().toLocaleTimeString("vi-VN"));
    setActiveAction(null);
  };

  const handleUpgradeKnowledge = () => {
    setActiveAction("knowledge");
  };

  const handleToggleMonitoring = () => {
    setMonitoringEnabled((current) => !current);
    setActiveAction("monitoring");
  };

  const handleResolveIncident = (title: string) => {
    setResolvedIncidents((current) =>
      current.includes(title) ? current : [...current, title],
    );
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.02)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
            <Bot className="h-3.5 w-3.5" />
            Chatbot Operations
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            Giám sát vận hành chatbot và chất lượng trả lời
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Theo dõi năng suất, phát hiện lỗi, kiểm tra mức độ an toàn câu trả
            lời, và xác định có cần nâng cấp tri thức hay mô hình AI hay không.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Trạng thái:{" "}
            {monitoringEnabled ? "Hoạt động tốt" : "Giám sát tạm tắt"}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới số liệu
          </button>
        </div>
      </div>

      <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50 px-5 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.02)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Hành động gần nhất
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {activeAction === "knowledge"
                ? "Đã đưa yêu cầu nâng cấp bộ tri thức vào hàng chờ phê duyệt."
                : activeAction === "monitoring"
                  ? monitoringEnabled
                    ? "Đã bật giám sát lỗi real-time."
                    : "Đã tạm dừng giám sát real-time theo yêu cầu."
                  : "Sẵn sàng nhận tác vụ quản lí chatbot."}
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Cập nhật cuối: {lastRefreshedAt}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {healthItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.4rem] border border-slate-200/80 bg-white p-5 shadow-[0_16px_35px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {item.value}
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${item.tone}`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="rounded-[1.65rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">
                Năng suất hoạt động
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Hiệu suất trả lời trong 7 ngày gần nhất
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              <Gauge className="h-4 w-4 text-blue-600" />
              Mục tiêu: {targetScore}%
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Đánh giá hiện tại
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-slate-900">
                      {currentScore}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-emerald-600">
                      /100
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Xu hướng
                  </div>
                  <div className="mt-1 text-sm font-bold text-emerald-700">
                    +6 điểm / tuần
                  </div>
                </div>
              </div>

              <div className="mt-6 flex h-44 items-end gap-3">
                {productivitySeries.map((value, index) => (
                  <div
                    key={`productivity-bar-${index}`}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t-2xl bg-linear-to-t from-blue-600 via-sky-500 to-cyan-300 shadow-[0_12px_24px_rgba(37,99,235,0.18)]"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-[11px] font-semibold text-slate-400">
                      T{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Độ chính xác
                  </p>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    93%
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Tự động hoá
                  </p>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    84%
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Escalation
                  </p>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    6%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <MessageSquareMore className="h-4 w-4 text-blue-600" />
                  Tác vụ chatbot đang xử lí
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Đặt lịch khám", value: 418, pct: 82 },
                    { label: "Hỏi giá dịch vụ", value: 236, pct: 61 },
                    { label: "Tra cứu bác sĩ", value: 149, pct: 48 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>{item.label}</span>
                        <span>{formatPercent(item.value)} phiên</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-linear-to-r from-blue-600 to-cyan-400"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <TimerReset className="h-4 w-4 text-sky-600" />
                  Chỉ số vận hành
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Latency trung bình
                    </p>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      2.8s
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Tỷ lệ lỗi
                    </p>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      3.1%
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Hand-off sang người
                    </p>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      12%
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      CSAT
                    </p>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      4.6/5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.65rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-rose-600">
                  Phản hồi từ bác sĩ
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Các lỗi chatbot được bác sĩ báo trực tiếp
                </h3>
              </div>
              <div className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                {doctorFeedbacks.length} phản hồi cần xem xét
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {doctorFeedbacks.map((feedback) => (
                <div
                  key={`${feedback.doctor}-${feedback.issue}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {feedback.doctor}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                          {feedback.department}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        {feedback.issue}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
                        {feedback.severity}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                        {feedback.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
              Chỗ này có thể nối tiếp với ticket nội bộ để kỹ thuật xem, xác
              minh, và đẩy bản sửa cho chatbot.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.65rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Bug className="h-4 w-4 text-rose-600" />
              Lỗi / sự cố gần đây
            </div>
            <div className="mt-4 space-y-3">
              {incidentFeed.map((incident) => {
                const isResolved = resolvedIncidents.includes(incident.title);

                return (
                  <div
                    key={incident.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold leading-5 text-slate-900">
                          {incident.title}
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {incident.detail}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                        {incident.severity}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span
                        className={`text-[11px] font-semibold ${isResolved ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {isResolved ? "Đã xử lý" : "Chờ xử lý"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleResolveIncident(incident.title)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isResolved}
                      >
                        {isResolved ? "Đã ghi nhận" : "Đánh dấu đã xử lý"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.65rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Wrench className="h-4 w-4 text-blue-600" />
              Cần upgrade gì không
            </div>
            <div className="mt-4 space-y-3">
              {upgradeItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.03)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </h4>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      {item.impact}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.65rem] border border-slate-200/80 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Hành động đề xuất
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Mô hình hiện ổn định, nhưng nên ưu tiên cập nhật dữ liệu tri thức
              và giảm độ trễ ở giờ cao điểm.
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleUpgradeKnowledge}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-cyan-300" />
                  Nâng cấp bộ tri thức
                </span>
                <span className="text-cyan-200">
                  {activeAction === "knowledge"
                    ? "Đang chờ duyệt"
                    : "Ưu tiên cao"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleToggleMonitoring}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  Bật giám sát lỗi real-time
                </span>
                <span className="text-amber-200">
                  {monitoringEnabled ? "Đang bật" : "Đang tắt"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
