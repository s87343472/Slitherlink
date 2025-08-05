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
    <div className={`bg-white rounded-lg shadow-md border-2 border-gray-100 p-3 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Time - Improved design */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
            <Clock size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Time</p>
            <p className="font-mono font-bold text-base text-blue-800">{displayTime}</p>
          </div>
        </div>

        {/* Score - Improved design */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-sm">
            <Trophy size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Score</p>
            <p className="font-bold text-base text-purple-800">{score.toLocaleString()}</p>
          </div>
        </div>

        {/* Errors - Improved design */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-2">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
            <AlertTriangle size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Errors</p>
            <p className="font-bold text-base text-red-800">{errors}</p>
          </div>
        </div>

        {/* Difficulty - Improved design */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2">
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center shadow-sm">
            <Target size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Level</p>
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold capitalize ${getDifficultyColor(currentPuzzle.difficulty)} shadow-sm`}>
              {currentPuzzle.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Game Status and Grid Size - Compact design */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${gameStatus === 'playing' ? 'bg-green-500 animate-pulse' : gameStatus === 'completed' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs font-semibold text-gray-700">Status:</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold capitalize ${getStatusColor(gameStatus)} shadow-sm`}>
                {gameStatus}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-700">Grid:</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-800">
                {currentPuzzle.gridSize}×{currentPuzzle.gridSize}
              </span>
            </div>
          </div>

          {/* Progress indicator - Enhanced */}
          {gameStatus === 'playing' && (
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2.5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: '30%' }} // This would be calculated based on actual progress
                />
              </div>
              <span className="text-xs font-bold text-gray-600 min-w-[2rem]">30%</span>
            </div>
          )}
        </div>
      </div>

      {/* Solution viewed warning - Enhanced design */}
      {hasViewedSolution && gameStatus === 'playing' && (
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <Eye size={12} className="text-white" />
            </div>
            <p className="text-xs font-bold text-orange-800">
              Solution viewed - submission disabled for fair play
            </p>
          </div>
        </div>
      )}

      {/* Completion message - Enhanced design */}
      {gameStatus === 'completed' && (
        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Trophy size={12} className="text-white" />
            </div>
            <p className="text-xs font-bold text-green-800">
              Puzzle completed! Time: {displayTime}
              {hasViewedSolution && ' (Practice mode - solution was viewed)'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};