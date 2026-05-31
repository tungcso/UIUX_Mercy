import { buildConsultCase } from "../_components/consult-case-data";
import ConsultationChatScreen from "../_components/consultation-chat-screen";

export default function ConsultationCasePage({
  params,
  searchParams,
}: {
  params: { caseId: string };
  searchParams?: { topic?: string; mode?: string; emergency?: string };
}) {
  const consultCase = buildConsultCase(params.caseId, {
    topic: searchParams?.topic,
    mode:
      searchParams?.mode === "doctor"
        ? "doctor"
        : searchParams?.mode === "emergency"
          ? "emergency"
          : "ai",
    emergency: searchParams?.emergency === "1",
  });

  return <ConsultationChatScreen consultCase={consultCase} />;
}
