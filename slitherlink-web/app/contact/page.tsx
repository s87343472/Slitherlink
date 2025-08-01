import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Slitherlinks - Get Support & Share Feedback',
  description: 'Contact the Slitherlinks team for support, feedback, or inquiries. We\'re here to help with your Slitherlink puzzle gaming experience.',
  keywords: 'contact slitherlinks, support, feedback, help, customer service',
  openGraph: {
    title: 'Contact Us | Slitherlinks Support',
    description: 'Get in touch with our team for support, feedback, or questions',
    url: 'https://slitherlinks.com/contact',
    type: 'website',
  }
};

export default function Contact() {
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
            <span className="text-gray-900 font-medium">Contact</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            We'd love to hear from you! Whether you need help, have feedback, or just want to say hello.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              {/* General Support */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">General Support</h3>
                    <p className="text-gray-600 mt-1">For questions, technical issues, or account help</p>
                    <a 
                      href="mailto:support@slitherlinks.com" 
                      className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
                    >
                      support@slitherlinks.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Response time: Usually within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Feedback & Suggestions</h3>
                    <p className="text-gray-600 mt-1">Share your ideas for improvements or new features</p>
                    <a 
                      href="mailto:feedback@slitherlinks.com" 
                      className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
                    >
                      feedback@slitherlinks.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">We read every suggestion!</p>
                  </div>
                </div>
              </div>

              {/* Privacy & Legal */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Privacy & Legal</h3>
                    <p className="text-gray-600 mt-1">Data requests, privacy concerns, or legal inquiries</p>
                    <a 
                      href="mailto:privacy@slitherlinks.com" 
                      className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
                    >
                      privacy@slitherlinks.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Response time: Within 30 days as required by law</p>
                  </div>
                </div>
              </div>

              {/* Business Inquiries */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Inquiries</h3>
                    <p className="text-gray-600 mt-1">Partnerships, press, or business-related questions</p>
                    <a 
                      href="mailto:business@slitherlinks.com" 
                      className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
                    >
                      business@slitherlinks.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">For media kits and partnership opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Before You Email...</h3>
              <p className="text-blue-800 text-sm mb-3">
                You might find a quick answer in our resources:
              </p>
              <div className="space-y-2">
                <a href="/faq" className="block text-blue-600 hover:text-blue-800 font-medium text-sm">
                  → Check our FAQ for common questions
                </a>
                <a href="/about" className="block text-blue-600 hover:text-blue-800 font-medium text-sm">
                  → Learn more about how Slitherlinks works
                </a>
                <a href="/" className="block text-blue-600 hover:text-blue-800 font-medium text-sm">
                  → Try creating an account if you're having login issues
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            <form className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="support">Technical Support</option>
                    <option value="account">Account Issues</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="bug">Bug Report</option>
                    <option value="privacy">Privacy Concern</option>
                    <option value="business">Business Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Brief description of your message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-vertical"
                    placeholder="Please provide as much detail as possible. If reporting a technical issue, include your browser type and any error messages you saw."
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> This form is currently for display purposes. Please use the email addresses above to contact us directly. We'll implement a working contact form in a future update.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                  >
                    Form Coming Soon - Use Email Above
                  </button>
                </div>
              </div>
            </form>

            {/* Response Time Info */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">What to Expect</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• We typically respond within 24 hours for support issues</li>
                <li>• Complex technical problems may take 2-3 days to resolve</li>
                <li>• We'll always acknowledge receipt of your message</li>
                <li>• Privacy requests are handled within 30 days by law</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-gray-600 text-sm">
              Our team typically responds to support requests within 24 hours during business days.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Support</h3>
            <p className="text-gray-600 text-sm">
              We're committed to providing helpful, friendly support that solves your problems effectively.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Community Driven</h3>
            <p className="text-gray-600 text-sm">
              Your feedback shapes our platform. Many features come directly from user suggestions.
            </p>
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