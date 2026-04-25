'use client';

import React from 'react';
import { Nav, Hero, Marquee, Coaches } from './sections-top';
import { FeatureGrid, MetricsBar, Pricing, Footer } from './sections-bottom';

export default function LandingV3Page() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,400&family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg-0: #0B0907;
          --bg-1: #100E0B;
          --bg-2: #181511;
          --bg-3: #221E18;
          --bg-4: #2D2920;
          --bg-card: #14110D;
          --bg-glass: rgba(245, 237, 224, 0.035);
          --bg-glass-hover: rgba(245, 237, 224, 0.06);
          --stroke-1: rgba(245, 237, 224, 0.06);
          --stroke-2: rgba(245, 237, 224, 0.10);
          --stroke-3: rgba(245, 237, 224, 0.16);
          --text-1: #F5EDE0;
          --text-2: #BFB4A2;
          --text-3: #847B6B;
          --text-4: #4A4338;
          --accent: #E85D2C;
          --accent-hot: #F47A4D;
          --accent-deep: #B0411D;
          --accent-glow: rgba(232, 93, 44, 0.32);
          --sage: #A8B89A;
          --sage-deep: #6B7C5E;
          --clay: #D4A88C;
          --clay-deep: #8A6850;
          --positive: #A8B89A;
          --warning: #E5B45A;
          --danger: #C84A2C;
          --d-1: #1A1612;
          --d-2: #2B231A;
          --d-3: #5C3D27;
          --d-4: #9A5A33;
          --d-5: #E85D2C;
          --font-display: "Fraunces", Georgia, serif;
          --font-display-alt: "Inter Tight", -apple-system, sans-serif;
          --font-text: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          --font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
          --r-xs: 6px;
          --r-sm: 10px;
          --r-md: 14px;
          --r-lg: 20px;
          --r-xl: 28px;
          --r-pill: 9999px;
          --shadow-card: 0 1px 0 rgba(245,237,224,0.04) inset, 0 24px 60px -20px rgba(0,0,0,0.55);
          --shadow-pop: 0 30px 80px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(245,237,224,0.06);
          --shadow-ember: 0 20px 60px -16px rgba(232,93,44,0.32);
        }

        .lv3-root {
          background: var(--bg-0);
          color: var(--text-1);
          font-family: var(--font-text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          min-height: 100vh;
        }
        .lv3-root img { display: block; max-width: 100%; }
        .lv3-root *, .lv3-root *::before, .lv3-root *::after { box-sizing: border-box; }

        .lv3-display-1 {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: clamp(56px, 8vw, 124px);
          line-height: 0.96;
          letter-spacing: -0.025em;
          color: var(--text-1);
        }
        .lv3-display-2 {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: clamp(40px, 5vw, 72px);
          line-height: 1.0;
          letter-spacing: -0.02em;
          color: var(--text-1);
        }
        .lv3-eyebrow {
          font-family: var(--font-text);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-3);
        }
        .lv3-numeric {
          font-family: var(--font-display);
          font-weight: 300;
          font-style: italic;
          font-feature-settings: "tnum", "lnum";
          font-variant-numeric: tabular-nums lining-nums;
          color: var(--text-1);
        }
        .lv3-meta {
          font-size: 11px;
          color: var(--text-3);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .lv3-card {
          background: var(--bg-card);
          border: 1px solid var(--stroke-1);
          border-radius: var(--r-lg);
        }

        .lv3-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 26px;
          background: var(--text-1);
          color: var(--bg-0);
          border-radius: var(--r-pill);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          border: none;
          cursor: pointer;
          font-family: var(--font-text);
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .lv3-btn-primary:hover { background: #fff; }

        .lv3-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border: 1px solid var(--stroke-2);
          border-radius: var(--r-pill);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--text-1);
          background: none;
          cursor: pointer;
          font-family: var(--font-text);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .lv3-btn-outline:hover {
          border-color: var(--stroke-3);
          background: var(--bg-glass);
        }

        .lv3-marquee-track {
          display: flex;
          gap: 56px;
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--text-3);
          white-space: nowrap;
          animation: lv3-marquee 50s linear infinite;
        }
        @keyframes lv3-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }

        ::selection { background: var(--accent); color: var(--text-1); }
      `}</style>
      <div className="lv3-root">
        <Nav />
        <Hero />
        <Marquee />
        <Coaches />
        <FeatureGrid />
        <MetricsBar />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}
