import z from "zod";
import { PlayerSchema, RoomStateSchema } from "./room";

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
];

export type EventName = (typeof EventDefinitions)[number]["name"];
