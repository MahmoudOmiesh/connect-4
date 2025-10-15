"use client";

import type { Channel } from "pusher-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { makeMove } from "~/lib/connect-4/moves";
import type { GameState, Player } from "~/lib/schemas/room";
import { cn } from "~/lib/utils";
import { subscribeToEvent } from "~/lib/wrappers/pusher/subscribe";
import { api } from "~/trpc/react";

export function Game({
  roomId,
  player,
  roomChannel,
}: {
  roomId: string;
  player: Player;
  roomChannel: Channel | null;
}) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const utils = api.useUtils();
  const makeMoveMutation = api.game.makeMove.useMutation({
    // optimistic update
    onMutate: (data) => {
      const { newBoard } = makeMove(
        gameState?.board ?? [],
        data.column,
        player.color,
      );

      console.log(newBoard);

      setGameState({
        board: newBoard,
        // N/A means that the turn is not yet determined
        turn: "N/A",
      });
    },
  });

  useEffect(() => {
    void utils.game.getGame.fetch({ roomId }).then((data) => {
      setGameState(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (!roomChannel) return;

    function handlePlayerWon(data: { playerId: string }) {
      if (data.playerId === player.id) {
        toast.success("You won!");
      } else {
        toast.error("You lost!");
      }

      setIsGameOver(true);
    }

    subscribeToEvent(roomChannel, "game-state-changed", setGameState);
    subscribeToEvent(roomChannel, "player-won", handlePlayerWon);

    return () => {
      roomChannel.unbind("game-state-changed");
      roomChannel.unbind("player-won");
    };
  }, [roomId, player.id, roomChannel]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const isMyTurn = gameState.turn === player?.id;

  function handleMakeMove(column: number) {
    const isColumnFull = gameState?.board[column]!.every((cell) => cell !== "");
    if (
      !isMyTurn ||
      !player.id ||
      makeMoveMutation.isPending ||
      isColumnFull ||
      isGameOver
    )
      return;

    makeMoveMutation.mutate({ roomId, playerId: player.id, column });
  }

  return (
    <div className="grid h-screen place-items-center">
      <div
        className="grid overflow-hidden rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${gameState.board.length}, 1fr)`,
        }}
      >
        {gameState.board.map((column, index) => (
          <div
            key={`column-${index}`}
            className={cn(
              "grid bg-gray-700/50 transition-colors",
              isMyTurn && !isGameOver && "cursor-pointer hover:bg-gray-700/90",
            )}
            style={{ gridTemplateRows: `repeat(${column.length}, 1fr)` }}
            onClick={() => handleMakeMove(index)}
          >
            {[...column].reverse().map((cell, index) => (
              <div key={`cell-${index}`} className="relative size-24">
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
    </div>
  );
}
