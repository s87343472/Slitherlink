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
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Select Puzzle</h2>

      {/* Daily Challenge */}
      <div className="mb-6">
        <button
          onClick={handleDailyChallenge}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar size={20} />
          <span className="font-medium">Daily Challenge</span>
        </button>
        <p className="text-sm text-gray-600 mt-2 text-center">
          New puzzle every day with varying difficulty
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-800">
          <Settings size={16} />
          <span className="text-sm font-bold">Custom Puzzle</span>
        </div>

        {/* Grid Size Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Grid Size
          </label>
          <div className="grid grid-cols-5 gap-2">
            {gridSizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedGridSize(size)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  selectedGridSize === size
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDifficulty(option.value as any)}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  selectedDifficulty === option.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : `bg-white border-gray-300 hover:border-blue-300 ${option.color}`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePuzzle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Generate Puzzle</span>
            </>
          )}
        </button>

      </div>

      {/* Puzzle Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">How to Play:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click between dots to draw lines</li>
          <li>• Right-click to block an edge with ×</li>
          <li>• Numbers show how many lines should surround that cell</li>
          <li>• Form a single continuous loop</li>
        </ul>
      </div>
    </div>
  );
};