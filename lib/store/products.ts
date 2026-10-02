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
  badge?: 'Bestseller' | 'New drop' | 'Limited run' | 'Low stock';
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
    title: 'Shadow Matrix Hoodie',
    slug: 'shadow-matrix-hoodie',
    subtitle: '500 GSM loopback French terry',
    price: 98,
    originalPrice: 125,
    category: 'hoodie',
    subcategory: 'pullover',
    badge: 'Bestseller',
    description:
      'Engineered from dense 500 GSM organic French terry cotton with a dry hand feel. Designed with dropped shoulders, double-layered architectural hood, and concealed kangaroo pocket with hidden zippered compartments for essentials.',
    fabricDetails: [
      '100% GOTS-certified heavyweight organic cotton',
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
      { name: 'Onyx Black', hex: '#15181B', bgClass: 'bg-[#15181B]' },
      { name: 'Charcoal', hex: '#262930', bgClass: 'bg-[#262930]' },
      { name: 'Bone White', hex: '#DEDBD2', bgClass: 'bg-[#DEDBD2]' },
      { name: 'Heather Grey', hex: '#8A8F95', bgClass: 'bg-[#8A8F95]' },
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
          'The weight of this hoodie is unbelievable. 500 GSM feels substantial and holds its silhouette after multiple washes.',
        verified: true,
        fitFeedback: 'Oversized',
      },
      {
        id: 'rev-2',
        author: 'Kaelen R.',
        rating: 5,
        date: '1 week ago',
        comment:
          'Dense loopback French terry with zero sagging at the hem. Outstanding build quality.',
        verified: true,
        fitFeedback: 'True to Size',
      },
    ],
  },
  {
    id: 'pw-02',
    title: 'Cyber-Spec Modular Jacket',
    slug: 'cyber-spec-modular-jacket',
    subtitle: '3-layer DWR tactical weatherproof shell',
    price: 185,
    originalPrice: 220,
    category: 'jacket',
    subcategory: 'techwear',
    badge: 'Limited run',
    description:
      'Storm-grade modular tactical shell engineered with waterproof 3-layer breathable nylon membrane (20,000 mm hydrostatic head). Features magnetic quick-release chest closures, YKK Aquaguard taped zippers, and ergonomic articulation sleeves.',
    fabricDetails: [
      '3-layer ripstop Cordura nylon with DWR fluorocarbon-free coating',
      '20,000 mm waterproof / 15,000 g breathability rating',
      'Fully taped waterproof seam construction',
      'Laser-perforated storm vents on underarm gussets',
    ],
    features: [
      'Magnetic quick-release chest hardware',
      'Dual multi-tier utility cargo front pockets with fleece hand warmers',
      'Packable helmet-compatible storm hood with 3-point cinch',
      'Removable cross-body interior carry sling',
    ],
    weightGsm: 380,
    fit: 'Ergonomic Techwear',
    colors: [
      { name: 'Stealth Black', hex: '#15181B', bgClass: 'bg-[#15181B]' },
      { name: 'Titanium Slate', hex: '#8A8F95', bgClass: 'bg-[#8A8F95]' },
      { name: 'Deep Sage', hex: '#1F2327', bgClass: 'bg-[#1F2327]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/jacket-collection.jpg',
    secondaryImage: '/images/hero-banner.jpg',
    stock: 6,
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
          'Tested through a torrential downpour on my commute. Zero leakage, taped seams held perfectly.',
        verified: true,
        fitFeedback: 'True to Size',
      },
    ],
  },
  {
    id: 'pw-03',
    title: 'Sub-Zero Arctic Puffer',
    slug: 'sub-zero-arctic-puffer',
    subtitle: '700-fill thermal down alternative baffle',
    price: 210,
    originalPrice: 260,
    category: 'jacket',
    subcategory: 'puffer',
    badge: 'New drop',
    description:
      'Ultra-insulated boxy puffer designed for sub-zero climates down to -25°C. Packed with ethical 700-fill thermal down alternative enclosed in a matte windproof microfiber shell with storm collar and ribbed heat-seal cuffs.',
    fabricDetails: [
      'High-density Japanese matte microfiber shell (100% recycled poly)',
      '700 fill-power synthetic thermo-down insulation',
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
      { name: 'Midnight', hex: '#15181B', bgClass: 'bg-[#15181B]' },
      { name: 'Bone White', hex: '#DEDBD2', bgClass: 'bg-[#DEDBD2]' },
      { name: 'Storm Grey', hex: '#8A8F95', bgClass: 'bg-[#8A8F95]' },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
    stock: 7,
    rating: 4.88,
    reviewsCount: 71,
    isFeatured: true,
  },
  {
    id: 'pw-04',
    title: 'Vapour Cloud Sherpa Zip Hoodie',
    slug: 'vapour-cloud-sherpa-zip-hoodie',
    subtitle: '500 GSM loopback terry & high-pile sherpa',
    price: 115,
    originalPrice: 140,
    category: 'hoodie',
    subcategory: 'zip_up',
    badge: 'Low stock',
    description:
      'Thermal comfort layer combining high-pile sherpa fleece interior with a dense brushed 500 GSM cotton outer shell. Features custom gunmetal two-way hardware and oversized drop shoulders.',
    fabricDetails: [
      'Heavyweight 500 GSM outer terry bonded with sherpa plush',
      'Anti-pill thermal sherpa fleece lining throughout body and hood',
      'Reinforced shoulder yoke and forearm panels',
    ],
    features: [
      'Two-way matte gunmetal industrial zipper',
      'Split kangaroo front pockets with reinforced bar-tacks',
      'Double-thick thermal cuffs that lock out drafts',
      'Deep custom cut hood',
    ],
    weightGsm: 500,
    fit: 'Relaxed Fit',
    colors: [
      { name: 'Bone White', hex: '#DEDBD2', bgClass: 'bg-[#DEDBD2]' },
      { name: 'Washed Charcoal', hex: '#262930', bgClass: 'bg-[#262930]' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    image:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
    stock: 3,
    rating: 4.96,
    reviewsCount: 142,
    isFeatured: true,
  },
  {
    id: 'pw-05',
    title: 'Retro-Velocity Heavy Bomber',
    slug: 'retro-velocity-heavy-bomber',
    subtitle: 'Flight satin shell with orange safety lining',
    price: 165,
    originalPrice: 195,
    category: 'jacket',
    subcategory: 'bomber',
    badge: 'Bestseller',
    description:
      'Inspired by vintage flight outerwear, modernized with clean boxy proportions. Features heavy water-repellent flight satin, 120g diamond quilt thermal padding, and signature sleeve utility pocket.',
    fabricDetails: [
      'Heavy-duty 100% nylon flight satin shell',
      'Diamond quilted orange emergency safety lining',
      '120g thermal insulation padding',
      'Heavy-duty knit rib collar, cuffs and waistband',
    ],
    features: [
      'Antiqued brass chunky zip front closure',
      'Zipped sleeve utility pocket with double pen slots',
      'Two snap-button storm waist flap pockets',
      'Interior zippered chest security pocket',
    ],
    weightGsm: 520,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Vintage Olive', hex: '#3f4e3c', bgClass: 'bg-[#3f4e3c]' },
      { name: 'Pitch Black', hex: '#15181B', bgClass: 'bg-[#15181B]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
    secondaryImage:
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80',
    stock: 18,
    rating: 4.91,
    reviewsCount: 110,
    isFeatured: true,
  },
  {
    id: 'pw-06',
    title: 'Ghost Mirage Distressed Hoodie',
    slug: 'ghost-mirage-distressed-hoodie',
    subtitle: 'Mineral washed 500 GSM loopback cotton',
    price: 92,
    originalPrice: 115,
    category: 'hoodie',
    subcategory: 'pullover',
    badge: 'New drop',
    description:
      'Each piece is individually mineral-washed to give an authentic vintage patina. Features subtle micro-fraying at pocket edges and cuffs, paired with heavy 500 GSM loopback cotton comfort.',
    fabricDetails: [
      '500 GSM 100% combed organic cotton',
      'Mineral wash pigment dyeing process',
      'Micro-abrasion distressing along hems and seams',
    ],
    features: [
      'Unique wash pattern on every individual hoodie',
      'Wide boxy torso cut with dropped shoulder slope',
      'Clean unbranded minimalist exterior aesthetic',
      'Pre-shrunk for zero shrinkage after laundry',
    ],
    weightGsm: 500,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Bleached Sand', hex: '#DEDBD2', bgClass: 'bg-[#DEDBD2]' },
      { name: 'Mineral Charcoal', hex: '#262930', bgClass: 'bg-[#262930]' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    image:
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
    secondaryImage: '/images/hoodie-collection.jpg',
    stock: 8,
    rating: 4.87,
    reviewsCount: 88,
  },
  {
    id: 'pw-07',
    title: 'Aero-Breeze Ripstop Shell',
    slug: 'aero-breeze-ripstop-shell',
    subtitle: 'Ultralight packable weatherproof shell',
    price: 125,
    originalPrice: 150,
    category: 'jacket',
    subcategory: 'windbreaker',
    badge: 'New drop',
    description:
      'Featherlight yet tear-resistant ripstop nylon shell with reflective accent piping. Packs completely into its own interior pocket for travel. Features dual storm hood adjusters and ventilated back yoke.',
    fabricDetails: [
      'Diamond mini-ripstop nylon with moisture-shedding coating',
      'Total jacket weight under 260 grams',
      'Windproof micro-membrane construction',
    ],
    features: [
      'Reflective stripes along chest and spine for night visibility',
      'Packs down into compact pouch with carabiner loop',
      'Concealed back ventilation panel to regulate core temperature',
      'Elastic cord lock hem cinching',
    ],
    weightGsm: 260,
    fit: 'Athletic Regular',
    colors: [
      { name: 'Stealth Black', hex: '#15181B', bgClass: 'bg-[#15181B]' },
      { name: 'Electric Cyan', hex: '#06b6d4', bgClass: 'bg-[#06b6d4]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
    secondaryImage: '/images/jacket-collection.jpg',
    stock: 15,
    rating: 4.84,
    reviewsCount: 64,
  },
  {
    id: 'pw-08',
    title: 'Midnight Echo Full-Zip Hoodie',
    slug: 'midnight-echo-full-zip-hoodie',
    subtitle: 'Dual-layered 500 GSM loopback cotton with gunmetal zip',
    price: 108,
    originalPrice: 135,
    category: 'hoodie',
    subcategory: 'zip_up',
    badge: 'Bestseller',
    description:
      'Dense 500 GSM full-zip hoodie with brushed interior, custom metal drawcord tips with engraved branding, and an oversized silhouette built for layering.',
    fabricDetails: [
      '500 GSM dense organic loopback cotton fleece',
      'Pre-laundered for softness and zero shrinkage',
      'Heavyweight 2x2 cotton rib trims',
    ],
    features: [
      'Custom heavy gunmetal steel zipper with smooth pull',
      'Reinforced metal eyelets and solid alloy aglets',
      'Deep split pouch pockets with hidden smartphone sleeves',
      'Triple-stitched shoulder seams for lifelong durability',
    ],
    weightGsm: 500,
    fit: 'Boxy Oversized',
    colors: [
      { name: 'Onyx Black', hex: '#15181B', bgClass: 'bg-[#15181B]' },
      { name: 'Gunmetal Slate', hex: '#8A8F95', bgClass: 'bg-[#8A8F95]' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
    secondaryImage: '/images/hoodie-collection.jpg',
    stock: 12,
    rating: 4.97,
    reviewsCount: 219,
    isFeatured: true,
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hoodie', label: 'Hoodies' },
  { id: 'jacket', label: 'Jackets' },
  { id: 'bestseller', label: 'Best sellers' },
  { id: 'new', label: 'New drops' },
];

export const SIZE_CHART = [
  { size: 'S', chestCm: 112, lengthCm: 68, sleeveCm: 61, recommendedHeight: '160 - 172 cm' },
  { size: 'M', chestCm: 118, lengthCm: 71, sleeveCm: 63, recommendedHeight: '170 - 178 cm' },
  { size: 'L', chestCm: 124, lengthCm: 74, sleeveCm: 65, recommendedHeight: '176 - 185 cm' },
  { size: 'XL', chestCm: 130, lengthCm: 77, sleeveCm: 67, recommendedHeight: '182 - 192 cm' },
  { size: 'XXL', chestCm: 136, lengthCm: 80, sleeveCm: 69, recommendedHeight: '190+ cm' },
];
