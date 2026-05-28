"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UserCircle2, Settings2, LogOut, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  dob: string;
};

type ClinicService = {
  id: number;
  name: string;
  price: number;
  active: boolean;
};

type ClinicSettings = {
  shiftStart: string;
  shiftEnd: string;
  slotMin: number;
  services: ClinicService[];
  holidayDate: string;
  holidays: string[];
};

const PROFILE_STORAGE_KEY = "doctor-dropdown-profile";
const CLINIC_STORAGE_KEY = "doctor-dropdown-clinic";
const SECURITY_STORAGE_KEY = "doctor-dropdown-security";
const PREFS_STORAGE_KEY = "doctor-dropdown-prefs";

const DEFAULT_PROFILE: ProfileForm = {
  name: "ThS. Nguyễn Văn Quân",
  phone: "+84 912 345 678",
  email: "quannv@medos.example",
  dob: "1980-01-01",
};

const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  shiftStart: "08:00",
  shiftEnd: "17:00",
  slotMin: 15,
  services: [
    { id: 1, name: "Khám tổng quát", price: 200, active: true },
    { id: 2, name: "Khám chuyên khoa", price: 350, active: true },
  ],
  holidayDate: "",
  holidays: [],
};

const DEFAULT_PREFS = {
  emailNotif: true,
  smsNotif: false,
  compactMode: false,
  language: "vi",
};

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return fallback;
    }
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

