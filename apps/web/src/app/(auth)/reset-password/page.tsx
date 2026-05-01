'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './reset-password-form';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-0)' }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
