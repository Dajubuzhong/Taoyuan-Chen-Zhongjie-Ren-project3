import React from "react";
import { useSudokuState, useSudokuDispatch, ACTIONS } from "../context/SudokuContext";
import { useAuth } from "../context/AuthContext";
import SudokuCell from "./SudokuCell";

const SudokuBoard = () => {
  const { board, size, prefilled, errors, status } = useSudokuState();
  const dispatch = useSudokuDispatch();
  const { user } = useAuth();

  const readOnly = !user;
  const isCompleted = status === "completed";

  if (!board || !board.length) {
    return <div className="sudoku-grid"> Loading... </div>;
  }

  const handleCellChange = (row, col, newValue) => {
    if (readOnly || isCompleted) return;

    dispatch({
      type: ACTIONS.UPDATE_CELL,
      payload: { row, col, value: newValue },
    });
  };

  return (
    <>
      {readOnly && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.6rem 0.9rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(0,0,0,0.08)",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Read only. Log in to continue the game.
        </div>
      )}

      <div className="sudoku-grid">
        {board.map((row, rIdx) =>
          row.map((val, cIdx) => {
            const index = rIdx * size + cIdx;
            const isPrefilled = prefilled.has(index);
            const isIncorrect = errors.has(index);

            return (
              <SudokuCell
                key={`${rIdx}-${cIdx}`}
                value={val}
                isPrefilled={isPrefilled}
                isIncorrect={isIncorrect}
                isCompleted={isCompleted}
                onChange={(v) => handleCellChange(rIdx, cIdx, v)}
                readOnly={readOnly}
                disabled={readOnly || isPrefilled || isCompleted}
              />
            );
          })
        )}
      </div>

      {isCompleted && (
        <div className="sudoku-congrats">
          Congratulations! You solved this puzzle.
        </div>
      )}
    </>
  );
};

export default SudokuBoard;