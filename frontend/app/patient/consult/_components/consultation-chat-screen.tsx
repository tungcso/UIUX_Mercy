"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  Camera,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Mic,
  PhoneCall,
  Pill,
  Stethoscope,
  Upload,
  X,
} from "lucide-react";
import ChatHeader from "./ChatHeader";
import ConversationList from "./ConversationList";
import InputBar from "./InputBar";
import {
  type ConsultAction,
  type ConsultCase,
  type ConsultMessage,
} from "./consult-case-data";
import { triageQuickReplies } from "./triage-quick-replies";

type AiPhase = "analyzing" | "evaluating" | "generating" | "image" | null;
type SheetState =
  | "case-info"
  | "status"
  | "attachments"
  | "voice"
  | "emergency"
  | null;
type UploadIntent = "image" | "lab" | "medical-file";

const storedConsultCasesKey = "mercy-patient-consult-cases";

const dangerousSymptoms = [
  "cannot breathe",
  "chest pain",
  "fainted",
  "bleeding heavily",
  "khó thở",
  "đau ngực",
  "ngất",
  "chảy máu nhiều",
];

function getTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function detectEmergency(text: string) {
  const lowerText = text.toLowerCase();
  return dangerousSymptoms.some((keyword) => lowerText.includes(keyword));
}

function isPersistableConsultCase(caseId: string) {
  const defaultMockIds = [
    "headache-3d",
    "fever-cough",
    "follow-up-meds",
    "emergency-chest-pain",
  ];
  return (
    caseId === "new" ||
    /^(ai|doctor|emergency)-\d+$/.test(caseId) ||
    defaultMockIds.includes(caseId)
  );
}

function persistOpenedConsultCase(consultCase: ConsultCase) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(storedConsultCasesKey);
    const storedCases = raw ? (JSON.parse(raw) as ConsultCase[]) : [];
    const safeStoredCases = Array.isArray(storedCases) ? storedCases : [];
    const nextCases = [
      consultCase,
      ...safeStoredCases.filter((caseItem) => caseItem.id !== consultCase.id),
    ];

    window.localStorage.setItem(storedConsultCasesKey, JSON.stringify(nextCases));
  } catch {
    // Ignore storage failures; the active chat still works.
  }
}

function readStoredConsultCase(caseId: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storedConsultCasesKey);
    const storedCases = raw ? (JSON.parse(raw) as ConsultCase[]) : [];
    if (!Array.isArray(storedCases)) return null;
    return storedCases.find((caseItem) => caseItem.id === caseId) ?? null;
  } catch {
    return null;
  }
}

function buildEmergencyMessage(): ConsultMessage {
  return {
    id: `emergency-${Date.now()}`,
    role: "assistant",
    kind: "emergency",
    title: "Triệu chứng có thể cần xử trí khẩn",
    text: "Nội dung bạn vừa nhập có dấu hiệu nguy hiểm. Nếu triệu chứng đang nặng lên, hãy kết nối bác sĩ hoặc gọi cấp cứu ngay.",
    time: getTimeLabel(),
    actions: [
      { label: "Gọi 115", value: "call-emergency", tone: "danger" },
      { label: "Kết nối bác sĩ", value: "connect-doctor", tone: "primary" },
    ],
  };
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildRecommendation(
  title: string,
  text: string,
  actions: ConsultAction[] = [
    { label: "Đặt lịch khám", value: "book", tone: "primary" },
    { label: "Tìm bác sĩ", value: "find-doctors" },
  ],
): ConsultMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    kind: "recommendation",
    title,
    text,
    time: getTimeLabel(),
    actions,
  };
}

function buildQuestion(
  text: string,
  quickReplies: string[],
): ConsultMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    kind: "question",
    text,
    time: getTimeLabel(),
    quickReplies,
  };
}

function getConversationText(messages: ConsultMessage[]) {
  return messages
    .map((message) => `${message.title ?? ""} ${message.text}`)
    .join(" ")
    .toLowerCase();
}

type SymptomScenario =
  | "chest-pain"
  | "breathing"
  | "fever"
  | "cough"
  | "headache"
  | "abdominal-pain"
  | "condition"
  | "doctor"
  | "other"
  | "emergency-menu"
  | "medicine"
  | "lab"
  | null;

function detectScenario(contextText: string): SymptomScenario {
  if (includesAny(contextText, ["emergency case", "ngất xỉu", "co giật", "chảy máu nhiều"])) {
    return "emergency-menu";
  }
  if (includesAny(contextText, ["hỏi về bệnh", "chẩn đoán bệnh", "mức độ nguy hiểm", "cách điều trị"])) {
    return "condition";
  }
  if (includesAny(contextText, ["gặp bác sĩ", "khám tim mạch", "khám thần kinh", "khám hô hấp", "khám tiêu hóa", "khám khoa"])) {
    return "doctor";
  }
  if (includesAny(contextText, ["khác", "không chắc triệu chứng", "hỏi nhiều vấn đề", "ai hướng dẫn"])) {
    return "other";
  }
  if (includesAny(contextText, ["đau ngực", "tức ngực"])) return "chest-pain";
  if (includesAny(contextText, ["khó thở", "thở hụt", "hụt hơi"])) {
    return "breathing";
  }
  if (includesAny(contextText, ["đau bụng", "bụng"])) return "abdominal-pain";
  if (includesAny(contextText, ["đau đầu", "nhức đầu"])) return "headache";
  if (includesAny(contextText, ["sốt", "nóng", "ớn lạnh", "38", "39"])) {
    return "fever";
  }
  if (includesAny(contextText, ["ho", "đờm", "đau họng", "sổ mũi"])) {
    return "cough";
  }
  if (includesAny(contextText, ["thuốc", "paracetamol", "liều"])) {
    return "medicine";
  }
  if (includesAny(contextText, ["xét nghiệm", "máu", "pdf", "kết quả"])) {
    return "lab";
  }
  return null;
}

function buildFollowUpRecommendation(
  title: string,
  text: string,
): ConsultMessage {
  return buildRecommendation(title, `${text}\n\nBạn muốn làm gì tiếp theo?`, [
    { label: "Đặt lịch gặp bác sĩ", value: "book", tone: "primary" },
    { label: "Bác sĩ tư vấn", value: "connect-doctor", tone: "primary" },
    { label: "Tiếp tục tư vấn", value: "continue-consult" },
  ]);
}

