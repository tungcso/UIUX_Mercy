export type ConsultCaseType = "ai" | "doctor" | "emergency";
export type ConsultCaseSeverity = "low" | "medium" | "high";
export type ConsultMessageRole = "assistant" | "patient";
export type ConsultMessageTone = "normal" | "card" | "warning";

export type ConsultMessage = {
  id: string;
  role: ConsultMessageRole;
  text: string;
  time: string;
  tone?: ConsultMessageTone;
  title?: string;
  subtitle?: string;
  bullets?: string[];
};

export type ConsultCase = {
  id: string;
  type: ConsultCaseType;
  typeLabel: string;
  title: string;
  subtitle: string;
  status: string;
  time: string;
  tag?: string;
  severity: ConsultCaseSeverity;
  messages: ConsultMessage[];
  quickReplies: string[];
};

const emergencyCase: ConsultCase = {
  id: "emergency-chest-pain",
  type: "emergency",
  typeLabel: "Khẩn cấp",
  title: "Đau ngực nhẹ",
  subtitle: "Triệu chứng cần ưu tiên theo dõi ngay",
  status: "Khẩn cấp",
  time: "Vừa xong",
  tag: "Tim mạch",
  severity: "high",
  quickReplies: ["Hỗ trợ khẩn", "Kết nối bác sĩ", "Gọi cấp cứu"],
  messages: [
    {
      id: "emergency-welcome",
      role: "assistant",
      tone: "warning",
      text: "Tôi ghi nhận đây là case khẩn. Nếu đau tăng, khó thở hoặc choáng, hãy chọn hỗ trợ khẩn hoặc gọi cấp cứu ngay.",
      time: "09:30",
    },
    {
      id: "emergency-guide",
      role: "assistant",
      tone: "card",
      title: "Cần làm ngay",
      subtitle: "Để hỗ trợ an toàn hơn, hãy trả lời ngắn gọn theo từng điểm sau.",
      bullets: ["Đau ở vị trí nào", "Có lan ra tay/hàm không", "Có khó thở hay chóng mặt không"],
      time: "09:31",
      text: "",
    },
  ],
};

const consultCases: ConsultCase[] = [
  {
    id: "headache-3d",
    type: "ai",
    typeLabel: "AI",
    title: "Đau đầu kéo dài",
    subtitle: "3 ngày gần đây, chưa có dấu hiệu nguy hiểm rõ rệt",
    status: "Đang tư vấn",
    time: "2 phút trước",
    tag: "Thần kinh",
    severity: "medium",
    quickReplies: ["Tôi có chóng mặt", "Tôi bị buồn nôn", "Gửi ảnh kết quả"],
    messages: [
      {
        id: "headache-welcome",
        role: "assistant",
        text: "Bạn đã bị đau đầu 3 ngày. Bạn có kèm chóng mặt, sốt hoặc buồn nôn không?",
        time: "09:30",
      },
      {
        id: "headache-card",
        role: "assistant",
        tone: "card",
        title: "Khung tư vấn hiện tại",
        subtitle: "Mình đang theo dõi triệu chứng theo hướng loại trừ yếu tố nguy hiểm.",
        bullets: ["Thời điểm bắt đầu", "Mức độ đau", "Yếu tố làm nặng hơn"],
        time: "09:31",
        text: "",
      },
    ],
  },
  {
    id: "fever-cough",
    type: "doctor",
    typeLabel: "Bác sĩ",
    title: "Ho và sốt",
    subtitle: "Đang chờ bác sĩ hô hấp xem lại triệu chứng",
    status: "Cần theo dõi",
    time: "Hôm qua",
    tag: "Hô hấp",
    severity: "medium",
    quickReplies: ["Sốt bao nhiêu độ", "Tôi bị đau họng", "Tôi muốn đặt lịch khám"],
    messages: [
      {
        id: "fever-welcome",
        role: "assistant",
        text: "Tôi là bác sĩ trực tuyến. Bạn cho biết nhiệt độ sốt, thời gian sốt và có kèm ho khan hay đờm không?",
        time: "11:20",
      },
    ],
  },
  {
    id: "follow-up-meds",
    type: "ai",
    typeLabel: "AI",
    title: "Tư vấn thuốc huyết áp",
    subtitle: "Case đang theo dõi định kỳ sau khi điều chỉnh thuốc",
    status: "Đã hoàn thành",
    time: "T2",
    tag: "Nội khoa",
    severity: "low",
    quickReplies: ["Tôi muốn xem lại liều", "Tôi có tác dụng phụ", "Gửi ảnh toa thuốc"],
    messages: [
      {
        id: "meds-welcome",
        role: "assistant",
        text: "Bạn muốn mình xem lại cách uống thuốc hay kiểm tra tác dụng phụ của thuốc hiện tại?",
        time: "08:12",
      },
    ],
  },
  emergencyCase,
];

