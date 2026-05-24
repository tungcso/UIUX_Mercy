"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ChatShell from "./_components/chat-shell";
import { AppSidebar } from "../_components/doctor-shell";
import { consultPatients, consultUnreadCount } from "./consult-patients";
import {
  DoctorOfflineNotice,
  useDoctorAvailability,
} from "../_components/doctor-availability-context";

export default function ConsultPage() {
  const { isAcceptingPatients, toggleAcceptingPatients } =
    useDoctorAvailability();
  const router = useRouter();

  const handleNavigate = (section: string) => {
    switch (section) {
      case "overview":
        router.push("/doctor");
        break;
      case "patients":
        router.push("/doctor/patients");
        break;
      case "consult":
        router.push("/doctor/consult");
        break;
      case "prescriptions":
        router.push("/doctor/prescriptions");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar
          activeSection="consult"
          isAcceptingPatients={isAcceptingPatients}
          onToggleAccepting={toggleAcceptingPatients}
          onNavigate={handleNavigate}
          consultUnread={consultUnreadCount}
        />

        <main className="flex-1 overflow-hidden px-6">
          <div className="relative w-full h-full">
            <DoctorOfflineNotice />
            <ChatShell patients={consultPatients} />
          </div>
        </main>
      </div>
    </div>
  );
}
