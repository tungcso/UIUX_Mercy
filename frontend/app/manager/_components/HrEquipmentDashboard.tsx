"use client";

import { useState } from "react";
import type React from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  RefreshCw,
  Server,
  ShieldAlert,
  Thermometer,
  UserCheck,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

type CommandState = "pending" | "approved" | "rejected";

export type Machine = {
  id: string;
  code: string;
  name: string;
  status: "running" | "idle" | "error" | "repairing";
  power: number;
  temp: number;
};

export const INITIAL_MACHINES: Machine[] = [
  {
    id: "m1",
    code: "EQ-CT-01",
    name: "Hệ thống Máy CT Scanner 128 dãy",
    status: "running",
    power: 92,
    temp: 38.5,
  },
  {
    id: "m2",
    code: "EQ-MRI-02",
    name: "Máy Cộng Hưởng Từ MRI 3.0T",
    status: "error",
    power: 0,
    temp: 42.1,
  },
  {
    id: "m3",
    code: "EQ-US-03",
    name: "Máy Siêu Âm Màu 4D Doppler",
    status: "running",
    power: 74,
    temp: 36.2,
  },
  {
    id: "m4",
    code: "EQ-IA-04",
    name: "Hệ thống phân tích miễn dịch tự động",
    status: "running",
    power: 85,
    temp: 37.0,
  },
];

type HrEquipmentDashboardProps = {
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
};

