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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  {
    id: "FL-005",
    patientName: "Hoàng Quốc E",
    timestamp: "Hôm qua, 11:20",
    symptom: "Chóng mặt khi đứng dậy",
    chatbotAnswer: "Bạn có thể bị thiếu nước. Hãy uống thêm nước.",
    correctAnswer:
      "Chóng mặt khi đứng dậy (hạ huyết áp tư thế) có thể do nhiều nguyên nhân: mất nước, dùng thuốc hạ huyết áp, hoặc vấn đề tim mạch. Cần đo huyết áp ở nhiều tư thế và tư vấn bác sĩ.",
    flagReason: "incomplete",
    rating: 2,
    status: "pending",
  },
  {
    id: "FL-006",
    patientName: "Vũ Thị F",
    timestamp: "Hôm qua, 08:45",
    symptom: "Phát ban đỏ trên tay",
    chatbotAnswer: "Có thể do dị ứng. Dùng kem dưỡng da và tránh tiếp xúc.",
    correctAnswer:
      "Phát ban đỏ trên tay cần được đánh giá về màu sắc, hình dạng, có ngứa hay không, và các yếu tố kích hoạt. Có thể là chàm, vẩy nến, hoặc phản ứng dị ứng cần điều trị đặc hiệu.",
    flagReason: "incomplete",
    rating: 2,
    status: "approved",
  },
  {
    id: "FL-007",
    patientName: "Đặng Văn G",
    timestamp: "2 ngày trước, 15:30",
    symptom: "Đau đầu dữ dội đột ngột",
    chatbotAnswer: "Uống thuốc giảm đau và nghỉ ngơi trong phòng tối.",
    correctAnswer:
      "Đau đầu dữ dội xuất hiện đột ngột (\"thunderclap headache\") là dấu hiệu cảnh báo khẩn cấp có thể liên quan đến xuất huyết não. Cần gọi 115 hoặc đến cấp cứu ngay lập tức.",
    flagReason: "incorrect",
    rating: 1,
    status: "pending",
  },
  {
    id: "FL-008",
    patientName: "Ngô Thị H",
    timestamp: "2 ngày trước, 13:15",
    symptom: "Tiểu đêm nhiều lần",
    chatbotAnswer: "Bạn có thể đang uống nhiều nước. Hạn chế uống nước trước khi ngủ.",
    correctAnswer:
      "Tiểu đêm nhiều lần (nocturia) có thể do nhiều nguyên nhân: tiểu đường, phì đại tuyến tiền liệt, suy tim, hoặc nhiễm trùng đường tiết niệu. Cần thăm khám và làm xét nghiệm để xác định nguyên nhân.",
    flagReason: "incomplete",
    rating: 2,
    status: "pending",
  },
  {
    id: "FL-009",
    patientName: "Bùi Minh I",
    timestamp: "2 ngày trước, 10:00",
    symptom: "Mệt mỏi kéo dài không rõ nguyên nhân",
    chatbotAnswer: "Ngủ đủ giấc và ăn uống điều độ sẽ giúp bạn cảm thấy tốt hơn.",
    correctAnswer:
      "Mệt mỏi mãn tính cần được đánh giá toàn diện: thiếu máu, suy giáp, tiểu đường, trầm cảm, hoặc các bệnh lý mãn tính khác. Cần xét nghiệm máu cơ bản và tư vấn bác sĩ.",
    flagReason: "low_rating",
    rating: 2,
    status: "fixed",
  },
  {
    id: "FL-010",
    patientName: "Lý Thị J",
    timestamp: "3 ngày trước, 16:45",
    symptom: "Đau khớp gối khi leo cầu thang",
    chatbotAnswer: "Có thể do vận động nhiều. Nghỉ ngơi và chườm đá.",
    correctAnswer:
      "Đau khớp gối khi leo cầu thang có thể là dấu hiệu của viêm khớp, hội chứng đau xương bánh chè, hoặc tổn thương sụn. Cần chụp X-quang và thăm khám chuyên khoa cơ xương khớp.",
    flagReason: "incomplete",
    rating: 3,
    status: "pending",
  },
  {
    id: "FL-011",
    patientName: "Trương Văn K",
    timestamp: "3 ngày trước, 14:20",
    symptom: "Buồn nôn sau ăn",
    chatbotAnswer: "Có thể do ăn quá no hoặc thức ăn không hợp. Uống nước gừng.",
    correctAnswer:
      "Buồn nôn thường xuyên sau ăn có thể do viêm loét dạ dày, trào ngược dạ dày thực quản, hoặc hẹp môn vị. Cần nội soi dạ dày để chẩn đoán chính xác.",
    flagReason: "incomplete",
    rating: 2,
    status: "pending",
  },
  {
    id: "FL-012",
    patientName: "Đinh Thị L",
    timestamp: "3 ngày trước, 09:30",
    symptom: "Rụng tóc nhiều bất thường",
    chatbotAnswer: "Có thể do stress. Hãy thư giãn và bổ sung vitamin.",
    correctAnswer:
      "Rụng tóc nhiều có thể do nhiều nguyên nhân: thiếu sắt, suy giáp, rối loạn nội tiết, hoặc bệnh tự miễn (alopecia areata). Cần xét nghiệm hormone tuyến giáp và ferritin trước khi điều trị.",
    flagReason: "low_rating",
    rating: 2,
    status: "approved",
  },
  {
    id: "FL-013",
    patientName: "Cao Văn M",
    timestamp: "4 ngày trước, 17:10",
    symptom: "Tê bì tay chân",
    chatbotAnswer: "Ngồi lâu một tư thế gây tê. Hãy vận động nhiều hơn.",
    correctAnswer:
      "Tê bì tay chân kéo dài có thể do bệnh thần kinh ngoại biên liên quan đến tiểu đường, thiếu vitamin B12, hoặc hội chứng ống cổ tay. Cần khám thần kinh và làm điện cơ đồ.",
    flagReason: "incorrect",
    rating: 1,
    status: "pending",
  },
  {
    id: "FL-014",
    patientName: "Phan Thị N",
    timestamp: "4 ngày trước, 11:55",
    symptom: "Khó ngủ, mất ngủ nhiều đêm",
    chatbotAnswer: "Tắt điện thoại trước khi ngủ và tránh caffeine.",
    correctAnswer:
      "Mất ngủ mãn tính cần được đánh giá về nguyên nhân tâm lý (lo âu, trầm cảm) và thể chất (ngưng thở khi ngủ, đau mãn tính). Liệu pháp nhận thức hành vi cho mất ngủ (CBT-I) là lựa chọn đầu tay.",
    flagReason: "incomplete",
    rating: 3,
    status: "fixed",
  },
  {
    id: "FL-015",
    patientName: "Mai Văn O",
    timestamp: "4 ngày trước, 08:20",
    symptom: "Đau lưng dưới lan xuống chân",
    chatbotAnswer: "Căng cơ lưng. Massage và chườm nóng sẽ giúp ích.",
    correctAnswer:
      "Đau lưng dưới lan xuống chân (đau thần kinh tọa) có thể do thoát vị đĩa đệm. Cần chụp MRI cột sống thắt lưng và điều trị bởi bác sĩ chuyên khoa thần kinh hoặc cơ xương khớp.",
    flagReason: "incorrect",
    rating: 1,
    status: "pending",
  },
  {
    id: "FL-016",
    patientName: "Hà Thị P",
    timestamp: "5 ngày trước, 15:00",
    symptom: "Huyết áp cao 160/100 mmHg",
    chatbotAnswer: "Tránh muối và tập thể dục nhẹ.",
    correctAnswer:
      "Huyết áp 160/100 mmHg là tăng huyết áp giai đoạn 2 cần điều trị bằng thuốc ngay lập tức. Cần đến gặp bác sĩ để được kê đơn và theo dõi tránh biến chứng tim mạch, đột quỵ.",
    flagReason: "incorrect",
    rating: 1,
    status: "pending",
  },
  {
    id: "FL-017",
    patientName: "Trịnh Văn Q",
    timestamp: "5 ngày trước, 13:40",
    symptom: "Tiêu chảy 3 ngày liên tục",
    chatbotAnswer: "Uống nước nhiều và ăn cháo trắng.",
    correctAnswer:
      "Tiêu chảy kéo dài 3 ngày cần đánh giá về mức độ mất nước, màu sắc phân có máu không. Nếu có sốt hoặc máu trong phân cần đến cơ sở y tế ngay. Có thể cần bù điện giải oresol.",
    flagReason: "incomplete",
    rating: 2,
    status: "approved",
  },
  {
    id: "FL-018",
    patientName: "Lưu Thị R",
    timestamp: "5 ngày trước, 09:15",
    symptom: "Ngứa mắt, chảy nước mắt",
    chatbotAnswer: "Có thể do dị ứng phấn hoa. Dùng nước muối sinh lý rửa mắt.",
    correctAnswer:
      "Ngứa mắt và chảy nước mắt có thể do viêm kết mạc dị ứng, nhiễm khuẩn, hoặc khô mắt. Cần xác định nguyên nhân cụ thể trước khi dùng thuốc nhỏ mắt. Không tự ý dùng corticoid nhỏ mắt.",
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function AccuracyFeedbackMonitor() {
  const [items, setItems] = useState<FlaggedItem[]>(flaggedItems);
  const [expandedId, setExpandedId] = useState<string | null>("FL-001");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "fixed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const filtered = items.filter((i) =>
    filterStatus === "all" ? true : i.status === filterStatus
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    setExpandedId(null);
    setPageSizeOpen(false);
  };

  const handleFilterChange = (f: "all" | "pending" | "fixed") => {
    setFilterStatus(f);
    setCurrentPage(1);
    setExpandedId(null);
  };

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

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (safePage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (safePage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages);
    }
    return pages;
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
              onClick={() => handleFilterChange(f)}
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
        {paginated.length === 0 ? (
          <div className="rounded-[1.4rem] border border-slate-100 bg-white px-8 py-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-400">Không có mục nào phù hợp</p>
          </div>
        ) : (
          paginated.map((item) => {
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
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {item.id}
                      </span>
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
          })
        )}
      </div>

      {/* Pagination */}
      {(
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: info + page size selector */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-400">
              Hiển thị{" "}
              <span className="font-semibold text-slate-600">
                {filtered.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + itemsPerPage, filtered.length)}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-slate-600">{filtered.length}</span> mục
            </p>

            {/* Page size dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPageSizeOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
              >
                Hiển thị {itemsPerPage} dòng/trang
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${pageSizeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {pageSizeOpen && (
                <div className="absolute left-0 bottom-[calc(100%+6px)] z-20 min-w-[11rem] overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePageSizeChange(size)}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                        size === itemsPerPage
                          ? "bg-amber-50 font-bold text-amber-600"
                          : "font-medium text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {size === itemsPerPage && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                      <span className={size !== itemsPerPage ? "pl-3.5" : ""}>
                        Hiển thị {size} dòng/trang
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              type="button"
              onClick={() => { setCurrentPage(1); setExpandedId(null); }}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang đầu"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>

            {/* Prev page */}
            <button
              type="button"
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setExpandedId(null); }}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                >
                  ···
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => { setCurrentPage(page as number); setExpandedId(null); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    safePage === page
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                  }`}
                  aria-label={`Trang ${page}`}
                  aria-current={safePage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )
            )}

            {/* Next page */}
            <button
              type="button"
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); }}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang tiếp"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Last page */}
            <button
              type="button"
              onClick={() => { setCurrentPage(totalPages); setExpandedId(null); }}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang cuối"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
