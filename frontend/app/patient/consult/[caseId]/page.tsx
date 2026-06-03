import {
  buildConsultCase,
  consultCases,
} from "../_components/consult-case-data";
import ConsultationChatScreen from "../_components/consultation-chat-screen";

export default async function ConsultationCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId?: string; caseid?: string }>;
  searchParams?: Promise<{
    topic?: string;
    mode?: string;
    emergency?: string;
    review?: string;
  }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const caseId = resolvedParams.caseId || resolvedParams.caseid || "new";

  const reviewCase =
    consultCases.find((item) => item.id === "follow-up-meds") ??
    consultCases[0];

  const consultCase =
    resolvedSearchParams?.review === "1"
      ? reviewCase
      : buildConsultCase(caseId, {
          topic: resolvedSearchParams?.topic,
          mode:
            resolvedSearchParams?.mode === "doctor"
              ? "doctor"
              : resolvedSearchParams?.mode === "emergency"
                ? "emergency"
                : "ai",
          emergency: resolvedSearchParams?.emergency === "1",
        });

  return (
    <ConsultationChatScreen
      consultCase={consultCase}
      readOnly={
        resolvedSearchParams?.review === "1" ||
        consultCase.status.toLowerCase().includes("hoàn")
      }
    />
  );
}
