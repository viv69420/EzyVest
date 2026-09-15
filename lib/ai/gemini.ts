import "server-only";
import { z } from "zod";
import type { ResearchResponse } from "@/lib/research/types";

export type GroundedPrompt = { question: string; sources: { title: string; publisher: string; url: string; content: string }[] };
const outputSchema = z.object({ answer:z.string().min(1), facts:z.array(z.string()), analysis:z.array(z.string()), inferences:z.array(z.string()), uncertainties:z.array(z.string()), speculation:z.array(z.string()) });

export async function generateGroundedResearch(prompt: GroundedPrompt): Promise<Omit<ResearchResponse,"sources">> {
  if (!process.env.GEMINI_API_KEY) throw new Error("Gemini is not configured.");
  if (!prompt.sources.length) throw new Error("Research needs verified source context.");
  const evidence = prompt.sources.map((source,index)=>`[${index + 1}] ${source.title} | ${source.publisher} | ${source.url}\n${source.content.slice(0,6000)}`).join("\n\n");
  const instruction = "You are EzyVest's evidence-led research engine. Answer only using the supplied sources. Never give investment advice or recommendations. Every fact must be directly supported by the supplied source text. Put any non-established information in uncertainties or speculation. Do not invent a source, URL, event, financial figure, or citation. Return JSON only with answer, facts, analysis, inferences, uncertainties, speculation; all values except answer are string arrays.";
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:instruction}]},contents:[{role:"user",parts:[{text:`Question: ${prompt.question}\n\nVerified evidence:\n${evidence}`}]}],generationConfig:{responseMimeType:"application/json",temperature:0.1}})});
  if (!response.ok) throw new Error("Gemini research is temporarily unavailable.");
  const payload = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = payload.candidates?.[0]?.content?.parts?.map(part=>part.text??"").join("");
  if (!text) throw new Error("Gemini returned no structured research.");
  return outputSchema.parse(JSON.parse(text));
}
