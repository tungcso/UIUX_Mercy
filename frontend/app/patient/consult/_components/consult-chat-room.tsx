"use client";

export type ConsultChatRole = "assistant" | "doctor";

export type ConsultChatMessageVariant =
  | "normal"
  | "symptom-question"
  | "quick-choice"
  | "medical-info"
  | "health-advice"
  | "doctor-recommendation"
  | "warning"
  | "appointment-suggestion";

export type ConsultChatMessage = {
  id: string;
  role: ConsultChatRole | "patient";
  text: string;
  time: string;
  variant?: ConsultChatMessageVariant;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  choices?: string[];
  ctaPrimary?: string;
  ctaSecondary?: string;
};

type ConsultChatRoomProps = {
  open: boolean;
  threadKey: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  role: ConsultChatRole;
  avatar: "bot" | "doctor";
  initialMessages: ConsultChatMessage[];
  quickReplies: string[];
  placeholder: string;
  onClose: () => void;
  onDelete?: () => void;
};

export default function ConsultChatRoom(_props: ConsultChatRoomProps) {
  return null;
}
