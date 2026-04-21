/**
 * @jest-environment node
 */

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({ send: mockSend }),
  },
  ScanCommand: jest.fn().mockImplementation((params) => params),
}));

// Story 8: Load mood vocabulary from database

describe("Story 8: getActiveMoods", () => {
  let getActiveMoods: () => Promise<string[]>;

  beforeEach(() => {
    mockSend.mockReset();
    jest.restoreAllMocks();

    // Isolate modules to reset module-level cache between tests
    jest.isolateModules(() => {
      const mod = require("@/lib/dynamodb");
      getActiveMoods = mod.getActiveMoods;
    });
  });

  it("returns sorted mood names with MOOD# prefix stripped", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        { PK: "MOOD#Melancholic", active: true },
        { PK: "MOOD#Angry", active: true },
        { PK: "MOOD#Joyful", active: true },
      ],
    });

    const moods = await getActiveMoods();
    expect(moods).toEqual(["Angry", "Joyful", "Melancholic"]);
  });

  it("returns an empty array when no items exist", async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined });

    const moods = await getActiveMoods();
    expect(moods).toEqual([]);
  });

  it("uses cache on second call within TTL", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ PK: "MOOD#Joyful", active: true }],
    });

    await getActiveMoods();
    await getActiveMoods();

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("returns stale cache when DynamoDB throws", async () => {
    mockSend
      .mockResolvedValueOnce({
        Items: [{ PK: "MOOD#Joyful", active: true }],
      })
      .mockRejectedValueOnce(new Error("Service unavailable"));

    const now = Date.now();
    jest.spyOn(Date, "now")
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + 6 * 60 * 1000);

    const first = await getActiveMoods();
    const second = await getActiveMoods();

    expect(first).toEqual(["Joyful"]);
    expect(second).toEqual(["Joyful"]);
  });

  it("throws when DynamoDB fails and no cache exists", async () => {
    mockSend.mockRejectedValueOnce(new Error("Service unavailable"));

    await expect(getActiveMoods()).rejects.toThrow(
      "Failed to load mood vocabulary from database"
    );
  });

  it("re-queries DynamoDB after cache expires", async () => {
    const now = Date.now();
    jest.spyOn(Date, "now")
      .mockReturnValueOnce(now)           // first call
      .mockReturnValueOnce(now + 6 * 60 * 1000); // second call (6 min later)

    mockSend
      .mockResolvedValueOnce({
        Items: [{ PK: "MOOD#Joyful", active: true }],
      })
      .mockResolvedValueOnce({
        Items: [{ PK: "MOOD#Angry", active: true }],
      });

    const first = await getActiveMoods();
    const second = await getActiveMoods();

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(first).toEqual(["Joyful"]);
    expect(second).toEqual(["Angry"]);
  });
});
