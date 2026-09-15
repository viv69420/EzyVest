export type Source = { title: string; publisher: string; url: string; sourceType: "filing" | "investor_relations" | "government" | "news" | "market_data"; publishedAt?: string; retrievedAt: string };
export type ResearchResponse = { answer: string; facts: string[]; analysis: string[]; inferences: string[]; uncertainties: string[]; speculation: string[]; sources: Source[] };
