import { NextRequest, NextResponse } from "next/server";
import { buildMoodPrompt } from "@/lib/moods";
import { analyzeMood } from "@/lib/anthropic";
import { validate } from "@/lib/validate";

const analyzeSchema = {
  songName: { type: "string" as const, min: 1, max: 200 },
  artist: { type: "string" as const, min: 1, max: 200 },
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = validate(body, analyzeSchema);

  if (!result.success) {
    return NextResponse.json(
      { error: result.errors.join(", ") },
      { status: 400 }
    );
  }

  try {
    const { songName, artist } = result.data;
    const prompt = buildMoodPrompt(songName, artist);
    const moods = await analyzeMood(prompt);
    return NextResponse.json({ song: songName, artist, moods });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
