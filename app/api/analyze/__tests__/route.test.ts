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
