import { useSelector, useDispatch } from "react-redux";

import Grid from "./Grid";
import Cells from "./Cells";
import { wonSelector, lostSelector, resetGame } from "./gameGridSlice";


const GameGrid = () => {
  const won = useSelector(wonSelector);
  const lost = useSelector(lostSelector);
  const dispatch = useDispatch();
  const reset = () => dispatch(resetGame())

  return (
    <>
      {won &&
        <h1>You WON 🤯 <button onClick={reset}>Try again</button> </h1>
      }
      {lost &&
        <h1>You lose 🥲 <button onClick={reset}>Try again</button> </h1>
      }
      <div className="grid-wrapper">
        <Grid />
        <Cells />
      </div>
    </>
  )
};
export default GameGrid;