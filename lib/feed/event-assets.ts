/**
 * Eventify / IdeaPulse Feed Visual & Event Assets
 * Provides curated event photography, realistic event metadata,
 * category visuals, and fallback textures for the discovery feed.
 */

import type { Category } from '@/lib/constants';

export interface EventVisualMeta {
  imageUrl: string;
  category: Category | string;
  dateStr: string;
  timeStr: string;
  location: string;
  format: 'Keynote & Demo' | 'Live Showcase' | 'Hands-on Workshop' | 'Pitch Stage' | 'Symposium';
  attendeeCount: number;
  accessBadge: 'Free RSVP' | 'Community Grant' | 'Open Pass' | 'Limited Seats';
  isFeatured: boolean;
}

// Curated high-resolution Unsplash event photography by category
export const CATEGORY_EVENT_PHOTOS: Record<string, string[]> = {
  'developer-tools': [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', // Tech conference auditorium
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80', // Tech stage with presenter
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80', // Hackathon teamwork
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80', // Modern classroom / dev workshop
  ],
  ai: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80', // Futuristic tech summit
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80', // AI presentation & team demo
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80', // Cyber stage lighting
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80', // Hackathon lab workspace
  ],
  sustainability: [
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1000&q=80', // Clean energy conference
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80', // Ecology & environmental research
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80', // Green innovation expo
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80', // Solar panels & clean tech summit
  ],
  health: [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80', // Biotech laboratory research
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80', // Digital health medical forum
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80', // Clinical summit
  ],
  fintech: [
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80', // Fintech summit & analytics
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80', // Executive meeting & networking
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80', // Digital financial markets
  ],
  product: [
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80', // Keynote presentation stage
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80', // Executive business conference
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80', // Startup demo day
  ],
  social: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80', // Community celebration & banquet
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80', // Outdoor community mixer
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80', // Social unconference
  ],
  hardware: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80', // Robotics & IoT engineering
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', // Microchip & hardware expo
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80', // Maker faire demo
  ],
  education: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80', // Masterclass & education summit
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80', // Student collaborative lab
  ],
  other: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80', // Festival & creative stage lights
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80', // Gala gathering
  ],
};

const VENUES = [
  'Moscone Center · San Francisco, CA',
  'Javits Center · New York, NY',
  'Convention Centre · Dublin, Ireland',
  'ExCeL Exhibition Centre · London, UK',
  'Messe Berlin · Berlin, Germany',
  'International Congress Center · Tokyo',
  'Mainstage Stream · Global Interactive',
  'Marina Bay Sands Expo · Singapore',
  'Metropolitan Pavilion · Austin, TX',
  'Palais des Congrès · Paris, France',
];

const FORMATS: EventVisualMeta['format'][] = [
  'Keynote & Demo',
  'Live Showcase',
  'Hands-on Workshop',
  'Pitch Stage',
  'Symposium',
];

const ACCESS_TYPES: EventVisualMeta['accessBadge'][] = [
  'Free RSVP',
  'Community Grant',
  'Open Pass',
  'Limited Seats',
];

const TIMES = [
  '10:00 AM – 3:30 PM UTC',
  '01:00 PM – 5:00 PM EST',
  '09:30 AM – 2:00 PM PST',
  '02:00 PM – 7:00 PM CET',
  '11:00 AM – 4:00 PM SGT',
];

/**
 * Deterministic integer hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Derives realistic visual event metadata from an idea item
 */
