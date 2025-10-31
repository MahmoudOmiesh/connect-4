"use client";

import { useState, type SetStateAction, type Dispatch, useEffect } from "react";
import { toast } from "sonner";
import { checkBoardState } from "~/lib/connect-4/board";
import { makeMove } from "~/lib/connect-4/moves";
import type { Board, Position } from "~/lib/schemas/board";
import type { Room } from "~/lib/schemas/room";
import { cn } from "~/lib/utils";

export function Game({
  room,
  setRoom,
  playerId,
}: {
  room: Room;
  setRoom: Dispatch<SetStateAction<Room>>;
  playerId: string;
}) {
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (!room.roomChannel) return;

    function handleClientMakeMove(data: { board: Board; turn: string }) {
      setRoom((prev) => ({ ...prev, board: data.board, turn: data.turn }));
    }

    function handleClientPlayerWon(data: { winnerId: string }) {
      handlePlayerWon(data.winnerId);
    }

    room.roomChannel.bind("client-make-move", handleClientMakeMove);
    room.roomChannel.bind("client-player-won", handleClientPlayerWon);
    return () => {
      room.roomChannel?.unbind("client-make-move");
      room.roomChannel?.unbind("client-player-won");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.roomChannel, setRoom]);

  const isMyTurn = room.turn === playerId;
  const myColor = room.players.find((player) => player.id === playerId)!.color;
  const otherPlayer = room.players.find((player) => player.id !== playerId)!;

  function handleMakeMove(column: number) {
    const isColumnFull = room.board[column]!.every((cell) => cell !== "");
    if (!isMyTurn || isColumnFull || isGameOver) return;

    const { newBoard, lastMove } = makeMove(room.board, column, myColor);

    setRoom((prev) => ({
      ...prev,
      board: newBoard,
      turn: otherPlayer.id,
    }));

    room.roomChannel?.trigger("client-make-move", {
      board: newBoard,
      turn: otherPlayer.id,
    });

    checkForWin(newBoard, lastMove);
  }

  function checkForWin(board: Board, lastMove: Position) {
    const state = checkBoardState(board, lastMove);

    if (state === "red-win" || state === "blue-win") {
      const winnerId = room.players.find(
        (player) => player.color === (state === "red-win" ? "red" : "blue"),
      )!.id;

      handlePlayerWon(winnerId);
      room.roomChannel?.trigger("client-player-won", {
        winnerId,
      });
    }
  }

  function handlePlayerWon(winnerId: string) {
    setIsGameOver(true);

    if (winnerId === playerId) {
      toast.success("You won!");
    } else {
      toast.error("You lost!");
    }
  }

  return (
    <div className="grid h-screen place-items-center">
      <div
        className="grid overflow-hidden rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${room.board.length}, 1fr)`,
        }}
      >
        {room.board.map((column, index) => (
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
