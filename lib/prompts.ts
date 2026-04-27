const promptBodyTemplate = (songSummary: string, moodList: string) => {
  return `Analyze the song ${songSummary}.
    Follow these steps:
    1. Recall what you know about this song — its lyrics, melody, production, tempo, and genre context.
    2. Assess your confidence (0-100) in knowing this specific song. If unsure, base your analysis on what the title, artist, and genre suggest.
    3. Consider the full emotional arc — verses, chorus, bridge, and overall feel — not just the most obvious moment.
    4. Select exactly 5 moods from this list that best capture the song: ${moodList}
    5. Rank them 1-5 by match strength. Score each from 1 to 10 — use the full range with meaningful separation between ranks.
    6. Write a one-sentence reason for each mood explaining why it fits.`;
}

export interface MoodResult {
  rank: number;
  mood: string;
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
  moods: string[] = []
): string {
  const moodList = moods.join(", ");
  const songSummary = artist ? `"${songName}" by ${artist}` : `"${songName}"`;

  return promptBodyTemplate(songSummary, moodList);
}
