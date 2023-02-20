import './App.css';
import GameGrid from './features/game-grid/GameGrid';

function App() {
  return (
    <div className="game">
      <div>
        <h1>2048</h1>
        <p>
          Use the arrow keys to slide the cells and merge them to get 2048.
        </p>
        <GameGrid />
      </div>
    </div>
  );
}

export default App;
