"use client";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function Game({
  roomId,
  playerId,
}: {
  roomId: string;
  playerId: string | null;
}) {
  const { data: gameState } = api.game.getGame.useQuery({ roomId });

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const isMyTurn = gameState.turn === playerId;

  return (
    <div
      className="grid overflow-hidden rounded-lg"
      style={{ gridTemplateColumns: `repeat(${gameState.board.length}, 1fr)` }}
    >
      {gameState.board.map((column, index) => (
        <div
          key={`column-${index}`}
          className="grid bg-gray-700/50 transition-colors hover:bg-gray-700/90"
          style={{ gridTemplateRows: `repeat(${column.length}, 1fr)` }}
        >
          {column.map((cell, index) => (
            <div
              key={`cell-${index}`}
              className="relative size-24 cursor-pointer"
            >
              <svg
                viewBox="0 0 100 100"
                className={cn(
                  "fill-background absolute inset-3",
                  cell === "red" && "fill-red-500",
                  cell === "blue" && "fill-blue-500",
                )}
              >
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
