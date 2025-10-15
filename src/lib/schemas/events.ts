import z from "zod";
import { PlayerSchema, RoomStateSchema } from "./room";
import { BoardSchema } from "./board";

export const EventDefinitions = [
  {
    name: "players-changed" as const,
    dataSchema: z.object({
      players: z.array(PlayerSchema),
    }),
  },
  {
    name: "room-state-changed" as const,
    dataSchema: z.object({
      state: RoomStateSchema,
    }),
  },
  {
    name: "game-state-changed" as const,
    dataSchema: z.object({
      board: BoardSchema,
      turn: z.string(),
    }),
  },
  {
    name: "player-won" as const,
    dataSchema: z.object({
      playerId: z.string(),
    }),
  },
];

export type EventName = (typeof EventDefinitions)[number]["name"];
