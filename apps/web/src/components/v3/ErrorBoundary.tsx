'use client';

import React, { Component } from 'react';
import { Button } from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ErrorBoundary extends Component<
  { children: any; fallback?: any },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/analytics/event`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'client_error',
          properties: {
            message: error.message,
            stack: error.stack?.slice(0, 500),
            componentStack: info?.componentStack?.slice(0, 500),
          },
        }),
      }).catch(() => {});
    } catch {
      // Fire and forget
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: 64,
              textAlign: 'center',
              background: 'var(--bg-0)',
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h2 className="v3-display-3" style={{ marginBottom: 12 }}>
              Neco se pokazilo
            </h2>
            <p
              className="v3-body"
              style={{ color: 'var(--text-2)', marginBottom: 24 }}
            >
              Omlouvame se. Zkuste obnovit stranku.
            </p>
            <Button
              variant="accent"
              onClick={() => window.location.reload()}
            >
              Obnovit stranku
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
