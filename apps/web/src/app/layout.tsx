import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ServiceWorkerRegistrar } from '@/components/layout/ServiceWorkerRegistrar';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitAI — AI Personal Trainer',
  description: 'AI-powered fitness platform. Personalized workout plans, real-time coaching, nutrition tracking, and social fitness community.',
  keywords: ['fitness', 'AI trainer', 'workout', 'nutrition', 'gym', 'health'],
  openGraph: {
    title: 'FitAI — AI Personal Trainer',
    description: 'Your AI fitness coach. Workout plans, nutrition, social challenges.',
    url: 'https://fitai.bfevents.cz',
    siteName: 'FitAI',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'FitAI', description: 'AI-powered fitness platform' },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FitAI',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
