import Anthropic from "@anthropic-ai/sdk";
import type { MoodResult } from "@/lib/prompts";

export enum ModelToolName {
  MOOD_ANALYSIS = "return_mood_analysis"
}

const MOOD_TOOL_REQUIREMENTS: (keyof MoodResult)[] = ["rank", "mood", "score", "reason"];

const VALID_CRITERIA = ["lyrics", "production", "tempo", "vocal delivery", "emotional arc"];

export function buildMoodTool(moods: string[]): Anthropic.Tool {
  return {
    name: ModelToolName.MOOD_ANALYSIS,
    description: "Return the mood analysis results for a song.",
    input_schema: {
      type: "object" as const,
      properties: {
        confidence: {
          type: "number",
          description: "How confident you are that you know this specific song, from 0 to 100",
        },
        moods: {
          type: "array",
          items: {
            type: "object",
            properties: {
              rank: { type: "number", description: "Rank from 1 (strongest) to 5 (weakest)" },
              mood: { type: "string", enum: moods, description: "Mood from the allowed list" },
              score: { type: "number", description: "Match strength from 1 to 10" },
              reason: { type: "string", description: "One-sentence explanation" },
              evidence: {
                type: "object",
                description: "Supporting evidence for this mood assignment",
                properties: {
                  lyrics: {
                    type: "array",
                    items: { type: "string" },
                    description: "1-3 specific lyric lines that support this mood",
                  },
                  criteria: {
                    type: "array",
                    items: { type: "string", enum: VALID_CRITERIA },
                    description: "Which factors contributed most to this mood",
                  },
                },
                required: ["lyrics", "criteria"],
              },
            },
            required: MOOD_TOOL_REQUIREMENTS,
          },
          minItems: 5,
          maxItems: 5,
        },
      },
      required: ["confidence", "moods"],
    },
  };
}