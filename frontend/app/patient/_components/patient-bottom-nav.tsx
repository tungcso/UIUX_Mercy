"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, House, MessageCircle, UserRound } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof House;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { href: "/patient", label: "Home", icon: House, exact: true },
  { href: "/patient/consult?mode=ai", label: "Chat", icon: MessageCircle },
  {
    href: "/patient/appointments",
    label: "Appointments",
    icon: CalendarCheck2,
  },
  { href: "/patient/profile", label: "Profile", icon: UserRound },
];

export default function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-97.5 -translate-x-1/2 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-4 gap-1 text-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href.split("?")[0]);

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
                  isActive
                    ? "text-[#2f66dc]"
                    : "text-[#90a0b8] hover:bg-[#f6f8fc] hover:text-[#51627f]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                    isActive ? "bg-[#e8f0ff] shadow-sm" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`text-[11px] font-medium ${isActive ? "text-[#2f66dc]" : "text-[#90a0b8]"}`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