function buildSymptomReply(
  text: string,
  messages: ConsultMessage[],
): ConsultMessage | null {
  const lowerText = text.toLowerCase();
  const conversationText = getConversationText(messages);
  const contextText = `${conversationText} ${lowerText}`;
  const scenario = detectScenario(contextText);
  const patientMessageCount = messages.filter(
    (message) => message.role === "patient",
  ).length;
  const hasDuration = includesAny(contextText, [
    "hôm nay",
    "giờ",
    "ngày",
    "1-3",
    ">3",
    "vài",
    "mới",
  ]);
  const hasSeverity = includesAny(contextText, [
    "nhẹ",
    "vừa",
    "nặng",
    "tăng",
    "giảm",
    "không đỡ",
    "dữ dội",
  ]);
  const hasRedFlag = includesAny(contextText, [
    "khó thở",
    "đau ngực",
    "choáng",
    "ngất",
    "lơ mơ",
    "mờ mắt",
    "yếu",
    "liệt",
    "nôn nhiều",
    ">39",
    "39",
  ]);
  const hasFeverNumber = includesAny(contextText, ["<38", "38-39", ">39", "38", "39"]);
  const hasCoughType = includesAny(contextText, ["ho khan", "có đờm", "đờm"]);
  const hasHeadacheAssociated = includesAny(contextText, [
    "chóng mặt",
    "buồn nôn",
    "mờ mắt",
    "đau tăng",
  ]);

  if ((scenario === "chest-pain" || scenario === "breathing") && hasRedFlag) {
    return buildEmergencyMessage();
  }

  if (scenario === "emergency-menu") {
    if (includesAny(contextText, ["đau ngực"])) {
      if (patientMessageCount === 1) {
        return buildQuestion("Bạn có khó thở không?", [
          "Không",
          "Có nhẹ",
          "Có rõ rệt",
          "Rất khó thở",
        ]);
      }
      if (patientMessageCount === 2) {
        return buildQuestion("Cơn đau hiện tại ở mức nào?", [
          "Nhẹ",
          "Trung bình",
          "Nặng",
          "Rất nặng",
        ]);
      }
    }

    if (includesAny(contextText, ["rất khó thở", "rất nặng", "ngất", "co giật", "chảy máu"])) {
      return buildRecommendation(
        "Dấu hiệu có thể cần xử trí khẩn",
        "Dấu hiệu hiện tại có thể cần được đánh giá y tế khẩn cấp.",
        [
          { label: "Gọi cấp cứu", value: "call-emergency", tone: "danger" },
          { label: "Tìm bệnh viện gần nhất", value: "find-hospital", tone: "primary" },
          { label: "Liên hệ bác sĩ", value: "connect-doctor", tone: "primary" },
          { label: "Tiếp tục trả lời", value: "continue-consult" },
        ],
      );
    }

    return buildQuestion(
      "Bạn đang gặp tình trạng nào cần hỗ trợ khẩn?",
      ["Đau ngực", "Khó thở", "Ngất xỉu", "Co giật", "Chảy máu nhiều", "Khác"],
    );
  }

  if (scenario === "condition") {
    if (includesAny(lowerText, ["tôi vừa được chẩn đoán bệnh"])) {
      return buildQuestion("Bạn được chẩn đoán bệnh gì?", [
        "Tiểu đường",
        "Tăng huyết áp",
        "Viêm họng",
        "Viêm dạ dày",
        "Khác",
      ]);
    }

    if (includesAny(lowerText, ["muốn hiểu triệu chứng"])) {
      return buildQuestion("Triệu chứng nào bạn muốn tìm hiểu?", [
        "Đau đầu",
        "Ho",
        "Sốt",
        "Đau ngực",
        "Khó thở",
        "Khác",
      ]);
    }

    if (patientMessageCount <= 1) {
      return buildQuestion("Bạn muốn hỏi về điều gì?", [
        "Tôi vừa được chẩn đoán bệnh",
        "Muốn hiểu triệu chứng",
        "Muốn biết mức độ nguy hiểm",
        "Muốn biết cách điều trị",
        "Muốn biết khi nào cần đi khám",
      ]);
    }

    return buildFollowUpRecommendation(
      "Giải thích sơ bộ về bệnh",
      "Mình đã ghi nhận nội dung bạn quan tâm. AI có thể giải thích ý nghĩa, mức độ cần theo dõi và các dấu hiệu nên đi khám, nhưng chẩn đoán/kế hoạch điều trị cuối cùng cần bác sĩ đối chiếu với triệu chứng, tiền sử và xét nghiệm.",
    );
  }

  if (scenario === "doctor") {
    if (includesAny(lowerText, ["tôi chưa biết khám khoa nào"])) {
      return buildQuestion("Bạn đang gặp vấn đề gì?", [
        "Đau đầu",
        "Đau ngực",
        "Ho kéo dài",
        "Đau bụng",
        "Mất ngủ",
        "Khác",
      ]);
    }

    if (includesAny(contextText, ["đau ngực", "khám tim mạch"])) {
      return buildRecommendation("Đề xuất chuyên khoa", "Tôi đề xuất chuyên khoa phù hợp là Tim mạch.", [
        { label: "Đặt lịch ngay", value: "book", tone: "primary" },
        { label: "Xem bác sĩ phù hợp", value: "connect-doctor", tone: "primary" },
        { label: "Tiếp tục tư vấn AI", value: "continue-consult" },
      ]);
    }

    if (includesAny(contextText, ["đau đầu", "khám thần kinh", "mất ngủ"])) {
      return buildRecommendation("Đề xuất chuyên khoa", "Tôi đề xuất chuyên khoa phù hợp là Thần kinh.", [
        { label: "Đặt lịch ngay", value: "book", tone: "primary" },
        { label: "Xem bác sĩ phù hợp", value: "connect-doctor", tone: "primary" },
        { label: "Tiếp tục tư vấn AI", value: "continue-consult" },
      ]);
    }

    if (includesAny(contextText, ["ho", "khám hô hấp"])) {
      return buildRecommendation("Đề xuất chuyên khoa", "Tôi đề xuất chuyên khoa phù hợp là Hô hấp.", [
        { label: "Đặt lịch ngay", value: "book", tone: "primary" },
        { label: "Xem bác sĩ phù hợp", value: "connect-doctor", tone: "primary" },
        { label: "Tiếp tục tư vấn AI", value: "continue-consult" },
      ]);
    }

    if (includesAny(contextText, ["đau bụng", "khám tiêu hóa"])) {
      return buildRecommendation("Đề xuất chuyên khoa", "Tôi đề xuất chuyên khoa phù hợp là Tiêu hóa.", [
        { label: "Đặt lịch ngay", value: "book", tone: "primary" },
        { label: "Xem bác sĩ phù hợp", value: "connect-doctor", tone: "primary" },
        { label: "Tiếp tục tư vấn AI", value: "continue-consult" },
      ]);
    }

    return buildQuestion(
      "Bạn muốn kết nối theo hướng nào?",
      [...triageQuickReplies.doctorRouting].slice(0, 5),
    );
  }

  if (scenario === "other") {
    if (includesAny(lowerText, ["tôi không chắc triệu chứng"])) {
      return buildQuestion("Điều gì làm bạn lo lắng nhất hiện tại?", [
        "Đau",
        "Sốt",
        "Khó thở",
        "Mệt mỏi",
        "Kết quả xét nghiệm",
      ]);
    }

    if (patientMessageCount <= 1) {
      return buildQuestion("Hãy chọn cách bắt đầu phù hợp nhất.", [
        "Tôi không chắc triệu chứng",
        "Muốn hỏi nhiều vấn đề cùng lúc",
        "Muốn được AI hướng dẫn",
        "Nhập nội dung thủ công",
      ]);
    }

    return buildQuestion(
      "Mình sẽ đi từng vấn đề một. Bạn muốn bắt đầu với nhóm nào trước?",
      ["Đau", "Sốt", "Khó thở", "Mệt mỏi", "Kết quả xét nghiệm"],
    );
  }

  if (scenario === "chest-pain") {
    if (patientMessageCount === 1) {
      return buildQuestion(
        "Bạn có khó thở không?",
        ["Không", "Hơi khó thở", "Khó thở rõ rệt", "Rất khó thở"],
      );
    }
    if (patientMessageCount === 2) {
      return buildQuestion(
        "Cơn đau có lan sang vùng nào không?",
        ["Không", "Tay trái", "Vai", "Hàm", "Lưng"],
      );
    }
    if (patientMessageCount === 3) {
      return buildQuestion(
        "Cơn đau xuất hiện khi nào?",
        ["Vừa mới xảy ra", "Hôm nay", "Vài ngày nay", "Lâu hơn"],
      );
    }

    return buildFollowUpRecommendation(
      "Đánh giá sơ bộ đau ngực",
      "Nếu đau ngực nhẹ, không lan, không khó thở và không choáng, nguy cơ trước mắt có thể thấp hơn. Bạn nên nghỉ ngơi, tránh gắng sức, theo dõi 30-60 phút và đặt lịch khám nếu còn lặp lại. Nếu đau tăng, lan tay/hàm, khó thở, vã mồ hôi hoặc choáng, hãy gọi cấp cứu ngay.",
    );
  }

  if (scenario === "breathing") {
    if (patientMessageCount === 1) {
      return buildQuestion(
        "Khó thở xảy ra trong trường hợp nào?",
        ["Khi nghỉ ngơi", "Khi vận động", "Khi nằm", "Liên tục"],
      );
    }
    if (patientMessageCount === 2) {
      return buildQuestion(
        "Bạn có triệu chứng nào đi kèm không?",
        ["Đau ngực", "Ho", "Sốt", "Chóng mặt", "Không có"],
      );
    }

    return buildFollowUpRecommendation(
      "Đánh giá sơ bộ khó thở",
      "Nếu khó thở nhẹ và chỉ xuất hiện khi vận động, bạn nên nghỉ, ngồi thẳng, tránh gắng sức và theo dõi thêm. Nếu khó thở khi nghỉ, nặng lên nhanh, tím môi, đau ngực hoặc không nói được câu dài, cần gọi cấp cứu hoặc kết nối bác sĩ ngay.",
    );
  }

  if (scenario === "fever") {
    if (patientMessageCount === 1) {
      return buildQuestion(
        "Nhiệt độ cao nhất bạn đo được là bao nhiêu?",
        ["Dưới 38°C", "38-39°C", "39-40°C", "Trên 40°C", "Chưa đo"],
      );
    }
    if (patientMessageCount === 2) {
      return buildQuestion(
        "Có triệu chứng nào đi kèm không?",
        ["Ho", "Đau họng", "Đau đầu", "Tiêu chảy", "Không có"],
      );
    }

    if (hasRedFlag || includesAny(contextText, ["trên 40", "39-40", "hơn 3 ngày", "lơ mơ"])) {
      return buildFollowUpRecommendation(
        "Sốt cần được theo dõi sát",
        "Bạn có dấu hiệu cần chú ý hơn. Hãy đo nhiệt độ lại, uống đủ nước, nghỉ ngơi và cân nhắc đặt lịch khám trong ngày. Nếu sốt trên 39°C, lơ mơ, khó thở, co giật, phát ban lan nhanh hoặc không hạ sau thuốc hạ sốt đúng liều, cần liên hệ bác sĩ/cấp cứu.",
      );
    }

    return buildFollowUpRecommendation(
      "Hướng xử trí sốt",
      "Hiện tại có thể theo dõi tại nhà nếu sốt không cao và không có dấu hiệu nguy hiểm. Hãy uống đủ nước, nghỉ ngơi, mặc đồ thoáng, đo nhiệt độ mỗi 4-6 giờ và dùng thuốc hạ sốt đúng liều nếu phù hợp. Nếu sốt kéo dài trên 48 giờ hoặc xuất hiện triệu chứng mới, nên đặt lịch khám.",
    );
  }

  if (scenario === "cough") {
    if (patientMessageCount === 1) {
      return buildQuestion(
        "Loại ho nào gần giống nhất?",
        ["Ho khan", "Ho có đờm", "Ho từng cơn", "Ho về đêm", "Không rõ"],
      );
    }
    if (patientMessageCount === 2) {
      return buildQuestion(
        "Bạn có kèm triệu chứng nào sau đây?",
        ["Sốt", "Đau họng", "Khó thở", "Sổ mũi", "Không có"],
      );
    }

    if (hasRedFlag || includesAny(contextText, ["đờm vàng", "đờm xanh", "ho ra máu"])) {
      return buildFollowUpRecommendation(
        "Ho cần khám sớm hơn",
        "Ho kèm sốt cao, khó thở, đau ngực, ho ra máu hoặc đờm vàng/xanh kéo dài nên được bác sĩ đánh giá. Bạn nên uống nước ấm, tránh khói bụi/lạnh và đặt lịch khám Hô hấp nếu triệu chứng không giảm.",
      );
    }

    return buildFollowUpRecommendation(
      "Hướng xử trí ho",
      "Nếu ho nhẹ, không khó thở và không sốt cao, bạn có thể uống nước ấm, giữ ấm cổ, tránh khói bụi/lạnh và theo dõi thêm. Nếu ho kéo dài trên 7 ngày, sốt cao, đau ngực hoặc khó thở, nên khám chuyên khoa Hô hấp.",
    );
  }

  if (scenario === "headache") {
    if (patientMessageCount === 1) {
      return buildQuestion(
        "Mức độ đau hiện tại như thế nào?",
        ["Nhẹ", "Trung bình", "Khá đau", "Rất đau", "Không chịu nổi"],
      );
    }
    if (patientMessageCount === 2) {
      return buildQuestion(
        "Bạn có triệu chứng nào kèm theo không?",
        ["Buồn nôn", "Chóng mặt", "Sốt", "Mờ mắt", "Không có"],
      );
    }

    if (hasRedFlag) {
      return buildFollowUpRecommendation(
        "Đau đầu cần theo dõi sát",
        "Đau đầu kèm mờ mắt, nôn nhiều, yếu/liệt, nói khó, sốt cao hoặc đau tăng nhanh cần được bác sĩ đánh giá sớm. Nếu triệu chứng đang nặng lên, nên đặt lịch khám chuyên khoa Thần kinh hoặc đi cấp cứu tùy mức độ.",
      );
    }

    return buildFollowUpRecommendation(
      "Hướng xử trí đau đầu",
      "Hiện tại có thể theo dõi nếu đau đầu nhẹ/vừa và không có dấu hiệu nguy hiểm. Bạn nên nghỉ trong phòng yên tĩnh, uống đủ nước, ngủ đủ, tránh nhìn màn hình lâu. Nếu kéo dài trên 3 ngày, tái diễn nhiều lần hoặc không giảm sau chăm sóc ban đầu, nên đặt lịch khám.",
    );
  }

  if (scenario === "abdominal-pain") {
    if (patientMessageCount === 1) {
      return buildQuestion(
        "Mức độ đau hiện tại?",
        ["Nhẹ", "Trung bình", "Đau nhiều", "Rất đau"],
      );
    }
    if (patientMessageCount === 2) {
      return buildQuestion(
        "Có triệu chứng nào đi kèm không?",
        ["Buồn nôn", "Nôn", "Tiêu chảy", "Táo bón", "Không có"],
      );
    }

    if (includesAny(contextText, ["rất đau", "nôn", "đau nhiều", "bên phải"])) {
      return buildFollowUpRecommendation(
        "Đau bụng cần khám sớm",
        "Đau bụng kèm sốt, nôn nhiều, đau tăng dần, đau khu trú bên phải hoặc đau khi ấn vào cần được bác sĩ đánh giá sớm. Bạn nên hạn chế tự dùng thuốc giảm đau mạnh trước khi khám vì có thể che lấp triệu chứng.",
      );
    }

    return buildFollowUpRecommendation(
      "Hướng xử trí đau bụng",
      "Nếu đau bụng nhẹ, không sốt, không nôn nhiều và vẫn ăn uống được, bạn có thể nghỉ ngơi, uống đủ nước, ăn thức ăn mềm và theo dõi thêm. Nếu đau kéo dài, tăng dần hoặc kèm sốt/nôn/tiêu chảy nhiều, nên đặt lịch khám.",
    );
  }

  if (scenario === "medicine") {
    if (includesAny(lowerText, ["cách dùng thuốc"])) {
      return buildQuestion(
        "Bạn đang muốn hỏi loại thuốc nào?",
        [...triageQuickReplies.medication].slice(5, 11),
      );
    }

    if (includesAny(lowerText, ["quên uống thuốc"])) {
      return buildQuestion(
        "Bạn quên thuốc bao lâu rồi?",
        ["Dưới 2 giờ", "2-6 giờ", "Hơn 6 giờ", "Không nhớ rõ"],
      );
    }

    if (patientMessageCount <= 1) {
      return buildQuestion(
        "Bạn muốn hỏi nội dung nào về thuốc?",
        [...triageQuickReplies.medication].slice(0, 5),
      );
    }

    return buildRecommendation(
      "Tư vấn thuốc sơ bộ",
      "Bạn không nên tự tăng/giảm liều hoặc ngừng thuốc nếu chưa có hướng dẫn của bác sĩ. Hãy kiểm tra đúng tên thuốc, hàm lượng, số lần dùng trong ngày và báo ngay nếu có dị ứng, khó thở, phát ban, chóng mặt nặng hoặc triệu chứng bất thường sau khi dùng.",
      [
        { label: "Đặt lịch khám", value: "book", tone: "primary" },
        { label: "Tác dụng phụ", value: "side-effects" },
      ],
    );
  }

  if (scenario === "lab") {
    if (patientMessageCount <= 1) {
      return buildQuestion(
        "Bạn muốn tải hoặc đọc loại kết quả nào?",
        [...triageQuickReplies.labResults].slice(0, 5),
      );
    }

    if (includesAny(contextText, ["tải ảnh", "tải file", "pdf", "ảnh"])) {
      return buildQuestion(
        "Bạn muốn tôi tập trung vào nội dung nào?",
        ["Các chỉ số bất thường", "Đánh giá tổng quan", "Giải thích thuật ngữ", "Có cần gặp bác sĩ không"],
      );
    }

    return buildRecommendation(
      "Đọc kết quả xét nghiệm",
      "AI có thể giúp tóm tắt chỉ số bất thường và gợi ý câu hỏi cần hỏi bác sĩ, nhưng kết luận cuối vẫn cần dựa trên triệu chứng, bệnh nền và thuốc đang dùng. Nếu chỉ số được đánh dấu cao/thấp rõ hoặc bạn có triệu chứng kèm theo, nên đặt lịch để bác sĩ đọc kết quả đầy đủ.",
    );
  }

  return null;
}

