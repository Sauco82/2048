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
      return { row: size - j - 1, col: i };
    case "UP":
      return { row: j, col: i };
    default:
      throw new Error("Invalid position");
  }
}

type Axis = "row" | "col";

export function directionToCoordName(direction: Direction): Axis {
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
    case "UP":
      return 1;
    case "RIGHT":
    case "DOWN":
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

export function transpositionData(direction: Direction, size: number) {
  const coordName = directionToCoordName(direction);
  const increment = directionToIncrement(direction);
  const borderIndex = directionBorderIndex(direction, size);

  return { coordName, increment, borderIndex };
}
