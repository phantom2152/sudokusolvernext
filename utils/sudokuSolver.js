import { isValid } from './sudokuUtils';

// Solve Sudoku synchronously (no visualization)
export const solveSudokuSync = (board, cancelRef) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (cancelRef.current) return false;
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudokuSync(board, cancelRef)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Solve Sudoku asynchronously with visualization
export const solveSudokuAsync = async (board, setBoard, speed, cancelRef) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (cancelRef.current) return false;
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            setBoard([...board]);
            await new Promise(resolve => setTimeout(resolve, 100 - speed));
            if (await solveSudokuAsync(board, setBoard, speed, cancelRef)) {
              return true;
            }
            board[row][col] = 0;
            setBoard([...board]);
            await new Promise(resolve => setTimeout(resolve, 100 - speed));
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Show answer (fill only empty cells)
export const showAnswer = (board, systemFilledCells) => {
  const newSystemFilledCells = systemFilledCells.map(row => [...row]);
  
  const solveSudoku = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              newSystemFilledCells[row][col] = true; // Mark as system-filled
              if (solveSudoku(board)) {
                return true;
              }
              board[row][col] = 0;
              newSystemFilledCells[row][col] = false;
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  
  solveSudoku(board);
  return newSystemFilledCells;
};