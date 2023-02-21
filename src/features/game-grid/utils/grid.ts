import produce from "immer";

import { Cells, createRandomCell } from "./cell";
import {
  Direction,
  transpositionData,
  iteratorToPosition,
} from "./transposition";

export type Grid = Array<Array<string | null>>;

export const SIZE = 6;

export function createGrid(size = SIZE) {
  return Array(size)
    .fill(null)
    .map(() => new Array(size).fill(null));
}

export function insertCell(grid: Grid, cell) {
  const { row, col, uuid } = cell;

  grid[row][col] = uuid;
}

export function getAvailableSpots(grid: Grid) {
  return grid
    .map((cellRow, row) => cellRow.map((uuid, col) => ({ row, col, uuid })))
    .flat()
    .filter(({ uuid }) => !uuid);
}

export function insertRandomCell(grid: Grid, cells: Cells, value = 1) {
  const availableSpots = getAvailableSpots(grid);
  const newCell = createRandomCell(availableSpots, value);

  insertCell(grid, newCell);
  cells[newCell.uuid] = newCell;
}

export function calculateSlide(
  currentState: { grid: Grid; cells: Cells },
  direction: Direction
) {
  const state = produce(currentState, ({ grid, cells }) => {
    const size = grid.length;
    const lastMergeables = Array(size).fill(null);
    const { coordName, increment, borderIndex } = transpositionData(
      direction,
      size
    );

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const { col, row } = iteratorToPosition(i, j, direction, size);
        const cellUuid = grid[row][col];
        const cell = cells[cellUuid];
        const lastMergeable = lastMergeables[i];

        if (!cell) continue;

        if (cell[coordName] === borderIndex) {
          lastMergeables[i] = cell;
          continue;
        }

        const canBeMerged =
          !lastMergeable?.merged && cell.value === lastMergeable?.value;

        if (canBeMerged) {
          // merge
          cell[coordName] = lastMergeable[coordName];
          lastMergeable.value *= 2;
          lastMergeable.merged = true;
          grid[row][col] = null;
          continue;
        }

        // move
        cell[coordName] = lastMergeable
          ? lastMergeable[coordName] + increment
          : borderIndex;
        lastMergeables[i] = cell;
        grid[row][col] = null;
        insertCell(grid, cell);
      }
    }
  });

  return state;
}

export function areGridsEqual(grid1: Grid, grid2: Grid) {
  const sideLength = grid1.length;
  if (sideLength !== grid2.length) return false;

  let i = 0;

  while (i < sideLength) {
    let j = 0;

    while (j < sideLength) {
      if (grid1[i][j] !== grid2[i][j]) return false;
      j++;
    }

    i++;
  }

  return true;
}

export function canSlide(
  { currentGrid, cells }: { currentGrid: Grid; cells: Cells },
  direction: Direction
) {
  const { grid } = calculateSlide({ grid: currentGrid, cells }, direction);

  return !areGridsEqual(currentGrid, grid);
}