function buildAssistantReply(
  text: string,
  messages: ConsultMessage[],
): ConsultMessage {
  const lowerText = text.toLowerCase();
  const symptomReply = buildSymptomReply(text, messages);

  if (symptomReply) {
    return symptomReply;
  }

  if (lowerText.includes("thuốc") || lowerText.includes("paracetamol")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      kind: "medical-info",
      text: "",
      time: getTimeLabel(),
      card: {
        name: "Thông tin dùng thuốc",
        description:
          "Mình có thể giúp bạn kiểm tra cách dùng, cảnh báo tương tác và dấu hiệu cần hỏi bác sĩ.",
        details:
          "Không tự ý tăng liều, đổi thuốc hoặc ngưng thuốc nếu chưa có chỉ định. Hãy gửi ảnh toa thuốc nếu có.",
        actions: [
          { label: "Liều dùng", value: "dosage", tone: "primary" },
          { label: "Tác dụng phụ", value: "side-effects" },
          { label: "Lưu", value: "save" },
        ],
      },
    };
  }

  if (lowerText.includes("đặt lịch") || lowerText.includes("bác sĩ")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      kind: "recommendation",
      title: "Gợi ý bước tiếp theo",
      text: "Bạn có thể đặt lịch khám hoặc tìm bác sĩ phù hợp để được đánh giá trực tiếp hơn.",
      time: getTimeLabel(),
      actions: [
        { label: "Đặt lịch khám", value: "book", tone: "primary" },
        { label: "Tìm bác sĩ", value: "find-doctors" },
      ],
    };
  }

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    kind: "question",
    text: "Mình đã ghi nhận. Triệu chứng này bắt đầu từ khi nào và mức độ ảnh hưởng đến sinh hoạt ra sao?",
    time: getTimeLabel(),
    quickReplies: ["Hôm nay", "1-3 ngày", ">3 ngày", "Ảnh hưởng nhiều"],
  };
}

