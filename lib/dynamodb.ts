import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "moods";
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedMoods: string[] | null = null;
let cacheTimestamp = 0;

export async function getActiveMoods(): Promise<string[]> {
  const now = Date.now();
  if (cachedMoods && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedMoods;
  }

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "active = :active",
        ExpressionAttributeValues: { ":active": true },
        ProjectionExpression: "PK",
      })
    );

    const moods = (result.Items ?? [])
      .map((item) => (item.PK as string).replace("MOOD#", ""))
      .sort();

    cachedMoods = moods;
    cacheTimestamp = now;
    return moods;
  } catch (error) {
    if (cachedMoods) {
      console.warn("DynamoDB unavailable, returning stale cache", error);
      return cachedMoods;
    }
    throw new Error("Failed to load mood vocabulary from database");
  }
}
