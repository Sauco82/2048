import { v4 as generateUuid } from "uuid";

export type Cell = {
  uuid: string;
  row: number;
  col: number;
  value: number;
  merged: boolean;
};

export type Cells = {
  [key: string]: Cell;
};

export function createCell({
  row = 0,
  col = 0,
  value = 2,
  merged = false,
} = {}) {
  const uuid = generateUuid();

  return { uuid, row, col, value, merged };
}

export function createRandomCell(
  availableSpots: { row: number; col: number }[] = [],
  value = 2
) {
  const randomIndex = Math.floor(Math.random() * availableSpots.length);
  const { row, col } = availableSpots[randomIndex];

  return createCell({ row, col, value });
}
