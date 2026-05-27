"use client";

import { useState } from "react";
import {
  Flag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Edit3,
  SendHorizonal,
  X,
} from "lucide-react";

type FlaggedItem = {
  id: string;
  patientName: string;
  timestamp: string;
  symptom: string;
  chatbotAnswer: string;
  correctAnswer: string;
  flagReason: "incorrect" | "incomplete" | "low_rating";
  rating: number;
  status: "pending" | "fixed" | "approved";
};

const flaggedItems: FlaggedItem[] = [
  {
    id: "FL-001",
    patientName: "Nguyễn Văn A",
    timestamp: "Hôm nay, 09:14",
    symptom: "Sốt 39.5°C kéo dài 2 ngày",
    chatbotAnswer:
      "Bạn có thể uống paracetamol 500mg và nghỉ ngơi. Uống nhiều nước.",
    correctAnswer:
      "Sốt trên 39°C kéo dài hơn 48h cần đi khám ngay. Uống paracetamol 500mg mỗi 4-6h nếu cần, nhưng phải đến cơ sở y tế để loại trừ nguyên nhân nhiễm trùng nặng.",
    flagReason: "incomplete",
    rating: 2,
    status: "pending",
  },
  {
    id: "FL-002",
    patientName: "Trần Thị B",
    timestamp: "Hôm nay, 10:52",
    symptom: "Đau ngực kèm khó thở",
    chatbotAnswer: "Có thể do căng thẳng hoặc trào ngược dạ dày.",
    correctAnswer:
      "Đau ngực kèm khó thở là dấu hiệu nguy hiểm, cần gọi cấp cứu 115 ngay lập tức hoặc đến phòng cấp cứu. Không tự điều trị tại nhà.",
    flagReason: "incorrect",
    rating: 1,
    status: "pending",
  },
  {
    id: "FL-003",
    patientName: "Lê Minh C",
    timestamp: "Hôm qua, 16:30",
    symptom: "Ho khan 1 tuần, không sốt",
    chatbotAnswer: "Ho khan kéo dài có thể do dị ứng hoặc khô họng.",
    correctAnswer:
      "Ho khan kéo dài trên 1 tuần cần được bác sĩ khám để loại trừ viêm phế quản mãn tính, hen suyễn hoặc các bệnh đường hô hấp. Nên đặt lịch khám.",
    flagReason: "low_rating",
    rating: 2,
    status: "pending",
  },
  {
    id: "FL-004",
    patientName: "Phạm Thu D",
    timestamp: "Hôm qua, 14:05",
    symptom: "Đau bụng dưới liên tục",
    chatbotAnswer: "Có thể do đầy hơi. Uống trà gừng và nghỉ ngơi.",
    correctAnswer:
      "Đau bụng dưới liên tục có thể là dấu hiệu của nhiều bệnh lý. Cần xác định vị trí, tính chất đau và các triệu chứng đi kèm để chẩn đoán chính xác.",
    flagReason: "incomplete",
    rating: 3,
    status: "fixed",
  },
];

const flagReasonLabel: Record<FlaggedItem["flagReason"], { label: string; class: string }> = {
  incorrect: { label: "Sai thông tin", class: "bg-red-100 text-red-700 border-red-200" },
  incomplete: { label: "Thiếu thông tin", class: "bg-amber-100 text-amber-700 border-amber-200" },
  low_rating: { label: "Đánh giá thấp", class: "bg-orange-100 text-orange-700 border-orange-200" },
};

export default function AccuracyFeedbackMonitor() {
  const [items, setItems] = useState<FlaggedItem[]>(flaggedItems);
  const [expandedId, setExpandedId] = useState<string | null>("FL-001");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "fixed">("all");

  const filtered = items.filter((i) =>
    filterStatus === "all" ? true : i.status === filterStatus
  );

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "approved" } : item
      )
    );
    setEditingId(null);
  };

  const handleSave = (id: string) => {
    const newText = editTexts[id];
    if (!newText?.trim()) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, correctAnswer: newText, status: "fixed" }
          : item
      )
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
            Trình Theo dõi Phản hồi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Phát hiện và vá các lỗ hổng kiến thức của Chatbot
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["all", "pending", "fixed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterStatus(f)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                filterStatus === f
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f === "all" ? "Tất cả" : f === "pending" ? "Chờ xử lý" : "Đã sửa"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng gắn cờ", value: items.length.toString(), color: "text-slate-900" },
          {
            label: "Chờ xử lý",
            value: items.filter((i) => i.status === "pending").length.toString(),
            color: "text-amber-600",
          },
          {
            label: "Đã duyệt hôm nay",
            value: items.filter((i) => i.status === "approved").length.toString(),
            color: "text-emerald-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.4rem] border border-slate-100 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {stat.label}
            </p>
            <p className={`mt-1.5 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Flagged Conversations List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const reason = flagReasonLabel[item.flagReason];
          const isExpanded = expandedId === item.id;
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-sm transition-all ${
                item.status === "approved"
                  ? "border-emerald-200 bg-emerald-50/30"
                  : item.status === "fixed"
                  ? "border-blue-100"
                  : "border-slate-200"
              }`}
            >
              {/* Header row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${reason.class}`}
                >
                  <Flag className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {item.patientName}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${reason.class}`}>
                      {reason.label}
                    </span>
                    {item.status === "approved" && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        ✓ Đã duyệt
                      </span>
                    )}
                    {item.status === "fixed" && (
                      <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        Đã sửa
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                    Triệu chứng: {item.symptom}
                  </p>
                  <p className="text-xs text-slate-400">{item.timestamp}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= item.rating ? "text-amber-400" : "text-slate-200"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Chatbot Answer */}
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-rose-400" />
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-500">
                          Câu trả lời của Chatbot (Bị gắn cờ)
                        </p>
                      </div>
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        {item.chatbotAnswer}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                            Câu trả lời chuẩn xác
                          </p>
                        </div>
                        {!isEditing && item.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTexts((prev) => ({
                                ...prev,
                                [item.id]: item.correctAnswer,
                              }));
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Chỉnh sửa
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div>
                          <textarea
                            value={editTexts[item.id] || item.correctAnswer}
                            onChange={(e) =>
                              setEditTexts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="min-h-28 w-full resize-none rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSave(item.id)}
                              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
                            >
                              <SendHorizonal className="h-4 w-4" />
                              Lưu & Cập nhật training
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                              <X className="h-4 w-4" />
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-slate-700">
                          {item.correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!isEditing && item.status === "pending" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Duyệt & Đưa vào training data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
