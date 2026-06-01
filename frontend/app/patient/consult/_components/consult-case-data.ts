import { getTriageReplies, triageQuickReplies } from "./triage-quick-replies";

export type ConsultCaseType = "ai" | "doctor" | "emergency";
export type ConsultCaseSeverity = "low" | "medium" | "high";
export type ConsultMessageRole = "assistant" | "patient" | "system";
export type ConsultMessageKind =
  | "text"
  | "question"
  | "medical-info"
  | "recommendation"
  | "emergency"
  | "system";

export type ConsultAction = {
  label: string;
  value: string;
  tone?: "primary" | "secondary" | "danger";
};

export type ConsultMessageCard = {
  name: string;
  description: string;
  details?: string;
  actions?: ConsultAction[];
};

export type ConsultMessage = {
  id: string;
  role: ConsultMessageRole;
  kind?: ConsultMessageKind;
  text: string;
  time: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  quickReplies?: string[];
  card?: ConsultMessageCard;
  actions?: ConsultAction[];
};

export type ConsultCase = {
  id: string;
  type: ConsultCaseType;
  typeLabel: string;
  title: string;
  subtitle: string;
  status: string;
  duration: string;
  time: string;
  tag?: string;
  severity: ConsultCaseSeverity;
  messages: ConsultMessage[];
  quickReplies: string[];
};

const emergencyActions: ConsultAction[] = [
  { label: "Gọi 115", value: "call-emergency", tone: "danger" },
  { label: "Kết nối bác sĩ", value: "connect-doctor", tone: "primary" },
  { label: "AI hỗ trợ khẩn", value: "urgent-ai", tone: "danger" },
];

const emergencyCase: ConsultCase = {
  id: "emergency-chest-pain",
  type: "emergency",
  typeLabel: "Khẩn cấp",
  title: "Đau ngực nhẹ",
  subtitle: "Triệu chứng cần ưu tiên theo dõi ngay",
  status: "Khẩn cấp",
  duration: "Trong hôm nay",
  time: "Vừa xong",
  tag: "Tim mạch",
  severity: "high",
  quickReplies: ["Đau tăng", "Khó thở", "Choáng", "Gọi cấp cứu"],
  messages: [
    {
      id: "emergency-context",
      role: "system",
      kind: "system",
      text: "Cuộc trò chuyện được AI gắn cờ khẩn sau khi bệnh nhân mô tả đau ngực tăng dần kèm khó thở và vã mồ hôi.",
      time: "09:24",
    },
    {
      id: "emergency-patient-1",
      role: "patient",
      kind: "text",
      text: "Mình thấy tức ngực bên trái từ khoảng 20 phút trước, lúc đầu nhẹ nên nghĩ do mệt.",
      time: "09:25",
    },
    {
      id: "emergency-assistant-1",
      role: "assistant",
      kind: "question",
      text: "Mình đã ghi nhận đau/tức ngực bên trái. Cơn đau có lan ra tay, vai, hàm hoặc lưng không? Bạn có khó thở, vã mồ hôi hay choáng không?",
      time: "09:26",
      quickReplies: ["Đau lan tay trái", "Có khó thở", "Vã mồ hôi", "Không có"],
    },
    {
      id: "emergency-patient-2",
      role: "patient",
      kind: "text",
      text: "Có hơi lan xuống tay trái, mình cũng thấy khó thở hơn và đang ra mồ hôi lạnh.",
      time: "09:27",
    },
    {
      id: "emergency-assistant-2",
      role: "assistant",
      kind: "question",
      text: "Các dấu hiệu này cần được ưu tiên. Bạn đang ở một mình không, có thể ngồi nghỉ ngay và nhờ người bên cạnh hỗ trợ gọi cấp cứu không?",
      time: "09:28",
      quickReplies: ["Đang ở một mình", "Có người bên cạnh", "Đau tăng", "Choáng"],
    },
    {
      id: "emergency-patient-3",
      role: "patient",
      kind: "text",
      text: "Mình đang ở nhà một mình, cơn tức ngực tăng hơn và hơi choáng.",
      time: "09:29",
    },
    {
      id: "emergency-warning",
      role: "assistant",
      kind: "emergency",
      title: "Triệu chứng có thể cần xử trí khẩn",
      text: "Đau ngực kèm khó thở, vã mồ hôi, choáng hoặc đau lan ra tay/hàm có thể cần được hỗ trợ y tế ngay.",
      time: "09:30",
      actions: emergencyActions,
    },
  ],
};

