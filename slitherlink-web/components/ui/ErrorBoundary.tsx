'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // trackError(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-64 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        
        <p className="text-gray-600 text-sm mb-6">
          An unexpected error occurred in this section. This is usually temporary.
        </p>

        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Reload Page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto max-h-32">
              {error.message}
              {error.stack && (
                <>
                  <br />
                  <br />
                  {error.stack}
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Specialized error boundaries for different sections

export function GameErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

function GameErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-96 flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Game Loading Failed
        </h3>
        
        <p className="text-gray-600 mb-4">
          We couldn't load the puzzle game. This might be due to a network issue or browser compatibility problem.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={retry}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retry Game Loading
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Return to Homepage
          </button>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>💡 <strong>Quick fixes:</strong></p>
          <p>• Refresh your browser</p>
          <p>• Check your internet connection</p>
          <p>• Try a different browser</p>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={LeaderboardErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

function LeaderboardErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="mb-4">
        <svg className="w-8 h-8 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h4 className="font-semibold text-gray-900 mb-2">
        Leaderboard Temporarily Unavailable
      </h4>
      
      <p className="text-gray-600 text-sm mb-4">
        We're having trouble loading the leaderboard data. Your game progress is still being saved!
      </p>
      
      <button
        onClick={retry}
        className="bg-yellow-600 text-white px-4 py-2 rounded font-medium hover:bg-yellow-700 transition-colors"
      >
        Retry Loading
      </button>
    </div>
  );
}