import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'IdeaPulse — Discover Events & Innovations',
  description:
    'A fraud-resistant product idea validation engine. One idea per author per cycle, five votes per 24 hours, and automated weekly rewards for top community proposals.',
};

export const dynamic = 'force-dynamic';

/**
 * Root Route (/) redirects directly to the primary discovery experience at /feed.
 */
export default function HomePage() {
  redirect('/feed');
}
