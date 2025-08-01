import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Slitherlinks',
  description: 'Get answers to common questions about Slitherlinks.com - how to play Slitherlink puzzles, account management, leaderboards, and technical support.',
  keywords: 'slitherlink faq, how to play slitherlink, puzzle help, account questions, leaderboard help',
  openGraph: {
    title: 'FAQ | Slitherlinks - Get Your Questions Answered',
    description: 'Find answers to common questions about playing Slitherlink puzzles and using our platform',
    url: 'https://slitherlinks.com/faq',
    type: 'website',
  }
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "What is Slitherlink?",
        a: "Slitherlink (数回) is a logic puzzle where you draw a single continuous loop by connecting dots. The numbers in each cell indicate how many lines should surround that cell. The goal is to create one closed loop that satisfies all the number clues."
      },
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button in the top right corner. You'll only need an email address and a display name for the leaderboards. Account creation is free and gives you access to daily challenges and progress tracking."
      },
      {
        q: "Do I need an account to play?",
        a: "You can play puzzles without an account, but creating one unlocks features like daily challenges, progress tracking, leaderboard participation, and the ability to save your game history."
      }
    ]
  },
  {
    category: "How to Play",
    questions: [
      {
        q: "What are the basic rules?",
        a: "1) Draw a single continuous loop connecting the dots. 2) Numbers indicate how many lines should surround that cell. 3) The loop cannot branch or cross itself. 4) Every line segment can only be used once. 5) The loop must close completely on itself."
      },
      {
        q: "How do I draw and remove lines?",
        a: "Left-click on the edge between two dots to draw a line. Left-click again on the same edge to remove it. You can also drag to draw multiple connected lines quickly."
      },
      {
        q: "What does the × (cross) mark mean?",
        a: "Right-click or long-press on an edge to mark it with ×. This indicates you're certain no line should go there. It's a helpful strategy to mark edges you've ruled out. Right-click again to remove the mark."
      },
      {
        q: "What do the different colors mean?",
        a: "Blue lines are your drawn lines. Green lines indicate correct placement (when you're close to the solution). Red lines show conflicts or errors. Numbers turn green when their requirement is satisfied and red when there are too many surrounding lines."
      }
    ]
  },
  {
    category: "Daily Challenges",
    questions: [
      {
        q: "When do new daily challenges appear?",
        a: "New daily challenges are released every day at midnight UTC (Coordinated Universal Time). The difficulty follows a weekly pattern: Monday (Easy 5×5), Tuesday (Medium 7×7), Wednesday (Hard 10×10), Thursday (Medium 7×7), Friday (Master 12×12), Saturday (Ninja 15×15), Sunday (Hard 10×10)."
      },
      {
        q: "Can I play yesterday's daily challenge?",
        a: "Currently, daily challenges are only available for the current day to maintain the competitive aspect. However, you can play similar difficulty puzzles from our regular puzzle library anytime."
      },
      {
        q: "Why does the daily challenge difficulty change?",
        a: "We designed the weekly cycle to accommodate different skill levels and provide variety. It starts easy on Monday and gradually increases, with weekend challenges being the most difficult. This gives everyone a chance to participate throughout the week."
      }
    ]
  },
  {
    category: "Leaderboards & Competition",
    questions: [
      {
        q: "How does scoring work?",
        a: "Your score is calculated based on: Base points (varies by difficulty) + Time bonus (faster completion = more points) - Error penalty (50 points per mistake). The minimum score is 100 points. Viewing the solution disqualifies your score from competitive leaderboards."
      },
      {
        q: "What are the different leaderboards?",
        a: "We have four leaderboard types: Daily (today's best scores), Weekly (this week's total), Monthly (this month's total), and All-Time (overall best). Each shows the top 100 players plus your personal ranking."
      },
      {
        q: "How often do leaderboards update?",
        a: "Leaderboards update in real-time when you complete a puzzle. Your score is automatically submitted if you have an account and haven't viewed the solution."
      },
      {
        q: "Can I compete without paying?",
        a: "Yes! All leaderboards are currently free to view and participate in. We believe competitive puzzle solving should be accessible to everyone."
      }
    ]
  },
  {
    category: "Technical & Account",
    questions: [
      {
        q: "What devices and browsers are supported?",
        a: "Slitherlinks works on all modern browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile devices. The game is optimized for touch screens and supports both mouse and touch input."
      },
      {
        q: "Why is my puzzle loading slowly?",
        a: "Puzzle generation uses advanced algorithms to ensure quality. Most puzzles load in under 2 seconds. If you experience consistent delays, try refreshing the page or switching to a different puzzle difficulty."
      },
      {
        q: "How do I change my display name?",
        a: "Currently, display names are set during account creation. If you need to change yours, please contact us at support@slitherlinks.com and we'll help you update it."
      },
      {
        q: "Is my data secure?",
        a: "Yes. We use industry-standard encryption for all data transmission and storage. Passwords are securely hashed, and we never store them in plain text. Read our Privacy Policy for complete details about data handling."
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can request account deletion by emailing us at privacy@slitherlinks.com. We'll remove all your personal data within 30 days, though leaderboard entries may be retained for competitive integrity."
      }
    ]
  },
  {
    category: "Puzzle Quality & Generation",
    questions: [
      {
        q: "How are puzzles generated?",
        a: "We use advanced constraint satisfaction algorithms powered by the Choco Solver engine. Every puzzle is automatically verified to have exactly one valid solution before being added to our database."
      },
      {
        q: "What if I find a puzzle with no solution or multiple solutions?",
        a: "This would be a serious bug. Please contact us immediately at support@slitherlinks.com with the puzzle details. We'll investigate and fix the issue quickly. Quality is our top priority."
      },
      {
        q: "How do difficulty levels work?",
        a: "Difficulty is determined by grid size and puzzle complexity: Easy (5×5), Medium (7×7), Hard (10×10), Master (12×12), and Ninja (15×15). Larger grids generally require more advanced solving techniques."
      },
      {
        q: "Will you add new puzzle variations?",
        a: "We're focused on perfecting the classic Slitherlink experience first. Future updates may include variations like triangular grids or different loop constraints based on community feedback."
      }
    ]
  },
  {
    category: "Features & Updates",
    questions: [
      {
        q: "What features are you working on next?",
        a: "Our roadmap includes user profile enhancements, social features for sharing achievements, mobile app development, and accessibility improvements. Follow our changelog for the latest updates."
      },
      {
        q: "Can I suggest new features?",
        a: "Absolutely! We love hearing from our community. Send your ideas to feedback@slitherlinks.com or through our contact form. Many current features came from user suggestions."
      },
      {
        q: "Do you have a mobile app?",
        a: "Currently, we're a web-based platform optimized for mobile browsers. A dedicated mobile app is in our development plans for 2025."
      },
      {
        q: "Is there a dark mode?",
        a: "Not yet, but it's a highly requested feature on our development list. We're working on theme options including dark mode and high contrast modes for better accessibility."
      }
    ]
  },
  {
    category: "Troubleshooting",
    questions: [
      {
        q: "The game isn't responding to my clicks/touches",
        a: "Try refreshing the page. If the problem persists, clear your browser cache or try a different browser. Make sure JavaScript is enabled. Contact us if issues continue."
      },
      {
        q: "I can't see the puzzle numbers clearly",
        a: "The puzzle automatically adjusts to your screen size. Try zooming in with your browser (Ctrl/Cmd + +) or switching to landscape mode on mobile devices for better visibility."
      },
      {
        q: "My progress wasn't saved",
        a: "Progress is automatically saved to your account when logged in. If you were playing as a guest, progress isn't saved. Make sure you're logged in before starting puzzles."
      },
      {
        q: "The leaderboard isn't showing my score",
        a: "Scores are only submitted if you're logged in and complete the puzzle without viewing the solution. Check that you have an active account and completed the puzzle legitimately."
      }
    ]
  }
];

