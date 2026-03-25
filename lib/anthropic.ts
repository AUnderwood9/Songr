import Anthropic from "@anthropic-ai/sdk";
import type { MoodResult } from "@/lib/moods";

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
      required: ["moods"],
    },
  };
}

export async function analyzeMood(prompt: string, activeMoods: string[]): Promise<MoodResult[]> {
  const tool = buildMoodTool(activeMoods);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
    tools: [tool],
    tool_choice: { type: "tool", name: "return_mood_analysis" },
  });

  const toolBlock = response.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("No structured response from Anthropic API");
  }

  const input = toolBlock.input as { moods: MoodResult[] };
  return input.moods;
}
