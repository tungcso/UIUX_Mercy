"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { LockKeyhole } from "lucide-react";

const STORAGE_KEY = "mercy:doctor:isAcceptingPatients";

type DoctorAvailabilityContextValue = {
  isAcceptingPatients: boolean;
  setIsAcceptingPatients: (value: boolean) => void;
  toggleAcceptingPatients: () => void;
};

const DoctorAvailabilityContext = createContext<
  DoctorAvailabilityContextValue | undefined
>(undefined);

export function DoctorAvailabilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isAcceptingPatients, setIsAcceptingPatients] = useState(true);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (storedValue !== null) {
      setIsAcceptingPatients(storedValue === "true");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isAcceptingPatients));
  }, [isAcceptingPatients]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      setIsAcceptingPatients(event.newValue !== "false");
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleAcceptingPatients = () => {
    setIsAcceptingPatients((value) => !value);
  };

  return (
    <DoctorAvailabilityContext.Provider
      value={{
        isAcceptingPatients,
        setIsAcceptingPatients,
        toggleAcceptingPatients,
      }}
    >
      {children}
    </DoctorAvailabilityContext.Provider>
  );
}

export function useDoctorAvailability() {
  const context = useContext(DoctorAvailabilityContext);

  if (!context) {
    throw new Error(
      "useDoctorAvailability must be used within DoctorAvailabilityProvider",
    );
  }

  return context;
}

export function DoctorOfflineNotice() {
  const { isAcceptingPatients } = useDoctorAvailability();

  if (isAcceptingPatients) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/10 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-w-md rounded-[1.75rem] border border-amber-200 bg-white/95 px-6 py-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-900">
          Đang ở trạng thái offline
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Hãy mở hoạt động để thao tác các chức năng trong màn hình này.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Bật công tắc tiếp nhận ở thanh bên để mở khóa
        </div>
      </div>
    </div>
  );
}
