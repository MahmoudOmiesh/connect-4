import { z } from "zod";

export const playerSchema = z.object({
  id: z.string(),
  ready: z.boolean(),
});

export const roomSchema = z.object({
  id: z.string(),
  players: z.array(playerSchema),
});

export type Player = z.infer<typeof playerSchema>;
export type Room = z.infer<typeof roomSchema>;
