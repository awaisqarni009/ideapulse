import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ideapulse.dev';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    { url: `${baseUrl}/rules`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const admin = createAdminClient();

    // Query published ideas
    const { data: ideas } = await admin
      .from('ideas')
      .select('slug, updated_at')
      .eq('status', 'published')
      .limit(500);

    const ideaRoutes: MetadataRoute.Sitemap = (ideas || []).map((idea) => ({
      url: `${baseUrl}/idea/${idea.slug}`,
      lastModified: new Date(idea.updated_at),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    // Query cycles
    const { data: cycles } = await admin
      .from('cycles')
      .select('cycle_number, ends_at')
      .order('cycle_number', { ascending: false })
      .limit(100);

    const cycleRoutes: MetadataRoute.Sitemap = (cycles || []).map((cycle) => ({
      url: `${baseUrl}/cycles/${cycle.cycle_number}`,
      lastModified: new Date(cycle.ends_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...ideaRoutes, ...cycleRoutes];
  } catch {
    return staticRoutes;
  }
}
