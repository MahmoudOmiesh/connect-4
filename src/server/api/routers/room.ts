import { nanoid } from "nanoid";
import { createTRPCRouter, publicProcedure, roomProcedure } from "../trpc";

import { tryCatch } from "~/lib/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { redisWrapper } from "~/lib/wrappers/redis";
import { triggerEvent } from "~/lib/wrappers/pusher/trigger";

export const roomRouter = createTRPCRouter({
  create: publicProcedure.mutation(async () => {
    const id = nanoid();
    const { error } = await tryCatch(redisWrapper.createRoom(id));

    if (error) {
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

      const { error } = await tryCatch(redisWrapper.updateRoom(room.id, room));

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not add a player. Please try again later.",
        });
      }

      void triggerEvent(`presence-room-${room.id}`, "players-changed", {
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

      const { error } = await tryCatch(redisWrapper.updateRoom(room.id, room));

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not remove a player. Please try again later.",
        });
      }

      void triggerEvent(`presence-room-${room.id}`, "players-changed", {
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

      const { error } = await tryCatch(redisWrapper.updateRoom(room.id, room));

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not toggle player ready. Please try again later.",
        });
      }

      void triggerEvent(`presence-room-${room.id}`, "players-changed", {
        players: room.players,
      });

      return {
        ok: true,
      };
    }),
});
