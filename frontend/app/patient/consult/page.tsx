import Link from "next/link";
import {
  Bot,
  CalendarCheck2,
  CheckCheck,
  MessageCircle,
  PenLine,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";

type OnlineDoctor = {
  name: string;
  avatar: string;
  active: boolean;
  highlighted?: boolean;
};

const onlineDoctors: OnlineDoctor[] = [
  { name: "BS. Tâm", avatar: "👨🏿", active: true, highlighted: true },
  { name: "BS. Lan", avatar: "👩🏾", active: true },
  { name: "BS. Hùng", avatar: "👩🏻‍🦰", active: true },
];

export default function PatientConsultPage() {
  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-1 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3 pt-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-[32px] font-bold leading-tight">
              Tin nhắn & Tư vấn
            </h1>
            <button
              type="button"
              aria-label="Soạn tư vấn mới"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3c74ea]"
            >
              <PenLine className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-[#9aa4b5] shadow-sm">
            <Search className="h-5 w-5" />
            <span className="text-[13px]">Tìm kiếm bác sĩ, chuyên khoa...</span>
          </div>
        </section>

        <section className="px-4 pb-23 pt-4">
          <h2 className="text-[28px] font-bold text-[#1f2939]">
            Bác sĩ đang trực tuyến
          </h2>

          <div className="mt-2.5 flex items-start gap-3">
            {onlineDoctors.map((doctor) => (
              <div key={doctor.name} className="text-center">
                <div
                  className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f3f7] text-[30px] ${doctor.highlighted ? "ring-2 ring-[#3a76ea] ring-offset-2 ring-offset-[#f7f8fb]" : ""}`}
                >
                  {doctor.avatar}
                  {doctor.active ? (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#f7f8fb] bg-[#22c55e]" />
                  ) : null}
                </div>
                <p className="mt-2 text-[14px] text-[#4b5568]">{doctor.name}</p>
              </div>
            ))}

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#c7cfdb] text-[22px] font-bold text-[#98a3b5]">
                ...
              </div>
              <p className="mt-2 text-[14px] text-[#6b7485]">Xem thêm</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-[28px] font-bold text-[#1f2939]">Gần đây</h3>

            <div className="mt-2.5 space-y-2">
              <article className="rounded-3xl border border-[#bfd6ff] bg-white px-3 py-2 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dcecff] text-[27px]">
                      👨🏿
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22c55e]" />
                    </div>

                    <div>
                      <p className="text-[16px] font-bold leading-tight text-[#202939]">
                        ThS. BS. Trần Tâm
                      </p>
                      <p className="mt-0.5 max-w-60 text-[14px] leading-5 text-[#4b5565]">
                        Bác sĩ: Kết quả xét nghiệm của bạn đã có, mọi chỉ số đều
                        ổn định nhé.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
                    <span className="text-[13px] font-semibold text-[#2667ea]">
                      09:12
                    </span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[12px] font-semibold text-white">
                      2
                    </span>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-[#e4e8ef] bg-white px-3 py-2 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[28px]">
                      👩🏻‍⚕️
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#94a3b8]" />
                    </div>

                    <div>
                      <p className="text-[16px] font-bold leading-tight text-[#202939]">
                        PGS. TS. Lê Văn B
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[14px] leading-5 text-[#6b7280]">
                        <CheckCheck className="h-4 w-4 text-[#3b82f6]" />
                        Dạ vâng, cảm ơn bác sĩ nhiều ạ.
                      </p>
                    </div>
                  </div>

                  <span className="pt-0.5 text-[13px] text-[#9aa4b5]">
                    Hôm qua
                  </span>
                </div>
              </article>

              <article className="rounded-3xl border border-[#e4e8ef] bg-white px-3 py-2 shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dfeafb] text-[#2f66dc]">
                      <Bot className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-[16px] font-bold leading-tight text-[#202939]">
                        Trợ lý Y tế AI
                      </p>
                      <p className="mt-0.5 text-[14px] leading-5 text-[#6b7280]">
                        Chào bạn, tôi có thể giúp gì cho bạn hôm nay?
                      </p>
                    </div>
                  </div>

                  <span className="pt-0.5 text-[12px] text-[#9aa4b5]">T2</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-2 py-1 backdrop-blur">
          <ul className="grid grid-cols-4 text-center">
            <li>
              <Link
                href="/patient"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <Stethoscope className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Trang chủ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/appointments"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <CalendarCheck2 className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Lịch khám</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/consult"
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <MessageCircle className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Tư vấn</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/profile"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <UserRound className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Cá nhân</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
