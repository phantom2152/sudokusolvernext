import React from 'react';

const SettingsPanel = ({ 
  difficulty, 
  speed, 
  showVisualization, 
  showKeyboard,
  onDifficultyChange,
  onSpeedChange,
  onVisualizationToggle,
  onKeyboardToggle
}) => {
  return (
    <div className="mt-5 border-t border-gray-700 pt-4">
      <div className="mb-3">
        <label htmlFor="difficulty" className="block mb-1 text-gray-200">
          Difficulty:
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full p-2 text-base bg-gray-700 text-white border border-gray-600 rounded"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="speedRange" className="block mb-1 text-gray-200">
          Speed: {speed}%
        </label>
        <input
          type="range"
          id="speedRange"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
          className="w-full bg-gray-700"
        />
      </div>

      <div className="mb-3">
        <label className="flex items-center text-gray-200">
          <input
            type="checkbox"
            checked={showVisualization}
            onChange={(e) => onVisualizationToggle(e.target.checked)}
            className="mr-2"
          />
          Show solving visualization
        </label>
      </div>

      <div className="mb-3">
        <label className="flex items-center text-gray-200">
          <input
            type="checkbox"
            checked={showKeyboard}
            onChange={(e) => onKeyboardToggle(e.target.checked)}
            className="mr-2"
          />
          Show number keyboard
        </label>
      </div>
    </div>
  );
};

export default SettingsPanel;