import { isValid } from './sudokuUtils';
import { solveSudokuSync } from './sudokuSolver';

// Generate a Sudoku puzzle with the given difficulty
export const generateSudoku = (difficulty) => {
  const board = Array(9).fill().map(() => Array(9).fill(0));
  const numToFill = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 30 : 25;
  
  // Fill the diagonal 3x3 boxes first (these can be filled independently)
  fillDiagonalBoxes(board);
  
  // Solve the rest of the board
  solveSudokuSync(board, { current: false });
  
  // Remove numbers to create the puzzle based on difficulty
  let cellsToRemove = 81 - numToFill;
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      cellsToRemove--;
    }
  }
  
  return board;
};

// Fill the diagonal 3x3 boxes with valid numbers
const fillDiagonalBoxes = (board) => {
  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box);
  }
};

// Fill a 3x3 box with valid numbers
const fillBox = (board, startRow, startCol) => {
  const nums = getShuffledArray();
  let index = 0;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[startRow + i][startCol + j] = nums[index++];
    }
  }
};

// Get an array of numbers 1-9 in random order
const getShuffledArray = () => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
};

// Create fixed cells array from a board (mark non-zero cells as fixed)
export const createFixedCellsFromBoard = (board) => {
  return board.map(row => row.map(cell => cell !== 0));
};