export default function FAQ() {
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
              <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Contact</a>
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
            <span className="text-gray-900 font-medium">FAQ</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about Slitherlinks and get the help you need.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-3">Quick Navigation</h2>
          <div className="flex flex-wrap gap-2">
            {faqs.map((category, idx) => (
              <a
                key={idx}
                href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                {category.category}
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        {faqs.map((category, categoryIdx) => (
          <div key={categoryIdx} className="mb-12">
            <h2 
              id={category.category.toLowerCase().replace(/\s+/g, '-')}
              className="text-2xl font-bold text-gray-900 mb-6 scroll-mt-4"
            >
              {category.category}
            </h2>
            <div className="space-y-6">
              {category.questions.map((faq, faqIdx) => (
                <div key={faqIdx} className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.q}
                    </h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 mb-6">
            Can't find what you're looking for? We're here to help! Reach out to our friendly support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="mailto:support@slitherlinks.com" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Email Us Directly
            </a>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Getting Started Guide</h3>
            <p className="text-gray-600 text-sm mb-4">
              New to Slitherlink? Check out our beginner's guide with step-by-step tutorials.
            </p>
            <a href="/guide" className="text-blue-600 hover:text-blue-800 font-medium">
              View Guide →
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">System Status</h3>
            <p className="text-gray-600 text-sm mb-4">
              Check if there are any known issues or maintenance updates affecting the service.
            </p>
            <a href="/status" className="text-blue-600 hover:text-blue-800 font-medium">
              Check Status →
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Feature Updates</h3>
            <p className="text-gray-600 text-sm mb-4">
              Stay up to date with the latest features, improvements, and bug fixes.
            </p>
            <a href="/changelog" className="text-blue-600 hover:text-blue-800 font-medium">
              View Changelog →
            </a>
          </div>
        </div>

        {/* Back to Game */}
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