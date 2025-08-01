'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Target, AlertTriangle, Trophy, Eye } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';

interface GameStatsProps {
  className?: string;
}

export const GameStats: React.FC<GameStatsProps> = ({ className = '' }) => {
  const {
    currentPuzzle,
    gameStatus,
    score,
    timeElapsed,
    errors,
    hasViewedSolution,
    updateTimer
  } = useGameStore();

  const [displayTime, setDisplayTime] = useState('00:00');

  // Update timer every second when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        updateTimer();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus, updateTimer]);

  // Format elapsed time
  useEffect(() => {
    const totalSeconds = Math.floor(timeElapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setDisplayTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [timeElapsed]);

  if (!currentPuzzle) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'difficult': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playing': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Time */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-100">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="font-mono font-semibold text-lg">{displayTime}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100">
            <Trophy size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Score</p>
            <p className="font-semibold text-lg">{score.toLocaleString()}</p>
          </div>
        </div>

        {/* Errors */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-red-100">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Errors</p>
            <p className="font-semibold text-lg">{errors}</p>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gray-100">
            <Target size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Difficulty</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(currentPuzzle.difficulty)}`}>
              {currentPuzzle.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Game Status and Grid Size */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-gray-600">Status: </span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(gameStatus)}`}>
                {gameStatus}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Grid: </span>
              <span className="font-medium">{currentPuzzle.gridSize}×{currentPuzzle.gridSize}</span>
            </div>
          </div>

          {/* Progress indicator (optional) */}
          {gameStatus === 'playing' && (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '30%' }} // This would be calculated based on actual progress
                />
              </div>
              <span className="text-xs text-gray-500">30%</span>
            </div>
          )}
        </div>
      </div>

      {/* Solution viewed warning */}
      {hasViewedSolution && gameStatus === 'playing' && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-orange-600" />
            <p className="text-sm font-medium text-orange-800">
              Solution viewed - submission disabled for fair play
            </p>
          </div>
        </div>
      )}

      {/* Completion message */}
      {gameStatus === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Puzzle completed! Time: {displayTime}
              {hasViewedSolution && ' (Practice mode - solution was viewed)'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};