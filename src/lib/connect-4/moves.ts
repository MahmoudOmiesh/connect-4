import type { Board } from "../schemas/board";

export function makeMove(
  board: Board,
  colIndex: number,
  player: "red" | "blue",
) {
  const rowIndex = board[colIndex]!.findIndex((cell) => cell === "");
  if (rowIndex === -1) {
    throw new Error("Column is full");
  }

  board[colIndex]![rowIndex] = player;

  return {
    newBoard: board,
    lastMove: {
      col: colIndex,
      row: rowIndex,
    },
  };
}
