import z from "zod";
import { createTRPCRouter, playerProcedure, roomProcedure } from "../trpc";
import { tryCatch } from "~/lib/utils";
import { makeMove } from "~/lib/connect-4/moves";
import { TRPCError } from "@trpc/server";
import { redisWrapper } from "~/lib/wrappers/redis";
import { triggerEvent } from "~/lib/wrappers/pusher/trigger";
import { checkBoardState } from "~/lib/connect-4/board";
import type { Position } from "~/lib/schemas/board";
import type { Room } from "~/lib/schemas/room";

function checkForWin(room: Room, lastMove: Position) {
  const state = checkBoardState(room.board, lastMove);

  if (state === "red-win") {
    const player = room.players.find((player) => player.color === "red")!;

    void triggerEvent(`presence-room-${room.id}`, "player-won", {
      playerId: player.id,
    });
  }

  if (state === "blue-win") {
    const player = room.players.find((player) => player.color === "blue")!;

    void triggerEvent(`presence-room-${room.id}`, "player-won", {
      playerId: player.id,
    });
  }
}

export const gameRouter = createTRPCRouter({
  getGame: roomProcedure.query(async ({ ctx }) => {
    return {
      turn: ctx.room.turn,
      board: ctx.room.board,
    };
  }),

  makeMove: playerProcedure
    .input(
      z.object({
        column: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // we are sure that the player is valid because of the playerProcedure
      const player = ctx.room.players.find(
        (player) => player.id === ctx.room.turn,
      )!;

      const otherPlayer = ctx.room.players.find(
        (player) => player.id !== ctx.room.turn,
      )!;

      try {
        const { newBoard, lastMove } = makeMove(
          ctx.room.board,
          input.column,
          player.color,
        );

        ctx.room.board = newBoard;
        ctx.room.turn = otherPlayer.id;

        const { error } = await tryCatch(
          redisWrapper.updateRoom(ctx.room.id, ctx.room),
        );

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not update the room. Please try again later.",
          });
        }

        void triggerEvent(
          `presence-room-${ctx.room.id}`,
          "game-state-changed",
          {
            board: newBoard,
            turn: otherPlayer.id,
          },
        );

        checkForWin(ctx.room, lastMove);

        return {
          newBoard,
          turn: otherPlayer.id,
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Column is full.",
        });
      }
    }),
});
