import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const growers = (await kv.get("microgreens-growers")) || [];
    return NextResponse.json({ growers });
  } catch (error) {
    return NextResponse.json({ growers: [] });
  }
}

export async function POST(request) {
  try {
    const { growers } = await request.json();
    await kv.set("microgreens-growers", growers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
