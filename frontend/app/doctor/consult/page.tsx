"use client";

import React from "react";
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

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar
          activeSection="consult"
          isAcceptingPatients={isAcceptingPatients}
          onToggleAccepting={toggleAcceptingPatients}
          onNavigate={() => {}}
          consultUnread={consultUnreadCount}
        />

        <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          <div className="relative mx-auto max-w-[1360px]">
            <DoctorOfflineNotice />
            <ChatShell patients={consultPatients} />
          </div>
        </main>
      </div>
    </div>
  );
}
