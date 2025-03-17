// Check if a number is valid in the given position
export const isValid = (board, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if ((boxRow + i !== row || boxCol + j !== col) && board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };
  
  // Validate the entire board
  export const validateBoard = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) {
          const temp = board[row][col];
          board[row][col] = 0;
          if (!isValid(board, row, col, temp)) {
            board[row][col] = temp;
            return false;
          }
          board[row][col] = temp;
        }
      }
    }
    return true;
  };
  
  // Find the next empty cell in the board
  export const findNextEmptyCell = (board, isFixed, row, col) => {
    for (let i = row * 9 + col + 1; i < 81; i++) {
      const newRow = Math.floor(i / 9);
      const newCol = i % 9;
      if (board[newRow][newCol] === 0 && !isFixed[newRow][newCol]) {
        return { row: newRow, col: newCol };
      }
    }
    return null;
  };
  
  // Check if the board is completely filled
  export const isBoardFull = (board) => {
    return board.every(row => row.every(cell => cell !== 0));
  };
  
  // Create an empty board
  export const createEmptyBoard = () => Array(9).fill().map(() => Array(9).fill(0));
  
  // Create an empty fixed cells board
  export const createEmptyFixedCells = () => Array(9).fill().map(() => Array(9).fill(false));