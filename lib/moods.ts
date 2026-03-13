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

export function buildMoodPrompt(songName: string, artist: string): string {
  const moodList = MOODS.join(", ");

  return `You are a music mood analyst. Here is a list of feelings:

${moodList}

Analyze the song "${songName}" by ${artist}.

Return exactly 5 moods ranked by how strongly they match the song. Format your response as a markdown table with these columns:

| Rank | Mood | Score /10 | Reason |
|------|------|-----------|--------|

Rules:
- Pick moods ONLY from the list above
- Score each mood from 1 to 10
- Keep each reason to one sentence
- Rank from strongest match to weakest`;
}
