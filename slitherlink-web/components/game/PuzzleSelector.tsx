'use client';

import React, { useState } from 'react';
import { Calendar, Shuffle, Settings, Play } from 'lucide-react';
import { PuzzleService } from '@/lib/services/puzzleService';
import { useGameStore } from '@/lib/store/gameStore';
import { useToastActions } from '@/components/ui/Toast';

interface PuzzleSelectorProps {
  className?: string;
}

export const PuzzleSelector: React.FC<PuzzleSelectorProps> = ({ className = '' }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'difficult'>('easy');
  const [selectedGridSize, setSelectedGridSize] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const { startGame } = useGameStore();
  const toast = useToastActions();

  const gridSizeOptions = [5, 7, 10, 12, 15];
  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'difficult', label: 'Difficult', color: 'bg-red-100 text-red-800' }
  ];

  const handleGeneratePuzzle = async () => {
    setIsLoading(true);

    try {
      const puzzle = await PuzzleService.generatePuzzle(selectedGridSize, selectedDifficulty);
      startGame(puzzle);
      toast.success('Puzzle Generated', `New ${selectedDifficulty} ${selectedGridSize}×${selectedGridSize} puzzle created!`);
    } catch (err) {
      toast.error('Generation Failed', 'Failed to generate puzzle. Please try again.');
      console.error('Error generating puzzle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDailyChallenge = async () => {
    setIsLoading(true);

    try {
      const puzzle = await PuzzleService.getDailyChallenge();
      startGame(puzzle);
      toast.success('Daily Challenge Loaded', 'Ready to solve today\'s puzzle!');
    } catch (err) {
      toast.error('Loading Failed', 'Failed to load daily challenge. Please try again.');
      console.error('Error loading daily challenge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Settings size={16} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Select Puzzle</h2>
      </div>

      {/* Daily Challenge - More compact */}
      <div className="mb-4">
        <button
          onClick={handleDailyChallenge}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Calendar size={16} />
          <span className="font-semibold text-sm">Daily Challenge</span>
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          New puzzle every day
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Shuffle size={14} className="text-purple-600" />
          <span className="text-sm font-bold text-gray-800">Custom Puzzle</span>
        </div>

        {/* Grid Size Selection - Improved design */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Grid Size
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {gridSizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedGridSize(size)}
                className={`p-2 text-xs font-bold rounded-md border-2 transition-all duration-200 transform hover:scale-105 ${
                  selectedGridSize === size
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection - Improved design */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Difficulty Level
          </label>
          <div className="space-y-1.5">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDifficulty(option.value as any)}
                className={`w-full p-2.5 text-xs font-semibold rounded-md border-2 transition-all duration-200 transform hover:scale-102 ${
                  selectedDifficulty === option.value
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : `bg-white border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50 ${option.color.replace('bg-', 'hover:bg-').replace('-100', '-50')}`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button - Improved styling */}
        <button
          onClick={handleGeneratePuzzle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="text-sm font-semibold">Generating...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span className="text-sm font-semibold">Generate Puzzle</span>
            </>
          )}
        </button>

      </div>

      {/* How to Play - Compact */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-600">?</span>
          </div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quick Guide</h3>
        </div>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start gap-1">
            <span className="text-blue-500 font-bold">•</span>
            <span>Click between dots to draw/remove lines</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-green-500 font-bold">•</span>
            <span>Right-click to block edges with ×</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-purple-500 font-bold">•</span>
            <span>Numbers = lines needed around cell</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-orange-500 font-bold">•</span>
            <span>Create one continuous loop</span>
          </li>
        </ul>
      </div>
    </div>
  );
};