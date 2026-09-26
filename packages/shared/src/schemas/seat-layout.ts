import { z } from "zod";

/**
 * Seat cell position (0-indexed).
 */
export const CellPositionSchema = z.object({
  row: z.number().int().nonnegative(),
  col: z.number().int().nonnegative(),
});
export type CellPosition = z.infer<typeof CellPositionSchema>;

/**
 * Zod schema for BusType seatLayout JSON.
 * Represents physical seat layout in the bus:
 * - rows: number of seat rows from front to back
 * - columns: number of columns across width (e.g. 5 for 3+2 or 4 for 2+2)
 * - aisleIndex: 0-indexed column position of aisle (e.g. 2 for 2+2, 3 for 3+2)
 * - labels: seat number labels in layout order (e.g. "1", "2", ... "60")
 * - blockedCells: cells with no seat (e.g. driver cabin, back door gap)
 */
export const SeatLayoutSchema = z.object({
  rows: z.number().int().positive(),
  columns: z.number().int().positive(),
  aisleIndex: z.number().int().nonnegative(),
  labels: z.array(z.string().min(1)),
  blockedCells: z.array(CellPositionSchema).default([]),
});

export type SeatLayout = z.infer<typeof SeatLayoutSchema>;
