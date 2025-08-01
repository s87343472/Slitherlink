import { Metadata } from 'next';

export const homeMetadata: Metadata = {
  title: "Play Slitherlink Puzzles Online - Daily Challenges & Global Leaderboards",
  description: "Experience the ultimate Slitherlink puzzle platform! Daily challenges, global leaderboards, competitive gameplay. Join thousands of players solving logic puzzles on slitherlinks.com.",
  keywords: "slitherlink puzzle, online puzzle game, daily puzzle challenge, logic puzzles, brain games, slitherlink solver, puzzle competition, 数回, puzzle leaderboard",
  openGraph: {
    title: "Slitherlinks - Ultimate Online Slitherlink Puzzle Platform",
    description: "Play Slitherlink puzzles with daily challenges, compete on global leaderboards, and join the ultimate puzzle gaming community!",
    url: "https://slitherlinks.com",
    type: "website",
    images: [
      {
        url: "https://slitherlinks.com/og-game.png",
        width: 1200,
        height: 630,
        alt: "Slitherlinks game interface showing puzzle solving"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Slitherlinks - Play Slitherlink Puzzles Online",
    description: "Daily challenges, global leaderboards, competitive Slitherlink puzzle gaming!",
    images: ["https://slitherlinks.com/og-game.png"]
  },
  alternates: {
    canonical: "https://slitherlinks.com"
  }
};