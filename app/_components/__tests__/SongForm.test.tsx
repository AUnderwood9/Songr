import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SongForm from "../SongForm";

const mockMoods = [
  { rank: 1, mood: "Melancholic", score: 9, reason: "Heavy use of minor keys throughout." },
  { rank: 2, mood: "Nostalgic", score: 8, reason: "References to past memories." },
  { rank: 3, mood: "Vulnerable", score: 7, reason: "Raw vocal delivery in the bridge." },
  { rank: 4, mood: "Hopeful", score: 5, reason: "Subtle lift in the final chorus." },
  { rank: 5, mood: "Bittersweet", score: 4, reason: "Mix of joy and sadness in the lyrics." },
];

beforeEach(() => {
  jest.restoreAllMocks();
});

// Story 1: Land on the home page

describe("Story 1: Land on the home page", () => {
  it("displays the song name field with placeholder text", () => {
    render(<SongForm />);
    expect(screen.getByPlaceholderText("enter song title...")).toBeInTheDocument();
  });

  it("displays the artist field with placeholder text", () => {
    render(<SongForm />);
    expect(screen.getByPlaceholderText("enter artist name...")).toBeInTheDocument();
  });

  it("displays the Analyze button", () => {
    render(<SongForm />);
    expect(screen.getByRole("button", { name: /analyze/i })).toBeInTheDocument();
  });

  it("has the Analyze button disabled by default", () => {
    render(<SongForm />);
    expect(screen.getByRole("button", { name: /analyze/i })).toBeDisabled();
  });

  it("does not show results on first load", () => {
    render(<SongForm />);
    expect(screen.queryByText(/#\d/)).not.toBeInTheDocument();
  });

  it("does not show an error on first load", () => {
    render(<SongForm />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// Story 2: Prevent empty submissions

describe("Story 2: Prevent empty submissions", () => {
  it("disables the button when song name is empty", () => {
    render(<SongForm />);
    expect(screen.getByRole("button", { name: /analyze/i })).toBeDisabled();
  });

  it("disables the button when song name is whitespace only", async () => {
    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "   ");
    expect(screen.getByRole("button", { name: /analyze/i })).toBeDisabled();
  });

  it("enables the button when song name has content", async () => {
    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    expect(screen.getByRole("button", { name: /analyze/i })).toBeEnabled();
  });

  it("does not require the artist field to enable the button", async () => {
    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    expect(screen.getByRole("button", { name: /analyze/i })).toBeEnabled();
  });
});

// Story 3: Submit a song for analysis

describe("Story 3: Submit a song for analysis", () => {
  it("returns 5 mood results when song and artist are provided", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ moods: mockMoods }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Bohemian Rhapsody");
    await user.type(screen.getByPlaceholderText("enter artist name..."), "Queen");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    for (const mood of mockMoods) {
      expect(await screen.findByText(new RegExp(mood.mood))).toBeInTheDocument();
    }
  });

  it("returns 5 mood results when only song name is provided", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ moods: mockMoods }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    for (const mood of mockMoods) {
      expect(await screen.findByText(new RegExp(mood.mood))).toBeInTheDocument();
    }
  });

  it("clears previous results when a new submission starts", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ moods: mockMoods }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ moods: mockMoods }),
      } as Response);

    const user = userEvent.setup();
    render(<SongForm />);

    await user.type(screen.getByPlaceholderText("enter song title..."), "Song One");
    await user.click(screen.getByRole("button", { name: /analyze/i }));
    await screen.findByText(/Melancholic/);

    await user.clear(screen.getByPlaceholderText("enter song title..."));
    await user.type(screen.getByPlaceholderText("enter song title..."), "Song Two");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("clears previous errors when a new submission starts", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ moods: mockMoods }),
      } as Response);

    const user = userEvent.setup();
    render(<SongForm />);

    await user.type(screen.getByPlaceholderText("enter song title..."), "Song One");
    await user.click(screen.getByRole("button", { name: /analyze/i }));
    await screen.findByText("Server error");

    await user.clear(screen.getByPlaceholderText("enter song title..."));
    await user.type(screen.getByPlaceholderText("enter song title..."), "Song Two");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    await screen.findByText(/Melancholic/);
    expect(screen.queryByText("Server error")).not.toBeInTheDocument();
  });
});

// Story 4: See loading state during analysis

describe("Story 4: See loading state during analysis", () => {
  it("shows skeleton placeholders while loading", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(5);
  });

  it("shows 'Analyzing...' on the button and disables it", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {})
    );

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    const button = screen.getByRole("button", { name: /analyzing/i });
    expect(button).toBeDisabled();
  });

  it("keeps form inputs visible with submitted values", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {})
    );

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.type(screen.getByPlaceholderText("enter artist name..."), "Beatles");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(screen.getByDisplayValue("Yesterday")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Beatles")).toBeInTheDocument();
  });
});

// Story 5: View mood results

describe("Story 5: View mood results", () => {
  it("displays rank, mood, score, and reason for each result", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ moods: mockMoods }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    for (const mood of mockMoods) {
      expect(await screen.findByText(new RegExp(`#${mood.rank}\\s+${mood.mood}`))).toBeInTheDocument();
      expect(screen.getByText(`${mood.score}/10`)).toBeInTheDocument();
      expect(screen.getByText(mood.reason)).toBeInTheDocument();
    }
  });

  it("displays results ordered by rank", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ moods: mockMoods }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    await screen.findByText(/Melancholic/);
    const resultCards = document.querySelectorAll("[class*='rounded-'][class*='border']");
    const ranks = Array.from(resultCards)
      .map((el) => el.textContent?.match(/#(\d)/)?.[1])
      .filter(Boolean);
    expect(ranks).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("replaces previous results on new submission", async () => {
    const secondMoods = mockMoods.map((m) => ({ ...m, mood: "Joyful" }));
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ moods: mockMoods }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ moods: secondMoods }),
      } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Song One");
    await user.click(screen.getByRole("button", { name: /analyze/i }));
    await screen.findByText(/Melancholic/);

    await user.clear(screen.getByPlaceholderText("enter song title..."));
    await user.type(screen.getByPlaceholderText("enter song title..."), "Song Two");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    await screen.findByText(/Joyful/);
    expect(screen.queryByText(/Melancholic/)).not.toBeInTheDocument();
  });
});

// Story 6: See an error when analysis fails

describe("Story 6: See an error when analysis fails", () => {
  it("shows an error message when the API returns an error", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Analysis failed. Please try again." }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByText("Analysis failed. Please try again.")).toBeInTheDocument();
  });

  it("does not show mood results alongside the error", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Something went wrong" }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    await screen.findByText("Something went wrong");
    expect(screen.queryByText(/#\d\s+\w+/)).not.toBeInTheDocument();
  });

  it("re-enables the form after an error", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Something went wrong" }),
    } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    await screen.findByText("Something went wrong");
    expect(screen.getByRole("button", { name: /analyze/i })).toBeEnabled();
  });

  it("clears the error when the user submits again", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Something went wrong" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ moods: mockMoods }),
      } as Response);

    const user = userEvent.setup();
    render(<SongForm />);
    await user.type(screen.getByPlaceholderText("enter song title..."), "Yesterday");
    await user.click(screen.getByRole("button", { name: /analyze/i }));
    await screen.findByText("Something went wrong");

    await user.click(screen.getByRole("button", { name: /analyze/i }));
    await screen.findByText(/Melancholic/);
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
