import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <nav className="flex space-x-4">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Loading Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* Puzzle-themed Loading Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-6">
              {/* Animated puzzle grid */}
              <div className="grid grid-cols-3 gap-1 w-16 h-16">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-blue-600 rounded-sm animate-pulse"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1.5s'
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Loading Dots */}
            <div className="flex justify-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading Your Puzzle Experience
          </h2>
          
          <p className="text-gray-600 mb-8">
            Preparing the best Slitherlink puzzles just for you...
          </p>

          {/* Progress Steps */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Initializing game engine
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
              Loading puzzle database
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              Preparing daily challenge
            </div>
          </div>

          {/* Skeleton Content */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-2/3"></div>
          </div>

          {/* Fun Loading Messages */}
          <div className="mt-8 text-sm text-gray-500">
            <p>💡 Did you know? Slitherlink puzzles always have exactly one solution!</p>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-2 sm:mt-0 flex space-x-4">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}