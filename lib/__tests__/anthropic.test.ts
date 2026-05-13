/**
 * @jest-environment node
 */

jest.mock("@anthropic-ai/sdk", () => {
  const mockCreate = jest.fn();
  return function () {
    return { messages: { create: mockCreate } };
  };
});

import Anthropic from "@anthropic-ai/sdk";
import { analyzeMood } from "@/lib/anthropic";

// Get the mock from the instantiated client
const mockClient = new (Anthropic as unknown as new () => { messages: { create: jest.Mock } })();
const mockCreate = mockClient.messages.create;

const mockMoods = [
  { rank: 1, mood: "Melancholic", score: 9, reason: "Heavy minor keys.",
    evidence: { lyrics: ["All my troubles seemed so far away"], criteria: ["lyrics", "production"] } },
  { rank: 2, mood: "Nostalgic", score: 8, reason: "Past memories.",
    evidence: { lyrics: ["Yesterday, love was such an easy game"], criteria: ["lyrics", "vocal delivery"] } },
  { rank: 3, mood: "Vulnerable", score: 7, reason: "Raw vocals.",
    evidence: { lyrics: [], criteria: ["vocal delivery", "production"] } },
  { rank: 4, mood: "Hopeful", score: 5, reason: "Lift in chorus.",
    evidence: { lyrics: [], criteria: ["production", "tempo"] } },
  { rank: 5, mood: "Bittersweet", score: 4, reason: "Mixed emotions.",
    evidence: { lyrics: ["There's a shadow hanging over me"], criteria: ["lyrics", "emotional arc"] } },
];

beforeEach(() => {
  mockCreate.mockReset();
});

// Story 9: Analyze song mood with AI

describe("Story 9: analyzeMood", () => {
  it("returns parsed mood results from tool_use response", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 95, moods: mockMoods },
        },
      ],
    });

    const result = await analyzeMood("Analyze Yesterday", ["Melancholic", "Nostalgic", "Vulnerable", "Hopeful", "Bittersweet"]);
    expect(result).toEqual({ confidence: 95, moods: mockMoods });
  });

  it("sends a system prompt separate from the user message", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 95, moods: mockMoods },
        },
      ],
    });

    await analyzeMood("Analyze Yesterday", ["Melancholic"]);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("music mood analyst"),
      })
    );
  });

  it("calls the API with temperature 0", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 95, moods: mockMoods },
        },
      ],
    });

    await analyzeMood("Analyze Yesterday", ["Melancholic"]);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0 })
    );
  });

  it("forces tool use via tool_choice", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 95, moods: mockMoods },
        },
      ],
    });

    await analyzeMood("Analyze Yesterday", ["Melancholic"]);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_choice: { type: "tool", name: "return_mood_analysis" },
      })
    );
  });

  it("throws when response has no tool_use block", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Some text response" }],
    });

    await expect(analyzeMood("Analyze Yesterday", ["Melancholic"]))
      .rejects.toThrow("No structured response from Anthropic API");
  });

  it("returns evidence in parsed results", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 95, moods: mockMoods },
        },
      ],
    });

    const result = await analyzeMood("Analyze Yesterday", ["Melancholic", "Nostalgic", "Vulnerable", "Hopeful", "Bittersweet"]);
    expect(result.moods[0].evidence).toBeDefined();
    expect(result.moods[0].evidence.criteria).toContain("lyrics");
    expect(result.moods[0].evidence.lyrics).toHaveLength(1);
  });

  it("handles moods with empty lyrics array", async () => {
    const moodsWithEmptyLyrics = mockMoods.map(m => ({
      ...m, evidence: { lyrics: [], criteria: m.evidence.criteria }
    }));
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 80, moods: moodsWithEmptyLyrics },
        },
      ],
    });

    const result = await analyzeMood("Analyze Yesterday", ["Melancholic"]);
    expect(result.moods[0].evidence.lyrics).toEqual([]);
    expect(result.moods[0].evidence.criteria.length).toBeGreaterThan(0);
  });

  it("handles moods with missing evidence field", async () => {
    const moodsWithoutEvidence = mockMoods.map(({ evidence, ...rest }) => rest);
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 30, moods: moodsWithoutEvidence },
        },
      ],
    });

    const result = await analyzeMood("Analyze Yesterday", ["Melancholic"]);
    expect(result.moods[0].evidence).toBeUndefined();
  });

  it("passes through unexpected criteria values without filtering", async () => {
    const moodsWeirdCriteria = [{
      ...mockMoods[0],
      evidence: { lyrics: [], criteria: ["melody", "rhythm"] }
    }, ...mockMoods.slice(1)];
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { confidence: 90, moods: moodsWeirdCriteria },
        },
      ],
    });

    const result = await analyzeMood("Analyze Yesterday", ["Melancholic"]);
    expect(result.moods[0].evidence.criteria).toContain("melody");
    expect(result.moods[0].evidence.criteria).toContain("rhythm");
  });

  it("propagates API errors", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API rate limit exceeded"));

    await expect(analyzeMood("Analyze Yesterday", ["Melancholic"]))
      .rejects.toThrow("API rate limit exceeded");
  });
});