export const consultCases: ConsultCase[] = [
  emergencyCase,
  {
    id: "headache-3d",
    type: "ai",
    typeLabel: "AI",
    title: "Đau đầu kéo dài",
    subtitle: "Đang được AI theo dõi và nhắc chăm sóc tại nhà",
    status: "Đang được chăm sóc",
    duration: "3 ngày",
    time: "2 phút trước",
    tag: "Thần kinh",
    severity: "medium",
    quickReplies: ["<1 ngày", "1-3 ngày", ">3 ngày", "Có chóng mặt"],
    messages: [
      {
        id: "headache-context",
        role: "system",
        kind: "system",
        text: "Case đang được AI theo dõi. Đã ghi nhận đau đầu kéo dài 3 ngày và bắt đầu chăm sóc tại nhà.",
        time: "09:29",
      },
      {
        id: "p1",
        role: "patient",
        kind: "text",
        text: "Mình bị đau đầu suốt 3 ngày nay.",
        time: "09:30",
      },
      {
        id: "headache-welcome",
        role: "assistant",
        kind: "question",
        text: "Bạn cho biết cơn đau xuất hiện liên tục hay từng cơn? Mình sẽ theo dõi sát để hỗ trợ bạn.",
        time: "09:31",
        quickReplies: [
          "Liên tục",
          "Từng cơn",
          "Đau tăng dần",
          "Đau khi cúi đầu",
        ],
      },
      {
        id: "p2",
        role: "patient",
        kind: "text",
        text: "Thường là từng cơn, có lúc kéo dài hơn.",
        time: "09:32",
      },
      {
        id: "headache-care1",
        role: "assistant",
        kind: "text",
        text: "Mình đã ghi nhận. Bạn hãy uống đủ nước, nghỉ trong phòng yên tĩnh và tránh nhìn màn hình quá lâu.",
        time: "09:33",
      },
      {
        id: "headache-med-card",
        role: "assistant",
        kind: "medical-info",
        text: "",
        time: "09:34",
        card: {
          name: "Hướng dẫn ban đầu",
          description: "Gợi ý dùng thuốc giảm đau và theo dõi triệu chứng.",
          details: "Nếu có nôn, sốt cao hoặc liệt mặt, cần khám ngay.",
          actions: [
            { label: "Liều dùng", value: "dosage", tone: "primary" },
            { label: "Tác dụng phụ", value: "side-effects" },
          ],
        },
      },
      {
        id: "p3",
        role: "patient",
        kind: "text",
        text: "Mình đã uống paracetamol nhưng chưa giảm nhiều.",
        time: "09:35",
      },
      {
        id: "headache-care2",
        role: "assistant",
        kind: "text",
        text: "Mình sẽ tiếp tục theo dõi. Nếu đau tăng, chóng mặt hoặc buồn nôn, hãy báo lại ngay để được hỗ trợ thêm.",
        time: "09:36",
      },
      {
        id: "headache-rec",
        role: "assistant",
        kind: "recommendation",
        title: "Gợi ý bước tiếp theo",
        text: "Hiện tại bạn đang được theo dõi tại nhà. Nếu đau không giảm hoặc kèm triệu chứng mới, nên khám chuyên khoa Thần kinh.",
        time: "09:37",
        actions: [
          { label: "Đặt lịch khám", value: "book", tone: "primary" },
          { label: "Tìm bác sĩ", value: "find-doctors" },
        ],
      },
    ],
  },
  {
    id: "fever-cough",
    type: "doctor",
    typeLabel: "Bác sĩ",
    title: "Ho và sốt",
    subtitle: "Bác sĩ đang chăm sóc và theo dõi triệu chứng hô hấp",
    status: "Đang được chăm sóc",
    duration: "2 ngày",
    time: "Hôm qua",
    tag: "Hô hấp",
    severity: "medium",
    quickReplies: [
      "Sốt bao nhiêu độ?",
      "Ho có đờm",
      "Đau họng",
      "Đặt lịch khám",
    ],
    messages: [
      {
        id: "f-p1",
        role: "patient",
        kind: "text",
        text: "Hôm nay mình sốt và ho khan.",
        time: "11:18",
      },
      {
        id: "fever-welcome",
        role: "assistant",
        kind: "text",
        text: "Bạn cho biết nhiệt độ sốt, thời gian sốt và có kèm ho khan hay đờm không? Mình sẽ theo dõi cùng bạn.",
        time: "11:20",
      },
      {
        id: "f-p2",
        role: "patient",
        kind: "text",
        text: "Khoảng 2 ngày, có ho khan và mệt mỏi.",
        time: "11:21",
      },
      {
        id: "fever-care1",
        role: "assistant",
        kind: "text",
        text: "Bạn nghỉ ngơi nhiều hơn, uống đủ nước ấm và hạn chế ra gió lạnh. Mình đã ghi chú để bác sĩ theo dõi.",
        time: "11:21",
      },
      {
        id: "fever-question",
        role: "assistant",
        kind: "question",
        text: "Nhiệt độ cao nhất bạn đo được là bao nhiêu?",
        time: "11:21",
        quickReplies: ["<38°C", "38-39°C", ">39°C", "Chưa đo"],
      },
      {
        id: "f-p3",
        role: "patient",
        kind: "text",
        text: "Chưa đo nhưng thấy ớn lạnh.",
        time: "11:22",
      },
      {
        id: "fever-care2",
        role: "assistant",
        kind: "text",
        text: "Mình khuyên bạn đo nhiệt độ ngay khi có thể và nhắn lại. Nếu sốt cao hơn, bác sĩ sẽ điều chỉnh chăm sóc phù hợp.",
        time: "11:22",
      },
      {
        id: "fever-rec",
        role: "assistant",
        kind: "recommendation",
        title: "Chuyên khoa phù hợp",
        text: "Hiện tại bạn đang được bác sĩ theo dõi. Nếu sốt kéo dài trên 48 giờ hoặc khó thở, cần khám Hô hấp hoặc cấp cứu tùy mức độ.",
        time: "11:23",
        actions: [
          { label: "Đặt lịch", value: "book", tone: "primary" },
          { label: "Tìm bác sĩ", value: "find-doctors" },
        ],
      },
    ],
  },
  {
    id: "follow-up-meds",
    type: "ai",
    typeLabel: "AI",
    title: "Tư vấn thuốc huyết áp",
    subtitle: "Đang được theo dõi định kỳ sau khi điều chỉnh thuốc",
    status: "Đã hoàn thành",
    duration: "Theo dõi định kỳ",
    time: "T2",
    tag: "Nội khoa",
    severity: "low",
    quickReplies: ["Xem lại liều", "Có tác dụng phụ", "Gửi ảnh toa thuốc"],
    messages: [
      {
        id: "m-p1",
        role: "patient",
        kind: "text",
        text: "Bác sĩ ơi, tôi muốn hỏi về cách uống thuốc huyết áp.",
        time: "08:10",
      },
      {
        id: "meds-welcome",
        role: "assistant",
        kind: "text",
        text: "Bạn muốn mình xem lại cách uống thuốc hay kiểm tra tác dụng phụ của thuốc hiện tại?",
        time: "08:12",
      },
      {
        id: "m-p2",
        role: "patient",
        kind: "text",
        text: "Tôi đang uống thuốc A vào buổi sáng, liệu có cần chia liều?",
        time: "08:13",
      },
      {
        id: "meds-card",
        role: "assistant",
        kind: "medical-info",
        text: "",
        time: "08:14",
        card: {
          name: "Theo dõi thuốc huyết áp",
          description:
            "Không tự ý ngừng hoặc đổi liều thuốc huyết áp nếu chưa có hướng dẫn của bác sĩ.",
          details:
            "Ghi lại huyết áp sáng/tối, nhịp tim và triệu chứng bất thường để bác sĩ đánh giá.",
          actions: [
            { label: "Cách theo dõi", value: "monitoring", tone: "primary" },
            { label: "Tác dụng phụ", value: "side-effects" },
            { label: "Lưu", value: "save" },
          ],
        },
      },
      {
        id: "m-p3",
        role: "patient",
        kind: "text",
        text: "Tôi có thỉnh thoảng chóng mặt sau khi đổi thuốc.",
        time: "08:16",
      },
      {
        id: "m-assess1",
        role: "assistant",
        kind: "text",
        text: "Chóng mặt có thể do thay đổi huyết áp hoặc tác dụng phụ; ghi lại biểu đồ huyết áp 1 tuần để đánh giá.",
        time: "08:18",
      },
      {
        id: "m-p4",
        role: "patient",
        kind: "text",
        text: "Được, tôi sẽ ghi lại và gửi ảnh kết quả nếu có.",
        time: "08:19",
      },
      {
        id: "m-assess2",
        role: "assistant",
        kind: "recommendation",
        title: "Kết luận",
        text: "Nếu không còn triệu chứng nặng, tiếp tục theo dõi tại nhà. Ghi huyết áp sáng/tối và gửi ảnh cho bác sĩ nếu có dấu hiệu bất thường.",
        time: "08:20",
        actions: [
          {
            label: "Xem lịch trình theo dõi",
            value: "monitor",
            tone: "primary",
          },
        ],
      },
      {
        id: "m-p5",
        role: "patient",
        kind: "text",
        text: "Tôi đã ghi lại 3 ngày rồi, trung bình 130/80, không có triệu chứng nặng.",
        time: "08:22",
      },
      {
        id: "m-assess3",
        role: "assistant",
        kind: "text",
        text: "Kết quả ổn định. Tiếp tục theo dõi tuần tiếp theo. Nếu huyết áp thường >140/90, báo cho bác sĩ để điều chỉnh.",
        time: "08:23",
      },
      {
        id: "m-p6",
        role: "patient",
        kind: "text",
        text: "Cảm ơn bác sĩ. Tôi sẽ tiếp tục theo dõi.",
        time: "08:24",
      },
      {
        id: "m-note",
        role: "assistant",
        kind: "text",
        text: "Ghi chú: Không phát hiện dấu hiệu cảnh báo cấp cứu trong giai đoạn theo dõi này.",
        time: "08:25",
      },
      {
        id: "m-completed",
        role: "system",
        kind: "system",
        text: "Đã hoàn thành — ca tư vấn này đã kết thúc và lưu vào lịch sử. Bạn có thể xem lại mọi lúc.",
        time: "08:26",
      },
    ],
  },
];

