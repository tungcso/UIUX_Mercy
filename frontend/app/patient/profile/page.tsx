import Link from "next/link";
import {
  ChevronRight,
  Cog,
  FileText,
  LogOut,
  MapPin,
  Pill,
  User,
  UserRound,
  Stethoscope,
  CalendarCheck2,
  MessageCircle,
} from "lucide-react";

export default function PatientProfilePage() {
  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-1 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3 pt-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-[28px] font-bold">Hồ sơ cá nhân</h1>
            <button
              type="button"
              aria-label="Cài đặt"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3c74ea]"
            >
              <Cog className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="-mt-2 flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[24px]">
              <User className="h-7 w-7 text-[#2f66dc]" />
              <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[12px] text-[#2f66dc] border border-white">
                📷
              </span>
            </div>

            <div>
              <div className="text-[18px] font-semibold">Nguyễn Văn An</div>
              <div className="mt-1 text-[13px] text-white/90">
                Nam • 28 Tuổi • Nhóm máu: O
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[12px] text-white">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                Đã xác thực
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 pt-4">
          <div className="-mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
              <div className="text-[18px] font-bold text-[#2f66dc]">12</div>
              <div className="text-[12px] text-[#6b7280]">Lượt khám</div>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
              <div className="text-[18px] font-bold text-[#2f66dc]">03</div>
              <div className="text-[12px] text-[#6b7280]">Đơn thuốc</div>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
              <div className="text-[18px] font-bold text-[#2f66dc]">A+</div>
              <div className="text-[12px] text-[#6b7280]">BHYT</div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-[#e4e8ef] bg-white p-2.5 shadow-sm">
            <Link
              href="#"
              className="flex items-center justify-between px-2 py-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#3b82f6]" />
                <div>
                  <div className="text-[15px] font-semibold text-[#202939]">
                    Hồ sơ bệnh án
                  </div>
                  <div className="text-[13px] text-[#6b7280]">
                    Kết quả xét nghiệm, chẩn đoán
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between px-2 py-3"
            >
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-[#10b981]" />
                <div>
                  <div className="text-[15px] font-semibold text-[#202939]">
                    Đơn thuốc của tôi
                  </div>
                  <div className="text-[13px] text-[#6b7280]">
                    Lịch sử mua và nhắc uống thuốc
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between px-2 py-3"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#fb923c]" />
                <div>
                  <div className="text-[15px] font-semibold text-[#202939]">
                    Người thân
                  </div>
                  <div className="text-[13px] text-[#6b7280]">
                    Quản lý hồ sơ thành viên gia đình
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </Link>
          </div>

          <div className="mt-6 text-[12px] text-[#94a3b8]">
            TÀI KHOẢN & HỖ TRỢ
          </div>

          <div className="mt-3 rounded-3xl border border-[#e4e8ef] bg-white p-2.5 shadow-sm">
            <Link
              href="#"
              className="flex items-center justify-between px-2 py-3"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#64748b]" />
                <div className="text-[15px] text-[#202939]">
                  Phương thức thanh toán
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between px-2 py-3"
            >
              <div className="flex items-center gap-3">
                <Cog className="h-5 w-5 text-[#64748b]" />
                <div className="text-[15px] text-[#202939]">
                  Trung tâm trợ giúp
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
            </Link>

            <button className="mt-3 w-full rounded-2xl bg-white px-2 py-3 text-[15px] font-medium text-[#ef4444]">
              <div className="flex items-center justify-center gap-2">
                <LogOut className="h-4.5 w-4.5 text-[#ef4444]" />
                Đăng xuất
              </div>
            </button>
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
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <UserRound className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Cá nhân</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
