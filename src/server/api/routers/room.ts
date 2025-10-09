import { nanoid } from "nanoid";
import { createTRPCRouter, publicProcedure, roomProcedure } from "../trpc";

import { tryCatch } from "~/lib/utils";
import { redis } from "~/lib/redis";
import { TRPCError } from "@trpc/server";
import { pusher } from "~/lib/pusher";
import { z } from "zod";

export type Player = {
  id: string;
  ready: boolean;
};

export type Room = {
  id: string;
  players: Player[];
};

export const roomRouter = createTRPCRouter({
  create: publicProcedure.mutation(async () => {
    const id = nanoid();
    const room: Room = {
      id,
      players: [],
    };
    const result = await tryCatch(redis.set(`room:${id}`, room));

    if (result.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not create a room. Please try again later.",
      });
    }

    return {
      id,
    };
  }),

  canJoin: roomProcedure.query(async ({ ctx }) => {
    const { room } = ctx;
    if (room.players.length >= 2) {
      return false;
    }

    return true;
  }),

  join: roomProcedure.mutation(async ({ ctx }) => {
    const { room } = ctx;
    const playerId = nanoid();

    if (room.players.length >= 2) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This room is full.",
      });
    }

    room.players.push({ id: playerId, ready: false });
    const result = await tryCatch(redis.set(`room:${room.id}`, room));

    if (result.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not join the room. Please try again.",
      });
    }

    void pusher.trigger(`room-${room.id}`, "players-changed", {
      players: room.players,
    });

    return {
      playerId,
      players: room.players,
    };
  }),

  toggleReady: roomProcedure
    .input(z.object({ playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { room } = ctx;
      const { playerId } = input;

      const player = room.players.find((player) => player.id === playerId);

      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Player not found.",
        });
      }

      player.ready = !player.ready;

      const result = await tryCatch(redis.set(`room:${room.id}`, room));

      if (result.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not toggle ready state. Please try again.",
        });
      }

      void pusher.trigger(`room-${room.id}`, "players-changed", {
        players: room.players,
      });

      return {
        players: room.players,
      };
    }),
});
