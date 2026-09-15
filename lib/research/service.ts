import "server-only";
import { generateGroundedResearch } from "@/lib/ai/gemini";
import { getSecSubmissions, resolveSecCompany } from "@/lib/sources/sec";
import type { ResearchResponse, Source } from "./types";

function cikFromQuestion(question:string) { return question.match(/\bCIK\s*(\d{1,10})\b/i)?.[1]; }
export async function researchQuestion(question: string): Promise<ResearchResponse> {
  const explicitCik=cikFromQuestion(question);
  const ticker=question.match(/\b[A-Z]{1,5}\b/g)?.find(token=>!['CIK','SEC','WHAT','WHY','SHOW','THE','FOR','AND','WITH'].includes(token));
  const namedCompany=question.match(/(?:what does|why did|show me|about|are)\s+([A-Za-z .,&-]{2,60}?)(?:\s+(?:do|stock|latest|biggest|filings|risks)|\?|$)/i)?.[1]?.trim();
  const resolved=explicitCik?null:await resolveSecCompany(ticker??namedCompany??"");
  const cik=explicitCik??resolved?.cik;
  if (!cik) return {answer:"EzyVest could not resolve this question to an official U.S. issuer source.",facts:[],analysis:[],inferences:[],uncertainties:["Search and open a listed company first, or ask using its ticker (for example, AAPL). Global official-source coverage varies by market."],speculation:[],sources:[]};
  const filings=await getSecSubmissions(cik);
  if (!filings?.length) return {answer:"No official SEC source context is currently available for this CIK.",facts:[],analysis:[],inferences:[],uncertainties:["SEC retrieval requires a valid CIK and configured SEC_USER_AGENT."],speculation:[],sources:[]};
  const sources:Source[]=filings.slice(0,8).map(f=>({title:f.title,publisher:"U.S. Securities and Exchange Commission",url:f.url,sourceType:"filing",publishedAt:f.filedAt,retrievedAt:new Date().toISOString()}));
  const result=await generateGroundedResearch({question,sources:sources.map(source=>({...source,content:`Official SEC filing index: ${source.title}; filed ${source.publishedAt??"unknown"}.`}))});
  return {...result,sources};
}
