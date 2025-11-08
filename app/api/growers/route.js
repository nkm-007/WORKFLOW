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
    const collection = db.collection("growers");

    const growers = await collection.find({}).toArray();
    return NextResponse.json({ growers });
  } catch (error) {
    console.error("Error fetching growers:", error);
    return NextResponse.json({ growers: [] });
  }
}

export async function POST(request) {
  try {
    const { growers } = await request.json();
    const client = await connectToDatabase();
    const db = client.db("microgreens");
    const collection = db.collection("growers");

    // Clear all existing data and insert new data
    await collection.deleteMany({});
    if (growers.length > 0) {
      await collection.insertMany(growers);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving growers:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const client = await connectToDatabase();
    const db = client.db("microgreens");
    const collection = db.collection("growers");

    await collection.deleteOne({ id: parseInt(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grower:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
