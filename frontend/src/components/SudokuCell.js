import React, { useState } from "react";

const SudokuCell = ({
  value,
  isPrefilled,
  isIncorrect,
  isCompleted,
  onChange,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsSelected(true);
  };

  const handleBlur = () => {
    setIsSelected(false);
  };

  const cellClassName =
    "sudoku-cell" +
    (isPrefilled ? " prefilled" : "") +
    (isIncorrect ? " incorrect" : "") +
    (isSelected ? " selected" : "");

  return (
    <div className={cellClassName}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={1}
        disabled={isPrefilled}
        readOnly={isCompleted && !isPrefilled}
      />
    </div>
  );
};

export default SudokuCell;