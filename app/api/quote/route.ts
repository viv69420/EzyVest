import { NextRequest, NextResponse } from "next/server";
import { financialData } from "@/lib/financial-data";
import { marketQuerySchema } from "@/lib/validation/market";

export async function GET(request: NextRequest) {
  const parsed = marketQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "A valid symbol is required." }, { status: 400 });
  try { return NextResponse.json(await financialData.quote(parsed.data)); }
  catch { return NextResponse.json({ error: "Market quote is temporarily unavailable." }, { status: 502 }); }
}
