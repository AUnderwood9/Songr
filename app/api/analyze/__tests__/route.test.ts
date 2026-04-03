/**
 * @jest-environment node
 */

import { validate } from "@/lib/validate";

const analyzeSchema = {
  songName: { type: "string" as const, min: 1, max: 200 },
  artist: { type: "string" as const, required: false as const, min: 1, max: 200 },
};

// Story 7: Server rejects invalid input

describe("Story 7: Server rejects invalid input", () => {
  it("rejects when no body is provided", () => {
    const result = validate(null, analyzeSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects a non-object body", () => {
    const result = validate("not an object", analyzeSchema);
    expect(result.success).toBe(false);
  });

  it("rejects when songName is missing", () => {
    const result = validate({}, analyzeSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("songName is required");
    }
  });

  it("rejects when songName is an empty string", () => {
    const result = validate({ songName: "" }, analyzeSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toMatch(/songName/);
    }
  });

  it("rejects when songName exceeds 200 characters", () => {
    const result = validate({ songName: "a".repeat(201) }, analyzeSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toMatch(/songName/);
    }
  });

  it("rejects when artist exceeds 200 characters", () => {
    const result = validate({ songName: "Yesterday", artist: "a".repeat(201) }, analyzeSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toMatch(/artist/);
    }
  });

  it("rejects when songName is not a string", () => {
    const result = validate({ songName: 123 }, analyzeSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("songName must be a string");
    }
  });

  it("accepts valid input with song and artist", () => {
    const result = validate({ songName: "Yesterday", artist: "Beatles" }, analyzeSchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.songName).toBe("Yesterday");
      expect(result.data.artist).toBe("Beatles");
    }
  });

  it("accepts valid input with song only (no artist)", () => {
    const result = validate({ songName: "Yesterday" }, analyzeSchema);
    expect(result.success).toBe(true);
  });
});

// Story 10: Process analysis request end-to-end

const mockMoods = [
  { rank: 1, mood: "Melancholic", score: 9, reason: "Heavy minor keys." },
  { rank: 2, mood: "Nostalgic", score: 8, reason: "Past memories." },
  { rank: 3, mood: "Vulnerable", score: 7, reason: "Raw vocals." },
  { rank: 4, mood: "Hopeful", score: 5, reason: "Lift in chorus." },
  { rank: 5, mood: "Bittersweet", score: 4, reason: "Mixed emotions." },
];

const mockActiveMoods = ["Bittersweet", "Hopeful", "Melancholic", "Nostalgic", "Vulnerable"];

jest.mock("@/lib/dynamodb", () => ({
  getActiveMoods: jest.fn(),
}));

jest.mock("@/lib/anthropic", () => ({
  analyzeMood: jest.fn(),
}));

import { POST } from "@/app/api/analyze/route";
import { getActiveMoods } from "@/lib/dynamodb";
import { analyzeMood } from "@/lib/anthropic";
import { NextRequest } from "next/server";

const mockedGetActiveMoods = getActiveMoods as jest.MockedFunction<typeof getActiveMoods>;
const mockedAnalyzeMood = analyzeMood as jest.MockedFunction<typeof analyzeMood>;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== null ? JSON.stringify(body) : null,
  });
}

describe("Story 10: Process analysis request end-to-end", () => {
  beforeEach(() => {
    mockedGetActiveMoods.mockReset();
    mockedAnalyzeMood.mockReset();
  });

  it("returns 200 with mood results for valid request", async () => {
    mockedGetActiveMoods.mockResolvedValueOnce(mockActiveMoods);
    mockedAnalyzeMood.mockResolvedValueOnce(mockMoods);

    const response = await POST(makeRequest({ songName: "Yesterday", artist: "Beatles" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.song).toBe("Yesterday");
    expect(data.artist).toBe("Beatles");
    expect(data.moods).toEqual(mockMoods);
  });

  it("returns 200 when artist is omitted", async () => {
    mockedGetActiveMoods.mockResolvedValueOnce(mockActiveMoods);
    mockedAnalyzeMood.mockResolvedValueOnce(mockMoods);

    const response = await POST(makeRequest({ songName: "Yesterday" }));

    expect(response.status).toBe(200);
  });

  it("returns 400 for invalid input", async () => {
    const response = await POST(makeRequest({ songName: "" }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("returns 500 when DynamoDB fails", async () => {
    mockedGetActiveMoods.mockRejectedValueOnce(new Error("DynamoDB unavailable"));

    const response = await POST(makeRequest({ songName: "Yesterday" }));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("returns 500 when Anthropic fails", async () => {
    mockedGetActiveMoods.mockResolvedValueOnce(mockActiveMoods);
    mockedAnalyzeMood.mockRejectedValueOnce(new Error("API error"));

    const response = await POST(makeRequest({ songName: "Yesterday" }));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("does not leak internal error details in 500 response", async () => {
    mockedGetActiveMoods.mockRejectedValueOnce(new Error("Secret internal details"));

    const response = await POST(makeRequest({ songName: "Yesterday" }));
    const data = await response.json();

    expect(data.error).not.toContain("Secret internal details");
  });
});
