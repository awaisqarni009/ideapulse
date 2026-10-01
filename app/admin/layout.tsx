import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console — PULSEWEAR Apparel',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Completely separate admin panel environment
  return <div className="min-h-screen w-full bg-[#07090e] text-slate-100">{children}</div>;
}
