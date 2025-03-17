import React from 'react';

const ModeToggle = ({ mode, onModeChange }) => {
  
  return (
    <div className="flex justify-center mb-5">
      <button
        className={`
          py-2 px-5 text-base  text-white border-none 
          rounded-l-md cursor-pointer transition-colors
          ${mode === 'solve' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}
        `}
        onClick={() => onModeChange('solve')}
      >
        Solve Mode
      </button>
      <button
        className={`
          py-2 px-5 text-base  text-white border-none 
          rounded-r-md cursor-pointer transition-colors
          ${mode === 'answer' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}
        `}
        onClick={() => onModeChange('answer')}
      >
        Answer Mode
      </button>
    </div>
  );
};

export default ModeToggle;