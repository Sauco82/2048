import gameGridReducer, {
  slide,
  resetGame,
  prepareNextRound,
} from "./gameGridSlice";
import { createGrid, insertCell, Grid } from "./utils/grid";
import { Cells, createCell } from "./utils/cell";

// Converts a grid to a string that when logged looks like the UI of the game:
// 0 0 0
// 0 0 0
// 0 0 0
function gridToString(grid: Grid, cells: Cells): string {
  return grid
    .map((row) =>
      row.map((uuid) => (uuid ? cells[uuid].value.toString() : "0")).join(" ")
    )
    .join("\n");
}

// Converts cells into a string that is equal to any other cells string with cells in the same
// positions and the same values:
// row-col-value
// 0-0-2
// 0-1-4
// 5-4-2
function cellsToString(cells: Cells): string {
  return Object.values(cells)
    .map(({ row, col, value }) => `${row}-${col}-${value}`)
    .sort()
    .join("\n");
}

type InitialCells = { row: number; col: number; value?: number }[];

function createInitialState(initialCells: InitialCells = [], size = 3) {
  const grid = createGrid(size);
  const cells: Cells = {};

  for (let initialCell of initialCells) {
    const { row, col, value } = initialCell;
    const cell = createCell({ row, col, value: value || 2 });
    insertCell(grid, cell);
    cells[cell.uuid] = cell;
  }

  return {
    grid,
    cells,
    clean: true,
  };
}

const LEFT = "LEFT" as const;
const RIGHT = "RIGHT" as const;
const UP = "UP" as const;
const DOWN = "DOWN" as const;

