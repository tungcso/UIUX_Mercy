"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

type Prescription = {
  id: string;
  name: string;
  dose: string;
  qty: string;
  usage: string;
};

type MedicationOption = {
  name: string;
  doseOptions: string[];
  defaultUsage: string;
};

const medicationOptions: MedicationOption[] = [
  {
    name: "Aspirin",
    doseOptions: ["81mg", "100mg", "300mg"],
    defaultUsage: "Uống 1 viên sau ăn sáng",
  },
  {
    name: "Metformin",
    doseOptions: ["500mg", "850mg", "1000mg"],
    defaultUsage: "Uống 1 viên cùng bữa ăn tối",
  },
  {
    name: "Paracetamol",
    doseOptions: ["500mg", "650mg"],
    defaultUsage: "Uống 1 viên khi sốt hoặc đau, cách 6 giờ",
  },
  {
    name: "Amoxicillin",
    doseOptions: ["250mg", "500mg"],
    defaultUsage: "Uống 1 viên sau ăn, ngày 2 lần",
  },
];

const initialPrescriptions: Prescription[] = [
  {
    id: "rx-1",
    name: "Aspirin",
    dose: "Hàm lượng: 100mg",
    qty: "30 Viên",
    usage: "Uống 1 viên sau ăn sáng",
  },
  {
    id: "rx-2",
    name: "Metformin",
    dose: "Hàm lượng: 850mg",
    qty: "60 Viên",
    usage: "Uống 1 viên cùng bữa ăn tối",
  },
];

