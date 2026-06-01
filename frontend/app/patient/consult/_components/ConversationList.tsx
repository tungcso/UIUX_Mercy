"use client";

import MessageBubble from "./MessageBubble";
import type { ConsultAction, ConsultMessage } from "./consult-case-data";

export default function ConversationList({
  messages = [],
  onQuickReply,
  onAction,
}: {
  messages?: ConsultMessage[];
  onQuickReply?: (value: string) => void;
  onAction?: (action: ConsultAction, message: ConsultMessage) => void;
}) {
  const emergencyIndex = messages.findIndex(
    (message) => message.kind === "emergency",
  );
  const visibleMessages =
    emergencyIndex >= 0 ? messages.slice(0, emergencyIndex + 1) : messages;

  return (
    <div className="px-4 pb-4 pt-4">
      <div className="space-y-3">
        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onQuickReply={onQuickReply}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}
