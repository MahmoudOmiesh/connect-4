import { z } from "zod";

export const BOARD_SIZES = [
  {
    name: "7x6",
    rows: 7,
    cols: 6,
  },
  {
    name: "8x7",
    rows: 8,
    cols: 7,
  },
  {
    name: "8x8",
    rows: 8,
    cols: 8,
  },
  {
    name: "9x7",
    rows: 9,
    cols: 7,
  },
  {
    name: "9x9",
    rows: 9,
    cols: 9,
  },
] as const;

export const CellSchema = z.enum(["", "red", "blue"]);
export const BoardSchema = z.array(z.array(CellSchema));
export const PositionSchema = z.object({
  col: z.number(),
  row: z.number(),
});

export type Board = z.infer<typeof BoardSchema>;
export type Cell = z.infer<typeof CellSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type BoardSize = (typeof BOARD_SIZES)[number];
export type BoardState = "draw" | "red-win" | "blue-win" | "in-progress";
