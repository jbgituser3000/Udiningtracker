import { NextRequest, NextResponse } from "next/server";
import { getMenu } from "@/lib/dineoncampus";

const ID = /^[A-Za-z0-9_-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const location = params.get("location") ?? "";
  const date = params.get("date") ?? "";
  const period = params.get("period") ?? undefined;

  if (!ID.test(location) || !DATE.test(date) || (period && !ID.test(period))) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getMenu(location, date, period));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Couldn't load this menu right now." }, { status: 502 });
  }
}
