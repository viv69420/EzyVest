import { NextRequest, NextResponse } from "next/server";
import { financialData } from "@/lib/financial-data";
import { marketQuerySchema } from "@/lib/validation/market";

export async function GET(request: NextRequest) {
  const parsed = marketQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "A valid symbol is required." }, { status: 400 });
  const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const days = Number.isInteger(requestedDays) && requestedDays >= 1 && requestedDays <= 500 ? requestedDays : 30;
  try { return NextResponse.json(await financialData.history(parsed.data, days)); }
  catch { return NextResponse.json({ error: "Price history is temporarily unavailable." }, { status: 502 }); }
}
