"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import EmergencyFab from "./_components/emergency-fab";
import PatientBottomNav from "./_components/patient-bottom-nav";

export default function PatientLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const hideBottomNav = pathname.startsWith("/patient/consult/");
  const hideGlobalEmergencyFab = pathname.startsWith("/patient/consult");

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      {children}
      {hideBottomNav ? null : <PatientBottomNav />}
      {hideGlobalEmergencyFab ? null : (
        <Suspense fallback={null}>
          <EmergencyFab />
        </Suspense>
      )}
    </div>
  );
}
