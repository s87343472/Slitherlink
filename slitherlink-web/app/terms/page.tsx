import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Slitherlinks - Slitherlink Puzzle Game',
  description: 'Terms of Service for Slitherlinks.com - Rules and guidelines for using our Slitherlink puzzle game platform.',
  keywords: 'terms of service, user agreement, slitherlink, puzzle game, rules',
  openGraph: {
    title: 'Terms of Service | Slitherlinks',
    description: 'Terms and conditions for using Slitherlinks puzzle game platform',
    url: 'https://slitherlinks.com/terms',
    type: 'website',
  }
};

export default function TermsOfService() {
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
            <span className="text-gray-900 font-medium">Terms of Service</span>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 text-sm mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Slitherlinks.com ("Service," "we," "us," or "our"). These Terms of Service ("Terms") govern your use of our Slitherlink puzzle game platform and related services.
              </p>
              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Slitherlinks.com provides an online platform for playing Slitherlink puzzles, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Daily challenge puzzles with rotating difficulty levels</li>
                <li>User account creation and management</li>
                <li>Global leaderboards and ranking systems</li>
                <li>Puzzle library with multiple difficulty levels</li>
                <li>Performance tracking and statistics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To access certain features, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Account Responsibility</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One account per person; multiple accounts are prohibited</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in harmful activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Permitted Uses</h3>
              <p className="text-gray-700 mb-4">You may use our Service to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Play Slitherlink puzzles for personal entertainment</li>
                <li>Participate in daily challenges and competitions</li>
                <li>Share your achievements on social media</li>
                <li>Provide feedback and suggestions</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Use automated tools, bots, or scripts to play puzzles</li>
                <li>Attempt to reverse engineer or hack our systems</li>
                <li>Share account credentials or transfer accounts</li>
                <li>Submit false or misleading information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use offensive or inappropriate display names</li>
                <li>Attempt to manipulate leaderboards or rankings</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Leaderboards and Fair Play</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Fair Play Policy</h3>
              <p className="text-gray-700 mb-4">
                We are committed to maintaining fair competition. Any attempt to cheat, use unauthorized assistance, or manipulate the system will result in disqualification and potential account termination.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Leaderboard Rules</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Only legitimate puzzle completions count toward rankings</li>
                <li>Solution viewing disqualifies scores from competitive leaderboards</li>
                <li>We reserve the right to investigate suspicious scores</li>
                <li>Rankings may be adjusted to maintain competitive integrity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1 Our Content</h3>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of our Service, including but not limited to puzzles, software, graphics, and text, are owned by us and protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.2 User Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you create, but you grant us a worldwide, royalty-free license to use, display, and distribute your display name and game achievements for Service operation.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.3 Slitherlink Puzzles</h3>
              <p className="text-gray-700">
                Slitherlink is a puzzle genre in the public domain. Our specific puzzle implementations and arrangements are our proprietary creation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>, which explains how we collect, use, and protect your information. By using our Service, you agree to our privacy practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">8.1 Service Provision</h3>
              <p className="text-gray-700 mb-4">
                We strive to provide uninterrupted service, but we cannot guarantee 100% uptime. We may temporarily suspend the Service for maintenance, updates, or technical issues.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">8.2 Changes to Service</h3>
              <p className="text-gray-700">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. We will provide reasonable notice for significant changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">9.1 Service Warranty</h3>
              <p className="text-gray-700 mb-4">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be error-free or uninterrupted.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">9.2 Limitation of Liability</h3>
              <p className="text-gray-700">
                To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or violation of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">11. Dispute Resolution</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">11.1 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">11.2 Dispute Resolution Process</h3>
              <p className="text-gray-700">
                Before pursuing legal action, we encourage you to contact us at support@slitherlinks.com to resolve disputes amicably.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. Material changes will be communicated through the Service or via email. Your continued use after changes indicates acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms or our Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@slitherlinks.com<br />
                  <strong>Legal:</strong> legal@slitherlinks.com<br />
                  <strong>Website:</strong> <a href="https://slitherlinks.com" className="text-blue-600 hover:text-blue-800 underline">slitherlinks.com</a><br />
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms, together with our Privacy Policy and any additional agreements, constitute the entire agreement between you and us regarding the Service.
              </p>
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
            <a href="/cookies" className="text-gray-600 hover:text-gray-900">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}