"use client";

import { useState } from "react";
import type { MoodResult } from "@/lib/moods";

export default function SongForm() {
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [results, setResults] = useState<MoodResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songName, artist }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await res.json();
      setResults(data.moods);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[620px] mx-auto space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-inner-card rounded-[14px] border border-border p-5 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="songName"
              className="block text-[9px] font-mono uppercase tracking-[0.08em] text-text-faint mb-1.5"
            >
              Song Name
            </label>
            <input
              id="songName"
              type="text"
              required
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="enter song title..."
              className="w-full bg-input border border-border rounded-[8px] px-3 py-[9px] text-[13px] text-text-primary placeholder:text-placeholder outline-none focus:border-accent transition-colors font-mono"
            />
          </div>
          <div>
            <label
              htmlFor="artist"
              className="block text-[9px] font-mono uppercase tracking-[0.08em] text-text-faint mb-1.5"
            >
              Artist
            </label>
            <input
              id="artist"
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="enter artist name..."
              className="w-full bg-input border border-border rounded-[8px] px-3 py-[9px] text-[13px] text-text-primary placeholder:text-placeholder outline-none focus:border-accent transition-colors font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient text-white text-[10px] uppercase tracking-[0.04em] font-medium rounded-[8px] px-6 py-2 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-red-500 text-[13px] text-center font-mono">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-[12px] bg-inner-card animate-pulse"
            />
          ))}
        </div>
      )}

      {results && (
        <div className="space-y-3">
          {results.map((row) => (
            <div
              key={row.rank}
              className="rounded-[12px] border border-border bg-inner-card p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-medium text-text-primary">
                  #{row.rank} {row.mood}
                </span>
                <span className="text-[13px] font-mono text-accent">{row.score}/10</span>
              </div>
              <p className="text-[13px] font-mono text-text-secondary">{row.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
