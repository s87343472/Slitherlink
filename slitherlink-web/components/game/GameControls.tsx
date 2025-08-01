'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Lightbulb, 
  Play, 
  Pause, 
  Square,
  Eye,
  EyeOff,
  Trophy
} from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuthStore } from '@/lib/store/authStore';

interface GameControlsProps {
  className?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({ className = '' }) => {
  const [showingSolution, setShowingSolution] = useState(false);
  
  const {
    gameStatus,
    hasViewedSolution,
    pauseGame,
    resumeGame,
    resetGame,
    undoMove,
    redoMove,
    history,
    historyIndex,
    validateSolution,
    markSolutionViewed,
    config
  } = useGameStore();
  
  const { user, isAuthenticated } = useAuthStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isPlaying = gameStatus === 'playing';
  const isPaused = gameStatus === 'paused';
  const isCompleted = gameStatus === 'completed';

  const handlePauseResume = () => {
    if (isPlaying) {
      pauseGame();
    } else if (isPaused) {
      resumeGame();
    }
  };

  const handleHint = () => {
    if (config.enableHints) {
      // TODO: Implement hint system
      console.log('Hint requested');
    }
  };

  const handleValidate = () => {
    const isValid = validateSolution();
    console.log('Solution valid:', isValid);
  };


  const handleToggleSolution = () => {
    const game = (window as any).slitherlinkGame;
    if (game) {
      if (showingSolution) {
        game.hideSolution();
        setShowingSolution(false);
      } else {
        game.showSolution();
        setShowingSolution(true);
        // Mark that the user has viewed the solution
        markSolutionViewed();
      }
    } else {
      console.warn('Game instance not available');
    }
  };

  const handleReset = () => {
    const game = (window as any).slitherlinkGame;
    if (game) {
      game.resetPuzzle();
    }
    setShowingSolution(false);
    resetGame();
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={handlePauseResume}
        disabled={isCompleted}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
          ${isPlaying 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        {isPlaying ? 'Pause' : 'Resume'}
      </button>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
      >
        <Square size={16} />
        Reset
      </button>

      {/* Undo Button */}
      <button
        onClick={undoMove}
        disabled={!canUndo}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCcw size={16} />
        Undo
      </button>

      {/* Redo Button */}
      <button
        onClick={redoMove}
        disabled={!canRedo}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCw size={16} />
        Redo
      </button>

      {/* Show/Hide Solution Button - Only for admin users */}
      {(isAuthenticated && user?.email === 'admin@slitherlink.game') && (
        <button
          onClick={handleToggleSolution}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showingSolution
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
          title="Admin only - Show solution"
        >
          {showingSolution ? <EyeOff size={16} /> : <Eye size={16} />}
          {showingSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
      )}

      {/* Hint Button */}
      {config.enableHints && (
        <button
          onClick={handleHint}
          disabled={!isPlaying}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lightbulb size={16} />
          Hint
        </button>
      )}


      {/* Validate Button - Only for admin users */}
      {(isAuthenticated && user?.email === 'admin@slitherlink.game') && (
        <button
          onClick={handleValidate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          title="Admin only - Validate solution"
        >
          Validate
        </button>
      )}
    </div>
  );
};