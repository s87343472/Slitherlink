'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { User, LogOut, Trophy, Shield, Crown } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, permissions, logout, purchaseLeaderboardAccess, isLoading } = useAuthStore();
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!isOpen || !user) return null;

  const handlePurchase = async () => {
    setIsPurchasing(true);
    await purchaseLeaderboardAccess();
    setIsPurchasing(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user.display_name}</h2>
              <p className="text-blue-100 text-sm">@{user.username}</p>
              <p className="text-blue-100 text-xs opacity-80">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Account Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Account Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Leaderboard Access</p>
                    <p className="text-xs text-gray-600">Compete in rankings and earn trophies</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {permissions?.hasLeaderboardAccess ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPurchasing ? 'Processing...' : '$1.99'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Ad-Free Experience</p>
                    <p className="text-xs text-gray-600">No advertisements during gameplay</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {permissions?.hasAdFreeAccess ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last login:</span>
                <span className="text-gray-900">
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Benefits Info */}
          {permissions?.hasLeaderboardAccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Premium Benefits Active</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Participate in daily/weekly/monthly leaderboards</li>
                <li>• Earn trophies and achievements</li>
                <li>• Track your progress and statistics</li>
                <li>• Compete with players worldwide</li>
              </ul>
            </div>
          )}

          {!permissions?.hasLeaderboardAccess && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Unlock Competitive Features</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Get the Leaderboard Access Pass for just $1.99 to compete in rankings and earn trophies!
              </p>
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                {isPurchasing ? 'Processing Purchase...' : 'Purchase Access - $1.99'}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}