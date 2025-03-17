import dynamic from 'next/dynamic';
import Head from 'next/head';

// Using dynamic import with SSR disabled for the SudokuSolver
// This is necessary because it requires browser APIs
const SudokuSolver = dynamic(() => import('../components/SudokuSolverMain'), { 
  ssr: false 
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-800 py-8">
      <Head>
        <title>Sudoku Solver</title>
        <meta name="description" content="Solve and generate Sudoku puzzles" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4">
        <SudokuSolver />
      </main>
    </div>
  );
}