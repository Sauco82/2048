import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import App from './App';
import gameGrid from './features/game-grid/gameGridSlice'

export const store = configureStore({
  reducer: {
    gameGrid,
  },
  preloadedState: {
    gameGrid: {
      cells: {
        '1': { uuid: '1', row: 1, col: 1, value: 2, merged: false },
        '2': { uuid: '2', row: 2, col: 1, value: 2, merged: false }
      },
      grid: [
        [null, null, null],
        [null, '1', null],
        [null, '2', null],
      ],
      clean: true,
    }
  }
});


test('renders learn react link', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/Use the arrow keys/i)).toBeInTheDocument();
  expect(screen.getAllByText("2")).toHaveLength(2);

  fireEvent.keyDown(document.body, { key: "ArrowUp" });

  const newCell = await screen.findByText("1");
  const mergedCell = screen.getByText("4");
  const style = mergedCell.getAttribute("style")

  expect(newCell).toBeInTheDocument();
  expect(mergedCell).toBeInTheDocument();
  expect(style).toBe("top: 10px; left: 120px;")
});
