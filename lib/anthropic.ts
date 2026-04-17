import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/lib/moods";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildMoodTool(moods: string[]): Anthropic.Tool {
  return {
    name: "return_mood_analysis",
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
            },
            required: ["rank", "mood", "score", "reason"],
          },
          minItems: 5,
          maxItems: 5,
        },
      },
      required: ["confidence", "moods"],
    },
  };
}

const SYSTEM_PROMPT = `You are a music mood analyst with deep knowledge of songs across all genres and eras. You analyze songs based on their lyrics, production, tempo, vocal delivery, and overall emotional arc.
Provide authoritative, definitive analysis. Use the full 1-10 scoring range with meaningful separation between ranks — avoid clustering all scores within 2-3 points of each other.
If you are not confident you know a specific song, set confidence low and base your analysis on what the title, artist, and genre context suggest.`;

export async function analyzeMood(prompt: string, activeMoods: string[]): Promise<AnalysisResult> {
  const tool = buildMoodTool(activeMoods);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    tools: [tool],
    tool_choice: { type: "tool", name: "return_mood_analysis" },
  });

  const toolBlock = response.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("No structured response from Anthropic API");
  }

  return toolBlock.input as AnalysisResult;
}