export const defaultConsultCase = consultCases[0];

export function getConsultCase(caseId: string) {
  return consultCases.find((item) => item.id === caseId) ?? null;
}

function normalizeCaseTitle(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (firstChar) => firstChar.toUpperCase());
}

function formatTopicQuestion(topic: string) {
  const normalizedTopic = topic.toLowerCase();

  if (normalizedTopic.includes("hỏi về bệnh")) {
    return "Tôi có thể giúp giải thích về bệnh, triệu chứng hoặc tình trạng sức khỏe mà bạn đang quan tâm.\n\nBạn muốn hỏi về điều gì?";
  }

  if (normalizedTopic.includes("tư vấn thuốc") || normalizedTopic.includes("thuốc")) {
    return "Tôi có thể giúp giải thích cách dùng thuốc, tác dụng phụ và những lưu ý quan trọng.";
  }

  if (normalizedTopic.includes("xét nghiệm") || normalizedTopic.includes("kết quả")) {
    return "Bạn có thể tải lên kết quả xét nghiệm hoặc ảnh chụp để tôi phân tích sơ bộ.";
  }

  if (normalizedTopic.includes("gặp bác sĩ")) {
    return "Tôi sẽ giúp bạn kết nối với chuyên khoa phù hợp.";
  }

  if (normalizedTopic.includes("khác")) {
    return "Hãy mô tả ngắn vấn đề bạn cần hỗ trợ.";
  }

  if (normalizedTopic.includes("emergency")) {
    return "Nếu bạn đang gặp tình trạng nghiêm trọng, hãy trả lời nhanh các câu hỏi sau.";
  }

  if (normalizedTopic.includes("đau ngực")) {
    return "Tôi cần đánh giá nhanh mức độ nguy hiểm của cơn đau ngực.\n\nHiện tại cơn đau ở mức nào?";
  }

  if (normalizedTopic.includes("khó thở")) {
    return "Tình trạng khó thở xuất hiện khi nào?";
  }

  if (normalizedTopic.includes("sốt")) {
    return "Bạn đã sốt bao lâu?";
  }

  if (normalizedTopic.includes("ho")) {
    return "Tôi sẽ hỗ trợ đánh giá tình trạng ho của bạn.\n\nBạn ho bao lâu rồi?";
  }

  if (normalizedTopic.includes("đau đầu")) {
    return "Tôi sẽ giúp đánh giá tình trạng đau đầu của bạn.\n\nCơn đau đầu bắt đầu từ khi nào?";
  }

  if (normalizedTopic.includes("đau bụng")) {
    return "Vị trí đau bụng gần đúng ở đâu?";
  }

  return `Tôi sẽ giúp đánh giá vấn đề ${topic}. Trước tiên: triệu chứng hoặc thắc mắc này bắt đầu từ khi nào?`;
}

