export interface ProductColor {
  name: string;
  hex: string;
  bgClass: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  fitFeedback: 'Runs Small' | 'True to Size' | 'Runs Large' | 'Oversized';
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  category: 'hoodie' | 'jacket';
  subcategory: 'pullover' | 'zip_up' | 'bomber' | 'puffer' | 'techwear' | 'windbreaker';
  badge?:
    'BESTSELLER' | 'NEW DROP' | 'HEAVYWEIGHT 500 GSM' | 'LIMITED RUN' | 'WATERPROOF' | '30% OFF';
  description: string;
  fabricDetails: string[];
  features: string[];
  weightGsm: number;
  fit: 'Boxy Oversized' | 'Relaxed Fit' | 'Athletic Regular' | 'Ergonomic Techwear';
  colors: ProductColor[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  image: string;
  secondaryImage?: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  reviews?: ProductReview[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'pw-01',
    title: 'Shadow Matrix Heavyweight Hoodie',
    slug: 'shadow-matrix-heavyweight-hoodie',
    subtitle: '500 GSM French Terry Loopback Cotton',
    price: 98,
    originalPrice: 125,
    category: 'hoodie',
    subcategory: 'pullover',
    badge: 'BESTSELLER',
    description:
      'Engineered from dense 500 GSM organic French terry cotton with a dry hand feel. Designed with dropped shoulders, double-layered architectural hood, and concealed kangaroo pocket with hidden zippered compartments for your essentials.',
    fabricDetails: [
      '100% GOTS-Certified Heavyweight Organic Cotton',
      '500 GSM luxury loopback French terry knit',
      'Pre-shrunk vintage enzyme acid wash',
      'Double-needle reinforced tonal flatlock stitching',
    ],
    features: [
      'Architectural double-lined hood that stands erect without drawstrings',
      'Ergonomic ribbed side panels for maximum mobility',
      'Concealed internal kangaroo zip pocket for phone & cards',
      'Heavyweight 2x2 ribbing at hem and cuffs',
    ],
    weightGsm: 500,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Onyx Black', hex: '#0a0d14', bgClass: 'bg-[#0a0d14]' },
      { name: 'Acid Washed Charcoal', hex: '#262930', bgClass: 'bg-[#262930]' },
      { name: 'Heather Grey', hex: '#94a3b8', bgClass: 'bg-[#94a3b8]' },
      { name: 'Electric Violet', hex: '#6366f1', bgClass: 'bg-[#6366f1]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/hoodie-collection.jpg',
    secondaryImage:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    stock: 14,
    rating: 4.95,
    reviewsCount: 184,
    isFeatured: true,
    reviews: [
      {
        id: 'rev-1',
        author: 'Malik Z.',
        rating: 5,
        date: '2 days ago',
        comment:
          'The weight of this hoodie is unbelievable. 500 GSM feels substantial and cozy. The hood actually stays up without looking sloppy.',
        verified: true,
        fitFeedback: 'Oversized',
      },
      {
        id: 'rev-2',
        author: 'Kaelen R.',
        rating: 5,
        date: '1 week ago',
        comment:
          'Best streetwear hoodie I have ever owned. High quality French terry. Better than brands charging $250.',
        verified: true,
        fitFeedback: 'True to Size',
      },
    ],
  },
  {
    id: 'pw-02',
    title: 'Cyber-Spec Modular Techwear Jacket',
    slug: 'cyber-spec-modular-techwear-jacket',
    subtitle: '3-Layer DWR Weatherproof Tactical Shell',
    price: 185,
    originalPrice: 220,
    category: 'jacket',
    subcategory: 'techwear',
    badge: 'WATERPROOF',
    description:
      'A storm-grade modular tactical shell engineered with waterproof 3-layer breathable nylon membrane (20,000mm hydrostatic head). Features magnetic Fidlock front closures, YKK Aquaguard taped zippers, and ergonomic articulation sleeves.',
    fabricDetails: [
      '3-Layer Ripstop Cordura Nylon with DWR fluorocarbon-free coating',
      '20,000mm Waterproof / 15,000g Breathability rating',
      'Fully taped waterproof seam construction',
      'Laser-perforated storm vents on underarm gussets',
    ],
    features: [
      'German Fidlock magnetic quick-release chest buckles',
      'Dual multi-tier utility cargo front pockets with fleece hand warmers',
      'Packable helmet-compatible storm hood with 3-point cinch',
      'Removable cross-body interior carry sling',
    ],
    weightGsm: 380,
    fit: 'Ergonomic Techwear',
    colors: [
      { name: 'Stealth Black', hex: '#0f172a', bgClass: 'bg-[#0f172a]' },
      { name: 'Concrete Titanium', hex: '#64748b', bgClass: 'bg-[#64748b]' },
      { name: 'Deep Cyber Sage', hex: '#1e293b', bgClass: 'bg-[#1e293b]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/jacket-collection.jpg',
    secondaryImage: '/images/hero-banner.jpg',
    stock: 9,
    rating: 4.92,
    reviewsCount: 96,
    isFeatured: true,
    reviews: [
      {
        id: 'rev-3',
        author: 'Julian D.',
        rating: 5,
        date: '3 days ago',
        comment:
          'Rode through heavy rain in this and not a single drop got through. The Fidlock buckles feel so futuristic.',
        verified: true,
        fitFeedback: 'True to Size',
      },
    ],
  },
  {
    id: 'pw-03',
    title: 'Sub-Zero Arctic Down Puffer',
    slug: 'sub-zero-arctic-down-puffer',
    subtitle: '700-Fill Goose Alternative Down Thermal Baffle',
    price: 210,
    originalPrice: 260,
    category: 'jacket',
    subcategory: 'puffer',
    badge: 'NEW DROP',
    description:
      'Ultra-insulated boxy puffer designed for sub-zero climates down to -25°C. Packed with ethical 700-fill thermal down alternative enclosed in a matte windproof microfiber shell with storm collar and ribbed heat-seal cuffs.',
    fabricDetails: [
      'High-density Japanese matte microfiber shell (100% Recycled Poly)',
      '700 Fill-Power synthetic thermo-down insulation',
      'Wind-blocking TPU membrane layer',
      'Anti-static soft touch interior lining',
    ],
    features: [
      'Chunky two-way heavy molded zipper with magnetic storm flap',
      'Deep dual microfleece-lined handwarmer welt pockets',
      'Adjustable internal elastic bungee waist cinch system',
      'High standing storm collar with chin guard',
    ],
    weightGsm: 650,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Pitch Midnight', hex: '#07090e', bgClass: 'bg-[#07090e]' },
      { name: 'Alpine Bone White', hex: '#e2e8f0', bgClass: 'bg-[#e2e8f0]' },
      { name: 'Glacier Blue', hex: '#38bdf8', bgClass: 'bg-[#38bdf8]' },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80',
    stock: 7,
    rating: 4.88,
    reviewsCount: 71,
    isFeatured: true,
  },
  {
    id: 'pw-04',
    title: 'Vapour Cloud Sherpa Fleece Zip Hoodie',
    slug: 'vapour-cloud-sherpa-fleece-zip-hoodie',
    subtitle: '480 GSM High-Pile Sherpa & Brushed Terry Hybrid',
    price: 115,
    originalPrice: 140,
    category: 'hoodie',
    subcategory: 'zip_up',
    badge: 'LIMITED RUN',
    description:
      'The ultimate thermal comfort layer. Combines high-pile sherpa fleece interior with a dense brushed cotton outer shell. Features custom gunmetal matte two-way YKK hardware and oversized aesthetic drop shoulders.',
    fabricDetails: [
      'Heavyweight 480 GSM outer terry bonded with sherpa plush',
      'Super-soft anti-pill thermal sherpa fleece lining throughout body and hood',
      'Reinforced shoulder yoke and forearm panels',
    ],
    features: [
      'Two-way matte gunmetal industrial zipper',
      'Split kangaroo front pockets with reinforced bar-tacks',
      'Double-thick thermal cuffs that lock out chilly drafts',
      'Deep custom cut hood that envelopes comfortably',
    ],
    weightGsm: 480,
    fit: 'Relaxed Fit',
    colors: [
      { name: 'Bone White', hex: '#f1f5f9', bgClass: 'bg-[#f1f5f9]' },
      { name: 'Washed Charcoal', hex: '#334155', bgClass: 'bg-[#334155]' },
      { name: 'Camel Tan', hex: '#b45309', bgClass: 'bg-[#b45309]' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    image:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
    stock: 11,
    rating: 4.96,
    reviewsCount: 142,
    isFeatured: true,
  },
  {
    id: 'pw-05',
    title: 'Retro-Velocity Heavyweight Bomber Jacket',
    slug: 'retro-velocity-heavyweight-bomber-jacket',
    subtitle: 'Flight Satin Shell with Quilted Diamond Lining',
    price: 165,
    originalPrice: 195,
    category: 'jacket',
    subcategory: 'bomber',
    badge: 'BESTSELLER',
    description:
      'Inspired by vintage military flight outerwear, modernized with clean streetwear proportions. Features heavy water-repellent flight satin, 120g diamond quilt thermal padding, and signature utility arm pocket with red pull ribbon.',
    fabricDetails: [
      'Heavy duty military-grade 100% nylon flight satin',
      'Diamond quilted orange contrast emergency safety lining',
      '120g thermal insulation padding',
      'Heavy-duty knit rib collar, cuffs and waistband',
    ],
    features: [
      'Antiqued brass chunky YKK zip front closure',
      'Signature zipped sleeve utility pocket with double pen slots',
      'Two snap-button storm waist flap pockets',
      'Interior zippered chest security pocket',
    ],
    weightGsm: 520,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Vintage Olive', hex: '#3f4e3c', bgClass: 'bg-[#3f4e3c]' },
      { name: 'Pitch Black', hex: '#0a0d14', bgClass: 'bg-[#0a0d14]' },
      { name: 'Burgundy Crimson', hex: '#7f1d1d', bgClass: 'bg-[#7f1d1d]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
    stock: 18,
    rating: 4.91,
    reviewsCount: 110,
    isFeatured: true,
  },
  {
    id: 'pw-06',
    title: 'Ghost Mirage Vintage Distressed Hoodie',
    slug: 'ghost-mirage-vintage-distressed-hoodie',
    subtitle: 'Pigment Washed 460 GSM Distressed Raw Edge',
    price: 92,
    originalPrice: 115,
    category: 'hoodie',
    subcategory: 'pullover',
    badge: '30% OFF',
    description:
      'Each piece is individually hand-distressed and mineral-washed to give an authentic 10-year vintage patina. Features subtle micro-fraying at the pocket edges and cuffs, paired with heavy loopback cotton comfort.',
    fabricDetails: [
      '460 GSM 100% Combed Organic Cotton',
      'Mineral wash pigment dyeing process',
      'Micro-abrasion distressing along hems and seams',
    ],
    features: [
      'Unique wash pattern on every individual hoodie',
      'Wide boxy torso cut with dropped shoulder slope',
      'Clean unbranded minimalist exterior aesthetic',
      'Pre-shrunk for zero shrinkage after laundry',
    ],
    weightGsm: 460,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Sun-Bleached Sand', hex: '#d6d3d1', bgClass: 'bg-[#d6d3d1]' },
      { name: 'Mineral Charcoal', hex: '#44403c', bgClass: 'bg-[#44403c]' },
      { name: 'Faded Terracotta', hex: '#9a3412', bgClass: 'bg-[#9a3412]' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    image:
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
    stock: 8,
    rating: 4.87,
    reviewsCount: 88,
  },
  {
    id: 'pw-07',
    title: 'Aero-Breeze Ripstop Windbreaker',
    slug: 'aero-breeze-ripstop-windbreaker',
    subtitle: 'Ultralight Packable Weatherproof Shell',
    price: 125,
    originalPrice: 150,
    category: 'jacket',
    subcategory: 'windbreaker',
    badge: 'NEW DROP',
    description:
      'Featherlight yet tear-resistant ripstop nylon shell with 3M reflective accent piping. Packs completely into its own interior pocket for seamless travel. Features dual storm hood adjusters and ventilated back yoke.',
    fabricDetails: [
      'Diamond mini-ripstop nylon with moisture-shedding coating',
      'Total jacket weight under 260 grams',
      'Windproof micro-membrane construction',
    ],
    features: [
      '3M Scotchlite reflective stripes along chest and spine for night visibility',
      'Packs down into compact pouch with carabiner loop',
      'Concealed back ventilation panel to regulate core temperature',
      'Elastic cord lock hem cinching',
    ],
    weightGsm: 210,
    fit: 'Athletic Regular',
    colors: [
      { name: 'Reflective Silver & Black', hex: '#0f172a', bgClass: 'bg-[#0f172a]' },
      { name: 'Electric Cyan & Navy', hex: '#0284c7', bgClass: 'bg-[#0284c7]' },
      { name: 'Hazard Neon Orange', hex: '#ea580c', bgClass: 'bg-[#ea580c]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
    stock: 15,
    rating: 4.84,
    reviewsCount: 64,
  },
  {
    id: 'pw-08',
    title: 'Midnight Echo Heavy Full-Zip Hoodie',
    slug: 'midnight-echo-heavy-full-zip-hoodie',
    subtitle: 'Dual-Layered 520 GSM Brushed Fleece with Gunmetal Zip',
    price: 108,
    originalPrice: 135,
    category: 'hoodie',
    subcategory: 'zip_up',
    badge: 'HEAVYWEIGHT 500 GSM',
    description:
      'The heaviest zip-up hoodie on the market. Weighing in at 520 GSM, the Midnight Echo features an ultra-thick brushed interior, custom metal drawcord tips with engraved branding, and an oversized silhouette built for layering over shirts.',
    fabricDetails: [
      '520 GSM Ultra-Dense Brushed Cotton Fleece',
      'Pre-laundered for supreme softness',
      'Heavyweight 2x2 cotton/spandex rib trims',
    ],
    features: [
      'Custom heavy gunmetal steel zipper with smooth pull',
      'Reinforced metal eyelets and solid alloy aglets',
      'Deep split pouch pockets with hidden smartphone sleeves',
      'Triple-stitched shoulder seams for lifelong durability',
    ],
    weightGsm: 520,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Deep Obsidian', hex: '#090a0f', bgClass: 'bg-[#090a0f]' },
      { name: 'Gunmetal Slate', hex: '#334155', bgClass: 'bg-[#334155]' },
      { name: 'Forest Evergreen', hex: '#14532d', bgClass: 'bg-[#14532d]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
    stock: 12,
    rating: 4.97,
    reviewsCount: 219,
    isFeatured: true,
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All Outerwear', icon: 'Sparkles' },
  { id: 'hoodie', label: 'Heavyweight Hoodies', icon: 'Shirt' },
  { id: 'jacket', label: 'Jackets & Shells', icon: 'Shield' },
  { id: 'bestseller', label: 'Best Sellers', icon: 'Flame' },
  { id: 'new', label: 'New Drops', icon: 'Zap' },
];

export const SIZE_CHART = [
  { size: 'S', chestCm: 112, lengthCm: 68, sleeveCm: 61, recommendedHeight: '160 - 172 cm' },
  { size: 'M', chestCm: 118, lengthCm: 71, sleeveCm: 63, recommendedHeight: '170 - 178 cm' },
  { size: 'L', chestCm: 124, lengthCm: 74, sleeveCm: 65, recommendedHeight: '176 - 185 cm' },
  { size: 'XL', chestCm: 130, lengthCm: 77, sleeveCm: 67, recommendedHeight: '182 - 192 cm' },
  { size: 'XXL', chestCm: 136, lengthCm: 80, sleeveCm: 69, recommendedHeight: '190+ cm' },
];
