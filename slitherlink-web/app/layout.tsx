import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://slitherlinks.com' : 'http://localhost:3000'),
  title: {
    default: "Slitherlinks - The Ultimate Slitherlink Puzzle Platform",
    template: "%s | Slitherlinks"
  },
  description: "Play Slitherlink puzzles online! Daily challenges, global leaderboards, and competitive puzzle solving. Join thousands of players on the premier Slitherlink platform at slitherlinks.com.",
  keywords: [
    "slitherlink",
    "puzzle games", 
    "logic puzzles",
    "daily puzzles",
    "online games",
    "brain games",
    "数回",
    "slitherlink solver",
    "puzzle competition",
    "leaderboard games"
  ].join(", "),
  authors: [{ name: "Slitherlinks Team" }],
  creator: "Slitherlinks",
  publisher: "Slitherlinks",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://slitherlinks.com",
    title: "Slitherlinks - The Ultimate Slitherlink Puzzle Platform",
    description: "Play Slitherlink puzzles online with daily challenges, global leaderboards, and competitive gameplay. Join the ultimate puzzle gaming community!",
    siteName: "Slitherlinks",
    images: [
      {
        url: "/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Slitherlinks - Slitherlink Puzzle Game Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Slitherlinks - Ultimate Slitherlink Puzzle Platform",
    description: "Play Slitherlink puzzles with daily challenges, global leaderboards, and competitive gameplay!",
    images: ["/twitter-card-1200x628.png"]
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    yandex: process.env.YANDEX_VERIFICATION_ID,
    yahoo: process.env.YAHOO_VERIFICATION_ID,
  },
  alternates: {
    canonical: "https://slitherlinks.com",
    languages: {
      'en': 'https://slitherlinks.com',
      'zh': 'https://slitherlinks.com/zh'
    }
  },
  category: "Games"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Slitherlinks",
    "description": "The ultimate online platform for Slitherlink puzzle enthusiasts with daily challenges, global leaderboards, and competitive gameplay.",
    "url": "https://slitherlinks.com",
    "applicationCategory": "GameApplication",
    "genre": "Logic Puzzle",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Slitherlinks Team"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Slitherlinks"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "ratingCount": "1247"
    },
    "featureList": [
      "Daily Slitherlink challenges",
      "Global leaderboards",
      "Multiple difficulty levels",
      "Real-time competitive gameplay",
      "Mobile-responsive design",
      "User account system"
    ]
  };

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="64x64" href="/apple-touch-icon.png" />
        
        {/* Web app manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://slitherlinks.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        
        {/* Cloudflare Turnstile */}
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
