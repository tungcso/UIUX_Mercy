"use client";

import React from "react";
import MessageBubble from "./MessageBubble";

export default function ConversationList({
  messages = [] as any[],
}: {
  messages?: any[];
}) {
  return (
    <div className="px-4 pb-4 pt-4">
      <div className="space-y-3">
        {messages.map((m: any) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            text={m.text}
            time={m.time}
            variant={m.tone}
          />
        ))}
      </div>
    </div>
  );
}
