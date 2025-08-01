'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found | Slitherlinks';
  }, []);
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
              <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">FAQ</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* 404 Puzzle Visual */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-4">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.5-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            
            {/* Stylized 404 with puzzle elements */}
            <div className="text-8xl font-bold text-gray-300 mb-2 relative">
              4
              <span className="inline-block mx-4 relative">
                <span className="text-blue-400">0</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-400 rounded-sm"></div>
                </div>
              </span>
              4
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Puzzle Piece Missing!
          </h1>
          
          <p className="text-gray-600 text-lg mb-2">
            This page seems to have wandered off the grid.
          </p>
          
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link 
              href="/"
              className="block w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Start Playing Puzzles
            </Link>
            
            <Link 
              href="/about"
              className="block w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
            >
              Learn About Slitherlinks
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <p className="text-gray-500 text-sm mb-4">Looking for something specific?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <Link href="/?daily=true" className="text-blue-600 hover:text-blue-800 hover:underline">
                Daily Challenge
              </Link>
              <Link href="/?view=leaderboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                Leaderboards
              </Link>
              <Link href="/faq" className="text-blue-600 hover:text-blue-800 hover:underline">
                FAQ
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search our site..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value.trim();
                    if (query) {
                      // Simple redirect to Google search for now
                      window.open(`https://www.google.com/search?q=site:slitherlinks.com ${query}`, '_blank');
                    }
                  }
                }}
              />
              <button 
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const query = input.value.trim();
                  if (query) {
                    window.open(`https://www.google.com/search?q=site:slitherlinks.com ${query}`, '_blank');
                  }
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM8 14A6 6 0 108 2a6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Press Enter to search our site</p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              © 2025 Slitherlinks.com - The Ultimate Slitherlink Puzzle Platform
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