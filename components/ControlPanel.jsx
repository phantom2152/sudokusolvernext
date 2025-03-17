import React from 'react';

const ControlPanel = ({ mode, solving, onGenerate, onSolve, onValidate, onShowAnswer, onClear, onStop }) => {
  return (
    <div className="flex justify-between mb-5">
      {mode === 'solve' && (
        <>
          <button
            onClick={onGenerate}
            disabled={solving}
            className="py-2 px-4 text-sm bg-blue-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Generate
          </button>
          <button
            onClick={onSolve}
            disabled={solving}
            className="py-2 px-4 text-sm bg-green-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Solve
          </button>
          <button
            onClick={onValidate}
            disabled={solving}
            className="py-2 px-4 text-sm bg-purple-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Validate
          </button>
        </>
      )}
      {mode === 'answer' && (
        <button
          onClick={onShowAnswer}
          disabled={solving}
          className="py-2 px-4 text-sm bg-blue-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Show Answer
        </button>
      )}
      <button
        onClick={onClear}
        disabled={solving}
        className="py-2 px-4 text-sm bg-red-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        Clear
      </button>
      {solving && (
        <button
          onClick={onStop}
          className="py-2 px-4 text-sm bg-yellow-600 text-white border-none rounded cursor-pointer transition-colors hover:bg-yellow-700"
        >
          Stop
        </button>
      )}
    </div>
  );
};

export default ControlPanel;