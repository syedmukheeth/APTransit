import { z } from "zod";

// Money is always integer paise (AGENTS.md hard rule 7).

export const PAISE_PER_RUPEE = 100;

/** Schema for a paise amount: whole number, zero or more. */
export const Paise = z.number().int().nonnegative();

export function isPaise(value: unknown): value is number {
  return Paise.safeParse(value).success;
}

export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) throw new RangeError("rupees must be a finite number");
  return Math.round(rupees * PAISE_PER_RUPEE);
}

export function paiseToRupees(paise: number): number {
  if (!Number.isInteger(paise)) throw new RangeError("paise must be an integer");
  return paise / PAISE_PER_RUPEE;
}

/** Rounds a paise amount to the nearest whole rupee, half up (fares are whole rupees, docs/19). */
export function roundToRupee(paise: number): number {
  if (!Number.isInteger(paise) || paise < 0) throw new RangeError("paise must be a non negative integer");
  return Math.floor((paise + PAISE_PER_RUPEE / 2) / PAISE_PER_RUPEE) * PAISE_PER_RUPEE;
}