function CaseContextBar({
  consultCase,
  onOpen,
}: {
  consultCase: ConsultCase;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mx-4 mt-3 rounded-[22px] border border-[#d8e7ef] bg-white px-4 py-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#16a34a]">
        Medical case
      </p>
      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[13px] leading-5 text-[#475569]">
        <span>Case: {consultCase.title}</span>
        <span>|</span>
        <span>Duration: {consultCase.duration}</span>
        <span>|</span>
        <span>Status: {consultCase.status}</span>
      </div>
    </button>
  );
}

function CompleteCaseControl({ onComplete }: { onComplete: () => void }) {
  return (
    <button
      type="button"
      onClick={onComplete}
      className="mx-4 mt-3 flex min-h-11 items-center gap-3 rounded-[20px] border border-[#bbf7d0] bg-[#ecfdf3] px-4 py-3 text-left text-[#14532d] shadow-[0_8px_20px_rgba(22,163,74,0.06)] transition active:scale-[0.99]"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[#16a34a] bg-white">
        <span className="h-2.5 w-2.5 rounded-sm bg-[#16a34a]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold">Đã được xử lý</span>
        <span className="mt-0.5 block text-[12px] leading-4 text-[#166534]">
          Đánh dấu ca tư vấn này là đã hoàn thành
        </span>
      </span>
    </button>
  );
}

const ON_SHIFT_DOCTORS = [
  {
    id: "doctor-nguyen-a",
    name: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    avatar: "👨‍⚕️",
    eta: "Phản hồi trong 1 phút",
  },
  {
    id: "doctor-tran-b",
    name: "BS Trần Thị B",
    specialty: "Hô hấp",
    avatar: "👩‍⚕️",
    eta: "Phản hồi trong 2 phút",
  },
  {
    id: "doctor-le-c",
    name: "BS Lê Minh C",
    specialty: "Thần kinh",
    avatar: "👨‍⚕️",
    eta: "Phản hồi trong 3 phút",
  },
  {
    id: "doctor-pham-d",
    name: "BS Phạm Thu D",
    specialty: "Da liễu",
    avatar: "👩‍⚕️",
    eta: "Phản hồi trong 4 phút",
  },
  {
    id: "doctor-lan",
    name: "BS. Lan",
    specialty: "Nội tổng quát",
    avatar: "👩🏾",
    eta: "Phản hồi trong 3 phút",
  },
  {
    id: "doctor-hung",
    name: "BS. Hùng",
    specialty: "Tai Mũi Họng",
    avatar: "👩🏻‍🦰",
    eta: "Phản hồi trong 4 phút",
  },
];

function getSpecialtyFromCase(caseItem: ConsultCase): string {
  const title = caseItem.title.toLowerCase();
  const tag = caseItem.tag?.toLowerCase() || "";
  const allMessagesText = caseItem.messages.map((m) => m.text).join(" ").toLowerCase();

  if (title.includes("ngực") || title.includes("tim") || tag.includes("tim") || allMessagesText.includes("ngực") || allMessagesText.includes("tim")) {
    return "Tim mạch";
  }
  if (title.includes("thở") || title.includes("ho") || title.includes("sốt") || tag.includes("hô hấp") || tag.includes("hấp") || allMessagesText.includes("thở") || allMessagesText.includes("ho") || allMessagesText.includes("sốt")) {
    return "Hô hấp";
  }
  if (title.includes("đầu") || title.includes("chóng mặt") || tag.includes("thần kinh") || allMessagesText.includes("đầu") || allMessagesText.includes("chóng mặt")) {
    return "Thần kinh";
  }
  if (title.includes("da") || tag.includes("da liễu") || allMessagesText.includes("da") || allMessagesText.includes("ngứa") || allMessagesText.includes("mẩn đỏ")) {
    return "Da liễu";
  }
  if (title.includes("tai") || title.includes("mũi") || title.includes("họng") || tag.includes("tai mũi họng")) {
    return "Tai Mũi Họng";
  }
  return "Nội tổng quát";
}

function findNearestAvailableDoctor(caseItem: ConsultCase) {
  const spec = getSpecialtyFromCase(caseItem);
  return ON_SHIFT_DOCTORS.find((d) => d.specialty === spec) || ON_SHIFT_DOCTORS[4];
}

function getDoctorSimulatedReply(
  patientText: string,
  doctorName: string,
  messages: ConsultMessage[],
): ConsultMessage {
  const t = patientText.toLowerCase();
  let replyText = "";

  if (t.includes("đau ngực") || t.includes("tức ngực") || t.includes("đau tim") || t.includes("nhói")) {
    replyText = "Cơn đau ngực của bạn xuất hiện đột ngột hay kéo dài? Bạn hãy ngồi nghỉ ngơi hoàn toàn, thả lỏng người và thở đều. Nếu đau lan ra vai, cánh tay trái hoặc hàm kèm khó thở vã mồ hôi, hãy báo tôi biết ngay hoặc gọi cấp cứu 115.";
  } else if (t.includes("khó thở") || t.includes("thở gấp") || t.includes("ngạt") || t.includes("hụt hơi")) {
    replyText = "Bạn hãy ngồi thẳng lưng, nới lỏng cổ áo và hít thở sâu, chậm rãi qua mũi rồi thở ra bằng miệng. Tránh nằm xuống vì nằm sẽ làm khó thở tăng lên. Bạn có kèm theo ho hay đau ngực không?";
  } else if (t.includes("đau đầu") || t.includes("nhức đầu") || t.includes("chóng mặt") || t.includes("choáng")) {
    replyText = "Đau đầu, chóng mặt có thể do huyết áp thay đổi hoặc mệt mỏi. Bạn có máy đo huyết áp tại nhà không? Hãy nằm nghỉ trong phòng tối, yên tĩnh và tránh sử dụng điện thoại lúc này nhé.";
  } else if (t.includes("sốt") || t.includes("nóng") || t.includes("ớn lạnh")) {
    replyText = "Nếu đo nhiệt độ trên 38.5 độ C, bạn có thể dùng Paracetamol 500mg (1 viên, giãn cách 4-6 tiếng nếu còn sốt). Hãy uống nhiều nước ấm hoặc Oresol để bù nước và theo dõi sát thân nhiệt.";
  } else if (t.includes("ho") || t.includes("họng") || t.includes("đờm")) {
    replyText = "Bạn nên súc họng bằng nước muối sinh lý ấm, giữ ấm vùng cổ và uống nhiều nước ấm. Nếu ho kéo dài, có đờm đục hoặc ho ra máu, cần đi chụp X-quang phổi sớm.";
  } else if (t.includes("cảm ơn") || t.includes("vâng") || t.includes("ok") || t.includes("dạ")) {
    replyText = "Không có gì. Tôi vẫn đang trực tuyến và theo dõi ca bệnh của bạn. Hãy tiếp tục nghỉ ngơi và thông báo ngay nếu bạn thấy triệu chứng tăng lên nhé.";
  } else {
    replyText = "Tôi đã ghi nhận thông tin bạn chia sẻ. Để tư vấn chính xác, bạn có thể mô tả chi tiết hơn cảm giác khó chịu hiện tại, hoặc cho tôi biết bạn có tiền sử bệnh lý và đang dùng loại thuốc nào không?";
  }

  return {
    id: `doctor-reply-${Date.now()}`,
    role: "assistant",
    kind: "text",
    text: replyText,
    time: getTimeLabel(),
  };
}

export default function ConsultationChatScreen({
  consultCase,
  readOnly = false,
}: {
  consultCase: ConsultCase;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [activeCase, setActiveCase] = useState<ConsultCase>(consultCase);
  const [storageChecked, setStorageChecked] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ConsultMessage[]>(
    consultCase.messages,
  );
  const [sheet, setSheet] = useState<SheetState>(null);
  const [aiPhase, setAiPhase] = useState<AiPhase>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [uploadIntent, setUploadIntent] = useState<UploadIntent>("image");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [aiDisclaimerVisible, setAiDisclaimerVisible] = useState(true);
  const [emergencyActive, setEmergencyActive] = useState(
    activeCase.severity === "high",
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingStatus, setConnectingStatus] = useState("Đang kiểm tra danh sách bác sĩ trực ca...");
  const [targetSpecialty, setTargetSpecialty] = useState("Nội tổng quát");
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const statusLabel = emergencyActive
    ? "Khẩn cấp"
    : activeCase.status === "Đang đánh giá"
      ? "Đang đánh giá"
    : activeCase.type === "doctor"
      ? "Bác sĩ"
      : "AI hoạt động";

  const subtitle = useMemo(() => {
    if (readOnly) return "Đang xem lại cuộc hội thoại đã hoàn thành";
    if (activeCase.type === "doctor") return "Bác sĩ đang theo dõi case";
    if (emergencyActive) return "Ưu tiên xử lý khẩn";
    if (activeCase.status === "Đang đánh giá") {
      return "AI đang thu thập thông tin triage";
    }
    return "AI đang phân tích theo ngữ cảnh";
  }, [activeCase.status, activeCase.type, emergencyActive, readOnly]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, aiPhase]);

  useEffect(() => {
    setAiDisclaimerVisible(true);
    const timer = window.setTimeout(() => {
      setAiDisclaimerVisible(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeCase.id]);

  useEffect(() => {
    const storedCase = readStoredConsultCase(consultCase.id);
    if (!storedCase?.messages?.length) {
      setActiveCase(consultCase);
      setMessages(consultCase.messages);
      setEmergencyActive(consultCase.severity === "high");
      setStorageChecked(true);
      return;
    }

    setActiveCase(storedCase);
    setMessages(storedCase.messages);
    setEmergencyActive(storedCase.severity === "high");
    setStorageChecked(true);
  }, [consultCase]);

  useEffect(() => {
    if (activeCase.type === "doctor" && activeCase.status === "Đang đánh giá" && !readOnly) {
      const spec = activeCase.doctor ? activeCase.doctor.specialty : getSpecialtyFromCase(activeCase);
      setTargetSpecialty(spec);
      setIsConnecting(true);
      setConnectingStatus("Đang kiểm tra danh sách bác sĩ trực ca...");
      
      const t1 = setTimeout(() => {
        setConnectingStatus("Tìm thấy bác sĩ trực ca. Đang chuyển tiếp thông tin...");
      }, 1000);
      
      const t2 = setTimeout(() => {
        setConnectingStatus("Đang thiết lập phòng tư vấn trực tuyến...");
      }, 2000);
      
      const t3 = setTimeout(() => {
        const selectedDoc = activeCase.doctor || findNearestAvailableDoctor(activeCase);
        
        const systemMsg: ConsultMessage = {
          id: `system-connected-${Date.now()}`,
          role: "system",
          kind: "system",
          text: `Đã kết nối thành công với ${selectedDoc.name} (${selectedDoc.specialty}) đang rảnh ca gần nhất.`,
          time: getTimeLabel(),
        };
        
        const isEmergency = activeCase.severity === "high" || emergencyActive;
        const messagesToAppend: ConsultMessage[] = [systemMsg];
        
        if (!isEmergency) {
          messagesToAppend.push({
            id: `system-warning-${Date.now()}`,
            role: "system",
            kind: "system",
            text: `⚠️ Bác sĩ có thể đang trong ca làm việc nên sẽ phản hồi chậm hơn bình thường. Bạn có thể để lại câu hỏi tại đây.`,
            time: getTimeLabel(),
          });
        }
        
        const introText = isEmergency
          ? `Chào bạn, tôi là ${selectedDoc.name}. Tôi đã nhận được thông tin về triệu chứng '${activeCase.title}' của bạn và đang trực tuyến để hỗ trợ tư vấn. Hãy cho tôi biết cụ thể tình trạng hiện tại của bạn nhé.`
          : `Chào bạn, tôi là ${selectedDoc.name}. Bác sĩ có thể đang trong ca làm nên sẽ trả lời muộn hơn bình thường một chút. Bạn cứ để lại câu hỏi hoặc tình trạng của mình ở đây nhé, tôi sẽ phản hồi ngay khi có thể.`;

        const introMsg: ConsultMessage = {
          id: `doctor-intro-${Date.now()}`,
          role: "assistant",
          kind: "text",
          text: introText,
          time: getTimeLabel(),
        };
        
        messagesToAppend.push(introMsg);
        
        setMessages((current) => {
          const nextMessages = [...current, ...messagesToAppend];
          const updatedCase: ConsultCase = {
            ...activeCase,
            doctor: selectedDoc,
            title: `Tư vấn với ${selectedDoc.name}`,
            subtitle: `${selectedDoc.specialty} · Đang trực tuyến`,
            status: "Đang tư vấn",
            messages: nextMessages,
          };
          setActiveCase(updatedCase);
          persistOpenedConsultCase(updatedCase);
          return nextMessages;
        });
        
        setIsConnecting(false);
      }, 3000);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [activeCase.id, activeCase.type, activeCase.status, activeCase.doctor, readOnly, emergencyActive]);

  useEffect(() => {
    if (!storageChecked) return;
    if (!isPersistableConsultCase(activeCase.id)) return;

    persistOpenedConsultCase({
      ...activeCase,
      messages,
      time: "Vừa xong",
    });
  }, [activeCase, messages, storageChecked]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const markCaseEmergency = () => {
    setEmergencyActive(true);
    setActiveCase((current) => ({
      ...current,
      type: "emergency",
      typeLabel: "Khẩn cấp",
      status: "Khẩn cấp",
      severity: "high",
      tag: "Ưu tiên",
      time: "Vừa xong",
    }));
  };

  const appendPatientMessage = (text: string) => {
    if (readOnly) return;
    const cleanText = text.trim();
    if (!cleanText || isSending || aiPhase || isDoctorTyping) return;

    const isEmergencyInput = detectEmergency(cleanText);
    const patientMessage: ConsultMessage = {
      id: `patient-${Date.now()}`,
      role: "patient",
      kind: "text",
      text: cleanText,
      time: getTimeLabel(),
    };

    setDraft("");
    setIsSending(true);
    setMessages((current) => [...current, patientMessage]);

    if (activeCase.doctor) {
      window.setTimeout(() => {
        setIsSending(false);
        setIsDoctorTyping(true);
      }, 220);

      window.setTimeout(() => {
        setMessages((current) => {
          const docReply = getDoctorSimulatedReply(cleanText, activeCase.doctor!.name, current);
          setIsDoctorTyping(false);
          return [...current, docReply];
        });
      }, 1800);
      return;
    }

    window.setTimeout(() => {
      setIsSending(false);
      setAiPhase(isEmergencyInput ? "evaluating" : "analyzing");
    }, 220);

    window.setTimeout(
      () => {
        if (isEmergencyInput) {
          markCaseEmergency();
          setMessages((current) => [...current, buildEmergencyMessage()]);
        } else {
          setMessages((current) => {
            const assistantReply = buildAssistantReply(cleanText, current);

            if (assistantReply.kind === "emergency") {
              markCaseEmergency();
            }

            return [...current, assistantReply];
          });
        }
        setAiPhase(null);
      },
      isEmergencyInput ? 1100 : 1300,
    );
  };

  const handleAction = (action: ConsultAction) => {
    if (readOnly) return;
    if (action.value === "call-emergency") {
      window.location.href = "tel:115";
      return;
    }

    if (action.value === "connect-doctor") {
      router.push(`/patient/consult/doctor-${Date.now()}?mode=doctor`);
      return;
    }

    if (action.value === "continue-consult") {
      showToast("Bạn có thể tiếp tục mô tả triệu chứng trong ô chat");
      return;
    }

    if (action.value === "find-hospital") {
      showToast("Đang tìm bệnh viện gần nhất");
      return;
    }

    if (action.value === "book") {
      const specialty = consultCase.doctor?.specialty || getSpecialtyFromCase(consultCase);
      const doctorName = consultCase.doctor?.name;
      const url = `/patient/appointments?specialty=${encodeURIComponent(specialty)}${doctorName ? `&doctorName=${encodeURIComponent(doctorName)}` : ""}&fromAi=1`;
      router.push(url);
      return;
    }

    showToast(`Đã chọn: ${action.label}`);
  };

  const openUploadModal = (intent: UploadIntent) => {
    if (readOnly) return;
    setUploadIntent(intent);
    setSheet(null);
    setUploadModalOpen(true);
  };

  const openAttachmentFile = () => {
    openUploadModal("medical-file");
  };

  const confirmImageSend = () => {
    if (!previewFile) return;

    const fileName = previewFile;
    setPreviewFile(null);
    setUploadModalOpen(false);
    setMessages((current) => [
      ...current,
      {
        id: `image-${Date.now()}`,
        role: "patient",
        kind: "text",
        text: `Tôi đã gửi ảnh/tệp: ${fileName}`,
        time: getTimeLabel(),
      },
    ]);
    setAiPhase("image");

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `image-result-${Date.now()}`,
          role: "assistant",
          kind: "question",
          text: "Ảnh đã được ghi nhận. Bạn mô tả thêm ảnh này liên quan đến triệu chứng nào để mình phân tích đúng ngữ cảnh nhé.",
          time: getTimeLabel(),
          quickReplies: [
            "Kết quả xét nghiệm",
            "Ảnh vùng đau",
            "Toa thuốc",
            "Khác",
          ],
        },
      ]);
      setAiPhase(null);
    }, 1300);
  };

  const startVoice = () => {
    if (readOnly) return;
    setSheet("voice");
    setIsRecording(true);
    setVoiceText("");
  };

  const stopVoice = () => {
    if (readOnly) return;
    setIsRecording(false);
    setVoiceText("Tôi bị đau đầu và hơi chóng mặt từ hôm qua");
  };

  const confirmVoice = () => {
    if (readOnly) return;
    if (voiceText) {
      appendPatientMessage(voiceText);
    }
    setSheet(null);
    setVoiceText("");
    setIsRecording(false);
  };

  const markCaseCompleted = () => {
    if (readOnly) return;

    const completedCase: ConsultCase = {
      ...activeCase,
      status: "Đã hoàn thành",
      time: "Vừa xong",
      messages: [
        ...messages,
        {
          id: `completed-${Date.now()}`,
          role: "system",
          kind: "system",
          text: "Ca tư vấn đã được bệnh nhân đánh dấu là đã xử lý.",
          time: getTimeLabel(),
        },
      ],
    };

    setActiveCase(completedCase);
    setMessages(completedCase.messages);
    persistOpenedConsultCase(completedCase);
    showToast("Đã đánh dấu ca tư vấn là hoàn thành");
  };

  return (
    <main className="relative flex h-full min-h-0 bg-[#e2f1e8] px-2 py-2 sm:px-4 sm:py-5">
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d2eadb] bg-[#f5fbf7] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <ChatHeader
          title={activeCase.doctor ? activeCase.doctor.name : activeCase.title}
          subtitle={activeCase.doctor ? `${activeCase.doctor.specialty} · Đang trực tuyến` : subtitle}
          status={activeCase.doctor ? "Bác sĩ" : statusLabel}
          emergency={emergencyActive}
          onBack={() => router.push("/patient/consult")}
          onTitleClick={() => setSheet("case-info")}
          onStatusClick={() => setSheet("status")}
        />

        <CaseContextBar
          consultCase={activeCase}
          onOpen={() => setSheet("case-info")}
        />

        {!readOnly && !activeCase.status.toLowerCase().includes("hoàn") ? (
          <CompleteCaseControl onComplete={markCaseCompleted} />
        ) : null}

        {isConnecting ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#f5fbf7] to-[#e2f1e8] px-6 py-12 text-center relative overflow-hidden">
            {/* Pulsing Concentric Rings */}
            <div className="relative flex h-48 w-48 items-center justify-center">
              <div className="absolute h-40 w-40 rounded-full border border-[#16a34a]/10 bg-[#16a34a]/5 radar-pulse-3" />
              <div className="absolute h-32 w-32 rounded-full border border-[#16a34a]/20 bg-[#16a34a]/10 radar-pulse-2" />
              <div className="absolute h-24 w-24 rounded-full border border-[#16a34a]/30 bg-[#16a34a]/15 radar-pulse-1" />
              
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16a34a] text-white shadow-[0_12px_28px_rgba(22,163,74,0.3)] z-10">
                <Stethoscope className="h-8 w-8 animate-pulse" />
              </div>

              {/* Floating Doctor Avatars */}
              <div className="absolute left-2 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md animate-bounce">
                👨‍⚕️
              </div>
              <div className="absolute right-0 bottom-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md animate-bounce [animation-delay:0.3s]">
                👩‍⚕️
              </div>
              <div className="absolute top-4 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md animate-bounce [animation-delay:0.6s]">
                👩🏾
              </div>
            </div>

            <div className="mt-8 max-w-xs z-10">
              <h3 className="text-[18px] font-bold text-[#10233f] tracking-tight animate-pulse">
                Đang kết nối bác sĩ trực...
              </h3>
              <p className="mt-2 text-[13px] leading-5 text-[#64748b]">
                Hệ thống đang liên hệ với bác sĩ chuyên khoa{" "}
                <span className="font-bold text-[#16a34a]">{targetSpecialty}</span> đang rảnh ca gần nhất.
              </p>
            </div>

            {/* Connection Status Log */}
            <div className="mt-6 w-full max-w-xs rounded-2xl border border-[#d8e7ef] bg-white/70 p-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.03)] backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5 text-xs text-[#475569] font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
                </span>
                <span>{connectingStatus}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="min-h-0 flex-1 overflow-y-auto relative"
            ref={scrollRef}
          >
            <ConversationList
              messages={messages}
              onQuickReply={appendPatientMessage}
              onAction={handleAction}
            />
            {aiPhase ? <AiTypingIndicator phase={aiPhase} /> : null}
            {isDoctorTyping ? <AiTypingIndicator phase={null} doctorName={activeCase.doctor?.name} /> : null}
          </div>
        )}

        {isConnecting ? (
          <footer className="border-t border-[#dbeaf1] bg-white px-4 py-3 text-center text-xs text-[#64748b] font-medium">
            Thiết lập cuộc gọi mã hóa đầu cuối...
          </footer>
        ) : activeCase.status?.toLowerCase().includes("hoàn") || readOnly ? (
          <footer className="border-t border-[#d8eadf] bg-white px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 text-[13px] leading-5 text-[#64748b]">
                Cuộc hội thoại đã hoàn thành.
              </span>
              <button
                type="button"
                onClick={() => router.push(`/patient/consult/ai-${Date.now()}?mode=ai`)}
                className="min-h-11 rounded-2xl bg-[#f1f5f9] px-4 py-2 text-sm font-semibold text-[#475569] border border-[#e6e9ee]"
              >
                Chat mới
              </button>
            </div>
          </footer>
        ) : (
          <InputBar
            draft={draft}
            setDraft={setDraft}
            onSend={() => appendPatientMessage(draft)}
            onAttach={() => openUploadModal("image")}
            onRecord={startVoice}
            onLab={() => {
              setDraft("Tôi muốn tải kết quả xét nghiệm để được đọc sơ bộ");
              openUploadModal("lab");
            }}
            onMedicine={() => {
              setDraft("Tôi muốn hỏi về thuốc đang dùng");
            }}
            onBookDoctor={() => {
              const specialty = consultCase.doctor?.specialty || getSpecialtyFromCase(consultCase);
              const doctorName = consultCase.doctor?.name;
              const url = `/patient/appointments?specialty=${encodeURIComponent(specialty)}${doctorName ? `&doctorName=${encodeURIComponent(doctorName)}` : ""}&fromAi=1`;
              router.push(url);
            }}
            onEmergency={() => setSheet("emergency")}
            isSending={isSending}
            isAiLoading={aiPhase !== null || isDoctorTyping}
            isRecording={isRecording}
          />
        )}



        {aiDisclaimerVisible ? (
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-50 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-[11px] leading-4 text-[#1e3a8a] shadow-[0_10px_24px_rgba(30,64,175,0.14)]">
            Tư vấn AI chỉ mang tính tham khảo. Để biết chính xác, hãy liên hệ
            bác sĩ chuyên ngành.
          </div>
        ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setPreviewFile(file.name);
          }
          event.currentTarget.value = "";
        }}
      />

      {sheet ? (
        <BottomSheet onClose={() => setSheet(null)}>
          {sheet === "case-info" ? (
            <CaseInfoSheet consultCase={activeCase} />
          ) : null}
          {sheet === "status" ? (
            <StatusSheet emergencyActive={emergencyActive} aiPhase={aiPhase} />
          ) : null}
          {sheet === "attachments" ? (
            <AttachmentSheet
              onPickFile={() => openUploadModal("image")}
              onPickLab={() => openUploadModal("lab")}
              onPickMedicalFile={() => openUploadModal("medical-file")}
              onSendLocation={() => {
                setSheet(null);
                appendPatientMessage("Tôi muốn tìm phòng khám gần đây");
              }}
            />
          ) : null}
          {sheet === "voice" ? (
            <VoiceSheet
              isRecording={isRecording}
              voiceText={voiceText}
              onStop={stopVoice}
              onConfirm={confirmVoice}
              onCancel={() => {
                setSheet(null);
                setIsRecording(false);
                setVoiceText("");
              }}
            />
          ) : null}
          {sheet === "emergency" ? (
            <EmergencySheet
              onConnectDoctor={() =>
                router.push(`/patient/consult/doctor-${Date.now()}?mode=doctor&emergency=1`)
              }
              onCall={() => {
                window.location.href = "tel:115";
              }}
            />
          ) : null}
        </BottomSheet>
      ) : null}

      {uploadModalOpen ? (
        <UploadDropzoneModal
          intent={uploadIntent}
          fileName={previewFile}
          onPickFile={() => fileInputRef.current?.click()}
          onDropFile={(fileName) => setPreviewFile(fileName)}
          onCancel={() => {
            setPreviewFile(null);
            setUploadModalOpen(false);
          }}
          onConfirm={confirmImageSend}
        />
      ) : null}

      {toast ? (
        <div className="absolute left-1/2 top-4 z-60 -translate-x-1/2 rounded-full bg-[#10233f] px-4 py-2 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
      </div>

      <style jsx global>{`
        @keyframes reply-slide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.45);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @keyframes radar-ping {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .radar-pulse-1 {
          animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .radar-pulse-2 {
          animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.6s;
        }
        .radar-pulse-3 {
          animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 1.2s;
        }
      `}</style>
    </main>
  );
}

function AiTypingIndicator({ phase, doctorName }: { phase: AiPhase; doctorName?: string }) {
  const label = doctorName
    ? `Bác sĩ ${doctorName} đang soạn câu trả lời...`
    : phase === "image"
      ? "Đang phân tích hình ảnh y tế..."
      : phase === "evaluating"
        ? "Đang đánh giá mức độ khẩn..."
        : phase === "generating"
          ? "Đang tạo khuyến nghị..."
          : "Đang phân tích triệu chứng...";

  return (
    <div className="px-4 pb-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#bbf7d0] bg-white px-4 py-2 text-[13px] font-medium text-[#16a34a] shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}

function BottomSheet({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[88vh] w-full max-w-97.5 overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fbfd] text-[#64748b]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function CaseInfoSheet({ consultCase }: { consultCase: ConsultCase }) {
  return (
    <div className="pr-9">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
        Case details
      </p>
      <h2 className="mt-1 text-[20px] font-bold text-[#10233f]">
        {consultCase.title}
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
        {consultCase.subtitle}
      </p>
      <div className="mt-4 grid gap-2 text-[14px]">
        <InfoRow label="Loại tư vấn" value={consultCase.typeLabel} />
        <InfoRow label="Thời gian" value={consultCase.duration} />
        <InfoRow label="Trạng thái" value={consultCase.status} />
        <InfoRow
          label="Chuyên khoa"
          value={consultCase.tag ?? "Chưa xác định"}
        />
      </div>
    </div>
  );
}

function StatusSheet({
  emergencyActive,
  aiPhase,
}: {
  emergencyActive: boolean;
  aiPhase: AiPhase;
}) {
  return (
    <div className="pr-9">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
        AI state
      </p>
      <h2 className="mt-1 text-[20px] font-bold text-[#10233f]">
        {emergencyActive ? "Đang ưu tiên khẩn" : "AI đang hoạt động"}
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
        {aiPhase
          ? "Hệ thống đang phân tích triệu chứng và ngữ cảnh y tế của case."
          : "Case đang sẵn sàng tiếp nhận thêm thông tin từ bệnh nhân."}
      </p>
    </div>
  );
}

function AttachmentSheet({
  onPickFile,
  onPickLab,
  onPickMedicalFile,
  onSendLocation,
}: {
  onPickFile: () => void;
  onPickLab: () => void;
  onPickMedicalFile: () => void;
  onSendLocation: () => void;
}) {
  const options = [
    { label: "Chụp ảnh", sub: "Camera", icon: Camera, onClick: onPickFile },
    {
      label: "Tải ảnh lên",
      sub: "Kết quả xét nghiệm",
      icon: ImageIcon,
      onClick: onPickLab,
    },
    {
      label: "Tệp y tế",
      sub: "PDF hoặc hồ sơ",
      icon: FileText,
      onClick: onPickMedicalFile,
    },
    {
      label: "Toa thuốc",
      sub: "Ảnh đơn thuốc",
      icon: Pill,
      onClick: onPickFile,
    },
    {
      label: "Vị trí",
      sub: "Phòng khám gần đây",
      icon: MapPin,
      onClick: onSendLocation,
    },
  ];

  return (
    <div className="pr-9">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
        Attachment
      </p>
      <h2 className="mt-1 text-[20px] font-bold text-[#10233f]">
        Gửi thêm thông tin y tế
      </h2>
      <div className="mt-4 grid gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              type="button"
              onClick={option.onClick}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#d8e7ef] bg-[#f8fbfd] px-3 text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#16a34a]">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-[#10233f]">
                  {option.label}
                </span>
                <span className="text-[12px] text-[#64748b]">{option.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VoiceSheet({
  isRecording,
  voiceText,
  onStop,
  onConfirm,
  onCancel,
}: {
  isRecording: boolean;
  voiceText: string;
  onStop: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="pr-9">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
        Voice input
      </p>
      <h2 className="mt-1 text-[20px] font-bold text-[#10233f]">
        {isRecording ? "Đang ghi âm..." : "Xác nhận nội dung"}
      </h2>
      <div className="mt-5 flex h-16 items-center justify-center gap-1 rounded-3xl bg-[#ecfdf3]">
        {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
          <span
            key={bar}
            className="h-9 w-2 origin-center rounded-full bg-[#16a34a]"
            style={{
              animation: "wave 900ms ease-in-out infinite",
              animationDelay: `${bar * 90}ms`,
            }}
          />
        ))}
      </div>
      {voiceText ? (
        <p className="mt-4 rounded-2xl bg-[#f8fbfd] px-3 py-3 text-[14px] leading-6 text-[#334155]">
          {voiceText}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        {isRecording ? (
          <button
            type="button"
            onClick={onStop}
            className="min-h-11 flex-1 rounded-2xl bg-[#dc2626] px-4 text-sm font-semibold text-white"
          >
            Dừng ghi
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 flex-1 rounded-2xl bg-[#16a34a] px-4 text-sm font-semibold text-white"
          >
            Gửi nội dung
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-2xl border border-[#d8e7ef] bg-white px-4 text-sm font-semibold text-[#334155]"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

function EmergencySheet({
  onConnectDoctor,
  onCall,
}: {
  onConnectDoctor: () => void;
  onCall: () => void;
}) {
  return (
    <div className="pr-9">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#dc2626]">
        Hỗ trợ khẩn cấp
      </p>
      <h2 className="mt-1 text-[20px] font-bold text-[#991b1b]">
        Bạn cần hỗ trợ khẩn?
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-[#7f1d1d]">
        Nếu có khó thở, đau ngực dữ dội, ngất hoặc chảy máu nhiều, hãy gọi cấp
        cứu ngay.
      </p>
      <div className="mt-4 grid gap-2">
        <EmergencyButton
          icon={Stethoscope}
          label="Kết nối bác sĩ"
          onClick={onConnectDoctor}
        />
        <EmergencyButton
          icon={PhoneCall}
          label="Gọi 115"
          onClick={onCall}
          danger
        />
      </div>
    </div>
  );
}

function EmergencyButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold ${
        danger
          ? "bg-[#dc2626] text-white"
          : "border border-[#fecaca] bg-[#fff5f5] text-[#991b1b]"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function UploadDropzoneModal({
  intent,
  fileName,
  onPickFile,
  onDropFile,
  onCancel,
  onConfirm,
}: {
  intent: UploadIntent;
  fileName: string | null;
  onPickFile: () => void;
  onDropFile: (fileName: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title =
    intent === "lab"
      ? "Tải kết quả xét nghiệm"
      : intent === "medical-file"
        ? "Tải tài liệu y tế"
        : "Gửi ảnh cho AI";
  const subtitle =
    intent === "lab"
      ? "Kéo thả ảnh/PDF xét nghiệm hoặc chọn tệp từ thiết bị."
      : "Kéo thả ảnh, PDF hoặc hồ sơ y tế vào đây.";

  return (
    <div className="absolute inset-0 z-55 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Đóng upload"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full rounded-[28px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.3)]">
        <h2 className="mt-4 text-[18px] font-bold text-[#10233f]">
          {title}
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-[#64748b]">{subtitle}</p>
        <button
          type="button"
          onClick={onPickFile}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) {
              onDropFile(file.name);
            }
          }}
          className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#bbf7d0] bg-[#ecfdf3] px-4 text-center text-[#16a34a] transition hover:bg-[#dcfce7]"
        >
          <Upload className="h-10 w-10" />
          <span className="mt-3 text-[14px] font-bold">
            Kéo thả tài liệu vào đây
          </span>
          <span className="mt-1 text-[12px] font-medium text-[#15803d]">
            hoặc chạm để chọn file
          </span>
        </button>
        {fileName ? (
          <p className="mt-3 rounded-2xl bg-[#f8fbfd] px-3 py-2 text-[13px] font-medium text-[#334155]">
            Đã chọn: {fileName}
          </p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!fileName}
            className="min-h-11 flex-1 rounded-2xl bg-[#16a34a] text-sm font-semibold text-white disabled:bg-[#d8e7ef] disabled:text-[#94a3b8]"
          >
            Gửi để phân tích
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-2xl border border-[#d8e7ef] bg-white px-4 text-sm font-semibold text-[#334155]"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8fbfd] px-3 py-2">
      <span className="text-[#64748b]">{label}</span>
      <span className="text-right font-semibold text-[#10233f]">{value}</span>
    </div>
  );
}
