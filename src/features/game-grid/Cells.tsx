import { memo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cellsSelector, slide, cleanCells, cleanSelector, availableDirectionsSelector } from "./gameGridSlice";

function cellPosition({ row, col }: { row: number, col: number }) {
  return ({
    top: `${row * 110 + 10}px`,
    left: `${col * 110 + 10}px`,
  })
}

const Cells = () => {
  const cells = useSelector(cellsSelector);
  const clean = useSelector(cleanSelector);
  const availableDirections = useSelector(availableDirectionsSelector);
  const dispatch = useDispatch();
  const trackDirections = useRef(null)

  useEffect(() => {
    if (!clean) setTimeout(() => dispatch(cleanCells()), 200)
  }, [clean, dispatch])

  useEffect(() => {
    if (trackDirections.current) window.removeEventListener("keydown", trackDirections.current)

    trackDirections.current = ({ key }) => {
      if (!clean) return dispatch(cleanCells());

      switch (key) {
        case "ArrowDown":
          if (!availableDirections.down) return;
          return dispatch(slide({ direction: "DOWN" }));
        case "ArrowLeft":
          if (!availableDirections.left) return;
          return dispatch(slide({ direction: "LEFT" }));
        case "ArrowRight":
          if (!availableDirections.right) return;
          return dispatch(slide({ direction: "RIGHT" }));
        case "ArrowUp":
          if (!availableDirections.up) return;
          return dispatch(slide({ direction: "UP" }));
        default:
          return;
      }
    }

    window.addEventListener("keydown", trackDirections.current);

    return () => window.removeEventListener("keydown", trackDirections.current)
  }, [dispatch, clean, availableDirections])

  return (
    <>
      {Object.values(cells).map(({ row, col, uuid, value, }) => (
        <div
          className={`cell cell-${value}`}
          key={uuid}
          style={cellPosition({ row, col })}
        >
          {value}
        </div>
      ))}
    </>
  )
};

export default memo(Cells);