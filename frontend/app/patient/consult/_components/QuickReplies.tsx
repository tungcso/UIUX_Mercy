"use client";

import React from "react";

export default function QuickReplies({
  items = [],
  onChoose,
}: {
  items?: string[];
  onChoose?: (s: string) => void;
}) {
  return (
    <div className="mt-4 px-4 pb-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChoose?.(item)}
            className="rounded-full border border-[#d7eadf] bg-white px-4 py-2 text-[13px] font-medium text-[#1f2939]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
