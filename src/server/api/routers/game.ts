import { createTRPCRouter, roomProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  getGame: roomProcedure.query(async ({ ctx }) => {
    return {
      turn: ctx.room.turn,
      board: ctx.room.board,
    };
  }),
});
