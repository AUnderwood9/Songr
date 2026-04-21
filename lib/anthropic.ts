import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/lib/prompts";
import { buildMoodTool, ModelToolName } from "@/lib/model_tools";

const CLIENT = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,  
});
const SYSTEM_PROMPT = `You are a music mood analyst with deep knowledge of songs across all genres and eras.
You provide authoritative, definitive analysis based on lyrics, production, tempo, vocal delivery, and overall emotional arc.`;
const SYSTEM_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 512
const MODEL_TEMP = 0
const MESSAGE_TYPE = "user"
const TOOL_TYPE = "tool"
const TOOL_BLOCK_TYPE = "tool_use"

export async function analyzeMood(prompt: string, activeMoods: string[]): Promise<AnalysisResult> {
  const tool = buildMoodTool(activeMoods);

  const response = await CLIENT.messages.create({
    model: SYSTEM_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: MODEL_TEMP,
    system: SYSTEM_PROMPT,
    messages: [{ role: MESSAGE_TYPE, content: prompt }],
    tools: [tool],
    tool_choice: { type: TOOL_TYPE, name: ModelToolName.MOOD_ANALYSIS },
  });

  const toolBlock = response.content.find((block) => block.type === TOOL_BLOCK_TYPE);
  if (!toolBlock || toolBlock.type !== TOOL_BLOCK_TYPE) {
    throw new Error("No structured response from Anthropic API");
  }

  return toolBlock.input as AnalysisResult;
}