export const defaultConsultCase = consultCases[0];

export function getConsultCase(caseId: string) {
  return consultCases.find((item) => item.id === caseId) ?? null;
}

function formatTopicQuestion(topic: string) {
  return `Mình đã ghi nhận chủ đề ${topic}. Bạn mô tả thêm thời gian bắt đầu, mức độ và yếu tố làm nặng hơn nhé.`;
}

export function buildConsultCase(
  caseId: string,
  options?: {
    topic?: string | null;
    mode?: ConsultCaseType | null;
    emergency?: boolean;
  },
): ConsultCase {
  const existingCase = getConsultCase(caseId);
  if (existingCase) {
    return existingCase;
  }

  const topic = options?.topic?.trim();
  const mode = options?.emergency ? "emergency" : options?.mode ?? "ai";
  const title = topic
    ? topic
    : mode === "doctor"
      ? "Tư vấn mới cùng bác sĩ"
      : mode === "emergency"
        ? "Hỗ trợ khẩn"
        : "Tư vấn mới";
  const subtitle = topic
    ? "Ca mới với ngữ cảnh từ chủ đề đã chọn"
    : mode === "doctor"
      ? "Trao đổi trực tiếp với bác sĩ"
      : mode === "emergency"
        ? "Ưu tiên xử lý khẩn"
        : "Bắt đầu từ mô tả triệu chứng";
  const status = mode === "emergency" ? "Khẩn cấp" : "Đang tư vấn";
  const typeLabel =
    mode === "doctor" ? "Bác sĩ" : mode === "emergency" ? "Khẩn cấp" : "AI";
  const severity: ConsultCaseSeverity = mode === "emergency" ? "high" : topic ? "medium" : "low";

  return {
    id: caseId,
    type: mode,
    typeLabel,
    title,
    subtitle,
    status,
    time: "Vừa tạo",
    tag: mode === "doctor" ? "Bác sĩ trực tuyến" : mode === "emergency" ? "Ưu tiên" : "AI hỗ trợ",
    severity,
    quickReplies:
      mode === "emergency"
        ? ["Hỗ trợ khẩn", "Kết nối bác sĩ", "Gọi cấp cứu"]
        : ["Tôi muốn mô tả thêm", "Tôi có ảnh kết quả", "Tôi cần đặt lịch"],
    messages: topic
      ? [
          {
            id: `${caseId}-topic`,
            role: "assistant",
            text: formatTopicQuestion(topic),
            time: "09:30",
          },
          {
            id: `${caseId}-card`,
            role: "assistant",
            tone: "card",
            title: "Gợi ý ban đầu",
            subtitle: "Hãy nói ngắn gọn theo 3 ý để hệ thống nắm đúng case bệnh.",
            bullets: ["Triệu chứng chính", "Bao lâu rồi", "Mức độ ảnh hưởng"],
            time: "09:31",
            text: "",
          },
        ]
      : mode === "emergency"
        ? emergencyCase.messages
        : [
            {
              id: `${caseId}-welcome`,
              role: "assistant",
              text:
                mode === "doctor"
                  ? "Tôi sẽ theo dõi case này như một ca lâm sàng đang mở. Bạn mô tả thêm triệu chứng theo từng thời điểm nhé."
                  : "Xin chào, tôi là Trợ lý Y tế AI. Bạn mô tả triệu chứng hoặc gửi ảnh để tôi hỗ trợ nhanh hơn.",
              time: "09:30",
            },
          ],
  };
}
