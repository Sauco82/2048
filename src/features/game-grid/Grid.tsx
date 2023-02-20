import { memo } from "react";
import { useSelector } from "react-redux";

import { createGrid } from "./utils/grid";
import { availableDirectionsSelector } from "./gameGridSlice";

// This grid is here for visuals and wont ever change
const grid = createGrid()

const Grid = () => {
  const { up, down, left, right } = useSelector(availableDirectionsSelector);

  return (
    <table
      className="grid"
      style={{
        boxShadow: `
          10px 0 ${right ? "rgba(217,217,217,.47)" : "rgba(210,89,89,.47)"}, 
          0 10px ${down ? "rgba(217,217,217,.47)" : "rgba(210,89,89,.47)"},
          -10px 0 ${left ? "rgba(217,217,217,.47)" : "rgba(210,89,89,.47)"}, 
          0 -10px ${up ? "rgba(217,217,217,.47)" : "rgba(210,89,89,.47)"}
        `
      }}
    >
      <tbody>
        {grid.map((row, i) => (
          <tr key={`${i}`}>
            {row.map((_, j) => (<td key={`${i}-${j}`} />))}
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export default memo(Grid);