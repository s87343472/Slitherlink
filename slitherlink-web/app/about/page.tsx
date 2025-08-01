import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Slitherlinks - The Premier Slitherlink Puzzle Platform',
  description: 'Learn about Slitherlinks.com - the ultimate online platform for Slitherlink puzzle enthusiasts. Daily challenges, global leaderboards, and competitive gameplay.',
  keywords: 'about slitherlinks, slitherlink puzzles, puzzle games, logic puzzles, daily challenges, competitive gaming',
  openGraph: {
    title: 'About Slitherlinks | Premier Slitherlink Puzzle Platform',
    description: 'Discover the story behind the ultimate Slitherlink puzzle gaming experience',
    url: 'https://slitherlinks.com/about',
    type: 'website',
    images: [
      {
        url: 'https://slitherlinks.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Slitherlinks - Slitherlink Puzzle Game'
      }
    ]
  }
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Slitherlinks
              </a>
            </div>
            <nav className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Home</a>
              <a href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">FAQ</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600 transition-colors">
              🏠 Home
            </a>
            <span>›</span>
            <span className="text-gray-900 font-medium">About Us</span>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Slitherlinks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The premier online platform for Slitherlink puzzle enthusiasts worldwide. 
            Experience competitive puzzle solving with daily challenges, global leaderboards, and a thriving community.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Mission Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              We believe that Slitherlink puzzles deserve a modern, competitive platform that brings puzzle enthusiasts together from around the world. Our mission is to transform this classic logic puzzle into an engaging, social experience.
            </p>
            <p className="text-gray-700">
              By combining traditional puzzle-solving with leaderboards, daily challenges, and community features, we're creating the ultimate destination for Slitherlink lovers of all skill levels.
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Slitherlinks was born from a simple observation: while Slitherlink puzzles are beloved worldwide, there wasn't a platform that truly celebrated their competitive potential.
            </p>
            <p className="text-gray-700">
              We set out to create more than just another puzzle website. We built a comprehensive platform that respects the puzzle's Japanese origins (数回 - "number loops") while adding modern features that enhance the solving experience.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">What Makes Us Different</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Daily Challenges */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Challenges</h3>
              <p className="text-gray-600 text-sm">
                Fresh puzzles every day with rotating difficulty levels. Monday starts easy, builds to weekend challenges.
              </p>
            </div>

            {/* Global Leaderboards */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Global Rankings</h3>
              <p className="text-gray-600 text-sm">
                Compete with players worldwide across daily, weekly, monthly, and all-time leaderboards.
              </p>
            </div>

            {/* Advanced Algorithm */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Puzzles</h3>
              <p className="text-gray-600 text-sm">
                Every puzzle is generated using advanced algorithms and validated for unique solutions.
              </p>
            </div>

            {/* Real-time Feedback */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Interface</h3>
              <p className="text-gray-600 text-sm">
                Visual feedback system with color-coded hints, progress tracking, and intuitive controls.
              </p>
            </div>

            {/* Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 9a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600 text-sm">
                Optimized for all devices with responsive design and touch-friendly controls.
              </p>
            </div>

            {/* Community */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Growing Community</h3>
              <p className="text-gray-600 text-sm">
                Join thousands of puzzle enthusiasts sharing strategies, achievements, and friendly competition.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Excellence */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Built for Performance</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Modern Technology Stack</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>Next.js 15</strong> - Lightning-fast React framework</li>
                <li>• <strong>Phaser.js</strong> - Smooth game engine for optimal puzzle interaction</li>
                <li>• <strong>PostgreSQL</strong> - Reliable database for user data and puzzles</li>
                <li>• <strong>JWT Authentication</strong> - Secure user management</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Assurance</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>Algorithm Validation</strong> - Every puzzle verified for unique solutions</li>
                <li>• <strong>Performance Monitoring</strong> - Sub-50ms response times</li>
                <li>• <strong>Automated Testing</strong> - Continuous quality assurance</li>
                <li>• <strong>Security First</strong> - GDPR compliant data handling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600">Puzzles Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">5</div>
            <div className="text-gray-600">Difficulty Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600">Uptime Target</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">Global</div>
            <div className="text-gray-600">Reach</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fair Competition</h3>
              <p className="text-gray-600 text-sm">
                We maintain the integrity of our leaderboards through anti-cheat measures and fair play policies.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">
                Your personal data is protected with industry-standard encryption and transparent privacy practices.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Continuous Innovation</h3>
              <p className="text-gray-600 text-sm">
                We regularly update our platform with new features based on community feedback and emerging technologies.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Join the Community?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start your Slitherlink journey today. Create an account to access daily challenges, compete on global leaderboards, and connect with puzzle enthusiasts worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Start Playing Now
            </a>
            <a 
              href="/faq" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">Questions or feedback? We'd love to hear from you.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
            <a href="/faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            <a href="mailto:hello@slitherlinks.com" className="hover:text-blue-600 transition-colors">hello@slitherlinks.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}