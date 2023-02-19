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

export function shiftGrid(grid: Grid, direction = "LEFT") {
  //will get direction
  // PUSH LEFT == col - 1
  const size = grid.length;
  const lastMergeables = Array(size).fill(null);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      //lastMergeable just needs to match the top iterator it is independent from rows and columns
      const lastMergeable = lastMergeables[row];

      if (!cell) continue;
      if (cell["col"] === 0) {
        lastMergeables[row] = cell;
        continue;
      }

      const canBeMerged =
        !lastMergeable?.merged && cell.value === lastMergeable?.value;

      if (canBeMerged) {
        // merge
        cell["col"] = lastMergeable["col"];
        cell.toRemove = true;
        lastMergeable.value *= 2;
        lastMergeable.merged = true;
        grid[row][col] = null;
      } else {
        // move
        cell["col"] = lastMergeable ? lastMergeable["col"] + 1 : 0;
        lastMergeables[row] = cell;
        grid[row][col] = null;
        insertCellInGrid(cell, grid);
      }
    }
  }
}