export default function PrescriptionShell() {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedDrugName, setSelectedDrugName] = useState(
    medicationOptions[0].name,
  );
  const [selectedDose, setSelectedDose] = useState(
    medicationOptions[0].doseOptions[0],
  );
  const [selectedQty, setSelectedQty] = useState("30");

  const showSuccessNotice = (actionName: string) => {
    setActionNotice(`${actionName} thành công`);
  };

  const removePrescription = (id: string) => {
    setPrescriptions((current) => current.filter((item) => item.id !== id));
    showSuccessNotice("Gỡ thuốc khỏi đơn");
  };

  const handleDrugChange = (drugName: string) => {
    const drug = medicationOptions.find((item) => item.name === drugName);
    setSelectedDrugName(drugName);
    setSelectedDose(drug?.doseOptions[0] ?? "");
  };

  const handleAddPrescription = () => {
    const activeDrug = medicationOptions.find(
      (item) => item.name === selectedDrugName,
    );
    const parsedQty = Number(selectedQty);

    if (
      !activeDrug ||
      !selectedDose ||
      Number.isNaN(parsedQty) ||
      parsedQty <= 0
    ) {
      return;
    }

    const nextPrescription: Prescription = {
      id: `rx-${Date.now()}`,
      name: activeDrug.name,
      dose: `Hàm lượng: ${selectedDose}`,
      qty: `${parsedQty} Viên`,
      usage: activeDrug.defaultUsage,
    };

    setPrescriptions((current) => [...current, nextPrescription]);
    setIsAddPrescriptionOpen(false);
    setSelectedQty("30");
    showSuccessNotice("Kê thêm đơn thuốc");
  };

  React.useEffect(() => {
    if (!actionNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setActionNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  return (
    <div>
      {actionNotice ? (
        <div className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
            Đơn thuốc điện tử &amp; Chẩn đoán tương tác
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => setIsAddPrescriptionOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Kê thêm đơn thuốc
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAiReportOpen((value) => {
                const next = !value;
                if (next) {
                  showSuccessNotice("Phân tích tương tác chéo chuyên sâu bằng AI");
                }
                return next;
              });
            }}
            aria-expanded={isAiReportOpen}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[14px] font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100"
          >
            <Sparkles className="h-4 w-4" />
            Phân tích tương tác chéo chuyên sâu bằng AI
          </button>
        </div>
      </div>

      <div className="mb-5">
        <input
          placeholder="Gõ tìm kiếm tên hoạt chất (VD: Aspirin, Ibuprofen, Paracetamol)..."
          className="w-full max-w-3xl rounded-[1.2rem] border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-slate-500 outline-none"
        />
      </div>

      <section>
        <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-4 py-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-5 sm:py-3">
          <div className="grid grid-cols-4 gap-4 px-2 py-3 text-[13px] text-slate-500">
            <div>Tên thuốc</div>
            <div className="text-center">Số lượng</div>
            <div>Liều dùng khuyến cáo</div>
            <div className="text-right">Tác vụ</div>
          </div>

          <div>
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-4 items-center gap-4 border-t border-slate-100 px-2 py-5"
              >
                <div>
                  <div className="text-[15px] font-semibold text-slate-900">
                    {p.name}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {p.dose}
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold text-slate-900">
                  {p.qty}
                </div>

                <div className="text-[14px] text-slate-700">{p.usage}</div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => removePrescription(p.id)}
                    className="font-semibold text-rose-500 transition-colors hover:text-rose-600"
                  >
                    Gỡ khỏi đơn
                  </button>
                </div>
              </div>
            ))}

            {prescriptions.length === 0 ? (
              <div className="border-t border-slate-100 px-2 py-12 text-center text-slate-500">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[13px] font-medium">
                  Đơn thuốc hiện đang trống
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Hãy thêm thuốc mới để tiếp tục kê đơn và xuất đơn.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className={`mt-5 overflow-hidden rounded-[1.4rem] border bg-rose-50/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-200 ${isAiReportOpen ? "max-h-[320px] border-rose-200 opacity-100" : "pointer-events-none max-h-0 border-transparent opacity-0"}`}
        aria-hidden={!isAiReportOpen}
      >
        <div className="flex items-start justify-between gap-4 border-b border-rose-100 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Báo cáo phân tích độc tính & tương tác thuốc lâm sàng (Gemini AI)
            </div>
            <p className="text-[13px] text-rose-500">Tạm ẩn báo cáo</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAiReportOpen(false)}
            className="rounded-full p-2 text-rose-400 transition-colors hover:bg-white hover:text-rose-600"
            aria-label="Ẩn báo cáo AI"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center px-4 py-9 text-center text-rose-500 sm:px-5">
          <div>
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-sm">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <p className="mt-4 text-[13px] font-medium">
              Gemini đang đối chiếu cơ sở dữ liệu y quốc gia và tính toán rủi ro
              biến chứng...
            </p>
          </div>
        </div>
      </section>

      <div className="fixed right-8 bottom-8">
        <button
          type="button"
          onClick={() => setIsExportPopupOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.24)]"
        >
          <CheckCircle2 className="h-4 w-4" />
          KÝ SỐ &amp; XUẤT ĐƠN THUỐC
        </button>
      </div>

      {isAddPrescriptionOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsAddPrescriptionOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-[21px] font-bold tracking-[-0.03em] text-slate-900">
                  Kê thêm đơn thuốc
                </h2>
                <p className="mt-2 text-[13px] text-slate-500">
                  Chọn thuốc, liều lượng và số lượng để thêm vào đơn hiện tại.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPrescriptionOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Thuốc
                </label>
                <select
                  value={selectedDrugName}
                  onChange={(event) => handleDrugChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition-colors focus:border-emerald-300"
                >
                  {medicationOptions.map((drug) => (
                    <option key={drug.name} value={drug.name}>
                      {drug.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                    Liều lượng
                  </label>
                  <select
                    value={selectedDose}
                    onChange={(event) => setSelectedDose(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition-colors focus:border-emerald-300"
                  >
                    {(
                      medicationOptions.find(
                        (drug) => drug.name === selectedDrugName,
                      )?.doseOptions ?? []
                    ).map((dose) => (
                      <option key={dose} value={dose}>
                        {dose}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                    Số lượng (viên)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={selectedQty}
                    onChange={(event) => setSelectedQty(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-700 outline-none transition-colors focus:border-emerald-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setIsAddPrescriptionOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.24)] transition-colors hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                Thêm vào đơn
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isExportPopupOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsExportPopupOpen(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-emerald-50/80 to-teal-50 shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-emerald-100/70 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Hộp thoại ký số & xuất đơn
                </div>
                <h2 className="mt-3 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
                  Hoàn tất đơn thuốc điện tử
                </h2>
                <p className="mt-2 max-w-xl text-[13px] leading-6 text-slate-600">
                  Xác nhận nội dung đơn, ký số điện tử và xuất bản hồ sơ cho
                  bệnh nhân theo định dạng chuẩn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExportPopupOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                aria-label="Đóng popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-3 text-slate-900">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500">
                      Trạng thái ký số
                    </p>
                    <p className="text-[17px] font-bold">Sẵn sàng xuất đơn</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Thuốc trong đơn
                    </p>
                    <p className="mt-2 text-[22px] font-bold text-slate-900">
                      {prescriptions.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Kiểm tra an toàn
                    </p>
                    <p className="mt-2 text-[22px] font-bold text-emerald-600">
                      98%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Dự kiến hoàn tất
                    </p>
                    <p className="mt-2 text-[22px] font-bold text-slate-900">
                      1 bước
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-[13px] leading-6 text-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <p>
                      Đề nghị rà soát lại các thuốc trước khi xuất để đảm bảo
                      tương tác chéo đã được kiểm tra đầy đủ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 px-4 py-4 text-white shadow-[0_20px_55px_rgba(15,23,42,0.22)] sm:px-5 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      Preview
                    </p>
                    <h3 className="mt-2 text-[17px] font-bold">
                      Đơn thuốc đã ký
                    </h3>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                    PDF / eRx
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {prescriptions.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[11px] text-white/65">
                            {item.dose}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                          Đã duyệt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                    Chữ ký số
                  </p>
                  <p className="mt-2 text-[14px] font-semibold text-white">
                    BS. Nguyễn Minh Trí
                  </p>
                  <p className="mt-1 text-[13px] text-white/65">
                    Khoa Hồi sức tích cực
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-emerald-100/70 bg-white/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[13px] text-slate-600">
                Sẵn sàng ký số và xuất đơn với định dạng bảo mật chuẩn.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsExportPopupOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportPopupOpen(false);
                    showSuccessNotice("Ký số và xuất đơn thuốc");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.24)] transition-transform hover:-translate-y-0.5"
                >
                  Ký số và xuất đơn
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
