import {
  iteratorToPosition,
  directionToCoordName,
  directionToIncrement,
} from "./transposition";

describe("direction handling utils", () => {
  it("convert iterators to grid coords that match the shifting exploration direction", () => {
    expect(iteratorToPosition(0, 0, "LEFT", 3)).toEqual({ row: 0, col: 0 });
    expect(iteratorToPosition(0, 1, "LEFT", 3)).toEqual({ row: 0, col: 1 });
    expect(iteratorToPosition(0, 2, "LEFT", 3)).toEqual({ row: 0, col: 2 });
    expect(iteratorToPosition(1, 1, "LEFT", 3)).toEqual({ row: 1, col: 1 });
    expect(iteratorToPosition(2, 2, "LEFT", 3)).toEqual({ row: 2, col: 2 });

    expect(iteratorToPosition(0, 0, "RIGHT", 3)).toEqual({ row: 0, col: 2 });
    expect(iteratorToPosition(0, 1, "RIGHT", 3)).toEqual({ row: 0, col: 1 });
    expect(iteratorToPosition(0, 2, "RIGHT", 3)).toEqual({ row: 0, col: 0 });
    expect(iteratorToPosition(1, 1, "RIGHT", 3)).toEqual({ row: 1, col: 1 });
    expect(iteratorToPosition(2, 2, "RIGHT", 3)).toEqual({ row: 2, col: 0 });

    expect(iteratorToPosition(0, 0, "DOWN", 3)).toEqual({ row: 2, col: 0 });
    expect(iteratorToPosition(0, 1, "DOWN", 3)).toEqual({ row: 1, col: 0 });
    expect(iteratorToPosition(0, 2, "DOWN", 3)).toEqual({ row: 0, col: 0 });
    expect(iteratorToPosition(1, 1, "DOWN", 3)).toEqual({ row: 1, col: 1 });
    expect(iteratorToPosition(2, 2, "DOWN", 3)).toEqual({ row: 0, col: 2 });

    expect(iteratorToPosition(0, 0, "UP", 3)).toEqual({ row: 0, col: 0 });
    expect(iteratorToPosition(0, 1, "UP", 3)).toEqual({ row: 1, col: 0 });
    expect(iteratorToPosition(0, 2, "UP", 3)).toEqual({ row: 2, col: 0 });
    expect(iteratorToPosition(1, 1, "UP", 3)).toEqual({ row: 1, col: 1 });
    expect(iteratorToPosition(2, 2, "UP", 3)).toEqual({ row: 2, col: 2 });
  });

  it("convert direction in the coord name that defines the border", () => {
    expect(directionToCoordName("LEFT")).toBe("col");
    expect(directionToCoordName("RIGHT")).toBe("col");
    expect(directionToCoordName("DOWN")).toBe("row");
    expect(directionToCoordName("UP")).toBe("row");
  });

  it("convert direction into an increment to define where to leave cells in relation with their collision", () => {
    expect(directionToIncrement("LEFT")).toBe(1);
    expect(directionToIncrement("RIGHT")).toBe(-1);
    expect(directionToIncrement("DOWN")).toBe(-1);
    expect(directionToIncrement("UP")).toBe(1);
  });
});
