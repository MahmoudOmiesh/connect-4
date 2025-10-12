import { nanoid } from "nanoid";
import { createTRPCRouter, publicProcedure, roomProcedure } from "../trpc";

import { tryCatch } from "~/lib/utils";
import { redis } from "~/lib/redis";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { pusher } from "~/lib/pusher";

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

  getPlayers: roomProcedure.query(async ({ ctx }) => {
    const { room } = ctx;
    return room.players;
  }),

  addPlayer: roomProcedure
    .input(z.object({ playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { room } = ctx;
      room.players.push({ id: input.playerId, ready: false });

      const result = await tryCatch(redis.set(`room:${room.id}`, room));

      if (result.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not add a player. Please try again later.",
        });
      }

      void pusher.trigger(`presence-room-${room.id}`, "players-changed", {
        players: room.players,
      });

      return {
        ok: true,
      };
    }),

  removePlayer: roomProcedure
    .input(z.object({ playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { room } = ctx;
      room.players = room.players.filter(
        (player) => player.id !== input.playerId,
      );

      const result = await tryCatch(redis.set(`room:${room.id}`, room));

      if (result.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not remove a player. Please try again later.",
        });
      }

      void pusher.trigger(`presence-room-${room.id}`, "players-changed", {
        players: room.players,
      });

      return {
        ok: true,
      };
    }),

  togglePlayerReady: roomProcedure
    .input(z.object({ playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { room } = ctx;
      const player = room.players.find(
        (player) => player.id === input.playerId,
      );

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
          message: "Could not toggle player ready. Please try again later.",
        });
      }

      void pusher.trigger(`presence-room-${room.id}`, "players-changed", {
        players: room.players,
      });

      return {
        ok: true,
      };
    }),
});
