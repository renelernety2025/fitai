'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { V2Layout } from '@/components/v2/V2Layout';
import { ErrorBoundary } from '@/components/v3/ErrorBoundary';
import { analytics } from '@/lib/analytics';

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
    analytics.page(pathname);
  }, [pathname]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }} />
    );
  }

  if (!user) return null;

  return (
    <V2Layout>
      <ErrorBoundary>{children}</ErrorBoundary>
    </V2Layout>
  );
}
