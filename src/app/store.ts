import { configureStore } from '@reduxjs/toolkit';
import gameGrid from '../features/game-grid/gameGridSlice'

export const store = configureStore({
  reducer: {
    gameGrid
  },
});