function getTopicQuickReplies(topic: string) {
  const normalizedTopic = topic.toLowerCase();

  if (normalizedTopic.includes("hỏi về bệnh")) {
    return [
      "Tôi vừa được chẩn đoán bệnh",
      "Muốn hiểu triệu chứng",
      "Muốn biết mức độ nguy hiểm",
      "Muốn biết cách điều trị",
      "Muốn biết khi nào cần đi khám",
    ];
  }

  if (normalizedTopic.includes("tư vấn thuốc") || normalizedTopic.includes("thuốc")) {
    return [...triageQuickReplies.medication].slice(0, 5);
  }

  if (normalizedTopic.includes("xét nghiệm") || normalizedTopic.includes("kết quả")) {
    return ["Tải ảnh xét nghiệm", "Tải file PDF", "Xét nghiệm máu", "Nước tiểu", "Chẩn đoán hình ảnh"];
  }

  if (normalizedTopic.includes("gặp bác sĩ")) {
    return [...triageQuickReplies.doctorRouting].slice(0, 5);
  }

  if (normalizedTopic.includes("khác")) {
    return [
      "Tôi không chắc triệu chứng",
      "Muốn hỏi nhiều vấn đề cùng lúc",
      "Muốn được AI hướng dẫn",
      "Nhập nội dung thủ công",
    ];
  }

  if (normalizedTopic.includes("emergency")) {
    return ["Đau ngực", "Khó thở", "Ngất xỉu", "Co giật", "Chảy máu nhiều", "Khác"];
  }

  if (normalizedTopic.includes("đau ngực")) {
    return ["Nhẹ", "Trung bình", "Nặng", "Rất nặng"];
  }

  if (normalizedTopic.includes("khó thở")) {
    return ["Vừa xuất hiện", "Hôm nay", "Vài ngày nay", "Hơn 1 tuần"];
  }

  if (normalizedTopic.includes("sốt")) {
    return ["Mới bắt đầu", "1 ngày", "2-3 ngày", "Hơn 3 ngày", "Không rõ"];
  }

  if (normalizedTopic.includes("ho")) {
    return ["Hôm nay", "2-3 ngày", "Dưới 1 tuần", "Hơn 1 tuần", "Hơn 1 tháng"];
  }

  if (normalizedTopic.includes("đau đầu")) {
    return ["Vài giờ trước", "Hôm nay", "2-3 ngày nay", "Hơn 1 tuần", "Không nhớ rõ"];
  }

  if (normalizedTopic.includes("đau bụng")) {
    return ["Trên rốn", "Dưới rốn", "Bên trái", "Bên phải", "Khắp bụng"];
  }

  return getTriageReplies("onset").slice(2, 6);
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

  const topic = options?.topic ? normalizeCaseTitle(options.topic) : "";
  const mode = options?.emergency ? "emergency" : (options?.mode ?? "ai");
  const title = topic
    ? topic
    : mode === "doctor"
      ? "Tư vấn mới cùng bác sĩ"
      : mode === "emergency"
        ? "Hỗ trợ khẩn"
        : "Tư vấn mới";
  const subtitle = topic
    ? "Đang đánh giá bằng câu hỏi triage"
    : mode === "doctor"
      ? "Trao đổi trực tiếp với bác sĩ"
      : mode === "emergency"
        ? "Ưu tiên xử lý khẩn"
        : "Bắt đầu từ mô tả triệu chứng";
  const status = mode === "emergency" ? "Khẩn cấp" : "Đang đánh giá";
  const typeLabel =
    mode === "doctor" ? "Bác sĩ" : mode === "emergency" ? "Khẩn cấp" : "AI";
  const severity: ConsultCaseSeverity =
    mode === "emergency" ? "high" : topic ? "medium" : "low";

  return {
    id: caseId,
    type: mode,
    typeLabel,
    title,
    subtitle,
    status,
    duration: topic ? "Mới tạo" : "Chưa xác định",
    time: "Vừa tạo",
    tag:
      mode === "doctor"
        ? "Bác sĩ trực tuyến"
        : mode === "emergency"
          ? "Ưu tiên"
          : "AI hỗ trợ",
    severity,
    quickReplies:
      mode === "emergency"
        ? ["Hỗ trợ khẩn", "Kết nối bác sĩ", "Gọi cấp cứu"]
      : ["<1 ngày", "1-3 ngày", ">3 ngày", "Gửi ảnh kết quả"],
    messages: topic
      ? [
          {
            id: `${caseId}-created`,
            role: "system",
            kind: "system",
            text: "NEW → Đang đánh giá. Consultation đã được tạo và AI bắt đầu thu thập thông tin.",
            time: "09:29",
          },
          {
            id: `${caseId}-topic`,
            role: "assistant",
            kind: "question",
            text: formatTopicQuestion(topic),
            time: "09:30",
            quickReplies: getTopicQuickReplies(topic),
          },
        ]
      : mode === "emergency"
        ? emergencyCase.messages
        : [
            {
              id: `${caseId}-welcome`,
              role: "assistant",
              kind: "question",
              text:
                mode === "doctor"
                  ? "Tôi sẽ theo dõi case này như một ca lâm sàng đang mở. Triệu chứng bắt đầu từ khi nào?"
                  : "Xin chào, tôi là Trợ lý Y tế AI. Triệu chứng chính của bạn bắt đầu từ khi nào?",
              time: "09:30",
              quickReplies: ["Hôm nay", "1-3 ngày", ">3 ngày", "Không rõ"],
            },
          ],
  };
}
