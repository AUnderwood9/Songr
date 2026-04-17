export const MOODS = [
  "Joyful",
  "Melancholic",
  "Anxious",
  "Peaceful",
  "Angry",
  "Hopeful",
  "Lonely",
  "Euphoric",
  "Bittersweet",
  "Nostalgic",
  "Vulnerable",
  "Defiant",
  "Tender",
  "Restless",
  "Empowered",
  "Heartbroken",
  "Playful",
  "Somber",
  "Yearning",
  "Free",
] as const;

export type Mood = (typeof MOODS)[number];

export interface MoodResult {
  rank: number;
  mood: Mood;
  score: number;
  reason: string;
}

export interface AnalysisResult {
  confidence: number;
  moods: MoodResult[];
}

export function buildMoodPrompt(
  songName: string,
  artist?: string,
  moods?: string[]
): string {
  const moodList = (moods ?? [...MOODS]).join(", ");
  const songLabel = artist ? `"${songName}" by ${artist}` : `"${songName}"`;

  return `Analyze the song ${songLabel}.

Pick exactly 5 moods from this list: ${moodList}

Rank them 1-5 by how strongly they match the song. Score each from 1 to 10. Use the full range — there should be meaningful separation between ranks. Keep each reason to one sentence.`;
}
