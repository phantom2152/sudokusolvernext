import React, { useState, useRef, useCallback } from 'react';
import SudokuBoard from './SudokuBoard';
import NumberKeypad from './NumberKeypad';
import ModeToggle from './ModeToggle';
import ControlPanel from './ControlPanel';
import SettingsPanel from './SettingsPanel';
import ValidationMessage from './ValidationMessage';
import { isValid, validateBoard, findNextEmptyCell, isBoardFull, createEmptyBoard, createEmptyFixedCells } from '../utils/sudokuUtils';
import { solveSudokuSync, solveSudokuAsync, showAnswer } from '../utils/sudokuSolver';
import { generateSudoku, createFixedCellsFromBoard } from '../utils/sudokuGenerator';

const SudokuSolverMain = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [originalBoard, setOriginalBoard] = useState(createEmptyBoard());
  const [isFixed, setIsFixed] = useState(createEmptyFixedCells());
  const [mode, setMode] = useState('solve');
  const [solving, setSolving] = useState(false);
  const [solved, setSolved] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [showVisualization, setShowVisualization] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [systemFilledCells, setSystemFilledCells] = useState(createEmptyFixedCells());
  const [boardGenerated, setBoardGenerated] = useState(false);

  const cancelRef = useRef(false);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (!solving) {
      setSelectedCell({ row, col });
    }
  };

  // Handle number input
  const handleNumberClick = (number) => {
    if (!selectedCell || solving) return;
  
    const { row, col } = selectedCell;
    
    if (mode === 'solve' && !boardGenerated) {
      setValidationMessage('Please generate a board before entering numbers.');
      return;
    }
  
    if (isFixed[row][col]) return;
  
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = number;
  
    if (mode === 'answer') {
      if (isValid(newBoard, row, col, number) || number === 0) {
        setBoard(newBoard);
        setSystemFilledCells(prev => {
          const newSystemFilled = [...prev];
          newSystemFilled[row][col] = false;
          return newSystemFilled;
        });
        if (isBoardFull(newBoard)) {
          setSolved(validateBoard(newBoard));
        }
      } else {
        setValidationMessage('Invalid move ❌');
        return;
      }
    } else {
      setBoard(newBoard);
    }
  
    setValidationMessage('');
  
    if (number !== 0) {
      const nextCell = findNextEmptyCell(newBoard, isFixed, row, col);
      if (nextCell) {
        setSelectedCell(nextCell);
      }
    }
  };

  // Generate a new puzzle
  const handleGenerate = () => {
    if (mode !== 'solve') return;
    
    const newBoard = generateSudoku(difficulty);
    setBoard(newBoard);
    setOriginalBoard(newBoard.map(row => [...row]));
    setIsFixed(createFixedCellsFromBoard(newBoard));
    setSolved(false);
    setValidationMessage('');
    setSelectedCell(null);
    setBoardGenerated(true);
  };

  // Solve the current puzzle
  const handleSolve = useCallback(async () => {
    if (!validateBoard(board)) {
      setValidationMessage('The current board configuration is invalid. Please correct it before solving.');
      return;
    }

    setSolving(true);
    setValidationMessage('');
    cancelRef.current = false;

    const boardCopy = board.map(row => [...row]);

    if (showVisualization) {
      const solved = await solveSudokuAsync(boardCopy, setBoard, speed, cancelRef);
      if (solved && !cancelRef.current) {
        setBoard(boardCopy);
        setSolved(true);
        setValidationMessage('Solved ✔️');
      } else if (!cancelRef.current) {
        setValidationMessage('Unable to solve the puzzle ❌');
      }
    } else {
      const solved = solveSudokuSync(boardCopy, cancelRef);
      if (solved && !cancelRef.current) {
        setBoard(boardCopy);
        setSolved(true);
        setValidationMessage('Solved ✔️');
      } else if (!cancelRef.current) {
        setValidationMessage('Unable to solve the puzzle ❌');
      }
    }
    setSolving(false);
  }, [board, showVisualization, speed]);

  // Clear the board
  const handleClear = () => {
    if (solving) return;

    if (mode === 'solve') {
      setBoard(originalBoard.map(row => [...row]));
    } else {
      setBoard(createEmptyBoard());
      setIsFixed(createEmptyFixedCells());
    }

    setSolved(false);
    setValidationMessage('');
    setSelectedCell(null);
  };

  // Validate the current state of the board
  const handleValidate = () => {
    if (solving) return;

    if (!isBoardFull(board)) {
      setValidationMessage('Please fill in all cells before validating.');
      return;
    }

    if (validateBoard(board)) {
      setValidationMessage('Solved ✔️');
      setSolved(true);
    } else {
      setValidationMessage('Invalid board configuration ❌');
      setSolved(false);
    }
  };

  // Show the solution (answer mode)
  const handleShowAnswer = useCallback(() => {
    if (mode !== 'answer' || solving) return;
  
    if (!validateBoard(board)) {
      setValidationMessage('The current board configuration is invalid. Please correct it before showing the answer.');
      return;
    }
  
    setSolving(true);
    cancelRef.current = false;
  
    // Create a copy of the current board
    const boardCopy = board.map(row => [...row]);
  
    // Solve and get system filled cells
    const newSystemFilledCells = showAnswer(boardCopy, systemFilledCells);
  
    if (!cancelRef.current) {
      setBoard(boardCopy);
      setSystemFilledCells(newSystemFilledCells);
      setSolved(true);
      setValidationMessage('Solved ✔️');
    }
  
    setSolving(false);
  }, [board, mode, systemFilledCells]);

  // Stop solving process
  const handleStop = () => {
    cancelRef.current = true;
    setSolving(false);
  };

  // Change mode (solve/answer)
  const handleModeChange = (newMode) => {
    if (newMode === 'solve') {
      setBoard(createEmptyBoard());
      setIsFixed(createEmptyFixedCells());
      setBoardGenerated(false);
    } else {
      setBoard(createEmptyBoard());
      setIsFixed(createEmptyFixedCells());
    }
    
    setSystemFilledCells(createEmptyFixedCells());
    setMode(newMode);
    setSolved(false);
    setSelectedCell(null);
    setValidationMessage('');
  };

  return (
    <div className="max-w-lg mx-auto p-5 bg-gray-900 text-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-5">Sudoku Solver</h1>

      <ModeToggle 
        mode={mode} 
        onModeChange={handleModeChange} 
      />

      <SudokuBoard 
        board={board}
        isFixed={isFixed}
        selectedCell={selectedCell}
        onCellClick={handleCellClick}
        systemFilledCells={systemFilledCells}
        mode={mode}
      />

      <ValidationMessage message={validationMessage} />

      <ControlPanel
        mode={mode}
        solving={solving}
        onGenerate={handleGenerate}
        onSolve={handleSolve}
        onValidate={handleValidate}
        onShowAnswer={handleShowAnswer}
        onClear={handleClear}
        onStop={handleStop}
      />

      {showKeyboard && (
        <NumberKeypad onNumberClick={handleNumberClick} />
      )}

      <SettingsPanel
        difficulty={difficulty}
        speed={speed}
        showVisualization={showVisualization}
        showKeyboard={showKeyboard}
        onDifficultyChange={setDifficulty}
        onSpeedChange={setSpeed}
        onVisualizationToggle={setShowVisualization}
        onKeyboardToggle={setShowKeyboard}
      />
    </div>
  );
};

export default SudokuSolverMain;