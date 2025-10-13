import z from "zod";
import { playerSchema } from "./room";

export const EventDefinitions = [
  {
    name: "players-changed" as const,
    dataSchema: z.object({
      players: z.array(playerSchema),
    }),
  },
];

export type EventName = (typeof EventDefinitions)[number]["name"];
