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
  { rank: 1, mood: "Melancholic", score: 9, reason: "Heavy minor keys." },
  { rank: 2, mood: "Nostalgic", score: 8, reason: "Past memories." },
  { rank: 3, mood: "Vulnerable", score: 7, reason: "Raw vocals." },
  { rank: 4, mood: "Hopeful", score: 5, reason: "Lift in chorus." },
  { rank: 5, mood: "Bittersweet", score: 4, reason: "Mixed emotions." },
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
          input: { moods: mockMoods },
        },
      ],
    });

    const result = await analyzeMood("Analyze Yesterday", ["Melancholic", "Nostalgic", "Vulnerable", "Hopeful", "Bittersweet"]);
    expect(result).toEqual(mockMoods);
  });

  it("calls the API with temperature 0", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "return_mood_analysis",
          input: { moods: mockMoods },
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
          input: { moods: mockMoods },
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

  it("propagates API errors", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API rate limit exceeded"));

    await expect(analyzeMood("Analyze Yesterday", ["Melancholic"]))
      .rejects.toThrow("API rate limit exceeded");
  });
});
