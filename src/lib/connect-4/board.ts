import type {
  Board,
  BoardSize,
  BoardState,
  Cell,
  Position,
} from "../schemas/board";

function createBoard(size: BoardSize) {
  // Board is array of columns, each column is an array of cells, bottom of column is index 0
  return Array.from({ length: size.cols }, () =>
    Array.from({ length: size.rows }, () => ""),
  );
}

function checkBoardState(board: Board, lastMove: Position): BoardState {
  const numberOfColumns = board.length;
  const numberOfRows = board[0]!.length;

  const { col: lastMoveCol, row: lastMoveRow } = lastMove;

  // Check vertical
  for (let rowIndex = 0; rowIndex < numberOfRows - 3; rowIndex++) {
    const cells = board[lastMoveCol]!.slice(rowIndex, rowIndex + 4);
    if (compareCells(cells, "red")) {
      return "red-win";
    }
    if (compareCells(cells, "blue")) {
      return "blue-win";
    }
  }

  // Check horizontal
  for (let colIndex = 0; colIndex < numberOfColumns - 3; colIndex++) {
    const cells = board
      .slice(colIndex, colIndex + 4)
      .map((col) => col[lastMoveRow]!);
    if (compareCells(cells, "red")) {
      return "red-win";
    }
    if (compareCells(cells, "blue")) {
      return "blue-win";
    }
  }

  // Check diagonal (down-right)
  for (let colIndex = 0; colIndex < numberOfColumns - 3; colIndex++) {
    const cells = board.slice(colIndex, colIndex + 4).map((col, index) => {
      const rowIndex = lastMoveCol + lastMoveRow - colIndex - index;
      return col[rowIndex];
    });

    if (cells.some((cell) => cell == undefined)) {
      // diagonal has less than 4 cells
      continue;
    }

    if (compareCells(cells as Cell[], "red")) {
      return "red-win";
    }

    if (compareCells(cells as Cell[], "blue")) {
      return "blue-win";
    }
  }

  // Check diagonal (up-right)
  for (let colIndex = 0; colIndex < numberOfColumns - 3; colIndex++) {
    const cells = board.slice(colIndex, colIndex + 4).map((col, index) => {
      const rowIndex = colIndex + index - lastMoveCol + lastMoveRow;
      return col[rowIndex];
    });

    if (cells.some((cell) => cell == undefined)) {
      continue;
    }

    if (compareCells(cells as Cell[], "red")) {
      return "red-win";
    }

    if (compareCells(cells as Cell[], "blue")) {
      return "blue-win";
    }
  }

  // Check all cells are filled
  if (board.flat().every((cell) => cell !== "")) {
    return "draw";
  }

  return "in-progress";
}

function compareCells(cells: Cell[], value: Cell) {
  return cells.every((cell) => cell === value);
}

export { createBoard, checkBoardState };
