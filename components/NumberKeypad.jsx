import React from 'react';

const NumberKeypad = ({ onNumberClick }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-5 gap-2 my-5">
      {numbers.map((num) => (
        <button
          key={num}
          className="p-4 text-lg bg-blue-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-blue-700"
          onClick={() => onNumberClick(num)}
        >
          {num}
        </button>
      ))}
      <button
        className="p-4 text-lg bg-red-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-red-700"
        onClick={() => onNumberClick(0)}
      >
        X
      </button>
    </div>
  );
};

export default NumberKeypad;