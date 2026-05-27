import Link from "next/link";
import {
  CalendarCheck2,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Plus,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";

export default function PatientAppointmentsPage() {
  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-1.5 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3.5 pt-4.5 text-white">
          <div className="mb-3.5 flex items-center justify-between">
            <h1 className="text-[32px] font-bold leading-tight">
              Lịch khám của tôi
            </h1>
            <button
              type="button"
              aria-label="Tạo lịch mới"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3c74ea]"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 rounded-2xl bg-[#255ad0] p-1">
            <button
              type="button"
              className="rounded-xl bg-white py-2 text-[17px] font-semibold text-[#2f66dc]"
            >
              Sắp tới
            </button>
            <button
              type="button"
              className="rounded-xl py-2 text-[17px] font-medium text-white/90"
            >
              Lịch sử
            </button>
          </div>
        </section>

        <section className="px-4 pb-23 pt-4">
          <article className="rounded-3xl border border-[#e4e8ef] border-l-6 border-l-[#ef4444] bg-white p-2.5 shadow-[0_4px_14px_rgba(148,163,184,0.1)]">
            <div className="mb-2.5 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#ffeaea] px-2.5 py-1.5 text-[14px] font-semibold text-[#ef4444]">
                <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                Sắp diễn ra
              </span>
              <span className="text-[14px] text-[#96a0b1]">Mã: #KB8821</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dcecff] text-[27px]">
                  👨🏿
                </div>
                <div>
                  <p className="text-[16px] font-bold leading-tight text-[#202939]">
                    ThS. BS. Trần Tâm
                  </p>
                  <p className="mt-0.5 text-[14px] text-[#66758a]">
                    Tim mạch • Khám Online
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Gọi video"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3ff] text-[#2f66dc]"
              >
                <Video className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f7fb] px-3 py-2 text-[#3f4c5f]">
              <div className="flex items-center gap-1.5 text-[14px]">
                <CalendarDays className="h-4 w-4 text-[#2d67e7]" />
                <span>Hôm nay, 24/05</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[14px] font-semibold text-[#ef4444]">
                <Clock3 className="h-4 w-4 text-[#ef4444]" />
                <span>14:30 - 15:00</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f66dc] px-4 py-2 text-[15px] font-medium text-white"
            >
              <Video className="h-4 w-4" />
              Vào phòng khám
            </button>
          </article>

          <article className="mt-3 rounded-3xl border border-[#e4e8ef] border-l-6 border-l-[#22c55e] bg-white p-2.5 shadow-[0_4px_14px_rgba(148,163,184,0.1)]">
            <div className="mb-2.5 flex items-start justify-between">
              <span className="inline-flex items-center rounded-xl bg-[#e8f9ef] px-2.5 py-1.5 text-[14px] font-semibold text-[#15803d]">
                Đã xác nhận
              </span>
              <span className="text-[14px] text-[#96a0b1]">Mã: #KB8904</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[29px]">
                👩🏻‍⚕️
              </div>
              <div>
                <p className="text-[16px] font-bold leading-tight text-[#202939]">
                  PGS. TS. Lê Văn B
                </p>
                <p className="mt-0.5 text-[14px] text-[#66758a]">
                  Nội thần kinh • Trực tiếp
                </p>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f7fb] px-3 py-2 text-[#4b5565]">
              <div className="flex items-center gap-1.5 text-[14px]">
                <CalendarDays className="h-4 w-4 text-[#6b7280]" />
                <span>T5, 28/05/2026</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[14px]">
                <Clock3 className="h-4 w-4 text-[#6b7280]" />
                <span>09:00 - 09:30</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <MapPin className="h-4 w-4" />
              <span>Phòng 204, Tầng 2, Tòa nhà A - Phòng khám Đa khoa</span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-2xl bg-[#f2f4f8] px-4 py-2 text-[15px] font-medium text-[#4b5565]"
              >
                Đổi lịch
              </button>
              <button
                type="button"
                className="rounded-2xl border border-[#d2d8e3] bg-white px-4 py-2 text-[15px] font-medium text-[#2f66dc]"
              >
                Chi tiết
              </button>
            </div>
          </article>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-2.5 py-1.5 backdrop-blur">
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
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <CalendarCheck2 className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Lịch khám</span>
              </Link>
            </li>

            <li>
              <Link
                href="/patient/consult"
                className="flex flex-col items-center gap-1 text-[#95a1b2]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <MessageCircle className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs">Tư vấn</span>
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
