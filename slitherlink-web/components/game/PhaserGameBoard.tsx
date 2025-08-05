'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store/gameStore';

interface PhaserGameBoardProps {
  width?: number;
  height?: number;
  className?: string;
  isMobile?: boolean;
}

// Create a client-side only Phaser component
const PhaserGameInner: React.FC<PhaserGameBoardProps> = ({
  width = 600,
  height = 600,
  className = '',
  isMobile = false
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);
  const gameSceneRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { currentPuzzle, gameStatus, completeGame, addError, calculateScore, markSolutionViewed } = useGameStore();

  // Initialize Phaser game
  useEffect(() => {
    let mounted = true;

    const initPhaser = async () => {
      if (!gameRef.current || !mounted) return;

      try {
        // Dynamic import of Phaser and game engine to avoid SSR issues
        const [{ default: Phaser }, { SlitherlinkGame }] = await Promise.all([
          import('phaser'),
          import('@/lib/game/PhaserGameEngine')
        ]);

        // Clean up existing game
        if (phaserGameRef.current) {
          phaserGameRef.current.destroy(true);
        }

        // Create Phaser game configuration with mobile optimizations
        const config: any = {
          type: Phaser.AUTO,
          width,
          height,
          parent: gameRef.current,
          backgroundColor: '#f8fafc',
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false
            }
          },
          scene: SlitherlinkGame,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width,
            height,
            // Better mobile handling
            zoom: 1,
            resizeInterval: 500
          },
          input: {
            mouse: {
              target: gameRef.current,
              capture: true
            },
            touch: {
              target: gameRef.current,
              capture: true
            },
            // Add mobile-specific input settings
            activePointers: 1,
            smoothFactor: 0.15,
            inputQueueSize: 10
          },
          render: {
            // Better mobile performance
            antialias: true,
            pixelArt: false,
            roundPixels: false
          }
        };

        // Create and start the game
        phaserGameRef.current = new Phaser.Game(config);
        
        // Get reference to the game scene
        phaserGameRef.current.events.once('ready', () => {
          if (!mounted) return;
          
          gameSceneRef.current = phaserGameRef.current?.scene.getScene('SlitherlinkGame');
          console.log('Game scene loaded:', gameSceneRef.current);
          
          // Set up game events
          if (gameSceneRef.current) {
            gameSceneRef.current.events.on('puzzleCompleted', (data: any) => {
              console.log('Puzzle completed:', data);
              // You can dispatch to game store here
            });
          }
          
          setIsLoaded(true);
        });
      } catch (error) {
        console.error('Failed to initialize Phaser:', error);
      }
    };

    initPhaser();

    return () => {
      mounted = false;
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [width, height]);

  // Load puzzle when it changes
  useEffect(() => {
    if (currentPuzzle && gameSceneRef.current && isLoaded) {
      console.log('Loading puzzle:', currentPuzzle);
      gameSceneRef.current.loadPuzzle(currentPuzzle);
      
      // Re-setup window controls after puzzle load
      (window as any).slitherlinkGame = {
        showSolution: () => {
          console.log('showSolution called, gameScene:', gameSceneRef.current);
          return gameSceneRef.current?.showSolution();
        },
        hideSolution: () => {
          console.log('hideSolution called');
          return gameSceneRef.current?.hideSolution();
        },
        resetPuzzle: () => {
          console.log('resetPuzzle called');
          return gameSceneRef.current?.resetPuzzle();
        },
        getPlayerSolution: () => gameSceneRef.current?.getPlayerSolution(),
        getBlockedEdges: () => gameSceneRef.current?.getBlockedEdges(),
        checkPuzzleCompletion: () => gameSceneRef.current?.checkPuzzleCompletion(),
        onPuzzleCompleted: () => gameSceneRef.current?.onPuzzleCompleted(),
      };

      // Development console helper functions
      if (process.env.NODE_ENV === 'development') {
        (window as any).slitherlinkDebug = {
          showSolution: () => {
            console.log('🔍 Debug: Showing solution');
            gameSceneRef.current?.showSolution();
            markSolutionViewed();
          },
          hideSolution: () => {
            console.log('🙈 Debug: Hiding solution');
            gameSceneRef.current?.hideSolution();
          },
          checkCompletion: () => {
            const isComplete = gameSceneRef.current?.checkPuzzleCompletion();
            console.log('✅ Debug: Puzzle completion status:', isComplete);
            return isComplete;
          },
          getGameState: () => {
            return {
              playerSolution: gameSceneRef.current?.getPlayerSolution(),
              blockedEdges: gameSceneRef.current?.getBlockedEdges(),
              isComplete: gameSceneRef.current?.checkPuzzleCompletion()
            };
          },
          help: () => {
            console.log(`
🎮 Slitherlink Debug Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• slitherlinkDebug.showSolution() - Show puzzle solution (marks as viewed)
• slitherlinkDebug.hideSolution() - Hide puzzle solution
• slitherlinkDebug.checkCompletion() - Check if puzzle is completed
• slitherlinkDebug.getGameState() - Get current game state
• slitherlinkDebug.help() - Show this help message

⚠️  Warning: Using showSolution() will mark the puzzle as "solution viewed"
   and disable submission for fair play.
            `);
          }
        };
        
        // Auto-show help message in development
        console.log('🎮 Slitherlink game loaded! Type slitherlinkDebug.help() for debug commands.');
      }

      // Connect game store actions to window for Phaser to use
      (window as any).gameStoreActions = {
        completeGame,
        addError,
        calculateScore,
        markSolutionViewed,
      };
    }
  }, [currentPuzzle, isLoaded]);

  // Expose game controls
  useEffect(() => {
    // Store game controls in a way that parent components can access them
    if (gameSceneRef.current && isLoaded) {
      console.log('Setting up game controls on window');
      (window as any).slitherlinkGame = {
        showSolution: () => {
          console.log('showSolution called, gameScene:', gameSceneRef.current);
          return gameSceneRef.current?.showSolution();
        },
        hideSolution: () => {
          console.log('hideSolution called');
          return gameSceneRef.current?.hideSolution();
        },
        resetPuzzle: () => {
          console.log('resetPuzzle called');
          return gameSceneRef.current?.resetPuzzle();
        },
        getPlayerSolution: () => gameSceneRef.current?.getPlayerSolution(),
        getBlockedEdges: () => gameSceneRef.current?.getBlockedEdges(),
        checkPuzzleCompletion: () => gameSceneRef.current?.checkPuzzleCompletion(),
        onPuzzleCompleted: () => gameSceneRef.current?.onPuzzleCompleted(),
      };

      // Connect game store actions to window for Phaser to use
      (window as any).gameStoreActions = {
        completeGame,
        addError,
        calculateScore,
        markSolutionViewed,
      };
    }
  }, [gameSceneRef.current, isLoaded]);

  return (
    <div className={`game-board-container ${className}`}>
      <div
        ref={gameRef}
        className="border border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          aspectRatio: '1 / 1'
        }}
      />
      
      {!currentPuzzle && isLoaded && (
        <div 
          className="absolute top-0 left-0 flex items-center justify-center bg-gray-100 rounded-lg"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No puzzle loaded</p>
            <p className="text-sm text-gray-500 mt-1">Select a puzzle to start playing</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Create the dynamically imported component to avoid SSR issues
const PhaserGameDynamic = dynamic(() => Promise.resolve(PhaserGameInner), {
  ssr: false,
  loading: ({ isLoading }) => (
    <div 
      className="border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100"
      style={{
        width: '100%',
        height: '600px',
        maxWidth: '100%'
      }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading game engine...</p>
      </div>
    </div>
  )
});

export const PhaserGameBoard: React.FC<PhaserGameBoardProps> = (props) => {
  return <PhaserGameDynamic {...props} />;
};