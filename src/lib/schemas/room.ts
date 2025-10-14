import { z } from "zod";
import { BoardSchema } from "./board";

export const PlayerSchema = z.object({
  id: z.string(),
  ready: z.boolean(),
});

export const RoomSchema = z.object({
  id: z.string(),
  players: z.array(PlayerSchema),
  state: z.enum(["lobby", "playing"]),
  // the id of the player who is currently playing
  turn: z.string(),
  board: BoardSchema,
});

export type Player = z.infer<typeof PlayerSchema>;
export type Room = z.infer<typeof RoomSchema>;
