import type { ReactNode } from "react";
import { DoctorAvailabilityProvider } from "./_components/doctor-availability-context";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return <DoctorAvailabilityProvider>{children}</DoctorAvailabilityProvider>;
}
