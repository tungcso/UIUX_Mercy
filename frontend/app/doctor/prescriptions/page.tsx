"use client";

import React from "react";
import PrescriptionShell from "./_components/PrescriptionShell";
import { AppSidebar } from "../_components/doctor-shell";
import {
  DoctorOfflineNotice,
  useDoctorAvailability,
} from "../_components/doctor-availability-context";

export default function PrescriptionsPage() {
  const { isAcceptingPatients, toggleAcceptingPatients } =
    useDoctorAvailability();

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar
          activeSection="prescriptions"
          isAcceptingPatients={isAcceptingPatients}
          onToggleAccepting={toggleAcceptingPatients}
          onNavigate={() => {}}
          consultUnread={1}
        />

        <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          <div className="relative mx-auto max-w-[1360px]">
            <DoctorOfflineNotice />
            <PrescriptionShell />
          </div>
        </main>
      </div>
    </div>
  );
}
