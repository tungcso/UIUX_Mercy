"use client";

import React, { useEffect, useRef, useState } from "react";
import { UserCircle2, Settings2, LogOut, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorDropdown() {
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState<
    null | "profile" | "settings" | "logout"
  >(null);
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
        setOpenModal(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setOpenModal(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // ignore
    }
    try {
      localStorage.removeItem("authToken");
    } catch (e) {}
    router.replace("/login");
  }

  return (
    <div className="relative z-20" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-full rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-sm transition-colors hover:bg-slate-100 p-3`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            TN
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800">
              ThS. Nguyễn Văn Quân
            </div>
            <div className="truncate text-xs text-slate-500">
              Giám đốc phòng khám
            </div>
          </div>
          <ChevronUp
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-0" : "rotate-180"}`}
          />
        </div>
      </button>

      {open ? (
        <div className="absolute z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)] bottom-[calc(100%+0.5rem)] right-0 w-56">
          <div className="mb-1 px-2 py-1.5">
            <p className="truncate text-sm font-semibold text-slate-800">
              ThS. Nguyễn Văn Quân
            </p>
            <p className="truncate text-xs text-slate-500">
              Giám đốc phòng khám
            </p>
          </div>

          <div className="my-1 h-px bg-slate-100" />

          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={() => {
              setOpen(false);
              setOpenModal("profile");
            }}
          >
            <UserCircle2 className="h-4 w-4" />
            Hồ sơ cá nhân
          </button>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={() => {
              setOpen(false);
              setOpenModal("settings");
            }}
          >
            <Settings2 className="h-4 w-4" />
            Cài đặt
          </button>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
            onClick={() => {
              setOpen(false);
              setOpenModal("logout");
            }}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      ) : null}

      {openModal === "profile" ? (
        <ProfileModal onClose={() => setOpenModal(null)} />
      ) : null}

      {openModal === "settings" ? (
        <SettingsModal onClose={() => setOpenModal(null)} />
      ) : null}

      {openModal === "logout" ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setOpenModal(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="absolute right-3 top-3 text-slate-400"
            >
              ×
            </button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                TN
              </div>
              <div>
                <h3 className="font-semibold">Đăng xuất tài khoản</h3>
                <div className="text-xs text-slate-500">
                  ThS. Nguyễn Văn Quân
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản lý? Hành động
              này sẽ yêu cầu đăng nhập lại.
            </p>
            <div className="mt-4 text-right">
              <button
                onClick={() => setOpenModal(null)}
                className="mr-2 rounded-md px-3 py-2 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleLogout();
                }}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "ThS. Nguyễn Văn Quân",
    phone: "+84 912 345 678",
    email: "quannv@medos.example",
    dob: "1980-01-01",
  });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng hồ sơ"
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Hồ sơ cá nhân</h3>
            <p className="text-xs text-slate-400 mt-1">
              Mã nhân sự: MNV-202601 · Chức vụ: Quản lý tổng hợp
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditing((s) => !s);
              }}
              className="rounded-md border px-3 py-1 text-sm"
            >
              {editing ? "Huỷ" : "Chỉnh sửa"}
            </button>
            <button onClick={onClose} className="text-slate-400">
              ×
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 items-start">
          <div className="col-span-1">
            <div className="h-28 w-28 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
              TN
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Kéo thả để thay avatar
            </div>
          </div>

          <div className="col-span-2 grid gap-3">
            <label className="text-xs text-slate-500">Họ và tên</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
            />

            <label className="text-xs text-slate-500">Số điện thoại</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
            />

            <label className="text-xs text-slate-500">Email cơ quan</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!editing}
              className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
            />

            <label className="text-xs text-slate-500">Ngày sinh</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              disabled={!editing}
              className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
            />

            {editing ? (
              <div className="mt-2 text-right">
                <button className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm">
                  Lưu
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"profile" | "clinic" | "security" | "prefs">(
    "profile",
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng cài đặt"
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl rounded-xl bg-white p-0 shadow-lg overflow-hidden">
        <div className="flex">
          <aside className="w-72 border-r border-slate-100 bg-slate-50 p-4">
            <div className="mb-4">
              <div className="text-sm font-semibold">Cài đặt tài khoản</div>
              <div className="text-xs text-slate-400">
                Quản lý thông tin & cấu hình phòng khám
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setTab("profile")}
                className={`w-full text-left rounded-md px-3 py-2 ${tab === "profile" ? "bg-white shadow-sm" : "hover:bg-slate-100"}`}
              >
                Hồ sơ cá nhân
              </button>
              <button
                onClick={() => setTab("clinic")}
                className={`w-full text-left rounded-md px-3 py-2 ${tab === "clinic" ? "bg-white shadow-sm" : "hover:bg-slate-100"}`}
              >
                Cấu hình phòng khám
              </button>
              <button
                onClick={() => setTab("security")}
                className={`w-full text-left rounded-md px-3 py-2 ${tab === "security" ? "bg-white shadow-sm" : "hover:bg-slate-100"}`}
              >
                Phân quyền & Bảo mật
              </button>
              <button
                onClick={() => setTab("prefs")}
                className={`w-full text-left rounded-md px-3 py-2 ${tab === "prefs" ? "bg-white shadow-sm" : "hover:bg-slate-100"}`}
              >
                Tùy chọn hệ thống
              </button>
            </nav>
          </aside>

          <div className="flex-1 p-6">
            {tab === "profile" && <ProfileTab />}
            {tab === "clinic" && <ClinicTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "prefs" && <PrefsTab />}

            <div className="mt-6 text-right">
              <button
                onClick={onClose}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm mr-2"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "ThS. Nguyễn Văn Quân",
    phone: "+84 912 345 678",
    email: "quannv@medos.example",
    dob: "1980-01-01",
  });
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold">Hồ sơ cá nhân</h4>
          <p className="text-xs text-slate-400">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
        <div>
          <button
            onClick={() => setEditing((s) => !s)}
            className="rounded-md border px-3 py-1 text-sm"
          >
            {editing ? "Huỷ" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 items-start">
        <div className="col-span-1">
          <div className="h-28 w-28 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
            TN
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Kéo thả để thay avatar
          </div>
        </div>

        <div className="col-span-2 grid gap-3">
          <label className="text-xs text-slate-500">Họ và tên</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!editing}
            className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
          />

          <label className="text-xs text-slate-500">Số điện thoại</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!editing}
            className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
          />

          <label className="text-xs text-slate-500">Email cơ quan</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!editing}
            className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
          />

          <label className="text-xs text-slate-500">Ngày sinh</label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            disabled={!editing}
            className={`rounded-md border px-3 py-2 ${editing ? "" : "bg-slate-50"}`}
          />

          {editing ? (
            <div className="mt-2 text-right">
              <button className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm">
                Lưu
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ClinicTab() {
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [slotMin, setSlotMin] = useState(15);
  const [services, setServices] = useState([
    { id: 1, name: "Khám tổng quát", price: 200, active: true },
    { id: 2, name: "Khám chuyên khoa", price: 350, active: true },
  ]);

  return (
    <div>
      <h4 className="text-lg font-semibold">Cấu hình phòng khám</h4>
      <p className="text-xs text-slate-400">
        Thiết lập giờ hoạt động và dịch vụ
      </p>

      <div className="mt-4 grid gap-4">
        <div className="rounded-md border p-4">
          <div className="font-medium">Cài đặt ca khám</div>
          <div className="mt-2 flex items-center gap-3">
            <div>
              <div className="text-xs text-slate-400">Giờ bắt đầu</div>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">Giờ kết thúc</div>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Thời gian 1 ca (phút)
              </div>
              <input
                type="number"
                value={slotMin}
                onChange={(e) => setSlotMin(Number(e.target.value))}
                className="rounded-md border px-3 py-2 w-28"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">Dịch vụ & Bảng giá</div>
          <div className="mt-3 space-y-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded p-2 border"
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-400">
                    {s.price} nghìn VND
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-400">Hoạt động</label>
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={() =>
                      setServices(
                        services.map((x) =>
                          x.id === s.id ? { ...x, active: !x.active } : x,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white">
              Lưu thay đổi
            </button>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">Ngày nghỉ lễ (Calendar)</div>
          <div className="mt-2 text-xs text-slate-400">
            Chọn ngày nghỉ để khóa lịch đặt trực tuyến
          </div>
          <div className="mt-3">
            <input type="date" className="rounded-md border px-3 py-2" />
            <button className="ml-2 rounded-md border px-3 py-2 text-sm">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  function passwordStrength(p: string) {
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score; // 0-4
  }

  const strength = passwordStrength(newPass);
  const strengthColor = [
    "bg-red-500",
    "bg-amber-400",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ][strength];

  const roles = [
    { id: 1, name: "Bác sĩ A", perms: ["Xem bệnh án"] },
    { id: 2, name: "Tiếp tân B", perms: ["Quản lý lịch"] },
    { id: 3, name: "Chuyên gia C", perms: ["Xem báo cáo"] },
  ];

  return (
    <div>
      <h4 className="text-lg font-semibold">Phân quyền & Bảo mật</h4>
      <p className="text-xs text-slate-400">
        Thay đổi mật khẩu và quản lý quyền truy cập
      </p>

      <div className="mt-4 grid gap-4">
        <div className="rounded-md border p-4">
          <div className="font-medium">Đổi mật khẩu</div>
          <div className="mt-3 grid gap-2">
            <input
              placeholder="Mật khẩu cũ"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              type="password"
              className="rounded-md border px-3 py-2"
            />
            <input
              placeholder="Mật khẩu mới"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              type="password"
              className="rounded-md border px-3 py-2"
            />
            <div className="h-2 w-full rounded bg-slate-100 overflow-hidden mt-1">
              <div
                className={`${strengthColor} h-2`}
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>
            <input
              placeholder="Xác nhận mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              className="rounded-md border px-3 py-2"
            />
            <div className="mt-2 text-right">
              <button className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white">
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">Quản lý phân quyền</div>
          <div className="mt-3 space-y-2">
            {roles.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded p-2 border"
              >
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-slate-400">
                    {r.perms.join(", ")}
                  </div>
                </div>
                <div>
                  <button className="rounded-md border px-2 py-1 text-sm">
                    Sửa quyền
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefsTab() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div>
      <h4 className="text-lg font-semibold">Tùy chọn hệ thống</h4>
      <p className="text-xs text-slate-400">Cá nhân hóa trải nghiệm</p>

      <div className="mt-4 space-y-4">
        <div className="rounded-md border p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">Thông báo</div>
            <div className="text-xs text-slate-400">
              Nhận thông báo khi có lịch mới, hủy khẩn, báo cáo
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={() => setEmailNotif((s) => !s)}
              />{" "}
              Email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={appNotif}
                onChange={() => setAppNotif((s) => !s)}
              />{" "}
              App
            </label>
          </div>
        </div>

        <div className="rounded-md border p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">Giao diện</div>
            <div className="text-xs text-slate-400">Chọn chế độ hiển thị</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-1 rounded ${theme === "light" ? "bg-slate-200" : "border"}`}
            >
              Sáng
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-1 rounded ${theme === "dark" ? "bg-slate-800 text-white" : "border"}`}
            >
              Tối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
