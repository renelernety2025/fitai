'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { V2Layout } from '@/components/v2/V2Layout';
import { ErrorBoundary } from '@/components/v3/ErrorBoundary';
import { Logo } from '@/components/v3/Logo';
import { analytics } from '@/lib/analytics';
import { getOnboardingStatus } from '@/lib/api';

const ONBOARDING_EXEMPT_PATHS = ['/onboarding', '/settings', '/privacy', '/terms', '/ai-disclaimer'];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (ONBOARDING_EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;
    getOnboardingStatus()
      .then((status) => {
        if (!status.completed) router.replace('/onboarding');
      })
      .catch(() => {});
  }, [user, isLoading, pathname, router]);

  useEffect(() => {
    analytics.page(pathname);
  }, [pathname]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'pulse 2s ease-in-out infinite' }}>
          <Logo size={64} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <V2Layout>
      <ErrorBoundary>{children}</ErrorBoundary>
    </V2Layout>
  );
}
