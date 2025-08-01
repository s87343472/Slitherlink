export interface PuzzleData {
  id: string;
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  clues: (number | null)[][];  // -1 or null means no clue
  solution?: number[];
  seed: string;
}

export interface GameState {
  // Current puzzle
  currentPuzzle: PuzzleData | null;
  
  // Game status
  gameStatus: 'idle' | 'playing' | 'completed' | 'paused';
  
  // Player solution - tracks which edges are drawn
  // Format: adjacency list representation
  playerSolution: number[];
  
  // Game metrics
  score: number;
  timeElapsed: number;
  errors: number;
  startTime: number | null;
  
  // Anti-cheat tracking
  hasViewedSolution: boolean;
  
  // Grid state for rendering
  gridState: {
    edges: EdgeState[][];
    cells: CellState[][];
  };
}

export interface EdgeState {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  status: 'empty' | 'drawn' | 'blocked' | 'correct' | 'incorrect';
}

export interface CellState {
  id: string;
  x: number;
  y: number;
  clue: number | null;
  status: 'incomplete' | 'complete' | 'conflict';
  requiredEdges: number;
  connectedEdges: number;
}

export interface GameConfig {
  // Visual settings
  cellSize: number;
  lineWidth: number;
  colors: {
    background: string;
    grid: string;
    clueText: string;
    drawnLine: string;
    correctLine: string;
    incorrectLine: string;
    blockedLine: string;
    completedCell: string;
    conflictCell: string;
  };
  
  // Game settings
  enableHints: boolean;
  autoValidate: boolean;
  maxUndoSteps: number;
}

export interface PuzzleApiResponse {
  count: string;  // JSON string of 2D array
  pairs: string;  // JSON string of solution pairs
  seed: string;   // Format: "size-difficulty-timestamp"
}

export interface GameStats {
  totalGames: number;
  completedGames: number;
  averageTime: number;
  bestTime: number;
  totalErrors: number;
  accuracy: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  time: number;
  difficulty: string;
  date: string;
  rank: number;
}