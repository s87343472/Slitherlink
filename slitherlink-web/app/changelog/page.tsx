import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog | Slitherlinks - Latest Updates & Features',
  description: 'Stay updated with the latest features, improvements, and bug fixes for Slitherlinks.com - your premier Slitherlink puzzle platform.',
  keywords: 'slitherlinks changelog, updates, new features, bug fixes, improvements',
  openGraph: {
    title: 'Changelog | Slitherlinks Updates',
    description: 'Discover what\'s new in Slitherlinks with our detailed changelog',
    url: 'https://slitherlinks.com/changelog',
    type: 'website',
  }
};

const releases = [
  {
    version: "1.0.0",
    date: "2025-01-31",
    type: "major",
    title: "Initial Public Release",
    description: "The official launch of Slitherlinks.com with full-featured Slitherlink puzzle gaming experience.",
    changes: [
      {
        type: "feature",
        title: "Core Game Engine",
        items: [
          "Phaser.js-powered game engine with smooth 60fps performance",
          "Support for 5×5 to 15×15 grid sizes across 5 difficulty levels",
          "Real-time visual feedback with color-coded line states",
          "Intuitive touch and mouse controls optimized for all devices",
          "Undo/redo functionality with multi-step history"
        ]
      },
      {
        type: "feature", 
        title: "Daily Challenge System",
        items: [
          "Automated daily puzzle updates at midnight UTC",
          "Weekly difficulty rotation following structured pattern",
          "600+ puzzle database with SHA256-based deduplication",
          "Automatic inventory management and replenishment",
          "Zero-downtime puzzle generation and distribution"
        ]
      },
      {
        type: "feature",
        title: "Global Leaderboards",
        items: [
          "Multi-dimensional rankings: daily, weekly, monthly, and all-time",
          "Advanced scoring algorithm based on time, accuracy, and difficulty", 
          "Real-time leaderboard updates with automatic score submission",
          "Personal ranking statistics and performance tracking",
          "Fair play enforcement and anti-cheat measures"
        ]
      },
      {
        type: "feature",
        title: "User Account System",
        items: [
          "Secure JWT-based authentication with email verification",
          "Personal game statistics and achievement tracking",
          "Customizable display names for leaderboard participation",
          "Account management with privacy controls",
          "Password reset and account recovery features"
        ]
      },
      {
        type: "feature",
        title: "Advanced Algorithm Integration",
        items: [
          "Java-based puzzle generation using Choco Solver constraints",
          "Guaranteed unique solutions for every generated puzzle",
          "Intelligent difficulty calibration and quality assurance",
          "High-performance batch generation for scalability",
          "Automated puzzle validation and testing pipeline"
        ]
      }
    ]
  },
  {
    version: "0.9.0-beta",
    date: "2025-01-25",
    type: "minor",
    title: "Beta Testing Release", 
    description: "Feature-complete beta version released for testing with limited user base.",
    changes: [
      {
        type: "feature",
        title: "Beta Features",
        items: [
          "Complete leaderboard system implementation",
          "Daily challenge automation and testing",
          "User registration and authentication flow",
          "Mobile responsiveness and touch optimization",
          "Performance optimization and bug fixes"
        ]
      },
      {
        type: "improvement",
        title: "Quality Enhancements",
        items: [
          "Improved puzzle generation speed by 40%",
          "Enhanced visual feedback with smoother animations",
          "Better error handling and user experience",
          "Cross-browser compatibility improvements",
          "Database performance optimizations"
        ]
      }
    ]
  },
  {
    version: "0.8.0-alpha",
    date: "2025-01-15", 
    type: "minor",
    title: "Alpha Release",
    description: "Initial alpha version with core gameplay and basic features.",
    changes: [
      {
        type: "feature",
        title: "Core Development",
        items: [
          "Basic Slitherlink game implementation with Phaser.js",
          "Simple puzzle generation and validation",
          "User interface foundation and responsive design",
          "Database schema design and initial migrations",
          "Development environment setup and CI/CD pipeline"
        ]
      }
    ]
  }
];

const upcomingFeatures = [
  {
    title: "Enhanced Social Features",
    description: "Share achievements, compare stats with friends, and create private tournaments.",
    eta: "Q2 2025"
  },
  {
    title: "Mobile Application",
    description: "Native iOS and Android apps with offline puzzle solving capabilities.",
    eta: "Q3 2025"
  },
  {
    title: "Advanced Themes",
    description: "Dark mode, high contrast, and customizable color schemes for better accessibility.",
    eta: "Q2 2025"
  },
  {
    title: "Tournament System",
    description: "Organized competitions with special prizes and recognition for top players.",
    eta: "Q4 2025"
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'major': return 'bg-red-100 text-red-800 border-red-200';
    case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';  
    case 'patch': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      );
    case 'improvement':
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'fix':
      return (
        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
  }
};

export default function Changelog() {
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
              <a href="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium">About</a>
              <a href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">FAQ</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600 transition-colors">
              🏠 Home
            </a>
            <span>›</span>
            <span className="text-gray-900 font-medium">Changelog</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Changelog</h1>
          <p className="text-xl text-gray-600">
            Track our progress as we continuously improve your Slitherlink puzzle experience.
          </p>
        </div>

        {/* Current Version Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Version: 1.0.0</h2>
              <p className="text-blue-100">
                🎉 We've officially launched! Experience the complete Slitherlink platform with all core features.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">1.0</div>
              <div className="text-blue-200 text-sm">Released</div>
            </div>
          </div>
        </div>

        {/* Release History */}
        <div className="space-y-12">
          <h2 className="text-2xl font-bold text-gray-900">Release History</h2>
          
          {releases.map((release, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Release Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(release.type)}`}>
                      {release.type.charAt(0).toUpperCase() + release.type.slice(1)} Release
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">
                      v{release.version}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(release.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-2">
                  {release.title}
                </h4>
                <p className="text-gray-700">
                  {release.description}
                </p>
              </div>

              {/* Release Content */}
              <div className="p-6">
                {release.changes.map((changeGroup, changeIdx) => (
                  <div key={changeIdx} className={changeIdx > 0 ? "mt-8" : ""}>
                    <div className="flex items-center space-x-2 mb-4">
                      {getChangeIcon(changeGroup.type)}
                      <h5 className="text-lg font-semibold text-gray-900">
                        {changeGroup.title}
                      </h5>
                    </div>
                    <ul className="space-y-2">
                      {changeGroup.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What's Coming Next</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    {feature.eta}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Have a Feature Request?
            </h3>
            <p className="text-blue-800 text-sm mb-4">
              We love hearing from our community! Your feedback helps shape our roadmap and prioritize the features that matter most to players.
            </p>
            <a 
              href="/contact" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Share Your Ideas
            </a>
          </div>
        </div>

        {/* Technical Information */}
        <div className="mt-16 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Stack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Next.js 15 with TypeScript</li>
                <li>• Phaser.js game engine</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Responsive design with mobile optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Node.js with Express.js</li>
                <li>• PostgreSQL database</li>
                <li>• JWT authentication</li>
                <li>• Java-based puzzle generation service</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stay Updated */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-green-100 mb-6">
            Get notified about new features, improvements, and important updates to Slitherlinks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Contact Us for Updates
            </a>
            <a 
              href="/" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
            >
              Start Playing Now
            </a>
          </div>
        </div>

        {/* Back Navigation */}
        <div className="mt-12 text-center">
          <a 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Playing Slitherlinks
          </a>
        </div>
      </div>
    </div>
  );
}