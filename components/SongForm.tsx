"use client";

import { useState } from "react";

interface MoodRow {
  rank: number;
  mood: string;
  score: string;
  reason: string;
}

function parseMarkdownTable(raw: string): MoodRow[] {
  const lines = raw.trim().split("\n");
  // Skip header and separator lines
  const dataLines = lines.filter(
    (line) => line.startsWith("|") && !line.includes("---") && !line.includes("Rank")
  );
  return dataLines.map((line) => {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    return {
      rank: parseInt(cells[0], 10),
      mood: cells[1],
      score: cells[2],
      reason: cells[3],
    };
  });
}

export default function SongForm() {
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [results, setResults] = useState<MoodRow[] | null>(null);
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
      setResults(parseMarkdownTable(data.raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="songName" className="block text-sm font-medium mb-1">
            Song Name
          </label>
          <input
            id="songName"
            type="text"
            required
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            placeholder="Bohemian Rhapsody"
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="artist" className="block text-sm font-medium mb-1">
            Artist
          </label>
          <input
            id="artist"
            type="text"
            required
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Queen"
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Mood"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-foreground/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {results && (
        <div className="space-y-3">
          {results.map((row) => (
            <div
              key={row.rank}
              className="rounded-lg border border-foreground/10 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">
                  #{row.rank} {row.mood}
                </span>
                <span className="text-sm font-mono">{row.score}</span>
              </div>
              <p className="text-sm text-foreground/60">{row.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
