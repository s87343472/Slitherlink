import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Slitherlinks - Slitherlink Puzzle Game',
  description: 'Privacy Policy for Slitherlinks.com - How we collect, use and protect your personal information while you play Slitherlink puzzles.',
  keywords: 'privacy policy, data protection, slitherlink, puzzle game, user data',
  openGraph: {
    title: 'Privacy Policy | Slitherlinks',
    description: 'Our commitment to protecting your privacy while playing Slitherlink puzzles',
    url: 'https://slitherlinks.com/privacy',
    type: 'website',
  }
};

export default function PrivacyPolicy() {
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
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 text-sm mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Slitherlinks.com ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our Slitherlink puzzle game service.
              </p>
              <p className="text-gray-700">
                We are committed to protecting your privacy and ensuring transparency about our data practices. By using our service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">When you create an account, we collect:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Email address (for account creation and communication)</li>
                <li>Display name (chosen by you for leaderboards)</li>
                <li>Password (encrypted and securely stored)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Game Data</h3>
              <p className="text-gray-700 mb-4">To provide game functionality, we collect:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Game scores and completion times</li>
                <li>Puzzle solving statistics</li>
                <li>Leaderboard rankings</li>
                <li>Game preferences and settings</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Technical Information</h3>
              <p className="text-gray-700 mb-4">We automatically collect:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Usage patterns and page views</li>
                <li>Performance metrics and error logs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Provide and maintain our game service</li>
                <li>Create and manage your user account</li>
                <li>Display leaderboards and rankings</li>
                <li>Generate daily challenges and puzzles</li>
                <li>Improve user experience and game features</li>
                <li>Communicate important updates and notifications</li>
                <li>Ensure security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li><strong>Public Leaderboards:</strong> Your display name and game scores are publicly visible on leaderboards</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Service Providers:</strong> With trusted partners who assist in operating our service (under strict confidentiality agreements)</li>
                <li><strong>Business Transfer:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure password hashing using industry standards</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Secure hosting infrastructure with monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us at privacy@slitherlinks.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                <li><strong>Performance Cookies:</strong> Help us analyze usage and improve our service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700">
                You can control cookie preferences through your browser settings. See our <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline">Cookie Policy</a> for more details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Game data and leaderboard information may be retained to maintain service integrity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Effective Date." Your continued use of the service after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@slitherlinks.com<br />
                  <strong>Website:</strong> <a href="https://slitherlinks.com" className="text-blue-600 hover:text-blue-800 underline">slitherlinks.com</a><br />
                  <strong>Response Time:</strong> We aim to respond within 30 days
                </p>
              </div>
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
            <a href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
            <a href="/cookies" className="text-gray-600 hover:text-gray-900">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}