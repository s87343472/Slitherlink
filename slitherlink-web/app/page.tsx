'use client';

import React, { useEffect, useState } from 'react';
import { PhaserGameBoard } from '@/components/game/PhaserGameBoard';
import { GameControls } from '@/components/game/GameControls';
import { GameStats } from '@/components/game/GameStats';
import { PuzzleSelector } from '@/components/game/PuzzleSelector';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { UserProfile } from '@/components/auth/UserProfile';
import { LeaderboardModal } from '@/components/leaderboard/LeaderboardModal';
import { GameErrorBoundary, LeaderboardErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useToastActions } from '@/components/ui/Toast';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuthStore } from '@/lib/store/authStore';
import { PuzzleService } from '@/lib/services/puzzleService';
import { User, Trophy, LogIn, Crown } from 'lucide-react';

export default function Home() {
  const { currentPuzzle, gameStatus, startGame, score, timeElapsed, errors } = useGameStore();
  const { user, permissions, isAuthenticated, initialize } = useAuthStore();
  const toast = useToastActions();
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [mobileGameSize, setMobileGameSize] = useState(350);
  const [displayTime, setDisplayTime] = useState('00:00');
  
  // Initialize auth state
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Calculate mobile game size - make it larger for better gameplay
  useEffect(() => {
    const updateMobileSize = () => {
      if (typeof window !== 'undefined') {
        // Use much more of the available width for maximum game area
        const maxSize = Math.min(window.innerWidth - 10, 500); // Increased to 500 and reduced margin to 10
        setMobileGameSize(maxSize);
      }
    };

    updateMobileSize();
    window.addEventListener('resize', updateMobileSize);
    return () => window.removeEventListener('resize', updateMobileSize);
  }, []);

  // Format elapsed time
  useEffect(() => {
    const totalSeconds = Math.floor(timeElapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setDisplayTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [timeElapsed]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'master': return 'text-red-600 bg-red-100';
      case 'ninja': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Auto-load Daily Challenge on first visit (only once per session)
  useEffect(() => {
    if (!currentPuzzle && !isAutoLoading) {
      // Check if we've already shown the daily challenge toast today
      const today = new Date().toISOString().split('T')[0];
      const lastToastDate = localStorage.getItem('lastDailyChallengeToast');
      const shouldShowToast = lastToastDate !== today;

      setIsAutoLoading(true);
      const loadDailyChallenge = async () => {
        try {
          console.log('Auto-loading daily challenge...');
          const puzzle = await PuzzleService.getDailyChallenge();
          console.log('Daily challenge loaded:', puzzle.id);
          startGame(puzzle);
          
          // Only show toast once per day
          if (shouldShowToast) {
            toast.success('Daily Challenge Loaded', 'Today\'s puzzle is ready to play!');
            localStorage.setItem('lastDailyChallengeToast', today);
          }
        } catch (error) {
          console.error('Failed to load daily challenge:', error);
          // Fallback to a simple puzzle
          try {
            const fallbackPuzzle = await PuzzleService.generatePuzzle(5, 'easy');
            console.log('Loading fallback puzzle:', fallbackPuzzle.id);
            startGame(fallbackPuzzle);
            
            // Only show warning once per day
            if (shouldShowToast) {
              toast.warning('Daily Challenge Unavailable', 'Loaded a practice puzzle instead.');
              localStorage.setItem('lastDailyChallengeToast', today);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback puzzle:', fallbackError);
            toast.error('Puzzle Loading Failed', 'Please try refreshing the page or contact support.');
          }
        } finally {
          setIsAutoLoading(false);
        }
      };
      
      loadDailyChallenge();
    }
  }, [currentPuzzle, startGame, isAutoLoading, toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Compact for mobile */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 lg:h-16">
            <div className="flex items-center">
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Slitherlinks</h1>
              <span className="ml-1 lg:ml-2 px-1 lg:px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Standard
              </span>
            </div>
            
            {/* User Section - More compact on mobile */}
            <div className="flex items-center gap-1 lg:gap-3">
              {/* Leaderboard Button */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs lg:text-sm font-medium"
              >
                <Trophy className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-1 lg:gap-3">
                  {/* User Button */}
                  <button
                    onClick={() => setShowUserProfile(true)}
                    className="flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs lg:text-sm font-medium"
                  >
                    <User className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">{user.display_name}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-2 py-1 lg:px-3 lg:py-2 text-gray-700 hover:text-gray-900 text-xs lg:text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm font-medium"
                  >
                    <LogIn className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 py-1 sm:py-4 lg:py-8">
        {/* Mobile-first layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-1 sm:gap-4 lg:gap-8">
          
          {/* Mobile Game Area (Priority layout - full width on mobile) */}
          <div className="lg:hidden order-1">
            {currentPuzzle && (
              <GameErrorBoundary>
                <div className="space-y-1">
                  {/* Ultra-compact Game Stats for Mobile - minimal height */}
                  <div className="px-1">
                    <div className="bg-white rounded shadow-sm border p-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono">{displayTime}</span>
                        <span>🏆{score.toLocaleString()}</span>
                        <span>❌{errors}</span>
                        <span className={`px-1 rounded text-xs capitalize ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                          {currentPuzzle.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Game Board - Maximize mobile width */}
                  <div className="flex justify-center">
                    <PhaserGameBoard 
                      width={mobileGameSize} 
                      height={mobileGameSize}
                      className="w-full"
                      isMobile={true}
                    />
                  </div>
                  
                  {/* Minimal Controls - icons only */}
                  <div className="px-1">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => {
                          if (gameStatus === 'playing') {
                            const game = (window as any).slitherlinkGame;
                            if (game) game.pauseGame();
                          } else {
                            const game = (window as any).slitherlinkGame;
                            if (game) game.resumeGame();
                          }
                        }}
                        className="w-6 h-6 rounded text-xs bg-yellow-500 text-white flex items-center justify-center"
                      >
                        {gameStatus === 'playing' ? '⏸' : '▶'}
                      </button>
                      
                      <button
                        onClick={() => {
                          const game = (window as any).slitherlinkGame;
                          if (game) game.resetPuzzle();
                        }}
                        className="w-6 h-6 rounded text-xs bg-red-500 text-white flex items-center justify-center"
                      >
                        🔄
                      </button>
                      
                      <button
                        onClick={() => {
                          const { undoMove } = useGameStore.getState();
                          undoMove();
                        }}
                        className="w-6 h-6 rounded text-xs bg-blue-500 text-white flex items-center justify-center"
                      >
                        ↶
                      </button>
                      
                      <button
                        onClick={() => {
                          const { redoMove } = useGameStore.getState();
                          redoMove();
                        }}
                        className="w-6 h-6 rounded text-xs bg-blue-500 text-white flex items-center justify-center"
                      >
                        ↷
                      </button>
                    </div>
                  </div>
                </div>
              </GameErrorBoundary>
            )}
            {!currentPuzzle && isAutoLoading && (
              <div className="flex justify-center py-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading puzzle...</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Compact Puzzle Selection at bottom */}
          <div className="lg:hidden order-3">
            <details className="bg-white rounded-lg shadow-sm border">
              <summary className="p-2 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-50 text-center">
                🎯 More Puzzles
              </summary>
              <div className="p-2 border-t border-gray-200">
                <PuzzleSelector />
              </div>
            </details>
          </div>

          {/* Left Sidebar - Desktop only */}
          <div className="hidden lg:block lg:col-span-1 lg:order-1">
            <PuzzleSelector />
          </div>

          {/* Desktop Game Area */}
          <div className="hidden lg:block lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-6">
              {/* Game Stats */}
              {currentPuzzle && (
                <GameErrorBoundary>
                  <GameStats />
                </GameErrorBoundary>
              )}

              {/* Game Board */}
              <div className="flex justify-center">
                <GameErrorBoundary>
                  <PhaserGameBoard 
                    width={600} 
                    height={600}
                    className="w-full max-w-2xl"
                  />
                </GameErrorBoundary>
              </div>
              
              {/* Loading indicator for desktop */}
              {!currentPuzzle && isAutoLoading && (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading daily challenge...</p>
                    <p className="text-sm text-gray-500 mt-2">Preparing today's puzzle for you</p>
                  </div>
                </div>
              )}

              {/* Game Controls */}
              {currentPuzzle && (
                <GameErrorBoundary>
                  <div className="flex justify-center">
                    <GameControls className="flex-wrap justify-center" />
                  </div>
                </GameErrorBoundary>
              )}
            </div>
          </div>

          {/* Mobile: Minimal help and features at very bottom */}
          <div className="lg:hidden order-4">
            <div className="space-y-1">
              {/* Minimal help - only when really needed */}
              <details className="bg-white rounded-lg shadow-sm border">
                <summary className="p-2 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-50 text-center">
                  ❓ Quick Help
                </summary>
                <div className="p-2 border-t border-gray-200 text-xs text-gray-700">
                  <strong>Goal:</strong> Draw one continuous loop. Numbers show how many lines surround that cell.
                </div>
              </details>

              {/* Account features - compact */}
              {(!isAuthenticated || gameStatus === 'completed') && (
                <details className="bg-white rounded-lg shadow-sm border">
                  <summary className="p-2 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-50 text-center">
                    {!isAuthenticated ? '🎯 Join' : '🎉 Done!'}
                  </summary>
                  <div className="p-2 border-t border-gray-200">
                    {!isAuthenticated && (
                      <div className="text-xs text-center">
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          className="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                    
                    {gameStatus === 'completed' && (
                      <div className="text-xs text-center text-green-800">
                        <strong>Congratulations!</strong>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* Right Sidebar - Desktop only */}
          <div className="hidden lg:block lg:col-span-1 lg:order-3">
            
            {/* Desktop: Full help panel */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">How to Play</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Goal</h4>
                  <p className="text-sm text-gray-800">
                    Draw a single continuous loop by connecting dots with lines.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Rules</h4>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>• Numbers indicate how many lines should surround that cell</li>
                    <li>• The loop must be continuous with no branches</li>
                    <li>• Each line segment can only be used once</li>
                    <li>• The loop must close on itself</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Controls</h4>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>• <strong>Left click:</strong> Draw/remove line</li>
                    <li>• <strong>Right click:</strong> Mark edge as blocked (×)</li>
                    <li>• <strong>Ctrl+click:</strong> Also blocks edge</li>
                  </ul>
                </div>

                {/* Desktop Marketing Content */}
                {!isAuthenticated && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>🎯 Join the Community!</strong>
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Sign up to compete in leaderboards and earn trophies!
                    </p>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {isAuthenticated && !permissions?.hasLeaderboardAccess && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>🏆 Unlock Competition!</strong>
                    </p>
                    <p className="text-xs text-yellow-700 mb-3">
                      Get Leaderboard Access to compete and earn trophies!
                    </p>
                    <button
                      onClick={() => setShowUserProfile(true)}
                      className="w-full bg-yellow-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                    >
                      Get Access - $1.99
                    </button>
                  </div>
                )}

                {!currentPuzzle && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Get Started:</strong> Select a puzzle from the left panel to begin playing!
                    </p>
                  </div>
                )}

                {gameStatus === 'completed' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Congratulations!</strong> You've completed the puzzle. {isAuthenticated && permissions?.hasLeaderboardAccess ? 'Your score has been submitted to the leaderboard!' : 'Sign up to track your scores!'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tech Stack Info */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
              <h4 className="font-bold text-gray-900 mb-2">Platform Features</h4>
              <ul className="text-xs text-gray-800 space-y-1">
                <li>• 🎮 Daily Challenge System</li>
                <li>• 🏆 Global Leaderboards</li>
                <li>• 👤 User Accounts & Profiles</li>
                <li>• 🏅 Trophy System</li>
                <li>• 🎯 Multiple Difficulty Levels</li>
                <li>• 📱 Mobile-Responsive Design</li>
              </ul>
              
              <div className="mt-3 pt-3 border-t">
                <h5 className="font-bold text-gray-900 mb-1 text-xs">Tech Stack</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Next.js 15 + TypeScript</li>
                  <li>• Node.js + PostgreSQL Backend</li>
                  <li>• Phaser.js Game Engine</li>
                  <li>• JWT Authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Hidden on mobile */}
      <footer className="hidden lg:block bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Game */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Game</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-300 hover:text-white text-sm transition-colors">Play Now</a></li>
                <li><a href="/?daily=true" className="text-gray-300 hover:text-white text-sm transition-colors">Daily Challenge</a></li>
                <li><a href="/?view=leaderboard" className="text-gray-300 hover:text-white text-sm transition-colors">Leaderboards</a></li>
                <li><a href="/guide" className="text-gray-300 hover:text-white text-sm transition-colors">How to Play</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">About Us</a></li>
                <li><a href="/faq" className="text-gray-300 hover:text-white text-sm transition-colors">FAQ</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">Contact</a></li>
                <li><a href="/changelog" className="text-gray-300 hover:text-white text-sm transition-colors">Updates</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="text-gray-300 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-3">
                <li><a href="mailto:hello@slitherlinks.com" className="text-gray-300 hover:text-white text-sm transition-colors">Email Us</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">Support</a></li>
                <li><a href="mailto:feedback@slitherlinks.com" className="text-gray-300 hover:text-white text-sm transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-white">Slitherlinks</div>
                <div className="ml-4 text-sm text-gray-400">
                  The Ultimate Slitherlink Puzzle Platform
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span>© 2025 Slitherlinks.com</span>
                  <span>•</span>
                  <span>Made with ❤️ for puzzle lovers</span>
                </div>
              </div>
            </div>

            {/* Features highlight */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Daily Challenges
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Global Leaderboards
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                5 Difficulty Levels
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Mobile Optimized
              </div>
            </div>

            {/* SEO Keywords for context */}
            <div className="mt-6 text-center">
              <div className="text-xs text-gray-600">
                Slitherlink puzzles • Logic games • Daily puzzle challenges • Brain training • Competitive puzzle solving
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
      
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)}
      />
      
      <LeaderboardErrorBoundary>
        <LeaderboardModal 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)}
        />
      </LeaderboardErrorBoundary>
    </div>
  );
}