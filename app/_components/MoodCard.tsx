"use client";

import { useState } from "react";
import type { MoodResult } from "@/lib/prompts";

export default function MoodCard({ mood: row }: { mood: MoodResult }) {
  const [expanded, setExpanded] = useState(false);
  const hasEvidence = row.evidence && (row.evidence.lyrics.length > 0 || row.evidence.criteria.length > 0);

  return (
    <div className="rounded-[12px] border border-border bg-inner-card overflow-hidden">
      <button
        type="button"
        role="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="w-full text-left p-4 min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono font-medium text-text-primary">
            #{row.rank} {row.mood}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-mono text-accent">{row.score}/10</span>
            {hasEvidence && (
              <svg
                className={`w-4 h-4 text-text-faint transition-transform duration-250 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        <p className="text-[13px] font-mono text-text-secondary">{row.reason}</p>
      </button>

      {expanded && hasEvidence && row.evidence && (
        <div
          className="px-4 pb-4 pt-1 border-t border-border space-y-3"
          style={{ animation: "fadeSlideUp 0.25s ease-out" }}
        >
          {row.evidence.criteria.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {row.evidence.criteria.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-border-accent"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {row.evidence.lyrics.length > 0 && (
            <div className="space-y-1.5">
              {row.evidence.lyrics.map((line, i) => (
                <blockquote
                  key={i}
                  className="text-[12px] font-mono text-text-secondary italic border-l-2 border-accent pl-3"
                >
                  &ldquo;{line}&rdquo;
                </blockquote>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
