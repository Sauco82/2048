import { createSlice, createSelector } from "@reduxjs/toolkit";

import { Direction } from "./utils/transposition";
import { Cells } from "./utils/cell";
import {
  Grid,
  SIZE,
  createGrid,
  insertRandomCell,
  calculateSlide,
  canSlide,
} from "./utils/grid";

function createInitiaState(size = SIZE) {
  const grid = createGrid(size);
  const cells: Cells = {};

  insertRandomCell(grid, cells, 2);

  return {
    grid,
    cells,
    clean: true,
  };
}

const initialState = createInitiaState();

type DirectionArg = {
  payload: {
    direction: Direction;
  };
};

export const gameGridSlice = createSlice({
  name: "gameGrid",
  initialState,
  reducers: {
    slide: (state, { payload: { direction } }: DirectionArg) => {
      const newState = calculateSlide(state, direction);

      state.grid = newState.grid;
      state.cells = newState.cells;
      insertRandomCell(state.grid, state.cells);
      state.clean = false;
    },

    cleanCells: (state) => {
      let newCells = {};

      Object.values(state.cells).forEach((cell) => {
        const { row, col, uuid } = cell;
        const gridUuid = state.grid[row][col];

        if (uuid === gridUuid) newCells[uuid] = { ...cell, merged: false };
      });

      state.cells = newCells;
      state.clean = true;
    },

    resetGame: () => createInitiaState(),
  },
});

// Selectors
// =====================================================================
export const cellsSelector = (state): Cells => state.gameGrid.cells;
export const gridSelector = (state): Grid => state.gameGrid.grid;
export const cleanSelector = (state): boolean => state.gameGrid.clean;

export const canSlideRightSelector = createSelector(
  [gridSelector, cellsSelector],
  (currentGrid, cells) => canSlide({ currentGrid, cells }, "RIGHT")
);

export const canSlideLeftSelector = createSelector(
  [gridSelector, cellsSelector],
  (currentGrid, cells) => canSlide({ currentGrid, cells }, "LEFT")
);

export const canSlideUpSelector = createSelector(
  [gridSelector, cellsSelector],
  (currentGrid, cells) => canSlide({ currentGrid, cells }, "UP")
);

export const canSlideDownSelector = createSelector(
  [gridSelector, cellsSelector],
  (currentGrid, cells) => canSlide({ currentGrid, cells }, "DOWN")
);

export const availableDirectionsSelector = createSelector(
  [
    canSlideDownSelector,
    canSlideLeftSelector,
    canSlideRightSelector,
    canSlideUpSelector,
  ],
  (down, left, right, up) => ({ down, left, right, up })
);

export const lostSelector = createSelector(
  [availableDirectionsSelector],
  ({ down, left, right, up }) => !down && !left && !right && !up
);

export const wonSelector = createSelector([cellsSelector], (cells) => {
  const cellsValues = Object.values(cells).map(({ value }) => value);

  return cellsValues.find((value) => value >= 2048);
});

// Actions
// =====================================================================
export const { slide, cleanCells, resetGame } = gameGridSlice.actions;

// Reducer
// =====================================================================
export default gameGridSlice.reducer;
