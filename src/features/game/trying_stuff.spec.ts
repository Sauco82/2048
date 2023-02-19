import { createGrid, shiftGrid, gridToString } from "./trying_stuff";

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
  it("when no obstacles moves cells to a border", () => {
    const cells = [createCell(1, 1), createCell(2, 2)];
    const grid = createGrid(cells, 3);

    shiftGrid(grid, "LEFT");

    const newGridStr = gridToString(grid);

    expect(cells).toEqual([
      { row: 1, col: 0, value: 2, merged: false, toRemove: false },
      { row: 2, col: 0, value: 2, merged: false, toRemove: false },
    ]);
    expect(newGridStr).toBe("0 0 0\n2 0 0\n2 0 0");
  });

  it("when incompatible cells it just stacks them", () => {
    const cells = [
      createCell(0, 0),
      createCell(0, 2, 128),
      createCell(1, 0),
      createCell(1, 1, 64),
      createCell(2, 1),
      createCell(2, 2, 32),
    ];
    const grid = createGrid(cells, 3);

    shiftGrid(grid, "LEFT");
    expect(gridToString(grid)).toBe("2 128 0\n2 64 0\n2 32 0");
  });

  describe("when mergeable cells", () => {
    it("merges duplicated values", () => {
      const cells = [
        createCell(1, 0),
        createCell(1, 1),
        createCell(2, 1),
        createCell(2, 2),
      ];
      const grid = createGrid(cells, 3);

      shiftGrid(grid, "LEFT");
      expect(cells).toEqual([
        { row: 1, col: 0, value: 4, merged: true, toRemove: false },
        { row: 1, col: 0, value: 2, merged: false, toRemove: true },
        { row: 2, col: 0, value: 4, merged: true, toRemove: false },
        { row: 2, col: 0, value: 2, merged: false, toRemove: true },
      ]);
      expect(gridToString(grid)).toBe("0 0 0\n4 0 0\n4 0 0");
    });

    it("merges duplicated values starting with the closest to the wall without merging odd duplicates", () => {
      const cells = [createCell(1, 0), createCell(1, 1), createCell(1, 2)];
      const grid = createGrid(cells, 3);

      shiftGrid(grid, "LEFT");
      expect(cells).toEqual([
        { row: 1, col: 0, value: 4, merged: true, toRemove: false },
        { row: 1, col: 0, value: 2, merged: false, toRemove: true },
        { row: 1, col: 1, value: 2, merged: false, toRemove: false },
      ]);
      expect(gridToString(grid)).toBe("0 0 0\n4 2 0\n0 0 0");
    });

    it("stacks correctly 4+ duplicates", () => {
      const cells = Array(6)
        .fill(createCell(1, 0))
        .map((cell, col) => ({ ...cell, col }));
      const grid = createGrid(cells, 6);

      shiftGrid(grid, "LEFT");
      expect(gridToString(grid)).toBe(
        "0 0 0 0 0 0\n4 4 4 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0"
      );
    });
  });
});
