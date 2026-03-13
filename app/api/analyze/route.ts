import { NextRequest, NextResponse } from "next/server";
import { buildMoodPrompt } from "@/lib/moods";
import { analyzeMood } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { songName, artist } = body;

  if (!songName || !artist) {
    return NextResponse.json(
      { error: "songName and artist are required" },
      { status: 400 }
    );
  }

  try {
    const prompt = buildMoodPrompt(songName, artist);
    const raw = await analyzeMood(prompt);
    return NextResponse.json({ song: songName, artist, raw });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
