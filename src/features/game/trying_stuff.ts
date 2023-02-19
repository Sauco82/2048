type Cell = {
  row: number;
  col: number;
  value: number;
  merged: boolean;
  toRemove: boolean;
};

type Grid = Array<Array<Cell | null>>;

const SIZE = 3;

function insertCellInGrid(cell, grid) {
  const { row, col } = cell;
  grid[row][col] = cell;
}

export function createGrid(cells: Cell[], size = SIZE): Grid {
  const grid = Array(size)
    .fill(null)
    .map(() => new Array(size).fill(null));

  cells.forEach((cell) => insertCellInGrid(cell, grid));

  return grid;
}

export function gridToString(grid: Grid): string {
  return grid
    .map((row) => row.map((cell) => cell?.value || "0").join(" "))
    .join("\n");
}

export type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN";

export function iteratorToPosition(
  i: number,
  j: number,
  direction: Direction,
  size: number
) {
  switch (direction) {
    case "LEFT":
      return { row: i, col: j };
    case "RIGHT":
      return { row: i, col: size - j - 1 };
    case "DOWN":
      return { row: j, col: i };
    case "UP":
      return { row: size - j - 1, col: i };
    default:
      throw new Error("Invalid position");
  }
}

type Dimension = "row" | "col";

export function directionToCoordName(direction: Direction): Dimension {
  switch (direction) {
    case "LEFT":
    case "RIGHT":
      return "col";
    case "DOWN":
    case "UP":
      return "row";
  }
}

type Increment = 1 | -1;

export function directionToIncrement(direction: Direction): Increment {
  switch (direction) {
    case "LEFT":
    case "DOWN":
      return 1;
    case "RIGHT":
    case "UP":
      return -1;
  }
}

export function directionBorderIndex(direction: Direction, size: number) {
  switch (direction) {
    case "LEFT":
    case "UP":
      return 0;
    case "RIGHT":
    case "DOWN":
      return size - 1;
  }
}

export function shiftGrid(grid: Grid, direction: Direction = "LEFT") {
  const size = grid.length;
  const lastMergeables = Array(size).fill(null);
  const coordName = directionToCoordName(direction);
  const increment = directionToIncrement(direction);
  const borderIndex = directionBorderIndex(direction, size);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const { col, row } = iteratorToPosition(i, j, direction, size);
      const cell = grid[row][col];
      const lastMergeable = lastMergeables[i];

      if (!cell) continue;
      if (cell[coordName] === borderIndex) {
        lastMergeables[row] = cell;
        continue;
      }

      const canBeMerged =
        !lastMergeable?.merged && cell.value === lastMergeable?.value;

      if (canBeMerged) {
        // merge
        cell[coordName] = lastMergeable[coordName];
        cell.toRemove = true;
        lastMergeable.value *= 2;
        lastMergeable.merged = true;
        grid[row][col] = null;
      } else {
        // move
        cell[coordName] = lastMergeable
          ? lastMergeable[coordName] + increment
          : borderIndex;
        lastMergeables[i] = cell;
        grid[row][col] = null;
        insertCellInGrid(cell, grid);
      }
    }
  }
}
