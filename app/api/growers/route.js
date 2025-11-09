import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(uri);
  cachedClient = client;
  return client;
}

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db("microgreens");

    const activeCollection = db.collection("active_growers");
    const finishedCollection = db.collection("finished_growers");

    const active = await activeCollection.find({}).toArray();
    const finished = await finishedCollection
      .find({})
      .sort({ finishedDate: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({ active, finished });
  } catch (error) {
    console.error("Error fetching growers:", error);
    return NextResponse.json({ active: [], finished: [] });
  }
}

export async function POST(request) {
  try {
    const { active, finished } = await request.json();
    const client = await connectToDatabase();
    const db = client.db("microgreens");

    const activeCollection = db.collection("active_growers");
    const finishedCollection = db.collection("finished_growers");

    // Update active growers
    await activeCollection.deleteMany({});
    if (active.length > 0) {
      await activeCollection.insertMany(active);
    }

    // Update finished growers (keep only last 5)
    await finishedCollection.deleteMany({});
    if (finished.length > 0) {
      await finishedCollection.insertMany(finished.slice(0, 5));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving growers:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
