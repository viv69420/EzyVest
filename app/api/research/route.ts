import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { researchQuestion } from "@/lib/research/service";
const schema = z.object({ question: z.string().trim().min(5).max(2000) });
export async function POST(request: NextRequest) {
  try { const body = schema.parse(await request.json()); return NextResponse.json(await researchQuestion(body.question)); }
  catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? "Enter a research question between 5 and 2,000 characters." : "Unable to run research." }, { status: 400 }); }
}
