import React from 'react';

const SudokuBoard = ({ board, isFixed, selectedCell, onCellClick, systemFilledCells, mode }) => {
  const renderCell = (value, row, col) => {
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
    const isSystemFilled = mode === 'answer' && systemFilledCells[row][col];
    const isFixedCell = isFixed[row][col];
    const is3rdCol = (col + 1) % 3 === 0 && col < 8;
    const is3rdRow = (row + 1) % 3 === 0 && row < 8;

    return (
      <div
        key={`${row}-${col}`}
        className={`
          flex items-center justify-center h-10 w-full
          text-lg cursor-pointer transition-colors duration-300
          border border-gray-800
          ${isSelected ? 'bg-blue-600' : isFixedCell ? 'bg-gray-700' : 'bg-gray-600'}
          ${isSystemFilled || isFixedCell ? 'font-bold' : 'font-normal'}
          ${is3rdCol ? 'border-r-2 border-r-gray-800' : ''}
          ${is3rdRow ? 'border-b-2 border-b-gray-800' : ''}
        `}
        onClick={() => onCellClick(row, col)}
      >
        {value !== 0 ? value : ''}
      </div>
    );
  };

  return (
    <div className="grid grid-rows-9 bg-gray-800 border-2 border-gray-800 rounded overflow-hidden mb-5">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-9 gap-0">
          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;