'use client';

import React, { useState, useEffect } from 'react';
import { leaderboardService, LeaderboardType, LeaderboardEntry, LeaderboardResponse } from '@/lib/services/leaderboardService';

interface LeaderboardPanelProps {
  className?: string;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ className = '' }) => {
  const [activeType, setActiveType] = useState<LeaderboardType>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState({
    hasLeaderboardPass: false,
    canSubmitScores: false,
    canViewRealTimeRankings: false
  });

  const leaderboardTypes: { type: LeaderboardType; label: string; description: string }[] = [
    { type: 'daily', label: 'Today', description: 'Today\'s best scores' },
    { type: 'weekly', label: 'This Week', description: 'This week\'s rankings' },
    { type: 'monthly', label: 'This Month', description: 'Monthly leaderboard' },
    { type: 'total', label: 'All Time', description: 'Overall rankings' }
  ];

  useEffect(() => {
    fetchLeaderboard(activeType);
    checkPurchaseStatus();
  }, [activeType]);

  const fetchLeaderboard = async (type: LeaderboardType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getLeaderboard(type);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const status = await leaderboardService.getPurchaseStatus();
      setPurchaseStatus(status);
    } catch (err) {
      console.error('Failed to check purchase status:', err);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard(activeType);
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = leaderboard?.data.userEntry?.userId === entry.userId;
    
    return (
      <div 
        key={entry.id}
        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
          isCurrentUser 
            ? 'bg-blue-50 border-blue-200' 
            : index % 2 === 0 
              ? 'bg-gray-50' 
              : 'bg-white'
        }`}
      >
        {/* Rank */}
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            leaderboardService.getRankBadgeColor(entry.rank)
          }`}>
            {entry.rank}
          </div>
          
          {/* User Info */}
          <div>
            <div className="font-medium text-gray-900">
              {entry.userName}
              {isCurrentUser && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  You
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {leaderboardService.getDifficultyName(entry.difficulty)} • {entry.gridSize}×{entry.gridSize}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right">
          <div className="font-bold text-lg text-gray-900">{entry.score.toLocaleString()}</div>
          <div className="text-sm text-gray-600">
            {leaderboardService.formatTime(entry.completionTime)}
            {entry.errorCount > 0 && (
              <span className="text-red-500 ml-1">• {entry.errorCount} errors</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPurchasePrompt = () => (
    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Join the Competition!</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        Purchase the Leaderboard Pass to submit your scores and compete with players worldwide.
      </p>
      <div className="space-y-2 text-sm text-gray-500 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Submit scores to all leaderboards</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Real-time ranking updates</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Compete for daily/weekly/monthly trophies</span>
        </div>
      </div>
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        onClick={() => {
          // TODO: Implement purchase flow
          alert('Purchase flow will be implemented in the next step!');
        }}
      >
        Purchase Leaderboard Pass - $1.99
      </button>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Type Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {leaderboardTypes.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={description}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading leaderboard...</p>
          </div>
        )}

        {!loading && leaderboard && (
          <>
            {/* Last Updated */}
            <div className="text-xs text-gray-500 mb-4 text-center">
              Last updated: {new Date(leaderboard.data.lastUpdated).toLocaleString()}
              {!purchaseStatus.canViewRealTimeRankings && (
                <span className="text-amber-600 ml-2">(1 hour delay for free users)</span>
              )}
            </div>

            {/* User Entry (if not in top list) */}
            {leaderboard.data.userEntry && !leaderboard.data.entries.find(e => e.userId === leaderboard.data.userEntry?.userId) && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your Ranking:</h3>
                {renderLeaderboardEntry(leaderboard.data.userEntry, -1)}
              </div>
            )}

            {/* Leaderboard Entries */}
            <div className="space-y-2">
              {leaderboard.data.entries.length > 0 ? (
                leaderboard.data.entries.map((entry, index) => renderLeaderboardEntry(entry, index))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No entries yet for this period.</p>
                  <p className="text-sm text-gray-500 mt-2">Be the first to submit a score!</p>
                </div>
              )}
            </div>

            {/* Purchase Prompt for Free Users */}
            {!purchaseStatus.hasLeaderboardPass && (
              <div className="mt-8">
                {renderPurchasePrompt()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};