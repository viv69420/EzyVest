import { z } from "zod";
export const marketQuerySchema = z.object({ symbol: z.string().trim().min(1).max(32).regex(/^[A-Za-z0-9.\-:]+$/), exchange: z.string().trim().min(1).max(100).optional() });
export const searchQuerySchema = z.object({ q: z.string().trim().min(2).max(100) });
