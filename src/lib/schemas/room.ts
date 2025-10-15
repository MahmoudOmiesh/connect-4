import { z } from "zod";
import { BoardSchema, type Board } from "./board";

export const PlayerSchema = z.object({
  id: z.string(),
  ready: z.boolean(),
  color: z.enum(["red", "blue"]),
});

export const RoomStateSchema = z.enum(["lobby", "playing"]);

export const RoomSchema = z.object({
  id: z.string(),
  players: z.array(PlayerSchema),
  state: RoomStateSchema,
  // the id of the player who is currently playing
  turn: z.string(),
  board: BoardSchema,
});

export type Player = z.infer<typeof PlayerSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type RoomState = z.infer<typeof RoomStateSchema>;
export type GameState = {
  board: Board;
  turn: string;
};
