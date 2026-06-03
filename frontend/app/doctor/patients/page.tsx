"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Brain,
  ChevronRight,
  ClipboardList,
  Flag,
  MessageCircle,
  Sparkles,
  X,
  Search,
} from "lucide-react";
import {
  AppSidebar,
  type NavigationSection,
} from "../_components/doctor-shell";
import {
  consultPatients,
  consultUnreadCount,
} from "../consult/consult-patients";
import {
  DoctorOfflineNotice,
  useDoctorAvailability,
} from "../_components/doctor-availability-context";

export const dynamic = "force-dynamic";

// Patient data structure
type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number;
  code: string;
  condition: string;
  status?: string;
  notes?: string;
  summary: string;
  recommendations: Array<[string, string, string]>;
  aiInsight: string;
  actions: Array<{ icon: string; title: string; description: string }>;
};

const patientsData: Record<string, Patient> = {
  "BN-9081": {
    id: "BN-9081",
    name: "Lê Thị Mai",
    gender: "Nữ",
    age: 62,
    code: "BN-9081",
    condition: "Bệnh án tim mạch huyết áp cấp",
    status: "NGUY HIỂM",
    summary: `Bệnh nhân Lê Thị Mai có tiền sử tăng huyết áp nguyên phát 5 năm nhưng tuân thủ điều trị kém. Hiện tại, bệnh nhân nhập viện với tình trạng đau buốt vùng chẩm sau tai kèm hồi hộp trống ngực dữ dội, ghi nhận chỉ số huyết áp đạt ngưỡng 180/120 mmHg. Với chẩn đoán nghi ngờ cơn tăng huyết áp cấp/theo dõi tai biến mạch máu não nhẹ, cần lập tức kiểm soát huyết áp bằng thuốc hạ áp phù hợp và theo dõi sát các dấu hiệu thần kinh khu trú cùng tri giác để có hướng xử trí kịp thời.`,
    recommendations: [
      ["Cơn tăng huyết áp cấp", "Độ phù hợp: 96%", "emerald"],
      ["Tai biến mạch máu não nhẹ cần loại trừ", "Độ phù hợp: 84%", "amber"],
      [
        "Đau đầu do tăng huyết áp kèm rối loạn giao cảm",
        "Độ phù hợp: 76%",
        "slate",
      ],
      ["Theo dõi hội chứng mạch vành cấp", "Độ phù hợp: 62%", "slate"],
    ],
    aiInsight: `Dựa trên huyết áp 180/120 mmHg, đau vùng chẩm và nhịp tim tăng, hệ thống ưu tiên cơn tăng huyết áp cấp, đồng thời đề nghị loại trừ biến cố thần kinh cấp tính.`,
    actions: [
      {
        icon: "clipboard",
        title: "Xác nhận chẩn đoán sơ bộ",
        description: "So sánh với bệnh án nền",
      },
      {
        icon: "sparkles",
        title: "Mở hội chẩn nếu có dấu hiệu thần kinh",
        description: "Ưu tiên ngay",
      },
      {
        icon: "activity",
        title: "Theo dõi vitals mỗi 5 phút",
        description: "Bắt buộc",
      },
    ],
  },
  "BN-9082": {
    id: "BN-9082",
    name: "Phạm Hoàng Nam",
    gender: "Nam",
    age: 56,
    code: "BN-9082",
    condition: "Bệnh án sức khỏe bình thường - Chưa xử trị",
    status: "Đang chờ",
    summary: `Bệnh nhân Phạm Hoàng Nam, nam, 56 tuổi, đến khám lâm sàng không có triệu chứng. Chỉ số sinh tồn ổn định: huyết áp 120/80 mmHg, nhịp tim 72 bpm, nhiệt độ 37°C. Khám lâm sàng toàn thân không ghi nhận bất thường. Dự kiến tiến hành khám toàn diện và xét nghiệm cơ bản để loại trừ các bệnh lý tiềm ẩn.`,
    recommendations: [
      ["Đợi xét nghiệm thêm", "Độ phù hợp: 100%", "slate"],
      ["Khám lâm sàng toàn thân chi tiết", "Độ phù hợp: 95%", "slate"],
      ["Tư vấn lối sống lành mạnh", "Độ phù hợp: 88%", "slate"],
      ["Tái khám định kỳ 3 tháng", "Độ phù hợp: 85%", "slate"],
    ],
    aiInsight: `Bệnh nhân không có dấu hiệu bất thường trong khám lâm sàng ban đầu. Cần tiếp tục theo dõi và xét nghiệm thêm để đảm bảo sức khỏe và phát hiện sớm các bệnh lý tiềm ẩn.`,
    actions: [
      {
        icon: "activity",
        title: "Hoàn thành xét nghiệm cơ bản",
        description: "Máu, nước tiểu, chức năng tim",
      },
      {
        icon: "clipboard",
        title: "Ghi nhận tiền sử bệnh gia đình",
        description: "Quan trọng cho dự phòng",
      },
      {
        icon: "sparkles",
        title: "Tư vấn dinh dưỡng và luyện tập",
        description: "Phòng chống bệnh mạn tính",
      },
    ],
  },
  "BN-9083": {
    id: "BN-9083",
    name: "Trần Quốc Bảo",
    gender: "Nam",
    age: 32,
    code: "BN-9083",
    condition: "Bệnh án chấn thương mạch máu - Đang truyền dịch",
    status: "Đang theo dõi",
    summary: `Bệnh nhân Trần Quốc Bảo, nam, 32 tuổi, nhập viện do tai nạn giao thông với chấn thương vùng ngực. Hiện đang được truyền dịch và giám sát chặt chẽ. Huyết áp ổn định 125/85 mmHg, nhịp tim 85 bpm, mức độ SpO2 98%. Cần theo dõi liên tục các chỉ số sinh tồn và cảnh báo sớm về các dấu hiệu biến chứng.`,
    recommendations: [
      ["Theo dõi sốc mạch máu", "Độ phù hợp: 92%", "emerald"],
      ["Kiểm tra chứng chấn thương nội tạng", "Độ phù hợp: 88%", "amber"],
      ["Cân bằng điện giải và dịch", "Độ phù hợp: 85%", "slate"],
      ["Theo dõi nhiễm trùng vết thương", "Độ phù hợp: 82%", "slate"],
    ],
    aiInsight: `Bệnh nhân chấn thương mạch máu cần theo dõi liên tục. Các chỉ số sinh tồn hiện tại ổn định nhưng cần cảnh báo sớm về các dấu hiệu biến chứng như sốc hay nhiễm trùng.`,
    actions: [
      {
        icon: "activity",
        title: "Theo dõi vitals liên tục mỗi 15 phút",
        description: "Cảnh báo nếu thay đổi đột ngột",
      },
      {
        icon: "clipboard",
        title: "Kiểm tra vết thương 3 lần/ngày",
        description: "Phòng tránh nhiễm trùng",
      },
      {
        icon: "sparkles",
        title: "Chuẩn bị phục hồi chức năng",
        description: "Sau khi bệnh tình ổn định",
      },
    ],
  },
  "BN-9084": {
    id: "BN-9084",
    name: "Nguyễn Văn Hùng",
    gender: "Nam",
    age: 45,
    code: "BN-9084",
    condition: "Nghi ngờ viêm ruột thừa cấp",
    status: "Theo dõi sát",
    summary: `Bệnh nhân Nguyễn Văn Hùng, nam, 45 tuổi, nhập viện do đau nhức âm ỉ vùng hố chậu phải khởi phát cách đây 12 giờ kèm sốt nhẹ 37.8°C. Ghi nhận phản ứng thành bụng rõ hố chậu phải. Cần theo dõi sát triệu chứng lâm sàng và chỉ số bạch cầu phòng biến chứng viêm ruột thừa vỡ.`,
    recommendations: [
      ["Viêm ruột thừa cấp giai đoạn sớm", "Độ phù hợp: 95%", "emerald"],
      ["Viêm hạch mạc treo ruột", "Độ phù hợp: 70%", "slate"],
      ["Cơn đau quặn thận phải", "Độ phù hợp: 60%", "slate"],
    ],
    aiInsight: `Triệu chứng đau hố chậu phải kèm phản ứng thành bụng định hướng cao đến viêm ruột thừa cấp. Đề xuất siêu âm ổ bụng khẩn và chuẩn bị xét nghiệm tiền phẫu.`,
    actions: [
      {
        icon: "clipboard",
        title: "Siêu âm ổ bụng khẩn",
        description: "Xác định đường kính ruột thừa",
      },
      {
        icon: "activity",
        title: "Xét nghiệm công thức máu khẩn",
        description: "Đánh giá số lượng bạch cầu và CRP",
      },
      {
        icon: "sparkles",
        title: "Nhịn ăn uống hoàn toàn",
        description: "Chuẩn bị cho khả năng phẫu thuật cấp cứu",
      },
    ],
  },
  "BN-9085": {
    id: "BN-9085",
    name: "Hoàng Thị Lan",
    gender: "Nữ",
    age: 28,
    code: "BN-9085",
    condition: "Sốt xuất huyết Dengue ngày 4",
    status: "Đang theo dõi",
    summary: `Bệnh nhân Hoàng Thị Lan, nữ, 28 tuổi, sốt cao liên tục ngày thứ 4. Xét nghiệm Dengue NS1 dương tính. Chỉ số tiểu cầu hiện tại giảm còn 105 G/L. Chưa ghi nhận dấu hiệu xuất huyết dưới da hay niêm mạc. Đang được bù nước bằng đường uống.`,
    recommendations: [
      ["Sốt xuất huyết Dengue có dấu hiệu cảnh báo", "Độ phù hợp: 90%", "amber"],
      ["Sốt xuất huyết Dengue cổ điển", "Độ phù hợp: 85%", "emerald"],
    ],
    aiInsight: `Bệnh nhân bước vào ngày thứ 4 của bệnh (giai đoạn nguy hiểm). Cần giám sát chặt chẽ lượng nước tiểu, tình trạng nôn mửa, đau bụng và xét nghiệm công thức máu hàng ngày.`,
    actions: [
      {
        icon: "activity",
        title: "Xét nghiệm HCT và Tiểu cầu mỗi 12-24h",
        description: "Theo dõi cô đặc máu và nguy cơ giảm tiểu cầu",
      },
      {
        icon: "clipboard",
        title: "Đánh giá dấu hiệu cảnh báo lâm sàng",
        description: "Đau bụng vùng gan, nôn nhiều, chảy máu cam",
      },
      {
        icon: "sparkles",
        title: "Hướng dẫn bù dịch đường uống tích cực",
        description: "Sử dụng Oresol đúng liều lượng",
      },
    ],
  },
  "BN-9086": {
    id: "BN-9086",
    name: "Bùi Minh Đức",
    gender: "Nam",
    age: 50,
    code: "BN-9086",
    condition: "Hen phế quản ác tính",
    status: "Đang khí dung",
    summary: `Bệnh nhân Bùi Minh Đức, nam, 50 tuổi, tiền sử hen phế quản mãn tính 10 năm. Nhập viện trong tình trạng khó thở co kéo cơ hô hấp phụ, ran rít ran ngáy lan tỏa hai phế trường. Hiện đang được thở oxy qua gọng kính và phun khí dung Ventolin kết hợp Pulmicort.`,
    recommendations: [
      ["Cơn hen phế quản cấp mức độ nặng", "Độ phù hợp: 98%", "emerald"],
      ["Đợt cấp COPD trên nền hen", "Độ phù hợp: 75%", "slate"],
    ],
    aiInsight: `Đáp ứng ban đầu với khí dung khá chậm. Cần theo dõi sát chỉ số khí máu động mạch và sẵn sàng tiêm tĩnh mạch Corticoid nếu cơn hen không cải thiện sau 1 giờ.`,
    actions: [
      {
        icon: "activity",
        title: "Theo dõi SpO2 liên tục",
        description: "Mục tiêu duy trì SpO2 từ 92% đến 96%",
      },
      {
        icon: "clipboard",
        title: "Tiêm tĩnh mạch Methylprednisolon",
        description: "Hỗ trợ kháng viêm phế quản khẩn cấp",
      },
      {
        icon: "sparkles",
        title: "Khí dung nhắc lại sau mỗi 20 phút",
        description: "Nếu co thắt phế quản vẫn tiến triển nặng",
      },
    ],
  },
  "BN-9087": {
    id: "BN-9087",
    name: "Vũ Thị Hồng",
    gender: "Nữ",
    age: 70,
    code: "BN-9087",
    condition: "Suy tim độ III - Khó thở khi nằm",
    status: "Ổn định",
    summary: `Bệnh nhân Vũ Thị Hồng, nữ, 70 tuổi, tiền sử suy tim do bệnh tim thiếu máu cục bộ. Vào viện vì khó thở tăng dần, khó thở khi nằm phẳng kèm phù nhẹ hai chi dưới. Huyết áp ổn định 130/80 mmHg, nhịp tim 92 chu kỳ/phút, phổi nghe ít ran ẩm hai đáy. Đang được điều trị bằng lợi tiểu tĩnh mạch.`,
    recommendations: [
      ["Đợt cấp mất bù của suy tim mạn", "Độ phù hợp: 95%", "emerald"],
      ["Hội chứng vành cấp không ST chênh lên", "Độ phù hợp: 70%", "slate"],
    ],
    aiInsight: `Tình trạng quá tải thể tích đang cải thiện dần sau khi dùng lợi tiểu. Cần theo dõi sát điện giải đồ (đặc biệt là Kali) và thể tích nước tiểu 24h để điều chỉnh liều thuốc lợi tiểu phù hợp.`,
    actions: [
      {
        icon: "activity",
        title: "Kiểm soát lượng dịch vào - ra hàng ngày",
        description: "Cân nặng hàng ngày cùng lượng nước tiểu",
      },
      {
        icon: "clipboard",
        title: "Xét nghiệm điện giải đồ và chức năng thận",
        description: "Giám sát nồng độ Kali, Natri, Creatinine máu",
      },
      {
        icon: "sparkles",
        title: "Nằm tư thế đầu cao (Fowler)",
        description: "Giảm gánh nặng tuần hoàn phổi và hỗ trợ thở dễ hơn",
      },
    ],
  },
  "BN-9088": {
    id: "BN-9088",
    name: "Đỗ Anh Tuấn",
    gender: "Nam",
    age: 38,
    code: "BN-9088",
    condition: "Ngộ độc thực phẩm cấp - Nôn mửa",
    status: "Đang bù dịch",
    summary: `Bệnh nhân Đỗ Anh Tuấn, nam, 38 tuổi, nhập viện sau ăn tiệc cưới với các triệu chứng đau quặn bụng, nôn liên tục nhiều lần và đi ngoài phân lỏng nhiều nước. Môi hơi khô, mạch nhanh 98 bpm, huyết áp ổn định 110/70 mmHg. Đang được truyền tĩnh mạch Ringer Lactate để bù nước.`,
    recommendations: [
      ["Nhiễm độc thức ăn do vi khuẩn", "Độ phù hợp: 92%", "emerald"],
      ["Viêm dạ dày ruột cấp tính", "Độ phù hợp: 88%", "slate"],
    ],
    aiInsight: `Tình trạng mất nước trung bình. Cần tiếp tục truyền dịch bù điện giải tốc độ nhanh trong 2-3 giờ đầu, sau đó chuyển sang bù dịch duy trì và theo dõi sát huyết động.`,
    actions: [
      {
        icon: "activity",
        title: "Truyền tĩnh mạch Ringer Lactate",
        description: "Bù dịch điện giải khẩn cấp theo phác đồ",
      },
      {
        icon: "clipboard",
        title: "Theo dõi số lần nôn và tiêu chảy",
        description: "Đánh giá mức độ mất dịch liên tục",
      },
      {
        icon: "sparkles",
        title: "Bổ sung men vi sinh và kẽm",
        description: "Hỗ trợ phục hồi niêm mạc ruột sau khi ngừng nôn",
      },
    ],
  },
  "BN-9089": {
    id: "BN-9089",
    name: "Phan Thanh Hải",
    gender: "Nam",
    age: 48,
    code: "BN-9089",
    condition: "Cơn đau thắt ngực ổn định - Theo dõi ECG",
    status: "Mạch ổn định",
    summary: `Bệnh nhân Phan Thanh Hải, nam, 48 tuổi, có tiền sử hút thuốc lá nhiều năm, thỉnh thoảng xuất hiện cơn đau thắt ngực khi gắng sức, giảm khi nghỉ ngơi. ECG hiện tại chưa phát hiện ST thay đổi động học rõ rệt. Men tim Troponin T trong giới hạn bình thường. Giao diện ECG liên tục ổn định.`,
    recommendations: [
      ["Bệnh tim thiếu máu cục bộ mạn tính", "Độ phù hợp: 95%", "emerald"],
      ["Cơn đau thắt ngực không ổn định", "Độ phù hợp: 75%", "amber"],
    ],
    aiInsight: `Cơn đau hiện tại ổn định. Đề xuất làm thêm nghiệm pháp gắng sức hoặc chụp MSCT động mạch vành nếu có chỉ định để đánh giá mức độ hẹp lòng mạch.`,
    actions: [
      {
        icon: "activity",
        title: "Theo dõi ECG liên tục trên monitor",
        description: "Phát hiện sớm các dấu hiệu thiếu máu cơ tim cấp",
      },
      {
        icon: "clipboard",
        title: "Kiểm tra định lượng Troponin T lần 2",
        description: "Sau 3 giờ từ lần xét nghiệm đầu tiên để loại trừ nhồi máu",
      },
      {
        icon: "sparkles",
        title: "Tư vấn điều trị nội khoa tối ưu",
        description: "Sử dụng thuốc kháng kết tập tiểu cầu và Statin",
      },
    ],
  },
  "BN-9090": {
    id: "BN-9090",
    name: "Trần Thị Dung",
    gender: "Nữ",
    age: 55,
    code: "BN-9090",
    condition: "Đái tháo đường type 2",
    status: "Ổn định đường huyết",
    summary: `Bệnh nhân Trần Thị Dung, nữ, 55 tuổi, điều trị đái tháo đường type 2 nhiều năm. Vào viện khám định kỳ, ghi nhận đường huyết đói 150 mg/dL, HbA1c 7.8%. Đang được tư vấn điều chỉnh chế độ ăn kết hợp điều chỉnh liều thuốc Metformin.`,
    recommendations: [
      ["Đái tháo đường type 2 kiểm soát đường huyết chưa tốt", "Độ phù hợp: 95%", "emerald"],
      ["Rối loạn dung nạp glucose", "Độ phù hợp: 60%", "slate"],
    ],
    aiInsight: `Chỉ số HbA1c 7.8% cho thấy kiểm soát đường huyết trong 3 tháng qua chưa đạt mục tiêu (< 7%). Cần phối hợp thêm thuốc uống nhóm khác hoặc điều chỉnh lối sống tích cực hơn.`,
    actions: [
      {
        icon: "activity",
        title: "Đo đường huyết mao mạch 4 lần/ngày",
        description: "Trước các bữa ăn chính và trước khi đi ngủ",
      },
      {
        icon: "clipboard",
        title: "Khám tầm soát biến chứng bàn chân",
        description: "Đánh giá cảm giác nông sâu và mạch mu chân",
      },
      {
        icon: "sparkles",
        title: "Tư vấn chế độ ăn giảm tinh bột",
        description: "Tăng cường rau xanh và luyện tập thể dục 30 phút mỗi ngày",
      },
    ],
  },
  "BN-9091": {
    id: "BN-9091",
    name: "Ngô Quốc Khánh",
    gender: "Nam",
    age: 25,
    code: "BN-9091",
    condition: "Tràn khí màng phổi tự phát - Đã dẫn lưu",
    status: "Ổn định",
    summary: `Bệnh nhân Ngô Quốc Khánh, nam, 25 tuổi, thể trạng cao gầy. Nhập viện vì đau ngực đột ngột kèm khó thở. X-quang phổi phát hiện tràn khí màng phổi phải lượng trung bình (~30%). Đã được tiến hành đặt ống dẫn lưu màng phổi hút liên tục. Hiện tại đỡ khó thở nhiều, phổi phải thông khí khá.`,
    recommendations: [
      ["Tràn khí màng phổi tự phát nguyên phát", "Độ phù hợp: 96%", "emerald"],
      ["Kén khí phổi vỡ", "Độ phù hợp: 80%", "slate"],
    ],
    aiInsight: `Hệ thống dẫn lưu đang hoạt động tốt, không có rò khí thêm qua bình hút. Đề xuất chụp X-quang phổi kiểm tra sau 24h để đánh giá mức độ nở của phổi trước khi xem xét kẹp và rút ống dẫn lưu.`,
    actions: [
      {
        icon: "activity",
        title: "Kiểm tra hệ thống bình dẫn lưu màng phổi",
        description: "Đảm bảo cột nước dao động theo nhịp thở và không bị tắc",
      },
      {
        icon: "clipboard",
        title: "Chụp X-quang phổi kiểm tra sau 24h",
        description: "Đánh giá phổi nở hoàn toàn hay chưa",
      },
      {
        icon: "sparkles",
        title: "Hướng dẫn bệnh nhân tập thở",
        description: "Tập thổi bóng để phổi nhanh nở lại",
      },
    ],
  },
  "BN-9092": {
    id: "BN-9092",
    name: "Phạm Thảo Vy",
    gender: "Nữ",
    age: 19,
    code: "BN-9092",
    condition: "Viêm amygdale cấp - Sốt nhẹ",
    status: "Chờ cấp đơn thuốc",
    summary: `Bệnh nhân Phạm Thảo Vy, nữ, 19 tuổi, đau rát họng nhiều khi nuốt, sốt nhẹ 38.0°C. Khám họng thấy hai amygdale sưng nề đỏ, có ít giả mạc trắng dạng chấm. Không ghi nhận hạch góc hàm sưng đau. Cần cấp đơn thuốc kháng sinh và kháng viêm điều trị ngoại trú.`,
    recommendations: [
      ["Viêm amygdale cấp do vi khuẩn", "Độ phù hợp: 90%", "emerald"],
      ["Viêm họng cấp do virus", "Độ phù hợp: 75%", "slate"],
    ],
    aiInsight: `Có giả mạc dạng chấm gợi ý viêm amygdale cấp mủ do liên cầu khuẩn. Cấp đơn kháng sinh đường uống (nhóm Penicillin hoặc Macrolide) điều trị đủ liệu trình 7-10 ngày.`,
    actions: [
      {
        icon: "clipboard",
        title: "Kê đơn thuốc điều trị ngoại trú",
        description: "Kháng sinh, kháng viêm, giảm đau hạ sốt",
      },
      {
        icon: "activity",
        title: "Súc họng bằng nước sát khuẩn hàng ngày",
        description: "Làm sạch vi khuẩn bám tại bề mặt amygdale",
      },
      {
        icon: "sparkles",
        title: "Hướng dẫn nghỉ ngơi và ăn thức ăn mềm",
        description: "Uống nhiều nước ấm và tránh ăn đồ cay nóng",
      },
    ],
  },
  "BN-9093": {
    id: "BN-9093",
    name: "Lê Hoàng Long",
    gender: "Nam",
    age: 42,
    code: "BN-9093",
    condition: "Gút cấp - Sưng đau khớp ngón chân cái",
    status: "Ổn định",
    summary: `Bệnh nhân Lê Hoàng Long, nam, 42 tuổi, thức dậy đột ngột vào ban đêm vì sưng, nóng, đỏ và đau dữ dội khớp bàn ngón chân cái bên phải. Tiền sử tăng acid uric máu mạn tính. Đang được điều trị bằng Colchicine liều thấp kết hợp kháng viêm NSAIDs. Cơn đau đang thuyên giảm.`,
    recommendations: [
      ["Cơn gút cấp tính", "Độ phù hợp: 98%", "emerald"],
      ["Viêm khớp nhiễm khuẩn", "Độ phù hợp: 60%", "slate"],
    ],
    aiInsight: `Cơn gút cấp đáp ứng tốt với Colchicine và NSAIDs. Cần tư vấn bệnh nhân tránh dùng các loại thực phẩm nhiều purine (hải sản, thịt đỏ, bia rượu) để phòng ngừa cơn cấp tái phát.`,
    actions: [
      {
        icon: "clipboard",
        title: "Duy trì thuốc giảm đau kháng viêm",
        description: "Sử dụng Colchicine 1mg/ngày và NSAID đường uống",
      },
      {
        icon: "activity",
        title: "Xét nghiệm lại Acid Uric máu sau khi hết đợt cấp",
        description: "Đánh giá chỉ số nền trước khi xem xét dùng thuốc hạ acid uric",
      },
      {
        icon: "sparkles",
        title: "Tư vấn chế độ ăn kiêng nghiêm ngặt",
        description: "Hạn chế thịt đỏ, hải sản và tuyệt đối không uống bia rượu",
      },
    ],
  },
  "BN-9094": {
    id: "BN-9094",
    name: "Nguyễn Tuyết Mai",
    gender: "Nữ",
    age: 65,
    code: "BN-9094",
    condition: "Thoái hóa khớp gối - Đau khớp gối",
    status: "Chờ vật lý trị liệu",
    summary: `Bệnh nhân Nguyễn Tuyết Mai, nữ, 65 tuổi, đau mỏi vùng khớp gối hai bên nhiều năm, đau tăng lên khi đi bộ hoặc leo cầu thang, có tiếng lạo xạo khi vận động khớp. X-quang khớp gối ghi nhận hẹp khe khớp nhẹ và gai xương rìa khớp. Chờ lịch tập vật lý trị liệu phục hồi chức năng.`,
    recommendations: [
      ["Thoái hóa khớp gối nguyên phát độ II-III", "Độ phù hợp: 95%", "emerald"],
      ["Viêm quanh khớp gối", "Độ phù hợp: 70%", "slate"],
    ],
    aiInsight: `Tình trạng thoái hóa khớp gối tiến triển chậm. Đề xuất điều trị bảo tồn bằng vật lý trị liệu, tập mạnh cơ tứ đầu đùi, kết hợp các thuốc bổ trợ sụn khớp như Glucosamine Sulfate dài ngày.`,
    actions: [
      {
        icon: "clipboard",
        title: "Đặt lịch tập vật lý trị liệu",
        description: "Tập vận động khớp gối và siêu âm trị liệu giảm đau",
      },
      {
        icon: "activity",
        title: "Sử dụng thuốc giảm đau tại chỗ",
        description: "Dán gel giảm đau hoặc xoa bóp nhẹ nhàng khi đau tăng",
      },
      {
        icon: "sparkles",
        title: "Hướng dẫn giảm tải trọng cho khớp gối",
        description: "Tránh ngồi xổm, hạn chế leo cầu thang và kiểm soát cân nặng",
      },
    ],
  },
  "BN-9095": {
    id: "BN-9095",
    name: "Trịnh Hồng Quân",
    gender: "Nam",
    age: 35,
    code: "BN-9095",
    condition: "Rối loạn lo âu lan tỏa - Tư vấn tâm lý",
    status: "Tư vấn tâm lý",
    summary: `Bệnh nhân Trịnh Hồng Quân, nam, 35 tuổi, thường xuyên lo lắng thái quá về các vấn đề sinh hoạt hàng ngày, kèm theo mất ngủ kéo dài, căng cơ vùng vai gáy và hồi hộp trống ngực. Đã khám loại trừ các bệnh lý thực thể tim mạch và tuyến giáp. Cần phối hợp tư vấn tâm lý và điều trị nội khoa lo âu.`,
    recommendations: [
      ["Rối loạn lo âu lan tỏa (GAD)", "Độ phù hợp: 92%", "emerald"],
      ["Rối loạn trầm cảm nhẹ", "Độ phù hợp: 65%", "slate"],
    ],
    aiInsight: `Điểm số đánh giá lo âu GAD-7 đạt 12 điểm (lo âu mức độ trung bình). Khuyên dùng liệu pháp nhận thức hành vi (CBT) kết hợp sử dụng thuốc giải lo âu hoặc điều hòa khí sắc liều thấp nếu cần.`,
    actions: [
      {
        icon: "clipboard",
        title: "Chỉ định tư vấn tâm lý chuyên sâu",
        description: "Liệu pháp nhận thức hành vi (CBT) định kỳ hàng tuần",
      },
      {
        icon: "activity",
        title: "Kê đơn thuốc giải lo âu nhẹ",
        description: "Sử dụng các thuốc an thần nhẹ hoặc SSRI liều khởi đầu thấp",
      },
      {
        icon: "sparkles",
        title: "Hướng dẫn các bài tập thư giãn cơ và thở bụng",
        description: "Giúp giảm nhịp tim và ổn định hệ thần kinh thực vật khi lo lắng",
      },
    ],
  },
};

