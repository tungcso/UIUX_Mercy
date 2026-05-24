"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  const roleOptions = ["Bệnh nhân", "Bác sĩ", "Quản lí phòng khám"];

  const showSuccessNotification = (message: string) => {
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }

    setNotification(message);
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic gọi API NestJS ở đây
    console.log("Submit login");
    setIsRoleSelectionOpen(true);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic gửi email khôi phục mật khẩu ở đây
    console.log("Submit forgot password");
    setIsForgotPasswordOpen(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic đăng ký tài khoản ở đây
    console.log("Submit register");
    setIsRegisterOpen(false);
    showSuccessNotification("Đăng ký thành công");
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsRoleSelectionOpen(false);
    console.log(`Selected role: ${role}`);

    if (role === "Bác sĩ") {
      router.push("/doctor?loginSuccess=1&role=doctor");
      return;
    }

    if (role === "Quản lí phòng khám") {
      router.push("/manager?loginSuccess=1&role=manager");
      return;
    }

    showSuccessNotification("Đăng nhập thành công");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(2, 6, 23, 0.84), rgba(6, 95, 70, 0.52)), url("/clinic-bg.svg")',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.18),transparent_30%)]" />

      {notification ? (
        <div className="fixed right-4 top-4 z-60 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{notification}</span>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md animate-login-pop rounded-[1.75rem] border border-white/40 bg-white/92 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner shadow-emerald-600/10">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Med<span className="text-emerald-600">OS AI</span>
            </h1>
            <p className="text-sm leading-6 text-slate-500">
              Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  className="block w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  placeholder="bacsigoiy@medos.vn"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-12 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-700 cursor-pointer"
                >
                  Ghi nhớ tôi
                </label>
              </div>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-500"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className="group flex w-full justify-center rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              Đăng nhập hệ thống
            </button>

            <div className="pt-2 text-center text-sm text-slate-500">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="font-medium text-emerald-600 transition-colors hover:text-emerald-500"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>
      </div>

      {isForgotPasswordOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng popup khôi phục mật khẩu"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsForgotPasswordOpen(false)}
          />

          <div className="relative w-full max-w-md animate-login-pop rounded-[1.75rem] border border-white/40 bg-white/95 p-8 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-md sm:p-10">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner shadow-emerald-600/10">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Khôi phục mật khẩu
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật
                khẩu.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="block w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    placeholder="bacsigoiy@medos.vn"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  Gửi yêu cầu khôi phục
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isRegisterOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng popup đăng ký"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsRegisterOpen(false)}
          />

          <div className="relative w-full max-w-md animate-login-pop rounded-[1.75rem] border border-white/40 bg-white/95 p-8 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-md sm:p-10">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner shadow-emerald-600/10">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Tạo tài khoản
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Nhập thông tin để tạo tài khoản mới trong hệ thống.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="block w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="block w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    placeholder="bacsigoiy@medos.vn"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    className="block w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    className="block w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  Đăng ký
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isRoleSelectionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng popup chọn vai trò"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsRoleSelectionOpen(false)}
          />

          <div className="relative w-full max-w-md animate-login-pop rounded-[1.75rem] border border-white/40 bg-white/95 p-8 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-md sm:p-10">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner shadow-emerald-600/10">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Chọn vai trò của bạn
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Hãy chọn một vai trò để tiếp tục vào hệ thống.
              </p>
            </div>

            <div className="space-y-3">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10"
                >
                  <span>{role}</span>
                  <span className="text-emerald-600">Chọn</span>
                </button>
              ))}
            </div>

            {selectedRole ? (
              <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
                Vai trò hiện tại: {selectedRole}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes login-pop {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          60% {
            opacity: 1;
            transform: translateY(-6px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-login-pop {
          animation: login-pop 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}
