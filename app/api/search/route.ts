import { NextRequest, NextResponse } from "next/server";
import { financialData } from "@/lib/financial-data";
import { searchQuerySchema } from "@/lib/validation/market";

export async function GET(request: NextRequest) {
  const parsed = searchQuerySchema.safeParse({ q: request.nextUrl.searchParams.get("q") });
  if (!parsed.success) return NextResponse.json({ error: "Search needs 2–100 characters." }, { status: 400 });
  try { return NextResponse.json(await financialData.search(parsed.data.q)); }
  catch { return NextResponse.json({ error: "Market search is temporarily unavailable." }, { status: 502 }); }
}