export function getEventVisualMetadata(idea: {
  id: string;
  title: string;
  category: string;
  vote_count?: number;
  verified_vote_count?: number;
  created_at?: string;
}): EventVisualMeta {
  const hash = hashString(idea.id + idea.title);
  const catKey = idea.category in CATEGORY_EVENT_PHOTOS ? idea.category : 'other';
  const photoList = CATEGORY_EVENT_PHOTOS[catKey] ??
    CATEGORY_EVENT_PHOTOS['other'] ?? [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    ];

  const photoIndex = hash % photoList.length;
  const imageUrl = photoList[photoIndex] ?? photoList[0]!;

  const venueIndex = hash % VENUES.length;
  const formatIndex = hash % FORMATS.length;
  const accessIndex = (hash >> 2) % ACCESS_TYPES.length;
  const timeIndex = (hash >> 3) % TIMES.length;

  // Calculate dynamic date: based on created_at or future offset
  let dateStr = 'Upcoming Schedule';
  if (idea.created_at) {
    try {
      const createdDate = new Date(idea.created_at);
      // Offset by hash % 14 days into the cycle
      const eventDate = new Date(createdDate.getTime() + ((hash % 10) + 2) * 24 * 60 * 60 * 1000);
      dateStr = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      dateStr = 'Active Cycle Showcase';
    }
  }

  const votes = idea.vote_count ?? 0;
  const attendeeCount = Math.max(35, votes * 15 + (hash % 85) + 30);
  const isFeatured = (idea.verified_vote_count ?? 0) >= 30 || hash % 7 === 0;

  return {
    imageUrl,
    category: idea.category,
    dateStr,
    timeStr: TIMES[timeIndex] ?? '10:00 AM – 3:30 PM UTC',
    location: VENUES[venueIndex] ?? 'Mainstage Stream · Global Interactive',
    format: FORMATS[formatIndex] ?? 'Live Showcase',
    attendeeCount,
    accessBadge: ACCESS_TYPES[accessIndex] ?? 'Free RSVP',
    isFeatured,
  };
}

/**
 * Rich category info with icons, gradients, and descriptions
 */
export interface CategoryVisual {
  id: Category;
  label: string;
  iconName: string;
  gradient: string;
  borderTint: string;
  description: string;
}

export const CATEGORY_VISUALS: CategoryVisual[] = [
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    iconName: 'Cpu',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    borderTint: 'border-purple-500/30',
    description: 'Neural models, LLM agents, computer vision & deep learning',
  },
  {
    id: 'developer-tools',
    label: 'Developer Tools',
    iconName: 'Code2',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    borderTint: 'border-blue-500/30',
    description: 'Compilers, SDKs, dev environments & testing frameworks',
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    iconName: 'Leaf',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderTint: 'border-emerald-500/30',
    description: 'Clean energy, carbon tracking, circular economy & agritech',
  },
  {
    id: 'fintech',
    label: 'Fintech & Web3',
    iconName: 'Coins',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderTint: 'border-amber-500/30',
    description: 'Decentralized finance, micropayments & fraud mitigation',
  },
  {
    id: 'health',
    label: 'Health & Biotech',
    iconName: 'HeartPulse',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    borderTint: 'border-rose-500/30',
    description: 'Digital therapeutics, diagnostic telemetry & genomics',
  },
  {
    id: 'hardware',
    label: 'Hardware & IoT',
    iconName: 'Radio',
    gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent',
    borderTint: 'border-sky-500/30',
    description: 'Embedded microcontrollers, LoRaWAN & smart robotics',
  },
  {
    id: 'product',
    label: 'Product & SaaS',
    iconName: 'LayoutGrid',
    gradient: 'from-indigo-500/20 via-violet-500/10 to-transparent',
    borderTint: 'border-indigo-500/30',
    description: 'Next-gen SaaS, productivity tools & enterprise platforms',
  },
  {
    id: 'social',
    label: 'Social & Community',
    iconName: 'Users',
    gradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    borderTint: 'border-teal-500/30',
    description: 'Decentralized social graphs, community governance & DAO tools',
  },
  {
    id: 'education',
    label: 'Education',
    iconName: 'GraduationCap',
    gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    borderTint: 'border-yellow-500/30',
    description: 'Adaptive curriculum, open science & interactive learning',
  },
  {
    id: 'other',
    label: 'Other Innovations',
    iconName: 'Sparkles',
    gradient: 'from-slate-500/20 via-zinc-500/10 to-transparent',
    borderTint: 'border-slate-500/30',
    description: 'Cross-disciplinary experiments and uncategorized breakthroughs',
  },
];
