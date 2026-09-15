export type PaperOrderInput = { securityId: string; side: "buy" | "sell"; quantity: number; executionPrice: number };
export function validatePaperOrder(input: PaperOrderInput) {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0 || !Number.isFinite(input.executionPrice) || input.executionPrice <= 0) throw new Error("Quantity and price must be positive numbers.");
}
