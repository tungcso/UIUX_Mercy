import {
  Bell,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  MessageCircle,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  Video,
  Star,
} from "lucide-react";
import Link from "next/link";

type ServiceItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
};

type FeaturedDoctor = {
  name: string;
  specialty: string;
  rating: string;
  reviews: string;
  avatar: string;
};

const services: ServiceItem[] = [
  {
    label: "Khám bệnh",
    icon: Stethoscope,
    iconColor: "text-[#3a74eb]",
    bgColor: "bg-[#e7f0ff]",
  },
  {
    label: "Tư vấn Online",
    icon: Video,
    iconColor: "text-[#18a39a]",
    bgColor: "bg-[#d9f6ee]",
  },
  {
    label: "Mua thuốc",
    icon: Pill,
    iconColor: "text-[#e7791f]",
    bgColor: "bg-[#fff0da]",
  },
  {
    label: "Hồ sơ y tế",
    icon: FileText,
    iconColor: "text-[#8f63d8]",
    bgColor: "bg-[#eee5ff]",
  },
];

const featuredDoctors: FeaturedDoctor[] = [
  {
    name: "PGS. TS. Lê Văn B",
    specialty: "Nội thần kinh",
    rating: "4.9",
    reviews: "128 đánh giá",
    avatar: "👩🏻‍⚕️",
  },
  {
    name: "BS. CKI Nguyễn Thị C",
    specialty: "Nhi khoa",
    rating: "4.8",
    reviews: "95 đánh giá",
    avatar: "👩🏾",
  },
];

export default function PatientPage() {
  return (
    <main className="min-h-screen bg-[#eceef2] px-2 py-2 sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-3xl border border-[#d8dde7] bg-[#f7f8fb] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <section className="rounded-b-[28px] bg-[#2f66dc] px-4 pb-3 pt-4 text-white">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[24px]">
                👨🏻
              </div>
              <div>
                <p className="text-sm text-white/85">Chào buổi sáng,</p>
                <h1 className="text-[26px] font-semibold leading-tight">
                  Nguyễn Văn An
                </h1>
              </div>
            </div>

            <button
              type="button"
              aria-label="Thông báo"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#3c74ea]"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ff4a4a] ring-2 ring-[#3c74ea]" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-[#9aa4b5] shadow-sm">
            <Search className="h-5 w-5" />
            <span className="text-[14px]">
              Tìm bác sĩ, chuyên khoa, triệu chứng...
            </span>
          </div>
        </section>

        <section className="px-4 pb-24 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#1f2939]">
              Lịch hẹn sắp tới
            </h2>
            <button
              type="button"
              className="text-[16px] font-medium text-[#2667ea]"
            >
              Xem tất cả
            </button>
          </div>

          <div className="rounded-3xl border border-[#e5e8ee] bg-white p-3 shadow-[0_5px_18px_rgba(148,163,184,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcecff] text-[28px]">
                  👨🏿
                </div>
                <div>
                  <p className="text-[16px] font-bold leading-tight text-[#202939]">
                    ThS. BS. Trần Tâm
                  </p>
                  <p className="mt-0.5 text-[14px] text-[#66758a]">
                    Chuyên khoa Tim mạch
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Gọi video"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#2f66dc]"
              >
                <Video className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f7fb] px-3 py-2.5 text-[#3f4c5f]">
              <div className="flex items-center gap-1.5 text-[14px]">
                <CalendarDays className="h-4 w-4 text-[#2d67e7]" />
                <span>Hôm nay, 24/05</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[14px]">
                <Clock3 className="h-4 w-4 text-[#2d67e7]" />
                <span>14:30 - 15:00</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 w-full rounded-2xl bg-[#2f66dc] px-4 py-2.5 text-[15px] font-medium text-white"
            >
              Vào phòng khám Online
            </button>
          </div>

          <div className="mt-7">
            <h3 className="text-[18px] font-bold text-[#1f2939]">
              Dịch vụ y tế
            </h3>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div key={service.label} className="text-center">
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${service.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${service.iconColor}`} />
                    </div>
                    <p className="mt-1 text-[13px] text-[#4a5568]">
                      {service.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#1f2939]">
                Bác sĩ nổi bật
              </h3>
              <button
                type="button"
                className="text-[16px] font-medium text-[#2667ea]"
              >
                Xem thêm
              </button>
            </div>

            <div className="space-y-2">
              {featuredDoctors.map((doctor) => (
                <article
                  key={doctor.name}
                  className="flex items-center justify-between rounded-3xl border border-[#e5e8ee] bg-white px-3 py-2.5 shadow-[0_4px_14px_rgba(148,163,184,0.1)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3f7] text-[30px]">
                      {doctor.avatar}
                    </div>
                    <div>
                      <p className="text-[16px] font-bold leading-tight text-[#202939]">
                        {doctor.name}
                      </p>
                      <p className="mt-0.5 text-[14px] text-[#66758a]">
                        {doctor.specialty}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[14px] text-[#8d99aa]">
                        <Star className="h-4 w-4 fill-[#f6bf38] text-[#f6bf38]" />
                        <span className="text-[#334155]">{doctor.rating}</span>
                        <span>({doctor.reviews})</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Xem thông tin ${doctor.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ff] text-[#2f66dc]"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-[#dde3ed] bg-white/95 px-3 py-2 backdrop-blur">
          <ul className="grid grid-cols-4 text-center">
            <li>
              <Link
                href="/patient"
                className="flex flex-col items-center gap-1 text-[#2f66dc]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ff]">
                  <Stethoscope className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold">Trang chủ</span>
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
