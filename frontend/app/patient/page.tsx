"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Camera,
  CalendarCheck2,
  Clock3,
  FileText,
  Mic,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserRound,
  Sparkles,
  Thermometer,
  Headphones,
  Smile,
  Droplets,
  MoonStar,
  Activity,
  Pill,
} from "lucide-react";

const commonSymptoms = ["Sốt", "Ho", "Đau đầu", "Đau bụng", "Đau họng"];

const ongoingChats = [
  {
    title: "Đau họng kéo dài",
    time: "5 phút trước",
    preview: "Tôi bị đau họng 3 ngày rồi, có nên đi khám không?",
  },
  {
    title: "Dị ứng thời tiết",
    time: "Hôm qua",
    preview: "Mỗi khi đổi thời tiết tôi hay hắt hơi, sổ mũi nhiều.",
  },
  {
    title: "Thuốc huyết áp",
    time: "T2",
    preview: "Tôi cần xem lại cách uống thuốc và lưu ý khi dùng.",
  },
];

const personalizedTips = [
  {
    icon: Droplets,
    title: "Uống đủ nước hôm nay",
    detail: "Giữ cơ thể đủ nước giúp giảm mệt mỏi và hỗ trợ phục hồi tốt hơn.",
  },
  {
    icon: MoonStar,
    title: "Ngủ sớm hơn 30 phút",
    detail: "Một giấc ngủ đều đặn giúp cơ thể ổn định hơn trong vài ngày tới.",
  },
  {
    icon: Activity,
    title: "Đi bộ nhẹ 10 phút",
    detail: "Vận động nhẹ giúp tuần hoàn tốt và giảm căng thẳng.",
  },
];

function getTopicQuery(topic: string) {
  return `/patient/consult?mode=ai&topic=${encodeURIComponent(topic)}`;
}

export default function PatientPage() {
  const router = useRouter();

  const goToExam = () => {
    router.push("/patient/appointments");
  };

  const goToConsult = () => {
    router.push("/patient/consult");
  };

  const goToAiConsult = () => {
    router.push("/patient/consult?mode=ai");
  };

  return (
    <main className="flex h-full min-h-0 justify-center bg-[#e9f5ed] px-2 py-2 sm:px-4 sm:py-5">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d7eadf] bg-[#f7fbf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <section className="relative overflow-hidden rounded-b-[30px] bg-linear-to-br from-[#1fa24a] via-[#16a34a] to-[#10813a] px-4 pb-4 pt-3 text-white">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-emerald-200/15 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[22px] shadow-[0_10px_24px_rgba(15,23,42,0.15)]">
                👨🏻
              </div>
              <div>
                <p className="text-sm text-white/85">Chào Nguyễn Văn An</p>
                <h1 className="text-[23px] font-semibold leading-tight">
                  Bạn cần hỗ trợ sức khỏe gì hôm nay?
                </h1>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white/95 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-3 rounded-[28px] border border-white/15 bg-white/12 p-2.5 shadow-[0_16px_40px_rgba(10,48,19,0.18)] backdrop-blur-sm">
            <button
              type="button"
              aria-label="Mô tả triệu chứng hoặc đặt câu hỏi"
              onClick={goToAiConsult}
              className="flex w-full items-start gap-3 rounded-[22px] bg-white px-4 py-2.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-[#94a3b8]" />
              <span className="flex-1 text-[14px] text-[#9aa4b5]">
                Mô tả triệu chứng hoặc đặt câu hỏi
              </span>
            </button>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Ghi âm"
                onClick={goToAiConsult}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#16a34a] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:scale-105"
              >
                <Mic className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Gửi ảnh"
                onClick={goToAiConsult}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#16a34a] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:scale-105"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 overscroll-contain">
          <div className="grid gap-3">
            <button
              type="button"
              onClick={goToExam}
              className="flex items-center justify-between rounded-3xl border border-[#d8eadf] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1f2939]">
                    Tôi cần khám
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">
                    Đặt lịch, xem bác sĩ và chuẩn bị trước cuộc hẹn
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#16a34a]" />
            </button>

            <button
              type="button"
              onClick={goToConsult}
              className="flex items-center justify-between rounded-3xl border border-[#d8eadf] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eafaf1] text-[#16a34a]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1f2939]">
                    Tôi cần tư vấn sức khỏe
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">
                    Trao đổi với AI hoặc bác sĩ online ngay trên app
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#16a34a]" />
            </button>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1f2939]">
                Triệu chứng phổ biến
              </h2>
              <span className="text-[13px] font-medium text-[#16a34a]">
                Chọn nhanh
              </span>
            </div>

            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => router.push(getTopicQuery(symptom))}
                  className="shrink-0 rounded-full border border-[#cfe8d8] bg-white px-4 py-2 text-[14px] font-medium text-[#1f2939] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:border-[#16a34a] hover:bg-[#f0fbf4]"
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1f2939]">
                Tiếp tục cuộc trò chuyện
              </h2>
              <button
                type="button"
                onClick={goToConsult}
                className="text-[14px] font-medium text-[#16a34a]"
              >
                Mở tư vấn
              </button>
            </div>

            <div className="space-y-2">
              {ongoingChats.map((chat) => (
                <button
                  key={chat.title}
                  type="button"
                  onClick={goToAiConsult}
                  className="w-full rounded-[22px] border border-[#dfe9e1] bg-white px-4 py-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
                          <Clock3 className="h-4 w-4" />
                        </span>
                        <p className="truncate text-[15px] font-semibold text-[#202939]">
                          {chat.title}
                        </p>
                      </div>
                      <p className="mt-2 line-clamp-1 text-[13px] text-[#6b7280]">
                        {chat.preview}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] font-medium text-[#16a34a]">
                      {chat.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1f2939]">
                Gợi ý cho bạn
              </h2>
              <span className="text-[13px] font-medium text-[#16a34a]">
                Cá nhân hóa
              </span>
            </div>

            <div className="grid gap-2">
              {personalizedTips.map((tip) => {
                const TipIcon = tip.icon;

                return (
                  <article
                    key={tip.title}
                    className="flex items-start gap-3 rounded-[22px] border border-[#dfe9e1] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
                      <TipIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#202939]">
                        {tip.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">
                        {tip.detail}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