describe("gameGrid reducer", () => {
  it("creates a grid with a tile in a random position with value 2", () => {
    const { grid, cells, clean } = gameGridReducer(undefined, { type: "none" });
    const cellsArray = Object.values(cells);
    const cell = cellsArray[0];

    expect(clean).toBe(true);
    expect(cell.value).toBe(2);
    expect(cellsArray).toHaveLength(1);
    expect(grid).toHaveLength(6);
    expect(grid[0]).toHaveLength(6);
  });

  describe("slide", () => {
    describe("when no obstacles", () => {
      it.each([
        {
          direction: LEFT,
          expectedGrid: "0 0 0\n2 0 0\n2 0 0",
          expectedCells: "1-0-2\n2-0-2",
        },
        {
          direction: RIGHT,
          expectedCells: "1-2-2\n2-2-2",
          expectedGrid: "0 0 0\n0 0 2\n0 0 2",
        },
        {
          direction: UP,
          expectedCells: "0-1-2\n0-2-2",
          expectedGrid: "0 2 2\n0 0 0\n0 0 0",
        },
        {
          direction: DOWN,
          expectedCells: "2-1-2\n2-2-2",
          expectedGrid: "0 0 0\n0 0 0\n0 2 2",
        },
      ])(
        "moves cells towards the $direction border",
        ({ direction, expectedCells, expectedGrid }) => {
          const initialState = createInitialState([
            { row: 1, col: 1 },
            { row: 2, col: 2 },
          ]);
          const { grid, cells } = gameGridReducer(
            initialState,
            slide({ direction })
          );

          expect(gridToString(grid, cells)).toBe(expectedGrid);
          expect(cellsToString(cells)).toBe(expectedCells);
        }
      );
    });

    describe("when incompatible cells", () => {
      it.each([
        {
          direction: LEFT,
          expectedGrid: "4 128 0\n16 64 0\n254 32 0",
        },
        {
          direction: RIGHT,
          expectedGrid: "0 4 128\n0 16 64\n0 254 32",
        },
        {
          direction: UP,
          expectedGrid: "4 64 128\n16 254 32\n0 0 0",
        },
        {
          direction: DOWN,
          expectedGrid: "0 0 0\n4 64 128\n16 254 32",
        },
      ])("stacks them ${direction}", ({ direction, expectedGrid }) => {
        const initialState = createInitialState([
          { row: 0, col: 0, value: 4 },
          { row: 0, col: 2, value: 128 },
          { row: 1, col: 0, value: 16 },
          { row: 1, col: 1, value: 64 },
          { row: 2, col: 1, value: 254 },
          { row: 2, col: 2, value: 32 },
        ]);
        const { grid, cells } = gameGridReducer(
          initialState,
          slide({ direction })
        );

        expect(gridToString(grid, cells)).toBe(expectedGrid);
      });
    });

    describe("when mergeable cells", () => {
      it.each([
        {
          direction: LEFT,
          expectedGrid: "0 0 0\n4 0 0\n4 0 0",
          expectedCells: "1-0-2\n1-0-4\n2-0-2\n2-0-4",
        },
        {
          direction: RIGHT,
          expectedGrid: "0 0 0\n0 0 4\n0 0 4",
          expectedCells: "1-2-2\n1-2-4\n2-2-2\n2-2-4",
        },
        {
          direction: UP,
          expectedGrid: "2 4 2\n0 0 0\n0 0 0",
          expectedCells: "0-0-2\n0-1-2\n0-1-4\n0-2-2",
        },
        {
          direction: DOWN,
          expectedGrid: "0 0 0\n0 0 0\n2 4 2",
          expectedCells: "2-0-2\n2-1-2\n2-1-4\n2-2-2",
        },
      ])(
        "merges $direction duplicated values",
        ({ direction, expectedGrid, expectedCells }) => {
          const initialState = createInitialState([
            { row: 1, col: 0 },
            { row: 1, col: 1 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
          ]);
          const { grid, cells } = gameGridReducer(
            initialState,
            slide({ direction })
          );

          expect(gridToString(grid, cells)).toBe(expectedGrid);
          expect(cellsToString(cells)).toBe(expectedCells);
        }
      );

      it.each([
        {
          direction: "LEFT" as const,
          expectedGrid: "0 0 0\n4 2 0\n0 0 0",
          expectedCells: "1-0-2\n1-0-4\n1-1-2",
        },
        {
          direction: "RIGHT" as const,
          expectedGrid: "0 0 0\n0 2 4\n0 0 0",
          expectedCells: "1-1-2\n1-2-2\n1-2-4",
        },
        {
          direction: "UP" as const,
          expectedGrid: "4 0 0\n2 0 0\n0 0 0",
          expectedCells: "0-0-2\n0-0-4\n1-0-2",
        },
        {
          direction: "DOWN" as const,
          expectedGrid: "0 0 0\n2 0 0\n4 0 0",
          expectedCells: "1-0-2\n2-0-2\n2-0-4",
        },
      ])(
        "merges $direction duplicated values starting with the closest to the wall without merging odd duplicates",
        ({ direction, expectedCells, expectedGrid }) => {
          const initialState = ["LEFT", "RIGHT"].includes(direction)
            ? createInitialState([
                { row: 1, col: 0 },
                { row: 1, col: 1 },
                { row: 1, col: 2 },
              ])
            : createInitialState([
                { row: 0, col: 0 },
                { row: 1, col: 0 },
                { row: 2, col: 0 },
              ]);
          const { grid, cells } = gameGridReducer(
            initialState,
            slide({ direction })
          );

          expect(gridToString(grid, cells)).toBe(expectedGrid);
          expect(cellsToString(cells)).toBe(expectedCells);
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
          const createRowCol = ["LEFT", "RIGHT"].includes(direction)
            ? (_, col) => ({ row: 1, col })
            : (_, row) => ({ row, col: 0 });

          const initialCells = Array(6).fill(undefined).map(createRowCol);

          const initialState = createInitialState(initialCells, 6);

          const { grid, cells } = gameGridReducer(
            initialState,
            slide({ direction })
          );

          expect(gridToString(grid, cells)).toBe(expectedGrid);
        }
      );
    });
  });

  it("resetGame resets the game", () => {
    const initialState = createInitialState([
      { row: 1, col: 1 },
      { row: 2, col: 2 },
    ]);
    const { grid, cells } = gameGridReducer(initialState, resetGame());

    expect(Object.values(cells)).toHaveLength(1);
    expect(gridToString(grid, cells)).not.toBe("0 2 0\n0 0 0\n0 0 2");
    expect(Object.values(cells)[0].value).toBe(2);
  });

  it("prepareNextRound removes the cells not present in the grid and inserts the new cell", () => {
    const initialState = createInitialState([
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ]);

    const secondState = gameGridReducer(
      initialState,
      slide({ direction: LEFT })
    );

    expect(gridToString(secondState.grid, secondState.cells)).toBe(
      "0 0 0\n4 2 0\n0 0 0"
    );

    expect(cellsToString(secondState.cells)).toBe("1-0-2\n1-0-4\n1-1-2");

    const { grid, cells } = gameGridReducer(secondState, prepareNextRound());

    expect(gridToString(grid, cells)).not.toBe("0 0 0\n4 2 0\n0 0 0");
    expect(cellsToString(cells)).not.toBe("1-0-2\n1-0-4\n1-1-2");

    const hasCellWithValue1 = !!Object.values(cells).find(
      ({ value }) => value === 1
    );

    expect(hasCellWithValue1).toBe(true);
  });
});
