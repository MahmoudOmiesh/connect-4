import z from "zod";
import { PlayerSchema } from "./room";

export const EventDefinitions = [
  {
    name: "players-changed" as const,
    dataSchema: z.object({
      players: z.array(PlayerSchema),
    }),
  },
];

export type EventName = (typeof EventDefinitions)[number]["name"];
