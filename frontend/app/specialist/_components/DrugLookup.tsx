"use client";

import { useState } from "react";
import {
  Search,
  Pill,
  AlertTriangle,
  ChevronRight,
  X,
  ShieldAlert,
  Info,
  Zap,
} from "lucide-react";

type Drug = {
  id: string;
  name: string;
  generic: string;
  category: string;
  ingredients: string[];
  dosage: string;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  interactions: Array<{ drug: string; risk: "high" | "moderate" | "low"; note: string }>;
};

const drugDatabase: Drug[] = [
  {
    id: "D001",
    name: "Paracetamol 500mg",
    generic: "Acetaminophen",
    category: "Thuốc giảm đau, hạ sốt",
    ingredients: ["Paracetamol 500mg"],
    dosage: "500-1000mg mỗi 4-6 giờ, tối đa 4g/ngày",
    indications: ["Hạ sốt", "Giảm đau nhẹ đến trung bình", "Đau đầu", "Đau cơ"],
    contraindications: ["Suy gan nặng", "Dị ứng Paracetamol"],
    sideEffects: ["Hiếm gặp khi dùng đúng liều", "Độc gan khi quá liều"],
    interactions: [
      { drug: "Warfarin", risk: "moderate", note: "Tăng tác dụng chống đông. Theo dõi INR." },
      { drug: "Rượu bia", risk: "high", note: "Tăng nguy cơ độc gan nghiêm trọng." },
      { drug: "Isoniazid", risk: "moderate", note: "Tăng nguy cơ độc gan." },
    ],
  },
  {
    id: "D002",
    name: "Amoxicillin 500mg",
    generic: "Amoxicillin trihydrate",
    category: "Kháng sinh nhóm Penicillin",
    ingredients: ["Amoxicillin trihydrate tương đương Amoxicillin 500mg"],
    dosage: "500mg mỗi 8 giờ, hoặc 875mg mỗi 12 giờ",
    indications: ["Viêm phổi nhẹ", "Viêm tai giữa", "Viêm họng do liên cầu", "Nhiễm trùng đường tiết niệu"],
    contraindications: ["Dị ứng Penicillin", "Tiền sử vàng da do Amoxicillin/Clavulanate"],
    sideEffects: ["Tiêu chảy", "Buồn nôn", "Ban đỏ da", "Hiếm: phản vệ"],
    interactions: [
      { drug: "Warfarin", risk: "moderate", note: "Có thể tăng tác dụng chống đông." },
      { drug: "Methotrexate", risk: "high", note: "Giảm thải trừ Methotrexate, tăng độc tính." },
      { drug: "Thuốc tránh thai", risk: "low", note: "Có thể giảm hiệu quả contraceptive." },
    ],
  },
  {
    id: "D003",
    name: "Metformin 500mg",
    generic: "Metformin hydrochloride",
    category: "Thuốc hạ đường huyết",
    ingredients: ["Metformin HCl 500mg"],
    dosage: "500-2000mg/ngày, uống trong/sau bữa ăn",
    indications: ["Đái tháo đường type 2", "Hội chứng buồng trứng đa nang"],
    contraindications: ["Suy thận (eGFR<30)", "Suy gan", "Nghiện rượu", "Nhiễm toan chuyển hóa"],
    sideEffects: ["Buồn nôn", "Tiêu chảy", "Đau bụng", "Giảm hấp thu B12"],
    interactions: [
      { drug: "Cimetidine", risk: "moderate", note: "Tăng nồng độ Metformin, giảm liều nếu cần." },
      { drug: "Thuốc cản quang có iod", risk: "high", note: "Ngưng Metformin 48h trước/sau chụp cản quang." },
      { drug: "Rượu bia", risk: "high", note: "Tăng nguy cơ nhiễm toan lactic." },
    ],
  },
  {
    id: "D004",
    name: "Amlodipine 5mg",
    generic: "Amlodipine besylate",
    category: "Thuốc hạ áp - Chẹn kênh Calci",
    ingredients: ["Amlodipine besylate 6.93mg tương đương Amlodipine 5mg"],
    dosage: "5-10mg/ngày, uống 1 lần",
    indications: ["Tăng huyết áp", "Đau thắt ngực ổn định", "Co thắt mạch vành"],
    contraindications: ["Sốc tim", "Hẹp động mạch chủ nặng", "Dị ứng Amlodipine"],
    sideEffects: ["Phù ngoại vi", "Đỏ bừng mặt", "Nhức đầu", "Chóng mặt"],
    interactions: [
      { drug: "Simvastatin", risk: "moderate", note: "Tăng nồng độ Simvastatin, tăng nguy cơ bệnh cơ." },
      { drug: "Cyclosporin", risk: "high", note: "Tăng nồng độ Cyclosporin đáng kể." },
      { drug: "Rifampicin", risk: "moderate", note: "Giảm hiệu quả Amlodipine." },
    ],
  },
  {
    id: "D005",
    name: "Warfarin 5mg",
    generic: "Warfarin sodium",
    category: "Thuốc chống đông",
    ingredients: ["Warfarin sodium 5mg"],
    dosage: "Liều cá thể hóa theo INR mục tiêu. Thường 2-10mg/ngày",
    indications: ["Rung nhĩ", "Huyết khối tĩnh mạch sâu", "Thuyên tắc phổi", "Van tim cơ học"],
    contraindications: ["Xuất huyết đang hoạt động", "Thai kỳ 3 tháng đầu", "Suy gan nặng"],
    sideEffects: ["Chảy máu bất thường", "Bầm tím dễ", "Hiếm: hoại tử da"],
    interactions: [
      { drug: "Aspirin", risk: "high", note: "Tăng nguy cơ chảy máu nghiêm trọng." },
      { drug: "Amoxicillin", risk: "moderate", note: "Kháng sinh có thể tăng INR." },
      { drug: "Paracetamol", risk: "moderate", note: "Dùng nhiều Paracetamol tăng INR." },
    ],
  },
];