export default function DoctorDropdown() {
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState<
    null | "profile" | "settings" | "logout"
  >(null);
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      const target = e.target as Node;
      if (!ref.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
    };
  }, [openModal]);

  function handleLogout() {
    // delegate to the shared handler defined below
    handleLogoutAction(router);
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
            <p className="truncate text-sm font-semibold text-slate-900">
              ThS. Nguyễn Văn Quân
            </p>
            <p className="truncate text-xs text-slate-600">
              Giám đốc phòng khám
            </p>
          </div>

          <div className="my-1 h-px bg-slate-100" />

          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 hover:text-slate-900"
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
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 hover:text-slate-900"
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
            <LogOut className="h-4 w-4 text-rose-600" />
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

      {openModal === "logout"
        ? createPortal(
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-slate-950/45"
              />
              <div
                ref={modalContentRef}
                className="relative z-10000 w-full max-w-sm rounded-xl bg-white p-5 shadow-lg"
              >
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
                    <h3 className="text-lg font-bold text-slate-800">
                      Đăng xuất tài khoản
                    </h3>
                    <div className="text-xs text-slate-500">
                      ThS. Nguyễn Văn Quân
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản lý? Hành
                  động này sẽ yêu cầu đăng nhập lại.
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

async function handleLogoutAction(router: any) {
  try {
    localStorage.removeItem("authToken");
  } catch (e) {
    // ignore
  }
  router.replace("/login");
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [savedForm, setSavedForm] = useState<ProfileForm>(() =>
    readLocalStorage(PROFILE_STORAGE_KEY, DEFAULT_PROFILE),
  );
  const [form, setForm] = useState<ProfileForm>(() =>
    readLocalStorage(PROFILE_STORAGE_KEY, DEFAULT_PROFILE),
  );
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  function handleStartEditing() {
    setForm(savedForm);
    setEditing(true);
  }

  function handleCancelEditing() {
    setForm(savedForm);
    setEditing(false);
  }

  function handleSave() {
    setSavedForm(form);
    writeLocalStorage(PROFILE_STORAGE_KEY, form);
    setEditing(false);
    setSaveNotice("Đã lưu hồ sơ thành công.");
    window.setTimeout(() => setSaveNotice(null), 2200);
  }

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/45" />
      <div className="relative z-10000 w-full max-w-lg rounded-xl bg-white p-6 text-slate-800 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hồ sơ cá nhân</h3>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Mã nhân sự: MNV-202601 · Chức vụ: Quản lý tổng hợp
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (editing) {
                  handleCancelEditing();
                  return;
                }
                handleStartEditing();
              }}
              className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors ${editing ? "bg-slate-900 text-white hover:bg-slate-800" : "border border-slate-300 text-slate-800 hover:bg-slate-50"}`}
            >
              {editing ? "Huỷ" : "Chỉnh sửa"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-slate-500"
            >
              ×
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 items-start">
          <div className="col-span-1">
            <div className="h-28 w-28 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
              TN
            </div>
            <div className="mt-2 text-sm font-medium text-slate-600">
              Kéo thả để thay avatar
            </div>
          </div>

          <div className="col-span-2 grid gap-3">
            <label className="text-sm font-semibold text-slate-700">
              Họ và tên
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              readOnly={!editing}
              className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
            />

            <label className="text-sm font-semibold text-slate-700">
              Số điện thoại
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              readOnly={!editing}
              className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
            />

            <label className="text-sm font-semibold text-slate-700">
              Email cơ quan
            </label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!editing}
              readOnly={!editing}
              className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
            />

            <label className="text-sm font-semibold text-slate-700">
              Ngày sinh
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              disabled={!editing}
              readOnly={!editing}
              className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
            />

            {editing ? (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            ) : null}

            {saveNotice ? (
              <div className="mt-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                {saveNotice}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"clinic" | "security" | "prefs">("clinic");

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/45" />
      <div className="relative z-10000 w-full max-w-4xl overflow-hidden rounded-xl bg-white p-0 text-slate-800 shadow-lg">
        <div className="flex">
          <aside className="w-72 border-r border-slate-100 bg-slate-50 p-4">
            <div className="mb-4">
              <div className="text-sm font-bold text-slate-900">
                Cài đặt tài khoản
              </div>
              <div className="text-sm font-medium text-slate-600">
                Quản lý thông tin & cấu hình phòng khám
              </div>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setTab("clinic")}
                className={`w-full rounded-md px-3 py-2 text-left font-semibold ${tab === "clinic" ? "bg-white text-slate-900 shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Cấu hình phòng khám
              </button>
              <button
                onClick={() => setTab("security")}
                className={`w-full rounded-md px-3 py-2 text-left font-semibold ${tab === "security" ? "bg-white text-slate-900 shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Phân quyền & Bảo mật
              </button>
              <button
                onClick={() => setTab("prefs")}
                className={`w-full rounded-md px-3 py-2 text-left font-semibold ${tab === "prefs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Tùy chọn hệ thống
              </button>
            </nav>
          </aside>
          <div className="flex-1 p-6">
            {tab === "clinic" && <ClinicTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "prefs" && <PrefsTab />}
            <div className="mt-6 text-right">
              <button
                onClick={onClose}
                className="mr-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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
          <h4 className="text-lg font-bold text-slate-900">Hồ sơ cá nhân</h4>
          <p className="text-sm font-medium text-slate-600">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
        <div>
          <button
            onClick={() => setEditing((s) => !s)}
            className={`rounded-md px-3 py-1 text-sm font-semibold ${editing ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-800"}`}
          >
            {editing ? "Huỷ" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 items-start">
        <div className="col-span-1">
          <div className="h-28 w-28 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700">
            TN
          </div>
          <div className="mt-2 text-sm font-medium text-slate-600">
            Kéo thả để thay avatar
          </div>
        </div>

        <div className="col-span-2 grid gap-3">
          <label className="text-sm font-semibold text-slate-700">
            Họ và tên
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!editing}
            readOnly={!editing}
            className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
          />

          <label className="text-sm font-semibold text-slate-700">
            Số điện thoại
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!editing}
            readOnly={!editing}
            className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
          />

          <label className="text-sm font-semibold text-slate-700">
            Email cơ quan
          </label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!editing}
            readOnly={!editing}
            className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
          />

          <label className="text-sm font-semibold text-slate-700">
            Ngày sinh
          </label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            disabled={!editing}
            readOnly={!editing}
            className={`rounded-md border px-3 py-2 text-slate-800 placeholder:text-slate-400 ${editing ? "border-slate-400 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100" : "border-slate-200 bg-slate-50 font-medium text-slate-700"}`}
          />

          {editing ? (
            <div className="mt-2 text-right">
              <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
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
  const [settings, setSettings] = useState<ClinicSettings>(() =>
    readLocalStorage(CLINIC_STORAGE_KEY, DEFAULT_CLINIC_SETTINGS),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  function handleSaveClinicSettings() {
    writeLocalStorage(CLINIC_STORAGE_KEY, settings);
    setSavedAt(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
    setSaveNotice("Đã lưu thay đổi phòng khám.");
    window.setTimeout(() => setSaveNotice(null), 2200);
  }

  function handleAddHolidayDate() {
    if (!settings.holidayDate) {
      return;
    }

    const nextHolidays = settings.holidays.includes(settings.holidayDate)
      ? settings.holidays
      : [...settings.holidays, settings.holidayDate];

    setSettings({
      ...settings,
      holidays: nextHolidays,
      holidayDate: "",
    });
  }

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
                value={settings.shiftStart}
                onChange={(e) =>
                  setSettings({ ...settings, shiftStart: e.target.value })
                }
                className="rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">Giờ kết thúc</div>
              <input
                type="time"
                value={settings.shiftEnd}
                onChange={(e) =>
                  setSettings({ ...settings, shiftEnd: e.target.value })
                }
                className="rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Thời gian 1 ca (phút)
              </div>
              <input
                type="number"
                value={settings.slotMin}
                onChange={(e) =>
                  setSettings({ ...settings, slotMin: Number(e.target.value) })
                }
                className="rounded-md border px-3 py-2 w-28"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">Dịch vụ & Bảng giá</div>
          <div className="mt-3 space-y-2">
            {settings.services.map((s) => (
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
                      setSettings({
                        ...settings,
                        services: settings.services.map((x) =>
                          x.id === s.id ? { ...x, active: !x.active } : x,
                        ),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={handleSaveClinicSettings}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
            >
              Lưu thay đổi
            </button>
          </div>
          {savedAt ? (
            <div className="mt-2 text-right text-xs text-slate-400">
              Đã lưu lúc {savedAt}
            </div>
          ) : null}

          {saveNotice ? (
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              {saveNotice}
            </div>
          ) : null}
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">Ngày nghỉ lễ (Calendar)</div>
          <div className="mt-2 text-xs text-slate-400">
            Chọn ngày nghỉ để khóa lịch đặt trực tuyến
          </div>
          <div className="mt-3">
            <input
              type="date"
              value={settings.holidayDate}
              onChange={(e) =>
                setSettings({ ...settings, holidayDate: e.target.value })
              }
              className="rounded-md border px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAddHolidayDate}
              className="ml-2 rounded-md border px-3 py-2 text-sm"
            >
              Thêm
            </button>
          </div>
          {settings.holidays.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {settings.holidays.map((holiday) => (
                <span
                  key={holiday}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {holiday}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");

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

  function handleChangePassword() {
    if (!oldPass || !newPass || !confirm) {
      setStatusTone("error");
      setStatusMessage("Vui lòng nhập đủ thông tin mật khẩu.");
      return;
    }

    if (newPass !== confirm) {
      setStatusTone("error");
      setStatusMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (strength < 3) {
      setStatusTone("error");
      setStatusMessage("Mật khẩu mới cần mạnh hơn.");
      return;
    }

    writeLocalStorage(SECURITY_STORAGE_KEY, {
      updatedAt: new Date().toISOString(),
    });
    setOldPass("");
    setNewPass("");
    setConfirm("");
    setStatusTone("success");
    setStatusMessage("Đã đổi mật khẩu.");
  }

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
              <button
                type="button"
                onClick={handleChangePassword}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
              >
                Đổi mật khẩu
              </button>
            </div>
            {statusMessage ? (
              <div
                className={`mt-2 rounded-md border px-3 py-2 text-xs font-medium ${statusTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
              >
                {statusMessage}
              </div>
            ) : null}
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
  const [smsNotif, setSmsNotif] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState("vi");

  return (
    <div>
      <h4 className="text-lg font-semibold">Tùy chọn hệ thống</h4>
      <p className="text-xs text-slate-400">
        Điều chỉnh thông báo, giao diện và ngôn ngữ hiển thị
      </p>

      <div className="mt-4 grid gap-4">
        <div className="rounded-md border p-4">
          <div className="font-medium">Thông báo</div>
          <div className="mt-3 space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
              <span className="text-sm text-slate-700">
                Thông báo qua email
              </span>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
              <span className="text-sm text-slate-700">Thông báo qua SMS</span>
              <input
                type="checkbox"
                checked={smsNotif}
                onChange={(e) => setSmsNotif(e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">Giao diện</div>
          <div className="mt-3 space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
              <span className="text-sm text-slate-700">Chế độ gọn</span>
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
              />
            </label>

            <div>
              <div className="mb-1 text-xs text-slate-500">Ngôn ngữ</div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-md border px-3 py-2"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
