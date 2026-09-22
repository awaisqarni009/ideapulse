'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Global Error Boundary per Next.js App Router and TASKS.md [T-7.10]
 * Renders dark canvas with inline styling to ensure zero style dependency failures.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Fatal Root Application Error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          backgroundColor: '#0B0F19',
          color: '#F1F4FB',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#131826',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#F1F4FB',
              marginBottom: '0.75rem',
            }}
          >
            Fatal Error
          </div>
          <p
            style={{
              fontSize: '14px',
              color: '#A9B2C8',
              lineHeight: '1.5',
              marginBottom: '1.5rem',
            }}
          >
            The root application layout failed to render. Please try reloading the application.
          </p>

          {error?.digest && (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#6E778F',
                marginBottom: '1.5rem',
              }}
            >
              Digest: {error.digest}
            </div>
          )}

          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.625rem 1.5rem',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload IdeaPulse
          </button>
        </div>
      </body>
    </html>
  );
}
