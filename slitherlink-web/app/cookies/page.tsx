import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Slitherlinks - Slitherlink Puzzle Game',
  description: 'Cookie Policy for Slitherlinks.com - How we use cookies and similar technologies to enhance your puzzle gaming experience.',
  keywords: 'cookie policy, cookies, tracking, slitherlink, puzzle game, website cookies',
  openGraph: {
    title: 'Cookie Policy | Slitherlinks',
    description: 'Learn about our cookie usage and privacy practices',
    url: 'https://slitherlinks.com/cookies',
    type: 'website',
  }
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <span className="text-gray-900 font-medium">Cookie Policy</span>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 text-sm mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our Slitherlink puzzle game platform.
              </p>
              <p className="text-gray-700">
                Similar technologies include web beacons, pixels, and local storage, which serve similar purposes to cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Keep you logged in to your account</li>
                <li>Remember your game preferences and settings</li>
                <li>Analyze website performance and usage patterns</li>
                <li>Provide security features and prevent fraud</li>
                <li>Enable core website functionality</li>
                <li>Improve user experience and service quality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Essential Cookies</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium mb-2">Required - Cannot be disabled</p>
                <p className="text-red-700 text-sm">
                  These cookies are necessary for the website to function and cannot be switched off in our systems.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li><strong>Authentication:</strong> Keep you logged in to your account</li>
                <li><strong>Security:</strong> Protect against cross-site request forgery</li>
                <li><strong>Session Management:</strong> Maintain your session state</li>
                <li><strong>Load Balancing:</strong> Distribute traffic across servers</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Performance Cookies</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-2">Analytics - Can be disabled</p>
                <p className="text-blue-700 text-sm">
                  These cookies help us understand how visitors interact with our website.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li><strong>Page Views:</strong> Track which pages are visited most</li>
                <li><strong>Performance Metrics:</strong> Monitor loading times and errors</li>
                <li><strong>User Behavior:</strong> Understand navigation patterns</li>
                <li><strong>Game Analytics:</strong> Analyze puzzle completion rates</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Functional Cookies</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium mb-2">Preferences - Can be disabled</p>
                <p className="text-green-700 text-sm">
                  These cookies remember your preferences to enhance your experience.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li><strong>Theme Settings:</strong> Remember light/dark mode preference</li>
                <li><strong>Language:</strong> Store your language choice</li>
                <li><strong>Game Settings:</strong> Save your puzzle preferences</li>
                <li><strong>Display Name:</strong> Remember your leaderboard name</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookie Duration</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Session Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are temporary and are deleted when you close your browser. They are used for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Maintaining your login session</li>
                <li>Storing temporary game state</li>
                <li>Security verification</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Persistent Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies remain on your device until they expire or are deleted. They are used for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Remembering your login for future visits</li>
                <li>Storing your preferences long-term</li>
                <li>Analytics and performance monitoring</li>
              </ul>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Our Cookie Retention Periods:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Authentication:</strong> 7 days (or until logout)</li>
                  <li>• <strong>Preferences:</strong> 1 year</li>
                  <li>• <strong>Analytics:</strong> 2 years</li>
                  <li>• <strong>Security:</strong> Session only</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                Most browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Block all cookies</li>
                <li>Accept only first-party cookies</li>
                <li>Delete existing cookies</li>
                <li>Receive notifications when cookies are set</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Browser-Specific Instructions</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Chrome</h4>
                  <p className="text-sm text-gray-700">Settings → Privacy and Security → Cookies and other site data</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Firefox</h4>
                  <p className="text-sm text-gray-700">Settings → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Safari</h4>
                  <p className="text-sm text-gray-700">Preferences → Privacy → Cookies and website data</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Edge</h4>
                  <p className="text-sm text-gray-700">Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">5.3 Impact of Blocking Cookies</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium mb-2">Important Notice</p>
                <p className="text-amber-700 text-sm">
                  Blocking essential cookies may prevent you from using certain features of our website, including logging in, saving preferences, and participating in leaderboards.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                Currently, we do not use third-party cookies for advertising or tracking. All cookies are set by our own domain (slitherlinks.com).
              </p>
              <p className="text-gray-700">
                If we introduce third-party services in the future, we will update this policy and notify you accordingly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Mobile Applications</h2>
              <p className="text-gray-700">
                This Cookie Policy applies to our web-based service accessed through browsers. If we develop mobile applications in the future, they may use different technologies for storing preferences and analytics.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies or this policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@slitherlinks.com<br />
                  <strong>Subject:</strong> Cookie Policy Inquiry<br />
                  <strong>Website:</strong> <a href="https://slitherlinks.com" className="text-blue-600 hover:text-blue-800 underline">slitherlinks.com</a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Related Policies</h2>
              <p className="text-gray-700">
                This Cookie Policy is part of our broader privacy framework. Please also review:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li><a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a> - How we handle your personal information</li>
                <li><a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a> - Rules for using our service</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Game
          </a>
          <div className="flex space-x-4 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}