const riskConfig = {
  high: { label: "Rủi ro cao", class: "bg-red-100 text-red-700 border-red-200", icon: "🔴" },
  moderate: { label: "Trung bình", class: "bg-amber-100 text-amber-700 border-amber-200", icon: "🟡" },
  low: { label: "Nhẹ", class: "bg-blue-100 text-blue-700 border-blue-200", icon: "🔵" },
};

export default function DrugLookup() {
  const [query, setQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(drugDatabase[0]);
  const [interactionCheck, setInteractionCheck] = useState<string[]>([]);
  const [checkResult, setCheckResult] = useState<Array<{d1: string; d2: string; interaction: typeof drugDatabase[0]["interactions"][0]}> | null>(null);

  const filtered = query
    ? drugDatabase.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.generic.toLowerCase().includes(query.toLowerCase()) ||
          d.category.toLowerCase().includes(query.toLowerCase())
      )
    : drugDatabase;

  const handleInteractionCheck = () => {
    if (interactionCheck.length < 2) return;
    const results: Array<{d1: string; d2: string; interaction: typeof drugDatabase[0]["interactions"][0]}> = [];
    
    for (let i = 0; i < interactionCheck.length; i++) {
      const drug1 = drugDatabase.find((d) => d.id === interactionCheck[i]);
      if (!drug1) continue;
      for (let j = i + 1; j < interactionCheck.length; j++) {
        const drug2 = drugDatabase.find((d) => d.id === interactionCheck[j]);
        if (!drug2) continue;
        const interaction = drug1.interactions.find((int) =>
          drug2.name.toLowerCase().includes(int.drug.toLowerCase()) ||
          int.drug.toLowerCase().includes(drug2.generic.toLowerCase())
        );
        if (interaction) {
          results.push({ d1: drug1.name, d2: drug2.name, interaction });
        }
      }
    }
    setCheckResult(results);
  };

  const toggleInteractionSelect = (id: string) => {
    setInteractionCheck((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setCheckResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
          Tra cứu Thuốc Nâng cao
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kho dữ liệu thuốc & kiểm tra tương tác để thiết lập kịch bản Chatbot chính xác
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: Drug List */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm thuốc, hoạt chất..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {/* Drug list */}
          <div className="space-y-2">
            {filtered.map((drug) => (
              <button
                key={drug.id}
                type="button"
                onClick={() => setSelectedDrug(drug)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 ${
                  selectedDrug?.id === drug.id
                    ? "border-emerald-200 bg-emerald-50 shadow-md shadow-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-emerald-100 hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    selectedDrug?.id === drug.id
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Pill className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{drug.name}</p>
                  <p className="truncate text-xs text-slate-400">{drug.category}</p>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${selectedDrug?.id === drug.id ? "text-emerald-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>

          {/* Interaction Checker */}
          <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-bold text-slate-800">Kiểm tra tương tác thuốc</p>
            </div>
            <p className="mb-3 text-xs text-slate-500">Chọn 2+ thuốc để kiểm tra tương tác:</p>
            <div className="space-y-1.5">
              {drugDatabase.map((d) => (
                <label
                  key={d.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                    interactionCheck.includes(d.id)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={interactionCheck.includes(d.id)}
                    onChange={() => toggleInteractionSelect(d.id)}
                    className="h-3.5 w-3.5 accent-emerald-600"
                  />
                  {d.name}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleInteractionCheck}
              disabled={interactionCheck.length < 2}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap className="h-4 w-4" />
              Kiểm tra ngay
            </button>

            {checkResult !== null && (
              <div className="mt-3 space-y-2">
                {checkResult.length === 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    ✓ Không phát hiện tương tác nguy hiểm
                  </div>
                ) : (
                  checkResult.map((r, i) => {
                    const risk = riskConfig[r.interaction.risk];
                    return (
                      <div key={i} className={`rounded-xl border px-3 py-2 text-xs ${risk.class}`}>
                        <p className="font-bold">
                          {risk.icon} {r.d1} × {r.d2}
                        </p>
                        <p className="mt-0.5">{r.interaction.note}</p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Drug Detail */}
        {selectedDrug ? (
          <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {selectedDrug.category}
                </span>
                <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-slate-900">
                  {selectedDrug.name}
                </h2>
                <p className="text-sm text-slate-500">Hoạt chất: {selectedDrug.generic}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <Pill className="h-6 w-6" />
              </div>
            </div>

            <div className="my-4 h-px bg-slate-100" />

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Dosage */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Liều dùng
                </p>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                  {selectedDrug.dosage}
                </div>
              </div>

              {/* Indications */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Chỉ định
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDrug.indications.map((ind) => (
                    <span key={ind} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contraindications */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Chống chỉ định
                </p>
                <div className="space-y-1.5">
                  {selectedDrug.contraindications.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-sm text-slate-700">
                      <X className="h-3.5 w-3.5 shrink-0 text-red-400" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Side effects */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Tác dụng phụ
                </p>
                <div className="space-y-1.5">
                  {selectedDrug.sideEffects.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-slate-700">
                      <Info className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactions */}
            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-bold text-slate-800">
                  Tương tác thuốc đã biết ({selectedDrug.interactions.length})
                </p>
              </div>
              <div className="space-y-2">
                {selectedDrug.interactions.map((int) => {
                  const risk = riskConfig[int.risk];
                  return (
                    <div key={int.drug} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${risk.class}`}>
                      <span className="mt-0.5 text-base">{risk.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{int.drug}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${risk.class}`}>
                            {risk.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-5">{int.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-[1.65rem] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
            <div className="text-center">
              <Pill className="mx-auto h-12 w-12 text-slate-200" />
              <p className="mt-4 text-sm text-slate-400">Chọn thuốc để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
