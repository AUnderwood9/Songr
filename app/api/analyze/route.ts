import { NextRequest, NextResponse } from "next/server";
import { buildMoodPrompt } from "@/lib/moods";
import { analyzeMood } from "@/lib/anthropic";
import { validate } from "@/lib/validate";
import { getActiveMoods } from "@/lib/dynamodb";

const analyzeSchema = {
  songName: { type: "string" as const, min: 1, max: 200 },
  artist: { type: "string" as const, required: false as const, min: 1, max: 200 },
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
    const activeMoods = await getActiveMoods();
    const prompt = buildMoodPrompt(songName, artist, activeMoods);
    const analysis = await analyzeMood(prompt, activeMoods);
    return NextResponse.json({ song: songName, artist, confidence: analysis.confidence, moods: analysis.moods });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
