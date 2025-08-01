import { create } from 'zustand';
import { GameState, PuzzleData, EdgeState, CellState, GameConfig } from '@/lib/types/game';
import { leaderboardService } from '@/lib/services/leaderboardService';

interface GameStore extends GameState {
  // Actions
  startGame: (puzzle: PuzzleData) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  toggleEdge: (edgeId: string) => void;
  blockEdge: (edgeId: string) => void;
  undoMove: () => void;
  redoMove: () => void;
  validateSolution: () => boolean;
  updateTimer: () => void;
  completeGame: () => void;
  addError: () => void;
  calculateScore: () => number;
  markSolutionViewed: () => void;
  
  // History for undo/redo
  history: GameState[];
  historyIndex: number;
  
  // Configuration
  config: GameConfig;
  updateConfig: (config: Partial<GameConfig>) => void;
}

const defaultConfig: GameConfig = {
  cellSize: 40,
  lineWidth: 3,
  colors: {
    background: '#ffffff',
    grid: '#cccccc',
    clueText: '#000000',
    drawnLine: '#2563eb',
    correctLine: '#16a34a',
    incorrectLine: '#dc2626',
    blockedLine: '#6b7280',
    completedCell: '#dcfce7',
    conflictCell: '#fecaca',
  },
  enableHints: true,
  autoValidate: true,
  maxUndoSteps: 50,
};

const createInitialGridState = (gridSize: number) => {
  const edges: EdgeState[][] = [];
  const cells: CellState[][] = [];
  
  // Create horizontal edges
  for (let row = 0; row <= gridSize; row++) {
    edges[row] = [];
    for (let col = 0; col < gridSize; col++) {
      edges[row][col] = {
        id: `h-${row}-${col}`,
        x1: col,
        y1: row,
        x2: col + 1,
        y2: row,
        status: 'empty',
      };
    }
  }
  
  // Create vertical edges
  for (let row = 0; row < gridSize; row++) {
    if (!edges[row]) edges[row] = [];
    for (let col = 0; col <= gridSize; col++) {
      edges[row][col] = {
        id: `v-${row}-${col}`,
        x1: col,
        y1: row,
        x2: col,
        y2: row + 1,
        status: 'empty',
      };
    }
  }
  
  // Create cells
  for (let row = 0; row < gridSize - 1; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize - 1; col++) {
      cells[row][col] = {
        id: `cell-${row}-${col}`,
        x: col,
        y: row,
        clue: null,
        status: 'incomplete',
        requiredEdges: 0,
        connectedEdges: 0,
      };
    }
  }
  
  return { edges, cells };
};

const initialState: GameState = {
  currentPuzzle: null,
  gameStatus: 'idle',
  playerSolution: [],
  score: 0,
  timeElapsed: 0,
  errors: 0,
  startTime: null,
  hasViewedSolution: false,
  gridState: createInitialGridState(5),
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  history: [],
  historyIndex: -1,
  config: defaultConfig,
  
  startGame: (puzzle: PuzzleData) => {
    const gridState = createInitialGridState(puzzle.gridSize);
    
    // Set clues in cells
    for (let row = 0; row < puzzle.clues.length; row++) {
      for (let col = 0; col < puzzle.clues[row].length; col++) {
        const clue = puzzle.clues[row][col];
        if (clue !== null && clue !== -1) {
          gridState.cells[row][col].clue = clue;
          gridState.cells[row][col].requiredEdges = clue;
        }
      }
    }
    
    set({
      currentPuzzle: puzzle,
      gameStatus: 'playing',
      playerSolution: new Array(puzzle.gridSize * puzzle.gridSize).fill(-1),
      score: 0,
      timeElapsed: 0,
      errors: 0,
      startTime: Date.now(),
      hasViewedSolution: false,
      gridState,
      history: [],
      historyIndex: -1,
    });
  },
  
  pauseGame: () => {
    set({ gameStatus: 'paused' });
  },
  
  resumeGame: () => {
    set({ gameStatus: 'playing' });
  },
  
  resetGame: () => {
    const state = get();
    if (state.currentPuzzle) {
      get().startGame(state.currentPuzzle);
    }
  },
  
  toggleEdge: (edgeId: string) => {
    const state = get();
    if (state.gameStatus !== 'playing') return;
    
    // Save current state to history
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ ...state });
    
    // Update the edge state
    const newGridState = { ...state.gridState };
    // Find and toggle the edge
    // This is a simplified version - you'd need to implement the actual edge finding logic
    
    set({
      history: newHistory.slice(-state.config.maxUndoSteps),
      historyIndex: Math.min(newHistory.length - 1, state.config.maxUndoSteps - 1),
      gridState: newGridState,
    });
  },
  
  blockEdge: (edgeId: string) => {
    // Similar to toggleEdge but marks as blocked
    const state = get();
    if (state.gameStatus !== 'playing') return;
    
    // Implementation would be similar to toggleEdge
  },
  
  undoMove: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        ...previousState,
        historyIndex: state.historyIndex - 1,
      });
    }
  },
  
  redoMove: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        ...nextState,
        historyIndex: state.historyIndex + 1,
      });
    }
  },
  
  validateSolution: () => {
    // Implement solution validation logic
    // This would check if the current solution is valid
    return false;
  },
  
  updateTimer: () => {
    const state = get();
    if (state.gameStatus === 'playing' && state.startTime) {
      set({
        timeElapsed: Date.now() - state.startTime,
      });
    }
  },
  
  updateConfig: (newConfig: Partial<GameConfig>) => {
    const state = get();
    set({
      config: { ...state.config, ...newConfig },
    });
  },

  completeGame: () => {
    const state = get();
    const finalScore = get().calculateScore();
    set({
      gameStatus: 'completed',
      score: finalScore,
    });
    
    // Auto-submit score to leaderboard (if user has pass)
    if (state.currentPuzzle && !state.hasViewedSolution) {
      const completionTime = Math.floor(state.timeElapsed / 1000);
      leaderboardService.submitScore(
        parseInt(state.currentPuzzle.id), 
        completionTime, 
        state.errors
      ).catch((error) => {
        // Silently handle leaderboard submission errors
        if (error.message !== 'LEADERBOARD_PASS_REQUIRED') {
          console.error('Failed to submit score to leaderboard:', error);
        }
      });
    }
  },

  addError: () => {
    const state = get();
    set({
      errors: state.errors + 1,
    });
  },

  calculateScore: () => {
    const state = get();
    if (!state.currentPuzzle || !state.startTime) return 0;

    const timeBonus = Math.max(0, 10000 - Math.floor(state.timeElapsed / 1000) * 10);
    const difficultyMultiplier = state.currentPuzzle.difficulty === 'easy' ? 1 : 
                                state.currentPuzzle.difficulty === 'medium' ? 2 : 3;
    const errorPenalty = state.errors * 100;
    const baseScore = 1000 * difficultyMultiplier;
    
    return Math.max(100, baseScore + timeBonus - errorPenalty);
  },

  markSolutionViewed: () => {
    set({ hasViewedSolution: true });
  },
}));