import {
  createGrid,
  shiftGrid,
  gridToString,
  iteratorToPosition,
  directionToCoordName,
  directionToIncrement,
} from "./trying_stuff";

function createCell(
  row = 0,
  col = 0,
  value = 2,
  merged = false,
  toRemove = false
) {
  return { row, col, value, merged, toRemove };
}

describe("grid shifter", () => {
  describe("when no obstacles", () => {
    it.each([
      {
        direction: "LEFT" as const,
        expectedCells: [createCell(1, 0), createCell(2, 0)],
        expectedGrid: "0 0 0\n2 0 0\n2 0 0",
      },
      {
        direction: "RIGHT" as const,
        expectedCells: [createCell(1, 2), createCell(2, 2)],
        expectedGrid: "0 0 0\n0 0 2\n0 0 2",
      },
      {
        direction: "UP" as const,
        expectedCells: [createCell(0, 1), createCell(0, 2)],
        expectedGrid: "0 2 2\n0 0 0\n0 0 0",
      },
      {
        direction: "DOWN" as const,
        expectedCells: [createCell(2, 1), createCell(2, 2)],
        expectedGrid: "0 0 0\n0 0 0\n0 2 2",
      },
    ])(
      "moves cells towards the $direction border",
      ({ direction, expectedCells, expectedGrid }) => {
        const cells = [createCell(1, 1), createCell(2, 2)];
        const grid = createGrid(cells, 3);

        shiftGrid(grid, direction);

        const newGridStr = gridToString(grid);

        expect(newGridStr).toBe(expectedGrid);
        expect(cells).toEqual(expectedCells);
      }
    );
  });

  describe("when incompatible cells ", () => {
    it.each([
      {
        direction: "LEFT" as const,
        expectedGrid: "4 128 0\n16 64 0\n254 32 0",
      },
      {
        direction: "RIGHT" as const,
        expectedGrid: "0 4 128\n0 16 64\n0 254 32",
      },
      {
        direction: "UP" as const,
        expectedGrid: "4 64 128\n16 254 32\n0 0 0",
      },
      {
        direction: "DOWN" as const,
        expectedGrid: "0 0 0\n4 64 128\n16 254 32",
      },
    ])("stacks them $direction", ({ direction, expectedGrid }) => {
      const cells = [
        createCell(0, 0, 4),
        createCell(0, 2, 128),
        createCell(1, 0, 16),
        createCell(1, 1, 64),
        createCell(2, 1, 254),
        createCell(2, 2, 32),
      ];
      const grid = createGrid(cells, 3);

      shiftGrid(grid, direction);
      expect(gridToString(grid)).toBe(expectedGrid);
    });
  });

  describe("when mergeable cells", () => {
    it.each([
      {
        direction: "LEFT" as const,
        expectedGrid: "0 0 0\n4 0 0\n4 0 0",
        expectedCells: [
          { row: 1, col: 0, value: 4, merged: true, toRemove: false },
          { row: 1, col: 0, value: 2, merged: false, toRemove: true },
          { row: 2, col: 0, value: 4, merged: true, toRemove: false },
          { row: 2, col: 0, value: 2, merged: false, toRemove: true },
        ],
      },
      {
        direction: "RIGHT" as const,
        expectedGrid: "0 0 0\n0 0 4\n0 0 4",
        expectedCells: [
          { row: 1, col: 2, value: 2, merged: false, toRemove: true },
          { row: 1, col: 2, value: 4, merged: true, toRemove: false },
          { row: 2, col: 2, value: 2, merged: false, toRemove: true },
          { row: 2, col: 2, value: 4, merged: true, toRemove: false },
        ],
      },
      {
        direction: "UP" as const,
        expectedGrid: "2 4 2\n0 0 0\n0 0 0",
        expectedCells: [
          { row: 0, col: 0, value: 2, merged: false, toRemove: false },
          { row: 0, col: 1, value: 4, merged: true, toRemove: false },
          { row: 0, col: 1, value: 2, merged: false, toRemove: true },
          { row: 0, col: 2, value: 2, merged: false, toRemove: false },
        ],
      },
      {
        direction: "DOWN" as const,
        expectedGrid: "0 0 0\n0 0 0\n2 4 2",
        expectedCells: [
          { row: 2, col: 0, value: 2, merged: false, toRemove: false },
          { row: 2, col: 1, value: 2, merged: false, toRemove: true },
          { row: 2, col: 1, value: 4, merged: true, toRemove: false },
          { row: 2, col: 2, value: 2, merged: false, toRemove: false },
        ],
      },
    ])(
      "merges $direction duplicated values",
      ({ direction, expectedGrid, expectedCells }) => {
        const cells = [
          createCell(1, 0),
          createCell(1, 1),
          createCell(2, 1),
          createCell(2, 2),
        ];
        const grid = createGrid(cells, 3);

        shiftGrid(grid, direction);
        expect(cells).toEqual(expectedCells);
        expect(gridToString(grid)).toBe(expectedGrid);
      }
    );

    it.each([
      {
        direction: "LEFT" as const,
        expectedGrid: "0 0 0\n4 2 0\n0 0 0",
        expectedCells: [
          { row: 1, col: 0, value: 4, merged: true, toRemove: false },
          { row: 1, col: 0, value: 2, merged: false, toRemove: true },
          { row: 1, col: 1, value: 2, merged: false, toRemove: false },
        ],
      },
      {
        direction: "RIGHT" as const,
        expectedGrid: "0 0 0\n0 2 4\n0 0 0",
        expectedCells: [
          { row: 1, col: 1, value: 2, merged: false, toRemove: false },
          { row: 1, col: 2, value: 2, merged: false, toRemove: true },
          { row: 1, col: 2, value: 4, merged: true, toRemove: false },
        ],
      },
      {
        direction: "UP" as const,
        expectedGrid: "4 0 0\n2 0 0\n0 0 0",
        expectedCells: [
          { row: 0, col: 0, value: 4, merged: true, toRemove: false },
          { row: 0, col: 0, value: 2, merged: false, toRemove: true },
          { row: 1, col: 0, value: 2, merged: false, toRemove: false },
        ],
      },
      {
        direction: "DOWN" as const,
        expectedGrid: "0 0 0\n2 0 0\n4 0 0",
        expectedCells: [
          { row: 1, col: 0, value: 2, merged: false, toRemove: false },
          { row: 2, col: 0, value: 2, merged: false, toRemove: true },
          { row: 2, col: 0, value: 4, merged: true, toRemove: false },
        ],
      },
    ])(
      "merges $direction duplicated values starting with the closest to the wall without merging odd duplicates",
      ({ direction, expectedCells, expectedGrid }) => {
        const cells = ["LEFT", "RIGHT"].includes(direction)
          ? [createCell(1, 0), createCell(1, 1), createCell(1, 2)]
          : [createCell(0, 0), createCell(1, 0), createCell(2, 0)];
        const grid = createGrid(cells, 3);

        shiftGrid(grid, direction);
        expect(gridToString(grid)).toBe(expectedGrid);
        expect(cells).toEqual(expectedCells);
      }
    );

    it.each([
      {
        direction: "LEFT" as const,
        expectedGrid:
          "0 0 0 0 0 0\n4 4 4 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0",
      },
      {
        direction: "RIGHT" as const,
        expectedGrid:
          "0 0 0 0 0 0\n0 0 0 4 4 4\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0",
      },
      {
        direction: "UP" as const,
        expectedGrid:
          "4 0 0 0 0 0\n4 0 0 0 0 0\n4 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0",
      },
      {
        direction: "DOWN" as const,
        expectedGrid:
          "0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n4 0 0 0 0 0\n4 0 0 0 0 0\n4 0 0 0 0 0",
      },
    ])(
      "stacks correctly 4+ duplicates $direction",
      ({ direction, expectedGrid }) => {
        const axis = ["LEFT", "RIGHT"].includes(direction) ? "col" : "row";
        const cells = Array(6)
          .fill(createCell(1, 0))
          .map((cell, i) => ({ ...cell, [axis]: i }));
        const grid = createGrid(cells, 6);

        shiftGrid(grid, direction);
        expect(gridToString(grid)).toBe(expectedGrid);
      }
    );
  });
});

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
