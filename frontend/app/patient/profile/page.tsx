"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Activity,
  Bell,
  Bot,
  Camera,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  FileText,
  Heart,
  HeartHandshake,
  KeyRound,
  LogOut,
  MessageCircle,
  Pill,
  QrCode,
  Scale,
  Shield,
  Smartphone,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveSheet =
  | "edit"
  | "qr"
  | "health-record"
  | "medical-files"
  | "family"
  | "security"
  | "change-password"
  | "two-factor"
  | "devices"
  | "download-data"
  | "delete-account"
  | "ai-settings"
  | "logout"
  | null;

type AISetting = {
  key: string;
  label: string;
  description: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const healthCards = [
  { label: "Nhóm máu", value: "O+", icon: "🩸", color: "bg-[#fee2e2] text-[#dc2626]" },
  { label: "Chiều cao", value: "170 cm", icon: "📏", color: "bg-[#dbeafe] text-[#2563eb]" },
  { label: "Cân nặng", value: "68 kg", icon: "⚖️", color: "bg-[#fef9c3] text-[#ca8a04]" },
  { label: "BMI", value: "23.5", subLabel: "Bình thường", icon: "💪", color: "bg-[#dcfce7] text-[#16a34a]" },
  { label: "Dị ứng", value: "Penicillin", icon: "⚠️", color: "bg-[#ffedd5] text-[#ea580c]" },
  { label: "Bệnh nền", value: "Tăng huyết áp", icon: "❤️", color: "bg-[#fce7f3] text-[#db2777]" },
  { label: "Thuốc đang dùng", value: "2 loại", icon: "💊", color: "bg-[#ede9fe] text-[#7c3aed]" },
];

const aiCards = [
  { label: "Lần tư vấn", value: "12", icon: Bot, color: "bg-[#dcfce7] text-[#16a34a]" },
  { label: "Đang theo dõi", value: "2", icon: Activity, color: "bg-[#dbeafe] text-[#2563eb]" },
  { label: "AI Follow-up", value: "Bật", icon: Zap, color: "bg-[#fef9c3] text-[#ca8a04]" },
  { label: "Đánh giá gần nhất", value: "Hôm nay", icon: TrendingUp, color: "bg-[#ede9fe] text-[#7c3aed]" },
];

const myDoctors = [
  {
    name: "BS Nguyễn Văn A",
    specialty: "Tim mạch",
    avatar: "🩺",
    lastVisit: "20/05/2026",
    primary: true,
  },
  {
    name: "BS Trần Thị B",
    specialty: "Hô hấp",
    avatar: "👩‍⚕️",
    lastVisit: "10/04/2026",
    primary: false,
  },
];

const medicalFileItems = [
  { label: "Biên bản khám", icon: FileText, desc: "2 biên bản gần nhất", color: "bg-[#dbeafe] text-[#2563eb]" },
  { label: "Kết quả xét nghiệm", icon: Activity, desc: "Máu, nước tiểu · 15/05/2026", color: "bg-[#dcfce7] text-[#16a34a]" },
  { label: "Đơn thuốc", icon: Pill, desc: "Amlodipine 5mg · đang dùng", color: "bg-[#ede9fe] text-[#7c3aed]" },
  { label: "Chẩn đoán", icon: Stethoscope, desc: "Tăng huyết áp · 20/05/2026", color: "bg-[#fce7f3] text-[#db2777]" },
];

const familyMembers = [
  { name: "Tôi", role: "Chủ hồ sơ", avatar: "👨", active: true },
  { name: "Trần Thu H", role: "Vợ · Thai kỳ", avatar: "👩", active: false },
  { name: "Nguyễn Minh An", role: "Con trai · 3 tuổi", avatar: "👦", active: false },
];

const aiSettings: AISetting[] = [
  { key: "symptomUpdate", label: "Nhắc cập nhật triệu chứng", description: "Hàng ngày lúc 20:00" },
  { key: "medicine", label: "Nhắc uống thuốc", description: "07:30 và 20:00 mỗi ngày" },
  { key: "reexam", label: "Nhắc tái khám", description: "Trước 3 ngày" },
  { key: "followup", label: "Theo dõi sau khám", description: "AI tự động hỏi thăm" },
];

const securityItems = [
  { label: "Đổi mật khẩu", icon: KeyRound, desc: "Cập nhật mật khẩu định kỳ" },
  { label: "Xác thực 2 lớp", icon: Shield, desc: "Đã bật · qua SMS" },
  { label: "Quản lý thiết bị", icon: Smartphone, desc: "1 thiết bị đang đăng nhập" },
  { label: "Tải dữ liệu cá nhân", icon: Download, desc: "Xuất toàn bộ hồ sơ sức khỏe" },
  { label: "Xóa tài khoản", icon: Trash2, desc: "Hành động không thể hoàn tác", danger: true },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatientProfilePage() {
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [aiToggles, setAiToggles] = useState<Record<string, boolean>>({
    symptomUpdate: true,
    medicine: true,
    reexam: true,
    followup: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const noticeTimerRef = useRef<number | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [profileName, setProfileName] = useState("Nguyễn Văn An");
  const [profilePhone, setProfilePhone] = useState("0901 234 567");
  const [profileDob, setProfileDob] = useState("1998-05-24");
  const [profileAddress, setProfileAddress] = useState("Thanh Xuân, Hà Nội");
  const [profileEmergency, setProfileEmergency] = useState("Trần Thu H - 0912 345 678");
  const [profileGender, setProfileGender] = useState("Nam");

  const getAge = (dobString: string) => {
    try {
      const birthYear = new Date(dobString).getFullYear();
      if (isNaN(birthYear)) return 28;
      return 2026 - birthYear;
    } catch {
      return 28;
    }
  };

  const showNotice = (msg: string) => {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    setNotice(msg);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 2400);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTwoFactor = localStorage.getItem("twoFactorEnabled");
      if (savedTwoFactor !== null) {
        setTwoFactorEnabled(savedTwoFactor === "true");
      }

      const savedAiToggles = localStorage.getItem("aiToggles");
      if (savedAiToggles !== null) {
        try {
          setAiToggles(JSON.parse(savedAiToggles));
        } catch (e) {
          console.error("Failed to parse aiToggles", e);
        }
      }

      const savedName = localStorage.getItem("profileName");
      if (savedName !== null) setProfileName(savedName);

      const savedPhone = localStorage.getItem("profilePhone");
      if (savedPhone !== null) setProfilePhone(savedPhone);

      const savedDob = localStorage.getItem("profileDob");
      if (savedDob !== null) setProfileDob(savedDob);

      const savedAddress = localStorage.getItem("profileAddress");
      if (savedAddress !== null) setProfileAddress(savedAddress);

      const savedEmergency = localStorage.getItem("profileEmergency");
      if (savedEmergency !== null) setProfileEmergency(savedEmergency);

      const savedGender = localStorage.getItem("profileGender");
      if (savedGender !== null) setProfileGender(savedGender);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const next = URL.createObjectURL(file);
    setAvatarPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return next; });
    setActiveSheet(null);
    showNotice("Đã cập nhật ảnh đại diện.");
    e.target.value = "";
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText("#10234");
      showNotice("Đã sao chép ID sức khỏe.");
    } catch {
      showNotice("Không thể sao chép lúc này.");
    }
  };

  return (
    <main className="flex h-full min-h-0 justify-center bg-[#e9f5ed] px-2 py-2 sm:px-4 sm:py-5">
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden rounded-3xl border border-[#d7eadf] bg-[#f7fbf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">

        {/* ── Header ── */}
        <section className="relative overflow-hidden rounded-b-[30px] bg-linear-to-br from-[#1fa24a] via-[#16a34a] to-[#10813a] px-4 pb-5 pt-3 text-white">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-emerald-200/15 blur-2xl" />

          <div className="relative">
            <h1 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-white/70 uppercase">
              Hồ sơ của tôi
            </h1>

            {/* Identity card */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <button
                type="button"
                aria-label="Cập nhật ảnh đại diện"
                onClick={() => setActiveSheet("edit")}
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-3xl shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover" />
                ) : (
                  "👨🏻"
                )}
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#16a34a] bg-white text-[11px]">
                  📷
                </span>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[20px] font-bold leading-tight">{profileName}</p>
                <p className="mt-0.5 text-[13px] text-white/80">{profileGender} · {getAge(profileDob)} tuổi</p>
                <button
                  type="button"
                  onClick={copyId}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[12px] text-white/90 backdrop-blur-sm transition hover:bg-white/25"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                  ID #10234
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveSheet("edit")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 py-2.5 text-[14px] font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => setActiveSheet("qr")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 py-2.5 text-[14px] font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <QrCode className="h-4 w-4" />
                QR Hồ sơ
              </button>
            </div>
          </div>
        </section>

        {/* ── Scrollable body ── */}
        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 overscroll-contain">

          {/* Section 1: Hồ sơ sức khỏe */}
          <SectionHeader icon="❤️" title="Hồ sơ sức khỏe" onAction={() => setActiveSheet("health-record")} actionLabel="Sửa" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {healthCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[22px] border border-[#d8eadf] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
              >
                <div className={`mb-1.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl text-lg ${card.color}`}>
                  {card.icon}
                </div>
                <p className="text-[12px] text-[#6b7280]">{card.label}</p>
                <p className="text-[16px] font-bold text-[#1f2939]">{card.value}</p>
                {card.subLabel ? (
                  <span className="mt-0.5 inline-block rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                    {card.subLabel}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Section 2: Hồ sơ AI */}
          <SectionHeader icon="🤖" title="Hồ sơ AI" className="mt-7" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {aiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-[22px] border border-[#d8eadf] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                >
                  <div className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-2xl ${card.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-[12px] text-[#6b7280]">{card.label}</p>
                  <p className="text-[16px] font-bold text-[#1f2939]">{card.value}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-2 px-1 text-[12px] text-[#6b7280]">✨ AI đang theo dõi sức khỏe của bạn liên tục</p>

          {/* Section 3: Bác sĩ của tôi */}
          <SectionHeader icon="⚕️" title="Bác sĩ của tôi" className="mt-7" />
          <div className="mt-3 space-y-2.5">
            {myDoctors.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-3 rounded-[22px] border border-[#d8eadf] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0fbf4] text-2xl">
                  {doc.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-[#1f2939]">{doc.name}</p>
                    {doc.primary && (
                      <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                        Chính
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#6b7280]">{doc.specialty} · Khám: {doc.lastVisit}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/patient/consult")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a] transition hover:bg-[#bbf7d0]"
                  aria-label={`Nhắn tin với ${doc.name}`}
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Section 4: Hồ sơ khám bệnh */}
          <SectionHeader icon="📋" title="Hồ sơ khám bệnh" onAction={() => setActiveSheet("medical-files")} actionLabel="Xem tất cả" className="mt-7" />
          <div className="mt-3 overflow-hidden rounded-[22px] border border-[#d8eadf] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
            {medicalFileItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveSheet("medical-files")}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#f0fbf4] ${
                    i < medicalFileItems.length - 1 ? "border-b border-[#f0f4f8]" : ""
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#1f2939]">{item.label}</p>
                    <p className="text-[12px] text-[#6b7280]">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[#94a3b8]" />
                </button>
              );
            })}
          </div>

          {/* Section 5: Theo dõi sức khỏe */}
          <SectionHeader icon="📊" title="Sức khỏe của tôi" className="mt-7" />
          <div className="mt-3 overflow-hidden rounded-[22px] border border-[#d8eadf] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
            <div className="px-4 py-3 border-b border-[#f0f4f8]">
              <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-[0.1em]">
                Đang theo dõi
              </p>
            </div>
            {[
              { label: "Cân nặng", value: "68 kg", trend: "→", color: "text-[#6b7280]", dot: "bg-[#94a3b8]" },
              { label: "Huyết áp", value: "125/80", trend: "↑ nhẹ", color: "text-[#ca8a04]", dot: "bg-[#fbbf24]" },
              { label: "Nhịp tim", value: "72 bpm", trend: "Ổn định", color: "text-[#16a34a]", dot: "bg-[#4ade80]" },
            ].map((metric, i, arr) => (
              <div
                key={metric.label}
                className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#f0f4f8]" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${metric.dot}`} />
                  <p className="text-[14px] font-medium text-[#1f2939]">{metric.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-bold text-[#1f2939]">{metric.value}</p>
                  <p className={`text-[11px] font-medium ${metric.color}`}>{metric.trend}</p>
                </div>
              </div>
            ))}
            <div className="px-4 py-3 border-t border-[#f0f4f8]">
              <p className="text-[12px] text-[#6b7280]">
                💡 AI có thể dùng dữ liệu này để tư vấn chính xác hơn
              </p>
            </div>
          </div>

          {/* Section 6: Gia đình */}
          <SectionHeader icon="👨‍👩‍👦" title="Hồ sơ gia đình" onAction={() => setActiveSheet("family")} actionLabel="Quản lý" className="mt-7" />
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {familyMembers.map((member) => (
              <button
                key={member.name}
                type="button"
                onClick={() => setActiveSheet("family")}
                className={`shrink-0 rounded-[22px] border px-4 py-3.5 text-center shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 ${
                  member.active
                    ? "border-[#16a34a] bg-[#16a34a] text-white"
                    : "border-[#d8eadf] bg-white"
                }`}
              >
                <div className="text-2xl">{member.avatar}</div>
                <p className={`mt-1.5 text-[13px] font-semibold ${member.active ? "text-white" : "text-[#1f2939]"}`}>
                  {member.name}
                </p>
                <p className={`text-[11px] ${member.active ? "text-white/80" : "text-[#6b7280]"}`}>
                  {member.role}
                </p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveSheet("family")}
              className="shrink-0 rounded-[22px] border border-dashed border-[#a7d9b7] bg-[#f0fbf4] px-4 py-3.5 text-center transition hover:-translate-y-0.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a] mx-auto text-lg font-bold">+</div>
              <p className="mt-1.5 text-[13px] font-medium text-[#16a34a]">Thêm</p>
              <p className="text-[11px] text-[#6b7280]">người thân</p>
            </button>
          </div>

          {/* Section 7: Bảo mật */}
          <SectionHeader icon="🔐" title="Bảo mật" onAction={() => setActiveSheet("security")} actionLabel="Quản lý" className="mt-7" />
          <div className="mt-3 overflow-hidden rounded-[22px] border border-[#d8eadf] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
            {securityItems.map((item, i) => {
              const Icon = item.icon;
              const getSecuritySheetKey = (label: string): ActiveSheet => {
                if (label === "Đổi mật khẩu") return "change-password";
                if (label === "Xác thực 2 lớp") return "two-factor";
                if (label === "Quản lý thiết bị") return "devices";
                if (label === "Tải dữ liệu cá nhân") return "download-data";
                if (label === "Xóa tài khoản") return "delete-account";
                return "security";
              };
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveSheet(getSecuritySheetKey(item.label))}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#f0fbf4] ${
                    i < securityItems.length - 1 ? "border-b border-[#f0f4f8]" : ""
                  } ${item.danger ? "hover:bg-[#fff5f5]" : ""}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    item.danger ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#f0fbf4] text-[#16a34a]"
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-semibold ${item.danger ? "text-[#dc2626]" : "text-[#1f2939]"}`}>
                      {item.label}
                    </p>
                    <p className="text-[12px] text-[#6b7280]">
                      {item.label === "Xác thực 2 lớp"
                        ? (twoFactorEnabled ? "Đã bật · qua SMS" : "Đã tắt")
                        : item.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[#94a3b8]" />
                </button>
              );
            })}
          </div>

          {/* Section 8: Cài đặt AI */}
          <SectionHeader icon="🤖" title="Trợ lý AI" onAction={() => setActiveSheet("ai-settings")} actionLabel="Cài đặt" className="mt-7" />
          <div className="mt-3 overflow-hidden rounded-[22px] border border-[#d8eadf] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
            {aiSettings.map((setting, i) => (
              <div
                key={setting.key}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  i < aiSettings.length - 1 ? "border-b border-[#f0f4f8]" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1f2939]">{setting.label}</p>
                  <p className="text-[12px] text-[#6b7280]">{setting.description}</p>
                </div>
                <Toggle
                  enabled={aiToggles[setting.key] ?? true}
                  onChange={(val) =>
                    setAiToggles((prev) => {
                      const next = { ...prev, [setting.key]: val };
                      localStorage.setItem("aiToggles", JSON.stringify(next));
                      return next;
                    })
                  }
                />
              </div>
            ))}
          </div>

          {/* Đăng xuất */}
          <button
            type="button"
            onClick={() => setActiveSheet("logout")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[22px] border border-[#fecaca] bg-[#fff5f5] py-4 text-[15px] font-semibold text-[#dc2626] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:bg-[#fee2e2]"
          >
            <LogOut className="h-4.5 w-4.5" />
            Đăng xuất
          </button>

          <p className="mt-4 text-center text-[12px] text-[#94a3b8]">
            Mercy Health · Phiên bản 1.0.0
          </p>
        </section>

        {/* ── Bottom sheets ── */}
        {activeSheet ? (
          <BottomSheet onClose={() => setActiveSheet(null)}>
            {activeSheet === "edit" && (
              <EditSheet
                avatarPreview={avatarPreview}
                avatarInputRef={avatarInputRef}
                onAvatarChange={handleAvatarChange}
                onClose={() => setActiveSheet(null)}
                profileData={{
                  name: profileName,
                  phone: profilePhone,
                  dob: profileDob,
                  address: profileAddress,
                  emergency: profileEmergency,
                  gender: profileGender,
                }}
                onSave={(updated) => {
                  setProfileName(updated.name);
                  setProfilePhone(updated.phone);
                  setProfileDob(updated.dob);
                  setProfileAddress(updated.address);
                  setProfileEmergency(updated.emergency);
                  setProfileGender(updated.gender);
                  
                  localStorage.setItem("profileName", updated.name);
                  localStorage.setItem("profilePhone", updated.phone);
                  localStorage.setItem("profileDob", updated.dob);
                  localStorage.setItem("profileAddress", updated.address);
                  localStorage.setItem("profileEmergency", updated.emergency);
                  localStorage.setItem("profileGender", updated.gender);

                  setActiveSheet(null);
                  showNotice("Đã lưu thông tin cá nhân.");
                }}
              />
            )}
            {activeSheet === "qr" && (
              <QRSheet onClose={() => setActiveSheet(null)} onCopy={copyId} />
            )}
            {activeSheet === "health-record" && (
              <HealthRecordSheet onClose={() => setActiveSheet(null)} onSave={() => { setActiveSheet(null); showNotice("Đã cập nhật hồ sơ sức khỏe."); }} />
            )}
            {activeSheet === "medical-files" && (
              <MedicalFilesSheet onClose={() => setActiveSheet(null)} />
            )}
            {activeSheet === "family" && (
              <FamilySheet onClose={() => setActiveSheet(null)} onAdd={() => showNotice("Đã thêm thành viên gia đình (mô phỏng).")} />
            )}
            {activeSheet === "security" && (
              <SecuritySheet
                onClose={() => setActiveSheet(null)}
                twoFactorEnabled={twoFactorEnabled}
                onAction={(msg) => { setActiveSheet(null); showNotice(msg); }}
              />
            )}
            {activeSheet === "change-password" && (
              <ChangePasswordSheet onClose={() => setActiveSheet(null)} onSave={() => { setActiveSheet(null); showNotice("Đã thay đổi mật khẩu thành công."); }} />
            )}
            {activeSheet === "two-factor" && (
              <TwoFactorSheet
                onClose={() => setActiveSheet(null)}
                phone={profilePhone}
                initialEnabled={twoFactorEnabled}
                onSave={(enabled, phone) => {
                  setTwoFactorEnabled(enabled);
                  setProfilePhone(phone);
                  localStorage.setItem("twoFactorEnabled", String(enabled));
                  localStorage.setItem("profilePhone", phone);
                  setActiveSheet(null);
                  showNotice("Đã cập nhật cài đặt xác thực 2 lớp.");
                }}
              />
            )}
            {activeSheet === "devices" && (
              <DevicesSheet onClose={() => setActiveSheet(null)} onLogoutDevice={(name) => showNotice(`Đã đăng xuất khỏi ${name}`)} />
            )}
            {activeSheet === "download-data" && (
              <DownloadDataSheet onClose={() => setActiveSheet(null)} onDownload={(format) => { setActiveSheet(null); showNotice(`Bắt đầu tải về hồ sơ dạng ${format.toUpperCase()}`); }} />
            )}
            {activeSheet === "delete-account" && (
              <DeleteAccountSheet onClose={() => setActiveSheet(null)} onDeleteConfirm={() => { setActiveSheet(null); showNotice("Yêu cầu xóa tài khoản đã được tiếp nhận."); }} />
            )}
            {activeSheet === "ai-settings" && (
              <AISettingsSheet
                toggles={aiToggles}
                onChange={(key, val) =>
                  setAiToggles((prev) => {
                    const next = { ...prev, [key]: val };
                    localStorage.setItem("aiToggles", JSON.stringify(next));
                    return next;
                  })
                }
                onClose={() => { setActiveSheet(null); showNotice("Đã lưu cài đặt trợ lý AI."); }}
              />
            )}
            {activeSheet === "logout" && (
              <LogoutSheet onClose={() => setActiveSheet(null)} onConfirm={() => router.push("/login")} />
            )}
          </BottomSheet>
        ) : null}

        {/* ── Toast notice ── */}
        {notice ? (
          <div className="absolute bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-[#1f2939] px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)]">
            {notice}
          </div>
        ) : null}
      </div>

      {/* Hidden avatar input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  onAction,
  actionLabel,
  className = "",
}: {
  icon: string;
  title: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#1f2939]">
        <span>{icon}</span>
        {title}
      </h2>
      {onAction && actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="text-[13px] font-semibold text-[#16a34a]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-[#16a34a]" : "bg-[#d1d5db]"
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function BottomSheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[85dvh] w-full max-w-97.5 overflow-y-auto rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ label, title, onClose }: { label: string; title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-1">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#16a34a]">{label}</p>
        <h3 className="mt-0.5 text-[18px] font-bold text-[#1f2939]">{title}</h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Edit sheet
function EditSheet({
  avatarPreview,
  avatarInputRef,
  onAvatarChange,
  onClose,
  profileData,
  onSave,
}: {
  avatarPreview: string | null;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  profileData: {
    name: string;
    phone: string;
    dob: string;
    address: string;
    emergency: string;
    gender: string;
  };
  onSave: (updated: {
    name: string;
    phone: string;
    dob: string;
    address: string;
    emergency: string;
    gender: string;
  }) => void;
}) {
  const [name, setName] = useState(profileData.name);
  const [phone, setPhone] = useState(profileData.phone);
  const [dob, setDob] = useState(profileData.dob);
  const [address, setAddress] = useState(profileData.address);
  const [emergency, setEmergency] = useState(profileData.emergency);
  const [gender, setGender] = useState(profileData.gender);

  return (
    <>
      <SheetHeader label="Hồ sơ cá nhân" title="Chỉnh sửa thông tin" onClose={onClose} />
      <div className="px-5 pb-5 pt-3 text-left">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0fbf4] text-3xl shadow-sm">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover" />
            ) : "👨🏻"}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="flex items-center gap-2 rounded-2xl bg-[#16a34a] px-4 py-2 text-[13px] font-medium text-white cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              Đổi ảnh
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Người liên hệ khẩn cấp</label>
            <input
              type="text"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280] cursor-pointer">
            Huỷ
          </button>
          <button type="button" onClick={() => onSave({ name, phone, dob, address, emergency, gender })} className="flex-1 rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white cursor-pointer hover:bg-emerald-700 transition">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  );
}

// Change Password sheet
function ChangePasswordSheet({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới nhập lại không khớp!");
      return;
    }
    onSave();
  };

  return (
    <>
      <SheetHeader label="Bảo mật" title="Đổi mật khẩu" onClose={onClose} />
      <div className="px-5 pb-5 pt-3 text-left">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a]"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280] cursor-pointer">
            Huỷ
          </button>
          <button
            type="button"
            disabled={!currentPassword || !newPassword || !confirmPassword}
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white disabled:opacity-50 cursor-pointer hover:bg-emerald-700 transition"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </>
  );
}

// Two Factor sheet
function TwoFactorSheet({
  onClose,
  phone,
  initialEnabled,
  onSave,
}: {
  onClose: () => void;
  phone: string;
  initialEnabled: boolean;
  onSave: (enabled: boolean, phone: string) => void;
}) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [otpPhone, setOtpPhone] = useState(phone);

  return (
    <>
      <SheetHeader label="Bảo mật" title="Xác thực 2 lớp (2FA)" onClose={onClose} />
      <div className="px-5 pb-5 pt-3 text-left">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-100 bg-[#f0fbf4] p-3.5">
          <div>
            <p className="text-sm font-semibold text-[#1f2939]">Trạng thái bảo mật 2 lớp</p>
            <p className="text-[12px] text-[#6b7280]">Bảo vệ tài khoản qua SMS OTP</p>
          </div>
          <Toggle enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {isEnabled && (
          <div className="mb-4">
            <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">Số điện thoại nhận mã OTP</label>
            <input
              type="tel"
              value={otpPhone}
              onChange={(e) => setOtpPhone(e.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a]"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280] cursor-pointer">
            Huỷ
          </button>
          <button
            type="button"
            onClick={() => onSave(isEnabled, otpPhone)}
            className="flex-1 rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white cursor-pointer hover:bg-emerald-700 transition"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </>
  );
}

// Devices sheet
function DevicesSheet({ onClose, onLogoutDevice }: { onClose: () => void; onLogoutDevice: (name: string) => void }) {
  const [devices, setDevices] = useState([
    { id: "d1", name: "iPhone 15 Pro Max", location: "Hà Nội, Việt Nam", active: true, desc: "Thiết bị hiện tại" },
    { id: "d2", name: "Chrome on Windows PC", location: "Đống Đa, Hà Nội", active: false, desc: "Hoạt động: 2 giờ trước" },
    { id: "d3", name: "Safari on MacBook Pro", location: "Cầu Giấy, Hà Nội", active: false, desc: "Hoạt động: Hôm qua" },
  ]);

  const handleLogout = (id: string, name: string) => {
    setDevices((current) => current.filter((dev) => dev.id !== id));
    onLogoutDevice(name);
  };

  return (
    <>
      <SheetHeader label="Bảo mật" title="Quản lý thiết bị đăng nhập" onClose={onClose} />
      <div className="px-5 pb-5 pt-3 text-left">
        <p className="text-[12px] text-[#6b7280] mb-3">Các thiết bị đang đăng nhập tài khoản của bạn:</p>
        <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
          {devices.map((dev) => (
            <div key={dev.id} className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f0fbf4] text-xl">
                {dev.name.includes("iPhone") ? "📱" : "💻"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-[#1f2939] truncate">{dev.name}</p>
                  {dev.active && (
                    <span className="rounded-full bg-[#dcfce7] px-2 py-0.2 text-[9px] font-bold text-[#16a34a]">
                      Đang chạy
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6b7280]">{dev.location} · {dev.desc}</p>
              </div>
              {!dev.active && (
                <button
                  type="button"
                  onClick={() => handleLogout(dev.id, dev.name)}
                  className="rounded-xl border border-red-100 bg-[#fff5f5] px-2.5 py-1.5 text-[11px] font-bold text-[#dc2626] hover:bg-red-50 cursor-pointer transition active:scale-95 shrink-0"
                >
                  Đăng xuất
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white cursor-pointer hover:bg-emerald-700 transition">
          Đóng
        </button>
      </div>
    </>
  );
}

// Download Data sheet
function DownloadDataSheet({ onClose, onDownload }: { onClose: () => void; onDownload: (format: "pdf" | "json") => void }) {
  return (
    <>
      <SheetHeader label="Bảo mật" title="Tải dữ liệu cá nhân" onClose={onClose} />
      <div className="px-5 pb-6 pt-3 text-left">
        <p className="text-[13px] leading-6 text-[#6b7280]">
          Theo quy định về quyền riêng tư, bạn có thể tải về bản sao toàn bộ hồ sơ y khoa, lịch sử tư vấn AI và thông tin đặt lịch khám của mình tại Mercy.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onDownload("pdf")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#d8eadf] bg-white p-4 shadow-sm hover:bg-[#f0fbf4] cursor-pointer transition active:scale-95"
          >
            <span className="text-3xl">📄</span>
            <span className="text-[13px] font-bold text-[#1f2939]">Báo cáo tổng hợp (PDF)</span>
            <span className="text-[10px] text-[#6b7280]">Thích hợp in ấn, lưu trữ</span>
          </button>

          <button
            type="button"
            onClick={() => onDownload("json")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#d8eadf] bg-white p-4 shadow-sm hover:bg-[#f0fbf4] cursor-pointer transition active:scale-95"
          >
            <span className="text-3xl">💾</span>
            <span className="text-[13px] font-bold text-[#1f2939]">Dữ liệu thô (JSON)</span>
            <span className="text-[10px] text-[#6b7280]">Dùng đồng bộ hệ thống khác</span>
          </button>
        </div>

        <button type="button" onClick={onClose} className="mt-4.5 w-full rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#475569] py-3 text-[13px] font-bold transition cursor-pointer">
          Quay lại
        </button>
      </div>
    </>
  );
}

// Delete Account sheet
function DeleteAccountSheet({ onClose, onDeleteConfirm }: { onClose: () => void; onDeleteConfirm: () => void }) {
  const [confirmCheck, setConfirmCheck] = useState(false);

  return (
    <>
      <SheetHeader label="Bảo mật" title="Xóa tài khoản cá nhân" onClose={onClose} />
      <div className="px-5 pb-5 pt-3 text-left">
        <div className="rounded-2xl border border-red-100 bg-[#fff5f5] p-3.5 mb-4 text-xs text-[#991b1b] leading-relaxed">
          <p className="font-extrabold text-[13px] mb-1">Cảnh báo nghiêm trọng!</p>
          <p className="text-[#7f1d1d]">
            Hành động này sẽ xóa vĩnh viễn tài khoản Mercy của bạn, toàn bộ lịch sử tư vấn bệnh án y khoa, đơn thuốc trực tuyến và không thể khôi phục lại dưới bất kỳ hình thức nào.
          </p>
        </div>

        <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmCheck}
            onChange={(e) => setConfirmCheck(e.target.checked)}
            className="mt-1.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
          />
          <span className="text-[12.5px] font-semibold text-[#475569] leading-snug">
            Tôi hiểu và đồng ý xóa vĩnh viễn mọi dữ liệu cá nhân liên kết với tài khoản này.
          </span>
        </label>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280] cursor-pointer">
            Huỷ
          </button>
          <button
            type="button"
            disabled={!confirmCheck}
            onClick={onDeleteConfirm}
            className="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 py-3 text-[14px] font-semibold text-white disabled:opacity-50 cursor-pointer transition active:scale-95"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </>
  );
}

// QR sheet
function QRSheet({ onClose, onCopy }: { onClose: () => void; onCopy: () => void }) {
  return (
    <>
      <SheetHeader label="Định danh y tế" title="QR Hồ sơ sức khỏe" onClose={onClose} />
      <div className="px-5 pb-6 pt-3 text-center">
        <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-3xl bg-[#f0fbf4] text-7xl shadow-inner">
          📱
        </div>
        <p className="text-[14px] text-[#6b7280]">
          Cho bác sĩ quét mã để chia sẻ hồ sơ sức khỏe của bạn nhanh chóng.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#f0fbf4] py-2.5">
          <span className="text-[15px] font-bold text-[#1f2939]">ID #10234</span>
          <button type="button" onClick={onCopy} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white">
          Đóng
        </button>
      </div>
    </>
  );
}

// Health record sheet
function HealthRecordSheet({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <>
      <SheetHeader label="Hồ sơ sức khỏe" title="Cập nhật chỉ số sức khỏe" onClose={onClose} />
      <div className="max-h-[60vh] overflow-y-auto px-5 pb-5 pt-3">
        <div className="space-y-3">
          {[
            { label: "Nhóm máu", value: "O+", type: "text" },
            { label: "Chiều cao (cm)", value: "170", type: "number" },
            { label: "Cân nặng (kg)", value: "68", type: "number" },
            { label: "Dị ứng", value: "Penicillin", type: "text" },
            { label: "Bệnh nền", value: "Tăng huyết áp", type: "text" },
            { label: "Thuốc đang sử dụng", value: "Amlodipine 5mg, Vitamin tổng hợp", type: "text" },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-1 block text-[12px] font-semibold text-[#6b7280]">{field.label}</label>
              <input
                type={field.type}
                defaultValue={field.value}
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-2.5 text-[14px] text-[#1f2939] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280]">
            Huỷ
          </button>
          <button type="button" onClick={onSave} className="flex-1 rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white">
            Lưu
          </button>
        </div>
      </div>
    </>
  );
}

// Medical files sheet
function MedicalFilesSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <SheetHeader label="Hồ sơ khám bệnh" title="Tài liệu y tế của bạn" onClose={onClose} />
      <div className="px-5 pb-5 pt-3">
        <div className="space-y-2.5">
          {[
            { label: "Biên bản khám 20/05/2026", size: "128 KB", tag: "PDF", tagColor: "bg-[#dbeafe] text-[#2563eb]" },
            { label: "Kết quả xét nghiệm máu", size: "256 KB", tag: "PDF", tagColor: "bg-[#dcfce7] text-[#16a34a]" },
            { label: "Đơn thuốc Amlodipine", size: "64 KB", tag: "PDF", tagColor: "bg-[#ede9fe] text-[#7c3aed]" },
            { label: "Chẩn đoán tăng huyết áp", size: "96 KB", tag: "PDF", tagColor: "bg-[#fce7f3] text-[#db2777]" },
          ].map((file) => (
            <div key={file.label} className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0fbf4] text-xl">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1f2939]">{file.label}</p>
                <p className="text-[11px] text-[#6b7280]">{file.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${file.tagColor}`}>{file.tag}</span>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f4f8] text-[#6b7280]">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white">
          Đóng
        </button>
      </div>
    </>
  );
}

// Family sheet
function FamilySheet({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  return (
    <>
      <SheetHeader label="Gia đình" title="Hồ sơ thành viên gia đình" onClose={onClose} />
      <div className="px-5 pb-5 pt-3">
        <div className="space-y-2.5 mb-4">
          {familyMembers.map((member) => (
            <div key={member.name} className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0fbf4] text-2xl">
                {member.avatar}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1f2939]">{member.name}</p>
                <p className="text-[12px] text-[#6b7280]">{member.role}</p>
              </div>
              {member.active && (
                <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                  Chính
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280]">
            Đóng
          </button>
          <button type="button" onClick={() => { onAdd(); onClose(); }} className="flex-1 rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white">
            + Thêm thành viên
          </button>
        </div>
      </div>
    </>
  );
}

// Security sheet
function SecuritySheet({
  onClose,
  twoFactorEnabled,
  onAction,
}: {
  onClose: () => void;
  twoFactorEnabled: boolean;
  onAction: (msg: string) => void;
}) {
  return (
    <>
      <SheetHeader label="Bảo mật" title="Quản lý bảo mật tài khoản" onClose={onClose} />
      <div className="px-5 pb-5 pt-3">
        <div className="space-y-2">
          {securityItems.filter((i) => !i.danger).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onAction(`${item.label} (mô phỏng) đã được thực hiện.`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fbf8] px-4 py-3 text-left transition hover:bg-[#f0fbf4]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0fbf4] text-[#16a34a]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1f2939]">{item.label}</p>
                  <p className="text-[12px] text-[#6b7280]">
                    {item.label === "Xác thực 2 lớp"
                      ? (twoFactorEnabled ? "Đã bật · qua SMS" : "Đã tắt")
                      : item.desc}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#94a3b8]" />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onAction("Xóa tài khoản đã bị chặn (mô phỏng).")}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-left transition hover:bg-[#fee2e2]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fee2e2] text-[#dc2626]">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#dc2626]">Xóa tài khoản</p>
              <p className="text-[12px] text-[#6b7280]">Hành động không thể hoàn tác</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#fca5a5]" />
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white">
          Đóng
        </button>
      </div>
    </>
  );
}

// AI settings sheet
function AISettingsSheet({
  toggles,
  onChange,
  onClose,
}: {
  toggles: Record<string, boolean>;
  onChange: (key: string, val: boolean) => void;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHeader label="Trợ lý AI" title="Cài đặt AI cá nhân hoá" onClose={onClose} />
      <div className="px-5 pb-5 pt-3">
        <div className="mb-3 rounded-2xl bg-[#f0fbf4] px-4 py-3">
          <p className="text-[13px] text-[#16a34a] font-medium">
            ✨ Trợ lý AI đang hoạt động và theo dõi sức khỏe của bạn
          </p>
        </div>
        <div className="space-y-0 overflow-hidden rounded-2xl border border-[#d8eadf]">
          {aiSettings.map((setting, i) => (
            <div
              key={setting.key}
              className={`flex items-center gap-3 bg-white px-4 py-3.5 ${
                i < aiSettings.length - 1 ? "border-b border-[#f0f4f8]" : ""
              }`}
            >
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1f2939]">{setting.label}</p>
                <p className="text-[12px] text-[#6b7280]">{setting.description}</p>
              </div>
              <Toggle enabled={toggles[setting.key] ?? true} onChange={(val) => onChange(setting.key, val)} />
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-[#16a34a] py-3 text-[14px] font-semibold text-white">
          Lưu cài đặt
        </button>
      </div>
    </>
  );
}

// Logout sheet
function LogoutSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="px-5 py-6 text-center">
      <div className="mb-3 text-5xl">👋</div>
      <h3 className="text-[18px] font-bold text-[#1f2939]">Đăng xuất?</h3>
      <p className="mt-1.5 text-[14px] text-[#6b7280]">
        Bạn có chắc muốn đăng xuất khỏi Mercy Health không?
      </p>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-[#d8eadf] py-3 text-[14px] font-medium text-[#6b7280]">
          Ở lại
        </button>
        <button type="button" onClick={onConfirm} className="flex-1 rounded-2xl bg-[#dc2626] py-3 text-[14px] font-semibold text-white">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
