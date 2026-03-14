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

export function buildMoodPrompt(songName: string, artist: string): string {
  const moodList = MOODS.join(", ");

  return `You are a music mood analyst. Analyze the song "${songName}" by ${artist}.

Pick exactly 5 moods from this list: ${moodList}

Rank them by how strongly they match the song. Score each from 1 to 10. Consider lyrics, production, and vocal delivery. Keep each reason to one sentence.`;
}
