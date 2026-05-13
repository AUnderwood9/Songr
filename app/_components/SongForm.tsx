"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/prompts";
import MoodCard from "./MoodCard";

export default function SongForm() {
  const songNameRef = useRef<HTMLInputElement>(null);
  const artistRef = useRef<HTMLInputElement>(null);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (songNameRef.current?.value) setSongName(songNameRef.current.value);
    if (artistRef.current?.value) setArtist(artistRef.current.value);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songName: songName.trim(), artist: artist.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await res.json();
      setResults({ confidence: data.confidence, moods: data.moods });
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
              ref={songNameRef}
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
              ref={artistRef}
              id="artist"
              type="text"
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
            disabled={loading || !songName.trim()}
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
          <div className="rounded-[12px] border border-border bg-inner-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wide text-text-faint">
                Confidence
              </span>
              <span className="text-[13px] font-mono text-accent">
                {results.confidence}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-page overflow-hidden">
              <div
                className="h-full rounded-full bg-accent score-bar-fill"
                style={{ width: `${results.confidence}%` }}
              />
            </div>
            {results.confidence < 50 && (
              <p className="text-[11px] font-mono text-text-faint mt-2">
                Low confidence — results may be less accurate for unfamiliar songs.
              </p>
            )}
          </div>

          {results.moods.map((row) => (
            <MoodCard key={row.rank} mood={row} />
          ))}
        </div>
      )}
    </div>
  );
}
