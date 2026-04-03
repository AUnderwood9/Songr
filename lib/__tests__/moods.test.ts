/**
 * @jest-environment node
 */

import { MOODS, buildMoodPrompt } from "@/lib/moods";

// Story 9: Analyze song mood with AI (prompt building)

describe("Story 9: MOODS constant", () => {
  it("contains 20 moods", () => {
    expect(MOODS).toHaveLength(20);
  });
});

describe("Story 9: buildMoodPrompt", () => {
  it("includes the song name in the prompt", () => {
    const prompt = buildMoodPrompt("Bohemian Rhapsody", "Queen");
    expect(prompt).toContain("Bohemian Rhapsody");
  });

  it("includes the artist in the prompt", () => {
    const prompt = buildMoodPrompt("Bohemian Rhapsody", "Queen");
    expect(prompt).toContain("Queen");
  });

  it("includes all provided moods in the prompt", () => {
    const customMoods = ["Happy", "Sad", "Angry"];
    const prompt = buildMoodPrompt("Yesterday", "Beatles", customMoods);
    for (const mood of customMoods) {
      expect(prompt).toContain(mood);
    }
  });

  it("falls back to MOODS constant when no custom moods provided", () => {
    const prompt = buildMoodPrompt("Yesterday", "Beatles");
    for (const mood of MOODS) {
      expect(prompt).toContain(mood);
    }
  });

  it("instructs to pick exactly 5 moods", () => {
    const prompt = buildMoodPrompt("Yesterday", "Beatles");
    expect(prompt).toMatch(/5 moods/);
  });
});
