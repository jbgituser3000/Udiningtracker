import { NextResponse } from "next/server";
import { getLocations } from "@/lib/dineoncampus";

export async function GET() {
  try {
    return NextResponse.json({ locations: await getLocations() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Couldn't load dining locations right now." }, { status: 502 });
  }
}
