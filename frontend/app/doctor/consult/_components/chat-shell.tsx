"use client";

import React, { useState } from "react";
import ChatWindow from "./chat-window";
import { Plus, FileText, CheckCircle2, Search } from "lucide-react";

type Patient = {
  id: string;
  name: string;
  note?: string;
  urgent?: boolean;
  unread?: number;
  online?: boolean;
};

export default function ChatShell({ patients = [] }: { patients?: Patient[] }) {
  const [selected, setSelected] = useState<string | null>(
    patients[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Messages for each patient
  const messagesByPatient: Record<
    string,
    Array<{
      id: string;
      from: "doctor" | "patient";
      text: string;
      time?: string;
    }>
  > = {
    "BN-9081": [
      {
        id: "1",
        from: "patient",
        text: "Chào bác sĩ Trí, tôi vừa uống thuốc hạ áp khẩn cấp nhưng vẫn buốt đau vùng chẩm sau tai.",
        time: "10:02",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào chị Mai, máy đo của chị hiển thị chỉ số 180/120 mmHg. Chị cần nằm bất động đầu cao 30 độ.",
        time: "10:04",
      },
      {
        id: "3",
        from: "patient",
        text: "Tôi đã nằm yên một chỗ rồi, nhờ bác sĩ kê đơn hoặc hướng dẫn cấp cứu giúp.",
        time: "10:05",
      },
    ],
    "BN-9082": [
      {
        id: "1",
        from: "patient",
        text: "Bác sĩ ơi, tôi chuẩn bị xuất viện. Cháu có cần phải làm gì thêm không?",
        time: "08:15",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Nam, chúc mừng anh sắp xuất viện. Anh cần tuân thủ hướng dẫn về thuốc và tái khám đúng hẹn nhé.",
        time: "08:17",
      },
      {
        id: "3",
        from: "patient",
        text: "Cảm ơn bác sĩ rất nhiều. Tôi sẽ tuân thủ đầy đủ.",
        time: "08:18",
      },
    ],
    "BN-9083": [
      {
        id: "1",
        from: "patient",
        text: "Bác sĩ ơi, tôi vừa kiểm tra glucose, con số hiện là 145 mg/dL. Có bình thường không bác?",
        time: "09:30",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Bảo, con số 145 mg/dL lúc đói là hơi cao một chút. Anh có dùng bữa sáng trước khi đo không?",
        time: "09:32",
      },
    ],
    "BN-9084": [
      {
        id: "1",
        from: "patient",
        text: "Chào bác sĩ, bụng dưới bên phải của tôi đau nhói liên tục từ sáng đến giờ, có kèm sốt nhẹ.",
        time: "10:10",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Hùng, đau hố chậu phải kèm sốt nhẹ là dấu hiệu cần cảnh giác viêm ruột thừa. Anh có bị buồn nôn không?",
        time: "10:12",
      },
    ],
    "BN-9085": [
      {
        id: "1",
        from: "patient",
        text: "Hôm nay là ngày thứ 4 tôi sốt rồi bác sĩ, người mỏi nhừ, nổi vài nốt đỏ trên tay.",
        time: "09:45",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào chị Lan, sốt xuất huyết ngày thứ 4 đến ngày thứ 7 là giai đoạn nguy hiểm. Chị cần theo dõi sát các dấu hiệu xuất huyết hoặc mệt lả.",
        time: "09:47",
      },
    ],
    "BN-9086": [
      {
        id: "1",
        from: "patient",
        text: "Tôi đang phun khí dung Ventolin cữ thứ 2 nhưng ngực vẫn thấy hơi co thắt nặng.",
        time: "08:50",
      },
      {
        id: "2",
        from: "doctor",
        text: "Anh Đức chú ý hít thở sâu và đều. Sau khi phun xong, tôi sẽ kiểm tra lại phế quản cho anh.",
        time: "08:52",
      },
    ],
    "BN-9087": [
      {
        id: "1",
        from: "patient",
        text: "Cứ nằm xuống là tôi thấy ngộp thở, phải ngồi dậy kê 3-4 gối mới thở được bác sĩ ơi.",
        time: "07:30",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào bà Hồng, khó thở khi nằm là triệu chứng của suy tim tiến triển. Bà hãy giữ nguyên tư thế ngồi và thở oxy nhé.",
        time: "07:35",
      },
    ],
    "BN-9088": [
      {
        id: "1",
        from: "patient",
        text: "Tôi bị nôn mửa và đi ngoài liên tục sau khi ăn hải sản tối qua. Giờ người mệt lả.",
        time: "09:15",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Tuấn, anh đang bị ngộ độc thực phẩm gây mất nước. Hãy uống Oresol từng ngụm nhỏ và theo dõi nhiệt độ.",
        time: "09:18",
      },
    ],
    "BN-9089": [
      {
        id: "1",
        from: "patient",
        text: "Bác sĩ xem giúp kết quả ECG vừa rồi của tôi có ổn định không?",
        time: "10:30",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Hải, nhịp tim của anh hiện tại dao động từ 72-78 nhịp/phút, không phát hiện ngoại tâm thu nguy hiểm. Tiếp tục theo dõi.",
        time: "10:32",
      },
    ],
    "BN-9090": [
      {
        id: "1",
        from: "patient",
        text: "Sáng nay tôi đo đường huyết đói lên tới 160 mg/dL, dù tối qua đã hạn chế tinh bột.",
        time: "06:45",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào cô Dung, cô cần duy trì liều tiêm Insulin buổi tối đúng giờ và ghi chép lại nhật ký đường huyết 3 ngày liên tục.",
        time: "06:50",
      },
    ],
    "BN-9091": [
      {
        id: "1",
        from: "patient",
        text: "Bình dẫn lưu màng phổi của tôi hôm nay ra dịch hồng nhạt, khoảng 50ml.",
        time: "08:00",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Khánh, lượng dịch và màu sắc như vậy là tiến triển tốt. Anh chú ý không để bình dẫn lưu cao hơn ngực nhé.",
        time: "08:05",
      },
    ],
    "BN-9092": [
      {
        id: "1",
        from: "patient",
        text: "Họng em nuốt đau buốt, nói chuyện khó khăn và có sốt nhẹ 38 độ.",
        time: "09:00",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào Vy, em cần súc họng bằng nước muối sinh lý ấm và hạn chế uống nước đá lạnh nhé.",
        time: "09:03",
      },
    ],
    "BN-9093": [
      {
        id: "1",
        from: "patient",
        text: "Ngón chân cái của tôi tự dưng sưng đỏ và đau dữ dội vào ban đêm, không đi lại được.",
        time: "07:15",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Long, sưng đau ngón cái cấp tính nghĩ nhiều đến cơn Gout cấp. Anh tránh ăn thịt đỏ và bia rượu lúc này.",
        time: "07:20",
      },
    ],
    "BN-9094": [
      {
        id: "1",
        from: "patient",
        text: "Khớp gối của tôi kêu lục cục khi đi lại và rất đau vào buổi sáng khi thức dậy.",
        time: "08:30",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào bác Mai, thoái hóa khớp gối cần vận động nhẹ nhàng kết hợp chườm ấm. Bác nhớ uống Glucosamine sau ăn.",
        time: "08:35",
      },
    ],
    "BN-9095": [
      {
        id: "1",
        from: "patient",
        text: "Dạo này tôi bị mất ngủ triền miên, trằn trọc đến 3 giờ sáng mới ngủ được chút ít.",
        time: "22:00",
      },
      {
        id: "2",
        from: "doctor",
        text: "Chào anh Quân, anh nên tắt thiết bị điện tử trước khi ngủ 1 tiếng và ngâm chân nước ấm để thư giãn thần kinh.",
        time: "22:05",
      },
    ],
  };

  const [messages, setMessages] = useState(() =>
    selected ? (messagesByPatient[selected] ?? []) : [],
  );

  const [messageInput, setMessageInput] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDraftByPatient, setAiDraftByPatient] = useState<
    Record<string, string | null>
  >({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Get current patient's draft
  const currentAiDraft = selected ? aiDraftByPatient[selected] : null;

  const showSuccessNotice = (actionName: string) => {
    setActionNotice(`${actionName} thành công`);
  };

  // Update messages when selected patient changes
  React.useEffect(() => {
    setMessages(selected ? (messagesByPatient[selected] ?? []) : []);
    setMessageInput("");
    setAiOpen(false);
  }, [selected]);

  const sampleSuggestions = [
    {
      id: "s1",
      text: "Cho phép bệnh nhân nằm bất động, nâng đầu cao 30 độ, theo dõi huyết áp 5-10 phút.",
    },
    {
      id: "s2",
      text: "Chuẩn bị thuốc hạ áp nhanh (Captopril 25mg) nếu huyết áp > 180/120 và theo dõi.",
    },
    {
      id: "s3",
      text: "Nếu có dấu thần kinh khu trú, chuyển viện gần nhất ngay lập tức.",
    },
  ];

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const next = {
      id: String(Date.now()),
      from: "doctor" as const,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((m) => [...m, next]);
    setMessageInput("");
    showSuccessNotice("Gửi tin nhắn");
  };

  const insertSuggestion = (text: string) => {
    setMessageInput(text);
    showSuccessNotice("Chèn gợi ý");
  };

  const generateDraft = () => {
    if (!selected) return;

    // If draft exists already, toggle the draft content only (do not close the panel)
    if (aiDraftByPatient[selected]) {
      setAiDraftByPatient((prev) => ({
        ...prev,
        [selected]: null,
      }));
      return;
    }

    // Otherwise generate a new draft and ensure the AI panel is open
    const summary = `Bệnh nhân: ${messages
      .filter((m) => m.from === "patient")
      .map((m) => m.text)
      .join(" ")}`;

    const suggestion =
      "Gợi ý: Cân nhắc dùng Captopril 25mg uống ngay, theo dõi huyết áp, chuẩn bị chuyển viện nếu cần.";

    setAiDraftByPatient((prev) => ({
      ...prev,
      [selected]: `${summary}\n\n${suggestion}`,
    }));
    setAiOpen(true);
    showSuccessNotice("Tạo AI Draft");
  };

  React.useEffect(() => {
    if (!actionNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setActionNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  // Filter patients list based on search query
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="relative flex h-[95vh] overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      {actionNotice ? (
        <div className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      <div className="w-80 border-r border-slate-100 p-4 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
            Hộp thư tư vấn trực tuyến
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100 placeholder-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 scrollbar-thin">
          {/* Group patients into sections: urgent, follow-up, completed */}
          {(() => {
            const urgent = filteredPatients.filter((p) => p.urgent);
            const followUp = filteredPatients.filter((p) => !p.urgent && p.online);
            const completed = filteredPatients.filter((p) => !p.urgent && !p.online);

            if (filteredPatients.length === 0) {
              return (
                <div className="py-8 text-center text-sm text-slate-400">
                  Không tìm thấy bệnh nhân nào
                </div>
              );
            }

            const renderPatientButton = (p: typeof filteredPatients[0], isCompleted = false) => {
              const isSelected = selected === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                      : isCompleted
                        ? "bg-white hover:bg-slate-50 border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.02)] opacity-70 hover:opacity-100"
                        : "bg-white hover:bg-slate-50 border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.02)]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? "bg-white/30 text-white"
                          : p.urgent
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    {!p.urgent && p.online && (
                      <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-sm font-semibold leading-none">
                        {p.name}
                      </span>
                      <span className={`text-[10px] shrink-0 font-medium ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                        {p.id}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className={isSelected ? "text-white/80" : "text-slate-500"}>
                        {p.note || "Ca bệnh"}
                      </span>
                      {p.unread ? (
                        <span className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1.5 text-[9px] font-bold ${
                          isSelected ? "bg-white text-emerald-600" : "bg-rose-600 text-white"
                        }`}>
                          {p.unread}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            };

            return (
              <div className="space-y-4">
                {urgent.length > 0 && (
                  <section>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-rose-600">
                        Cần ưu tiên gấp
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {urgent.map((p) => renderPatientButton(p))}
                    </div>
                  </section>
                )}

                {followUp.length > 0 && (
                  <section>
                    <div className="mb-2 px-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Lịch hẹn theo dõi
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {followUp.map((p) => renderPatientButton(p))}
                    </div>
                  </section>
                )}

                {completed.length > 0 && (
                  <section>
                    <div className="mb-2 px-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Đã hoàn thành
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {completed.map((p) => renderPatientButton(p, true))}
                    </div>
                  </section>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="relative flex-1 transition-all duration-300 ease-in-out">
        <ChatWindow
          selectedPatient={patients.find((p) => p.id === selected)}
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={sendMessage}
          aiOpen={aiOpen}
          toggleAi={() => setAiOpen((v) => !v)}
        />
      </div>

      <div className="relative">
        {/* backdrop overlay when AI panel open */}
        {aiOpen ? (
          <div className="absolute inset-0 z-20 bg-black/20 transition-opacity" />
        ) : null}
      </div>

      <aside
        className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out ${aiOpen ? "w-80 p-4" : "w-0 p-0 overflow-hidden"} border-l border-slate-100 bg-[#fbfefe]`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700">
              GEMINI COPILOT CHAT
            </h4>
            <div className="inline-flex items-center gap-2">
              <button
                onClick={generateDraft}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition transform duration-150 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                aria-label="Generate AI draft"
              >
                <FileText className="h-4 w-4" /> AI Draft
              </button>
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4">
            {currentAiDraft ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-slate-800">
                  TÓM TẮT CA BỆNH NHANH
                </div>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {currentAiDraft}
                </p>
                <button
                  onClick={() => {
                    const suggestionIndex = currentAiDraft.indexOf("Gợi ý: ");
                    const suggestionText =
                      suggestionIndex !== -1
                        ? currentAiDraft.substring(suggestionIndex + 7)
                        : currentAiDraft;
                    insertSuggestion(suggestionText);
                  }}
                  className="mt-3 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition transform duration-150 hover:bg-emerald-700 hover:scale-105 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  SỬ DỤNG GỢI Ý NÀY
                </button>
              </div>
            ) : null}

            <div className="text-xs font-semibold text-slate-500">
              Phác đồ/đoạn trả lời nhanh
            </div>

            <div className="space-y-3">
              {sampleSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="text-sm text-slate-700">{s.text}</div>
                  <button
                    onClick={() => insertSuggestion(s.text)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition transform duration-150 hover:scale-110 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    title="Chèn vào ô nhập"
                    aria-label={`Chèn gợi ý: ${s.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
