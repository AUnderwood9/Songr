/**
 * @jest-environment node
 */

import { buildMoodPrompt } from "@/lib/prompts";

const testMoods = ["Happy", "Sad", "Angry", "Peaceful", "Nostalgic"];

// Story 9: Analyze song mood with AI (prompt building)

describe("Story 9: buildMoodPrompt", () => {
  it("includes the song name in the prompt", () => {
    const prompt = buildMoodPrompt("Bohemian Rhapsody", "Queen", testMoods);
    expect(prompt).toContain("Bohemian Rhapsody");
  });

  it("includes the artist in the prompt", () => {
    const prompt = buildMoodPrompt("Bohemian Rhapsody", "Queen", testMoods);
    expect(prompt).toContain("Queen");
  });

  it("works without an artist", () => {
    const prompt = buildMoodPrompt("Yesterday", undefined, testMoods);
    expect(prompt).toContain('the song "Yesterday".');
    expect(prompt).not.toContain('" by ');
  });

  it("includes all provided moods in the prompt", () => {
    const prompt = buildMoodPrompt("Yesterday", "Beatles", testMoods);
    for (const mood of testMoods) {
      expect(prompt).toContain(mood);
    }
  });

  it("instructs to pick exactly 5 moods", () => {
    const prompt = buildMoodPrompt("Yesterday", "Beatles", testMoods);
    expect(prompt).toMatch(/5 moods/);
  });

  it("contains numbered reasoning steps", () => {
    const prompt = buildMoodPrompt("Yesterday", "Beatles", testMoods);
    expect(prompt).toContain("Follow these steps:");
    expect(prompt).toMatch(/1\./);
    expect(prompt).toMatch(/7\./);
  });

  it("contains evidence gathering step", () => {
    const prompt = buildMoodPrompt("Yesterday", "Beatles", testMoods);
    expect(prompt).toMatch(/7\./);
    expect(prompt).toMatch(/lyric/i);
    expect(prompt).toMatch(/criteria/i);
  });
});
