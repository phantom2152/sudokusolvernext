// Create an empty Sudoku board (9x9 filled with zeros)
export const EMPTY_BOARD = Array(9).fill().map(() => Array(9).fill(0));

// Difficulty settings - clues to leave in the puzzle
export const DIFFICULTY_CLUES = {
  'easy': 35,
  'medium': 30,
  'hard': 25
};

// Positive validation messages
export const SOLVED_MESSAGE = 'Solved ✔️';

// Error messages
export const INVALID_BOARD_MESSAGE = 'The current board configuration is invalid. Please correct it before solving.';
export const UNABLE_TO_SOLVE_MESSAGE = 'Unable to solve the puzzle ❌';
export const INVALID_MOVE_MESSAGE = 'Invalid move ❌';
export const EMPTY_CELLS_MESSAGE = 'Please fill in all cells before validating.';
export const GENERATE_FIRST_MESSAGE = 'Please generate a board before entering numbers.';