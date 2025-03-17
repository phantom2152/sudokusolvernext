import React, { useState } from 'react';

const OpencvTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/detect-sudoku', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error testing OpenCV:', err);
      setError(err.message || 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the sudoku grid
  const renderSudokuGrid = (puzzle) => {
    if (!puzzle) return null;
    
    return (
      <div className="grid grid-cols-9 gap-px bg-gray-800 border-2 border-gray-800 max-w-md mx-auto my-4">
        {puzzle.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`
                bg-gray-700 flex items-center justify-center h-9 w-9 text-lg 
                ${cell ? 'font-bold text-white' : 'text-gray-500'}
                ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-r-gray-800' : ''}
                ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-b-gray-800' : ''}
              `}
            >
              {cell || '·'}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Sudoku Detection Test</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Upload an image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className={`py-2 px-4 rounded ${
            isLoading || !selectedFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Processing...' : 'Detect Sudoku'}
        </button>
      </form>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Result:</h3>
          <p className="mb-4">
            Detection {result.success ? 'successful' : 'failed'} 
            {!result.success && result.message && `: ${result.message}`}
          </p>
          
          {result.success && result.puzzle && (
            <div className="mb-6">
              <h4 className="font-bold mb-2">Detected Puzzle:</h4>
              {renderSudokuGrid(result.puzzle)}
            </div>
          )}
          
          {result.gridImage && (
            <div className="mb-6">
              <h4 className="font-bold mb-2">Extracted Grid:</h4>
              <img
                src={result.gridImage}
                alt="Extracted Grid"
                className="max-w-full h-auto border border-gray-300"
              />
            </div>
          )}
          
          {result.debugImage && (
            <div>
              <h4 className="font-bold mb-2">Debug Image:</h4>
              <img
                src={result.debugImage}
                alt="Debug"
                className="max-w-full h-auto border border-gray-300"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpencvTest;