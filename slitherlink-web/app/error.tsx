'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error caught:', error);
    
    // You could send this to your error tracking service
    // trackError(error);
  }, [error]);

  const getErrorMessage = (error: Error) => {
    if (error.message.includes('fetch')) {
      return {
        title: "Connection Problem",
        description: "We're having trouble connecting to our servers. Please check your internet connection.",
        suggestion: "This might be a temporary network issue."
      };
    }
    
    if (error.message.includes('timeout')) {
      return {
        title: "Request Timeout",
        description: "The request took too long to complete. Our servers might be experiencing high traffic.",
        suggestion: "Please try again in a moment."
      };
    }
    
    if (error.message.includes('parse') || error.message.includes('JSON')) {
      return {
        title: "Data Error",
        description: "We received unexpected data from the server. This might be a temporary issue.",
        suggestion: "Refreshing the page usually fixes this."
      };
    }

    return {
      title: "Something Went Wrong",
      description: "An unexpected error occurred while processing your request.",
      suggestion: "This is usually a temporary issue that resolves quickly."
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Slitherlinks
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Support</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-4">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-600 text-lg mb-2">
            {errorInfo.description}
          </p>
          
          <p className="text-gray-500 mb-8">
            {errorInfo.suggestion}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={reset}
              className="block w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Try Again
            </button>
            
            <Link 
              href="/"
              className="block w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
            >
              Return Home
            </Link>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left bg-gray-100 p-4 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details (Development Only)
              </summary>
              <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\nStack Trace:\n'}
                    {error.stack}
                  </>
                )}
              </div>
            </details>
          )}

          {/* Quick Actions */}
          <div className="mt-12">
            <p className="text-gray-500 text-sm mb-4">Quick actions while we fix this:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <Link href="/?daily=true" className="text-blue-600 hover:text-blue-800 hover:underline">
                Daily Challenge
              </Link>
              <Link href="/?view=leaderboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                Leaderboards
              </Link>
              <Link href="/faq" className="text-blue-600 hover:text-blue-800 hover:underline">
                Get Help
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">
                Report Issue
              </Link>
            </div>
          </div>

          {/* Status Check */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Having persistent issues?</strong> Check our{' '}
              <Link href="/status" className="underline hover:no-underline">
                system status page
              </Link>{' '}
              or{' '}
              <Link href="/contact" className="underline hover:no-underline">
                contact our support team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              © 2025 Slitherlinks.com - We'll get this puzzle sorted out!
            </div>
            <div className="mt-2 sm:mt-0 flex space-x-4 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-gray-600">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-gray-600">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}