'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

/**
 * Elfsight AI Chatbot Integration
 * Code provided by user:
 *   <script src="https://elfsightcdn.com/platform.js" async></script>
 *   <div class="elfsight-app-654b7ef6-6352-4679-b208-9fdafa5a2d64" data-elfsight-app-lazy></div>
 */
export function ElfsightChatbot() {
  useEffect(() => {
    // Re-initialize Elfsight widget when client mounts or navigates
    if (typeof window !== 'undefined' && (window as any).Elfsight) {
      try {
        (window as any).Elfsight?.initialize?.();
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" async />
      <div className="elfsight-app-654b7ef6-6352-4679-b208-9fdafa5a2d64" data-elfsight-app-lazy />
    </>
  );
}