export default function HrEquipmentDashboard({
  machines,
  setMachines,
}: HrEquipmentDashboardProps) {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  // Command 1 State
  const [cmd1State, setCmd1State] = useState<CommandState>("pending");
  // Command 2 State
  const [cmd2State, setCmd2State] = useState<CommandState>("pending");

  const handleApproveCmd1 = () => {
    setCmd1State("approved");
  };

  const handleRejectCmd1 = () => {
    setCmd1State("rejected");
  };

  const handleApproveCmd2 = () => {
    setCmd2State("approved");
    // Dynamically change machine status to repairing or running
    setMachines((prev) =>
      prev.map((m) =>
        m.code === "EQ-MRI-02"
          ? { ...m, status: "repairing", temp: 37.5, power: 10 }
          : m,
      ),
    );
  };

  const handleRejectCmd2 = () => {
    setCmd2State("rejected");
  };

  const handleReset = () => {
    setSelectedMachine(null);
    setCmd1State("pending");
    setCmd2State("pending");
    // Reset is handled by page.tsx via the shared INITIAL_MACHINES constant
    setMachines(INITIAL_MACHINES);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.02)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Quản lý thiết bị & Điều phối nhân sự
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Hôm nay: Thứ Bảy, 23 tháng 5, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            title="Reset trạng thái"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100/50">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống hoạt động ổn định
          </div>
        </div>
      </div>

      {/* Grid of actions / approvals */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Duyệt lệnh 1 */}
        <div className="relative overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.03)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-100">
              Duyệt lệnh 1
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Không có yêu cầu
            </span>
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-800 leading-snug">
            Xác nhận lệnh điều động thêm bác sĩ khi khoa bị quá tải!
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Lượng bệnh nhân tại khoa Nội đang vượt quá 85% công suất thiết kế.
            Hệ thống đề xuất điều động khẩn cấp 1 Bác sĩ dự phòng từ khoa Ngoại
            sang hỗ trợ.
          </p>

          {cmd1State === "pending" && (
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleRejectCmd1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 active:scale-95"
              >
                Bác bỏ
              </button>
              <button
                type="button"
                onClick={handleApproveCmd1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 shadow-blue-200"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Duyệt lệnh điều phối
              </button>
            </div>
          )}

          {cmd1State === "approved" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-800 animate-slide-up">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Đã duyệt! Lệnh điều phối bác sĩ tăng cường khoa Nội đã được gửi
                đi.
              </span>
            </div>
          )}

          {cmd1State === "rejected" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-800 animate-slide-up">
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Đã từ chối lệnh điều phối nhân sự này.</span>
            </div>
          )}
        </div>

        {/* Card 2: Duyệt lệnh 2 */}
        <div className="relative overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.03)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 border border-rose-100">
              Duyệt lệnh 2
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Không có yêu cầu
            </span>
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-800 leading-snug">
            Xác nhận chi ngân sách sửa chữa / bảo trì thiết bị khi máy báo lỗi
            đỏ
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Kích hoạt nhanh gói bảo trì 24/7 của hãng đối với máy MRI 3.0T bị
            báo lỗi đỏ để phục hồi hoạt động khám chữa bệnh. Dự toán chi phí ước
            tính: 45 triệu VND.
          </p>

          {cmd2State === "pending" && (
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleRejectCmd2}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 active:scale-95"
              >
                Bác bỏ
              </button>
              <button
                type="button"
                onClick={handleApproveCmd2}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 shadow-blue-200"
              >
                <Wrench className="h-3.5 w-3.5" />
                Duyệt chi ngân sách
              </button>
            </div>
          )}

          {cmd2State === "approved" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-800 animate-slide-up">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Đã phê duyệt chi ngân sách sửa chữa khẩn cấp! Kỹ thuật viên đang
                đến.
              </span>
            </div>
          )}

          {cmd2State === "rejected" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-800 animate-slide-up">
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Đã từ chối cấp ngân sách bảo trì này.</span>
            </div>
          )}
        </div>
      </div>

      {/* Equipment IOT section */}
      <div className="rounded-[1.65rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
            IOT HOSPITAL HUB
          </span>
          <h3 className="mt-1 text-sm font-extrabold text-slate-800">
            Danh mục hiển thị trạng thái hoạt động thực tế của máy móc
          </h3>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {machines.map((machine) => {
            let statusText = "ĐANG TRỐNG";
            let statusStyle = "bg-slate-50 text-slate-500 border-slate-100";
            let dotColor = "bg-slate-400";

            if (machine.status === "running") {
              statusText = "ĐANG CHẠY";
              statusStyle =
                "bg-emerald-50 text-emerald-700 border-emerald-100/50";
              dotColor = "bg-emerald-500";
            } else if (machine.status === "error") {
              statusText = "BÁO LỖI ĐỎ";
              statusStyle =
                "bg-rose-50 text-rose-700 border-rose-100/50 animate-pulse";
              dotColor = "bg-rose-500";
            } else if (machine.status === "repairing") {
              statusText = "ĐANG SỬA CHỮA";
              statusStyle = "bg-amber-50 text-amber-700 border-amber-100/50";
              dotColor = "bg-amber-500 animate-spin";
            }

            return (
              <div
                key={machine.id}
                onClick={() => setSelectedMachine(machine)}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#fafcff]/50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white hover:border-blue-300 cursor-pointer active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {machine.code}
                    </span>
                    <Cpu className="h-4 w-4 text-slate-300" />
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-800 line-clamp-2 h-8 leading-snug">
                    {machine.name}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 space-y-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusStyle}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                    {statusText}
                  </span>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>Công suất: {machine.power}%</span>
                    <span>Nhiệt độ: {machine.temp}°C</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Interactive AI Equipment Details Modal */}
      {selectedMachine ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
          />

          <div className="relative w-full max-w-lg animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            {/* Close button */}
            <button
              type="button"
              aria-label="Đóng chi tiết thiết bị"
              onClick={() => setSelectedMachine(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              ×
            </button>

            {/* Header info */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-1">
                <Server className="h-3.5 w-3.5" />
                CHI TIẾT THIẾT BỊ IOT
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900 leading-snug">
                {selectedMachine.code}: {selectedMachine.name}
              </h3>
            </div>

            {/* Current Real-time Metrics Grid */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trạng thái
                </span>
                <span
                  className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold ${
                    selectedMachine.status === "running"
                      ? "text-emerald-600"
                      : selectedMachine.status === "error"
                        ? "text-rose-600 animate-pulse"
                        : selectedMachine.status === "repairing"
                          ? "text-amber-600"
                          : "text-slate-500"
                  }`}
                >
                  ●{" "}
                  {selectedMachine.status === "running"
                    ? "Đang chạy"
                    : selectedMachine.status === "error"
                      ? "Báo lỗi đỏ"
                      : selectedMachine.status === "repairing"
                        ? "Bảo trì"
                        : "Đang trống"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Công suất
                </span>
                <span className="text-sm font-bold text-slate-800 block mt-1.5 flex items-center justify-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {selectedMachine.power}%
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nhiệt độ
                </span>
                <span className="text-sm font-bold text-slate-800 block mt-1.5 flex items-center justify-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-blue-500" />
                  {selectedMachine.temp}°C
                </span>
              </div>
            </div>

            {/* AI Diagnostics & Troubleshooting Suggestions */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100/50 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  🤖
                </span>
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  {selectedMachine.status === "error"
                    ? "Đề xuất giải quyết tự động theo AI"
                    : "Đánh giá sức khỏe AI"}
                </span>
              </div>

              {selectedMachine.status === "error" ? (
                <div className="mt-2 text-xs text-slate-600 leading-relaxed space-y-2">
                  <p className="font-semibold text-rose-600">
                    ⚠️ Ghi nhận lỗi MRI-TEMP-OVERHEAT: Cuộn siêu dẫn Magnet bị
                    quá nhiệt vượt ngưỡng an toàn (42.1°C). Áp suất khí Heli
                    giảm nhẹ.
                  </p>
                  <p className="font-medium text-slate-500">
                    <strong className="text-slate-700">
                      Các bước AI khuyến nghị lập tức:
                    </strong>
                    <br />
                    1. Kích hoạt bơm Heli lỏng phụ trợ khẩn cấp để hạ nhiệt cuộn
                    Magnet.
                    <br />
                    2. Tạm ngắt dòng RF để cô lập nguồn nhiệt phát sinh.
                    <br />
                    3. Đề xuất chuyển ca chụp tiếp theo sang phòng chụp CT dự
                    phòng hoặc liên kết Mercy Clinic để bảo đảm lịch trình bệnh
                    nhân.
                  </p>
                </div>
              ) : selectedMachine.status === "repairing" ? (
                <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-amber-600">
                    ⚙️ Đang xử lý sửa chữa khẩn cấp: Gói hỗ trợ bảo hành chính
                    hãng đã được kích hoạt thành công.
                  </p>
                  <p className="mt-1 font-medium text-slate-500">
                    Đội kỹ thuật viên chuyên trách đang thực hiện cân chỉnh lại
                    hệ thống RF và bổ sung Helium. Ước tính thời gian hoàn tất
                    chụp thử nghiệm: 15 phút.
                  </p>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-emerald-600">
                    ✓ Chỉ số sức khỏe: Tuyệt hảo (98/100).
                  </p>
                  <p className="mt-1 font-medium text-slate-500">
                    Tín hiệu IOT truyền phát liên tục và ổn định. Chu kỳ bảo trì
                    máy tiếp theo dự kiến diễn ra sau 45 ngày nữa. Khuyến nghị
                    chạy công suất tối ưu.
                  </p>
                </div>
              )}
            </div>

            {/* Manager Operations Block */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              {/* Conditional action buttons depending on machine state */}
              {selectedMachine.status === "error" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      // Power isolate: Turn to idle, power 0, temp 25
                      setMachines((prev) =>
                        prev.map((m) =>
                          m.id === selectedMachine.id
                            ? { ...m, status: "idle", power: 0, temp: 25 }
                            : m,
                        ),
                      );
                      setSelectedMachine(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-2.5 text-xs font-bold transition hover:bg-rose-100 active:scale-95"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Ngắt điện cách ly máy
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Trigger Repairing
                      setMachines((prev) =>
                        prev.map((m) =>
                          m.id === selectedMachine.id
                            ? {
                                ...m,
                                status: "repairing",
                                power: 10,
                                temp: 37.5,
                              }
                            : m,
                        ),
                      );
                      setCmd2State("approved"); // Sync with top duyệt lệnh 2!
                      setSelectedMachine(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition hover:bg-blue-700 active:scale-95 shadow-blue-200"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Duyệt bảo trì khẩn cấp
                  </button>
                </>
              )}

              {selectedMachine.status === "repairing" && (
                <button
                  type="button"
                  onClick={() => {
                    // Turn to running, power 80, temp 36.5
                    setMachines((prev) =>
                      prev.map((m) =>
                        m.id === selectedMachine.id
                          ? { ...m, status: "running", power: 80, temp: 36.5 }
                          : m,
                      ),
                    );
                    setSelectedMachine(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition hover:bg-emerald-700 active:scale-95 shadow-emerald-200"
                >
                  <Check className="h-3.5 w-3.5" />
                  Hoàn tất & Kích hoạt máy
                </button>
              )}

              {selectedMachine.status === "running" && (
                <button
                  type="button"
                  onClick={() => {
                    // Simulate full-load test
                    setMachines((prev) =>
                      prev.map((m) =>
                        m.id === selectedMachine.id
                          ? { ...m, power: 99, temp: 39.2 }
                          : m,
                      ),
                    );
                    window.alert(
                      `Đang khởi chạy kiểm tra tải tối đa (99% công suất) cho thiết bị ${selectedMachine.code}...`,
                    );
                    setSelectedMachine(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-50 active:scale-95"
                >
                  <Activity className="h-3.5 w-3.5" />
                  Chạy kiểm thử hiệu năng
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedMachine(null)}
                className="rounded-xl border border-slate-200 bg-white text-slate-500 px-4 py-2.5 text-xs font-semibold transition hover:bg-slate-50 hover:text-slate-700 active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
