import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  MessageCircle,
  Pill,
  Search,
  Stethoscope,
  UserCircle2,
  Video,
} from "lucide-react";

const services = [
  { label: "Khám bệnh", icon: Stethoscope, color: "bg-blue-100 text-blue-600" },
  {
    label: "Tư vấn Online",
    icon: Video,
    color: "bg-emerald-100 text-emerald-600",
  },
  { label: "Mua thuốc", icon: Pill, color: "bg-orange-100 text-orange-500" },
  {
    label: "Hồ sơ y tế",
    icon: FileText,
    color: "bg-violet-100 text-violet-600",
  },
] as const;

const featuredDoctors = [
  {
    name: "PGS. TS. Lê Văn B",
    specialty: "Nội thần kinh",
    rating: "4.9",
    reviews: "128",
    avatar: "bg-linear-to-br from-amber-200 to-sky-300 text-slate-800",
  },
  {
    name: "BS. CKI Nguyễn Thị C",
    specialty: "Nhi khoa",
    rating: "4.8",
    reviews: "95",
    avatar: "bg-linear-to-b from-slate-700 to-slate-900 text-white",
  },
] as const;

const bottomNavigation = [
  { label: "Trang chủ", icon: Activity, active: true },
  { label: "Lịch khám", icon: CalendarDays, active: false },
  { label: "Tư vấn", icon: MessageCircle, active: false },
  { label: "Cá nhân", icon: UserCircle2, active: false },
] as const;

function SectionTitle({ title, action }: { title: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-slate-800">
        {title}
      </h2>
      <button
        type="button"
        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        {action}
      </button>
    </div>
  );
}

function AvatarBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold shadow-sm ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export default function PatientHomePage() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#ecf3ff_0%,#f7f9ff_38%,#f8fafc_100%)] py-0 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-white shadow-[0_20px_70px_rgba(15,23,42,0.16)] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2.4rem]">
        <section className="rounded-b-4xl bg-[#2f67f5] px-5 pb-6 pt-7 text-white shadow-[0_16px_36px_rgba(47,103,245,0.28)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-[0_10px_25px_rgba(17,24,39,0.14)]">
                <span className="text-3xl leading-none">👨🏻‍⚕️</span>
              </div>
              <div className="pt-1">
                <p className="text-[15px] font-medium text-white/82">
                  Chào buổi sáng,
                </p>
                <h1 className="mt-1 text-[24px] font-extrabold leading-none tracking-[-0.03em]">
                  Nguyễn Văn An
                </h1>
              </div>
            </div>

            <button
              type="button"
              className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/18"
              aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#2f67f5] bg-[#ff6a3d]" />
            </button>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-slate-400 shadow-[0_10px_26px_rgba(14,29,70,0.12)]">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="text-[15px] leading-none text-slate-400">
              Tìm bác sĩ, chuyên khoa, triệu chứng...
            </span>
          </label>
        </section>

        <div className="flex-1 space-y-6 px-5 pb-28 pt-5">
          <section className="space-y-4">
            <SectionTitle title="Lịch hẹn sắp tới" action="Xem tất cả" />

            <article className="rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarBadge
                    label="👩🏾"
                    className="bg-linear-to-br from-orange-100 via-amber-200 to-sky-200"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-[18px] font-bold tracking-[-0.02em] text-slate-800">
                      ThS. BS. Trần Tâm
                    </h3>
                    <p className="mt-1 text-[14px] text-slate-500">
                      Chuyên khoa Tim mạch
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                  aria-label="Mở phòng khám online"
                >
                  <Video className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-[1.35rem] bg-slate-50 p-3 text-[15px] text-slate-600">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4.5 w-4.5 shrink-0 text-blue-600" />
                  <span>Hôm nay, 24/05</span>
                </div>
                <div className="flex items-center justify-end gap-2.5 text-right">
                  <Clock3 className="h-4.5 w-4.5 shrink-0 text-blue-600" />
                  <span>14:30 - 15:00</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-[#2f67f5] py-4 text-[16px] font-medium text-white shadow-[0_12px_26px_rgba(47,103,245,0.32)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Vào phòng khám Online
              </button>
            </article>
          </section>

          <section className="space-y-4">
            <h2 className="text-[22px] font-bold tracking-[-0.03em] text-slate-800">
              Dịch vụ y tế
            </h2>

            <div className="grid grid-cols-4 gap-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    key={service.label}
                    type="button"
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={`flex h-16 w-16 items-center justify-center rounded-3xl ${service.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-[13px] leading-tight text-slate-600">
                      {service.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle title="Bác sĩ nổi bật" action="Xem thêm" />

            <div className="space-y-4">
              {featuredDoctors.map((doctor) => (
                <article
                  key={doctor.name}
                  className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                >
                  <AvatarBadge label="👩🏻" className={doctor.avatar} />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[16px] font-bold tracking-[-0.02em] text-slate-800">
                      {doctor.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-slate-500">
                      {doctor.specialty}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500">
                      <span className="text-amber-400">★</span>
                      <span className="font-medium text-slate-600">
                        {doctor.rating}
                      </span>
                      <span>({doctor.reviews} đánh giá)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                    aria-label={`Xem chi tiết ${doctor.name}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-107.5 -translate-x-1/2 border-t border-slate-200 bg-white/96 px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-b-[2.4rem]">
          <div className="grid grid-cols-4 gap-2">
            {bottomNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-2 text-[12px] font-medium transition-colors ${
                    item.active
                      ? "text-[#2f67f5]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      item.active
                        ? "bg-blue-100 text-[#2f67f5]"
                        : "bg-transparent text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </main>
  );
}