export default function PatientDetailPage() {
  return (
    <Suspense fallback={null}>
      <PatientDetailContent />
    </Suspense>
  );
}

function PatientDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAcceptingPatients, toggleAcceptingPatients } =
    useDoctorAvailability();
  const [isDiagnosisPopupOpen, setIsDiagnosisPopupOpen] = useState(false);
  const [isAiErrorPopupOpen, setIsAiErrorPopupOpen] = useState(false);
  const [symptomsAndDiagnosisByPatient, setSymptomsAndDiagnosisByPatient] =
    useState<Record<string, string>>({});
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Get patient ID from URL or default to first patient
  const patientId = searchParams.get("id") || "BN-9081";
  const currentPatient = patientsData[patientId] || patientsData["BN-9081"];
  const patientList = Object.values(patientsData);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patientList;
    return patientList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q),
    );
  }, [searchQuery, patientList]);

  const handleNavigate = (section: NavigationSection) => {
    if (section === "overview") {
      router.push("/doctor");
      return;
    }

    if (section === "patients") {
      router.push("/doctor/patients");
    }
  };

  const handleSwitchPatient = (patientId: string) => {
    router.push(`/doctor/patients?id=${patientId}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AppSidebar
          activeSection="patients"
          isAcceptingPatients={isAcceptingPatients}
          onToggleAccepting={toggleAcceptingPatients}
          onNavigate={handleNavigate}
          consultUnread={consultUnreadCount}
        />

        <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          <div className="relative mx-auto max-w-[1800px]">
            <DoctorOfflineNotice />

            <div className="mt-5 grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* Left Column: Search & Scrollable Patient List */}
              <div className="rounded-[1.65rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.02)] h-[calc(100vh-140px)] sticky top-4 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                    Danh sách bệnh nhân ({filteredPatients.length})
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm bệnh nhân..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {filteredPatients.map((patient) => {
                    const isActive = currentPatient.id === patient.id;
                    return (
                      <button
                        key={patient.id}
                        onClick={() => handleSwitchPatient(patient.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                            : "border border-slate-100 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30 hover:text-emerald-700"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isActive
                              ? "bg-white/30 text-white"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-sm font-semibold leading-none">
                              {patient.name}
                            </span>
                            <span className={`text-[10px] shrink-0 font-medium ${isActive ? "text-white/70" : "text-slate-400"}`}>
                              {patient.code}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-xs">
                            <span className={isActive ? "text-white/80" : "text-slate-500"}>
                              {patient.gender} • {patient.age} tuổi
                            </span>
                            {patient.status && (
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : patient.status === "Đang chờ" || patient.status === "Chờ cấp đơn thuốc" || patient.status === "Chờ vật lý trị liệu"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : patient.status === "Theo dõi sát" || patient.status === "Đang theo dõi" || patient.status === "NGUY HIỂM"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : patient.status === "Đang khí dung" || patient.status === "Đang bù dịch"
                                        ? "bg-violet-50 text-violet-700 border border-violet-200"
                                        : patient.status === "Mạch ổn định" || patient.status === "Ổn định" || patient.status === "Ổn định đường huyết"
                                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                                          : "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}>
                                {patient.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400">
                      Không tìm thấy bệnh nhân nào
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Record Content & AI Co-pilot */}
              <div className="min-w-0 space-y-5">
                <div className="mb-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
                      Chi tiết ca bệnh &amp; Chẩn đoán tự động
                    </h1>

                    <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-medium text-slate-500 shadow-sm">
                      Hôm nay: Thứ Năm, 21 tháng 5, 2026
                    </span>
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-red-500 shadow-[0_8px_20px_rgba(239,68,68,0.08)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      Có chỉ số đo từ xa khẩn cấp!
                    </span>
                  </div>
                </div>

                <div className={`grid gap-4 ${isAiPanelOpen ? "xl:grid-cols-[minmax(0,1fr)_360px]" : "xl:grid-cols-1"}`}>
                  <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Hồ sơ y tế hiện hành
                        </p>
                        <h2 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[26px]">
                          Bệnh nhân: {currentPatient.name}
                        </h2>
                        <p className="mt-2 text-[14px] text-slate-500">
                          {currentPatient.gender} • {currentPatient.age} Tuổi • Hồ
                          sơ do thông số tự động #{currentPatient.code}
                          {currentPatient.status && (
                            (() => {
                              const s = currentPatient.status;
                              const isAmber = s === "Đang chờ" || s === "Chờ cấp đơn thuốc" || s === "Chờ vật lý trị liệu";
                              const isRose = s === "Theo dõi sát" || s === "Đang theo dõi" || s === "NGUY HIỂM";
                              const isViolet = s === "Đang khí dung" || s === "Đang bù dịch";
                              const isSky = s === "Mạch ổn định" || s === "Ổn định" || s === "Ổn định đường huyết";

                              const bgClass = isAmber
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : isRose
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isViolet
                                    ? "bg-violet-50 text-violet-700 border-violet-200"
                                    : isSky
                                      ? "bg-sky-50 text-sky-700 border-sky-200"
                                      : "bg-slate-50 text-slate-600 border-slate-200";

                              const dotClass = isAmber
                                ? "bg-amber-500"
                                : isRose
                                  ? "bg-rose-500"
                                  : isViolet
                                    ? "bg-violet-500"
                                    : isSky
                                      ? "bg-sky-500"
                                      : "bg-slate-400";

                              return (
                                <span className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold border ${bgClass}`}>
                                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                                  {s}
                                </span>
                              );
                            })()
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => router.push("/doctor/consult")}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[14px] font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-[18px] w-[18px]" />
                          Chat trực tiếp với bệnh nhân
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsAiPanelOpen((v) => !v)}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3.5 py-2.5 text-[14px] font-semibold shadow-sm transition-all hover:-translate-y-0.5 ${
                            isAiPanelOpen
                              ? "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <Brain className="h-[18px] w-[18px]" />
                          {isAiPanelOpen ? "Ẩn trợ lý AI" : "Mở trợ lý AI"}
                        </button>
                      </div>
                    </div>

                    <div className="my-5 h-px w-full bg-slate-100" />

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Ghi nhận triệu chứng &amp; chẩn đoán
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsDiagnosisPopupOpen(true)}
                        className="inline-flex items-center gap-2 text-[14px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                      >
                        <Sparkles className="h-4 w-4" />
                        Đề xuất chẩn đoán sâu bằng Gemini AI
                      </button>
                    </div>

                    <textarea
                      value={symptomsAndDiagnosisByPatient[currentPatient.id] || ""}
                      onChange={(e) =>
                        setSymptomsAndDiagnosisByPatient((prev) => ({
                          ...prev,
                          [currentPatient.id]: e.target.value,
                        }))
                      }
                      placeholder="Gõ triệu chứng lâm sàng hoặc từ khóa (VD: tăng huyết áp, đau đầu vùng chẩm)..."
                      className="mt-3 min-h-28 w-full resize-none rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] leading-6 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </section>

                  {isAiPanelOpen && (
                  <aside className="rounded-[1.65rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-500 shadow-sm">
                          <Activity className="h-3.5 w-3.5" />
                        </div>
                        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">
                          Bảng trợ lý AI co-pilot
                        </h2>
                      </div>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                        PRO V1.5
                      </span>
                    </div>

                    <div className="my-4 h-px w-full bg-slate-100" />

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[14px] font-semibold text-slate-700">
                        Tóm tắt bệnh sử từ Gemini AI
                      </p>

                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 12a9 9 0 1 1-3-6.7" />
                            <path d="M21 3v6h-6" />
                          </svg>
                        </span>
                        Tạo bảng AI
                      </button>
                    </div>

                    <div className="mt-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] leading-7 text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                      <p className="text-[14px] font-semibold text-slate-900">
                        **TÓM TẮT BỆNH ÁN**
                      </p>
                      <p className="mt-2">{currentPatient.summary}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAiErrorPopupOpen((value) => !value)}
                      className="mt-4 flex w-full items-center gap-4 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] px-4 py-3.5 text-left shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:bg-[#fff4e6]"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ff8a1f] text-white shadow-[0_14px_28px_rgba(249,115,22,0.28)]">
                        <Flag className="h-7 w-7" />
                      </div>

                      <div>
                        <div className="text-[16px] font-bold leading-6 text-[#f97316]">
                          Báo cáo lỗi
                          <br />
                          kịch bản AI
                        </div>
                      </div>
                    </button>

                    {isAiErrorPopupOpen ? (
                      <div className="mt-3 rounded-[1.2rem] border border-orange-200 bg-[#fffaf4] p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                        <p className="text-[13px] font-semibold text-slate-700">
                          Ghi chú lỗi y khoa/Ban chỉ đạo AI
                        </p>

                        <textarea
                          placeholder="Vui lòng nêu chi tiết lỗi chẩn đoán hoặc dữ liệu đề xuất không đúng thực tế..."
                          className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-orange-200 bg-white px-4 py-2.5 text-[13px] leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                        />

                        <div className="mt-4 rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                              <ClipboardList className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                Thông tin gửi đi sẽ được ghi nhận để huấn luyện lại
                                luồng gợi ý.
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                Chỉ dùng nội bộ, ưu tiên phân loại lỗi chẩn đoán,
                                lỗi dữ liệu và lỗi giao diện.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setIsAiErrorPopupOpen(false)}
                            className="flex-1 rounded-2xl bg-[#ff8a1f] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#f97316]"
                          >
                            Gửi báo cáo
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsAiErrorPopupOpen(false)}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </aside>
                  )}
                </div>
              </div>
            </div>

            {isDiagnosisPopupOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-3xl animate-alert-modal rounded-[1.75rem] border border-slate-200 bg-white p-6 font-sans shadow-[0_24px_70px_rgba(15,23,42,0.22)] lg:p-7">
                  <button
                    type="button"
                    aria-label="Đóng popup đề xuất chẩn đoán"
                    onClick={() => setIsDiagnosisPopupOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex items-start justify-between gap-4 pr-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                        Đề xuất chẩn đoán
                      </p>
                      <h2 className="mt-1 text-[1.55rem] font-bold tracking-[-0.03em] text-slate-900">
                        Gemini gợi ý các chẩn đoán ưu tiên
                      </h2>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                      {currentPatient.recommendations.length} đề xuất
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Brain className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {currentPatient.name}
                            </div>
                            <div className="truncate text-xs text-slate-400">
                              {currentPatient.gender} • {currentPatient.age}{" "}
                              tuổi • {currentPatient.condition}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        {currentPatient.recommendations.map(
                          ([label, meta, tone], index) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setSelectedDiagnosis(label)}
                              className={`rounded-2xl border bg-white p-4 shadow-sm transition-all ${
                                selectedDiagnosis === label
                                  ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                                  : index === 0
                                    ? "border-emerald-200 hover:border-emerald-300"
                                    : "border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4 text-left">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[15px] font-semibold text-slate-800">
                                    {index + 1}. {label}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-400">
                                    {meta}
                                  </div>
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                                    selectedDiagnosis === label
                                      ? "bg-emerald-600 text-white"
                                      : tone === "emerald"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : tone === "amber"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {selectedDiagnosis === label
                                    ? "✓ Đã chọn"
                                    : "Ưu tiên"}
                                </span>
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                          AI nhận định
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {currentPatient.aiInsight}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Gợi ý hành động
                          </p>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            {currentPatient.actions.length} bước
                          </span>
                        </div>

                        <div className="mt-3 space-y-3">
                          {currentPatient.actions.map((action, index) => {
                            const iconMap: Record<
                              string,
                              React.ComponentType<{ className?: string }>
                            > = {
                              clipboard: ClipboardList,
                              sparkles: Sparkles,
                              activity: Activity,
                            };
                            const IconComponent =
                              iconMap[action.icon] || Activity;
                            const bgColorMap: Record<string, string> = {
                              clipboard: "bg-emerald-100 text-emerald-700",
                              sparkles: "bg-cyan-100 text-cyan-700",
                              activity: "bg-emerald-100 text-emerald-700",
                            };
                            const bgColor =
                              bgColorMap[action.icon] ||
                              "bg-emerald-100 text-emerald-700";

                            return (
                              <div
                                key={index}
                                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                              >
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor}`}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-slate-700">
                                    {action.title}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {action.description}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              Ưu tiên 1: {currentPatient.name}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Cần theo dõi chỉ số sinh tồn ngay, chuyển sang
                              luồng khẩn cấp nếu có triệu chứng thần kinh.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedDiagnosis) {
                          setSymptomsAndDiagnosisByPatient((prev) => ({
                            ...prev,
                            [currentPatient.id]:
                              (prev[currentPatient.id] || "") +
                              (prev[currentPatient.id] ? "\n" : "") +
                              selectedDiagnosis,
                          }));
                          setSelectedDiagnosis(null);
                          setIsDiagnosisPopupOpen(false);
                        }
                      }}
                      disabled={!selectedDiagnosis}
                      className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition-all hover:-translate-y-0.5 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Áp dụng chẩn đoán
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDiagnosisPopupOpen(false)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
