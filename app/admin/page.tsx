'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS, Product, ProductColor } from '@/lib/store/products';
import {
  Shield,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Plus,
  Check,
  ArrowLeft,
  RefreshCw,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Upload,
  Image as ImageIcon,
  Percent,
  Tag,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  ExternalLink,
  Lock,
  Phone,
  Mail,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Award,
  Clock,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff' | 'vip' | 'customer';
  status: 'active' | 'suspended';
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  avatarUrl?: string;
}

export interface AdminOrder {
  orderId: string;
  date: string;
  customer: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  items: {
    id: string;
    title: string;
    size: string;
    color?: { name: string };
    quantity: number;
    price: number;
    image?: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  usedCount: number;
  expiryDate: string;
  status: 'active' | 'expired';
}

// Preset streetwear images for 1-click addition
const PRESET_IMAGES = [
  { label: 'Hoodie Studio Cutout', url: '/images/hoodie-collection.jpg' },
  { label: 'Techwear Modular Jacket', url: '/images/jacket-collection.jpg' },
  { label: 'Hero 3D Streetwear Model', url: '/images/streetwear-hero-model.png' },
  {
    label: 'Back View Editorial',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Fabric Macro Close-Up',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Streetwear Model Urban',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
  },
];

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    fullName: 'Awais Qarni',
    username: 'awais_qarni',
    email: 'awais@pulsewear.store',
    phone: '+92 300 8472910',
    role: 'admin',
    status: 'active',
    ordersCount: 8,
    totalSpent: 920.0,
    joinedDate: 'Jan 12, 2026',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr-2',
    fullName: 'Hamza Tariq',
    username: 'hamza_t',
    email: 'hamza@example.com',
    phone: '+92 321 9876543',
    role: 'vip',
    status: 'active',
    ordersCount: 4,
    totalSpent: 450.0,
    joinedDate: 'Feb 18, 2026',
  },
  {
    id: 'usr-3',
    fullName: 'Bilal Ahmed',
    username: 'bilal_street',
    email: 'bilal@pulse.io',
    phone: '+92 333 4567890',
    role: 'customer',
    status: 'active',
    ordersCount: 2,
    totalSpent: 234.4,
    joinedDate: 'Mar 02, 2026',
  },
  {
    id: 'usr-4',
    fullName: 'Sara Khan',
    username: 'sara_k',
    email: 'sara.k@gmail.com',
    phone: '+92 345 1122334',
    role: 'vip',
    status: 'active',
    ordersCount: 5,
    totalSpent: 560.0,
    joinedDate: 'Apr 14, 2026',
  },
  {
    id: 'usr-5',
    fullName: 'Zaid Malik',
    username: 'zaid_m',
    email: 'zaid@techwear.pk',
    phone: '+92 301 9988776',
    role: 'customer',
    status: 'suspended',
    ordersCount: 1,
    totalSpent: 98.0,
    joinedDate: 'May 09, 2026',
  },
  {
    id: 'usr-6',
    fullName: 'Ayesha Noor',
    username: 'ayesha_ops',
    email: 'ayesha@pulsewear.store',
    phone: '+92 305 6677889',
    role: 'staff',
    status: 'active',
    ordersCount: 3,
    totalSpent: 310.0,
    joinedDate: 'Jun 21, 2026',
  },
];

const INITIAL_DEMO_ORDERS: AdminOrder[] = [
  {
    orderId: 'PW-940218',
    date: 'Oct 1, 2026',
    customer: {
      fullName: 'Hamza Tariq',
      username: 'hamza_t',
      email: 'hamza@example.com',
      phone: '+92 03001234567',
      address: 'Street 4, F-8/3, Islamabad',
    },
    paymentMethod: 'Cash on Delivery (COD)',
    items: [
      {
        id: 'item-1',
        title: 'Shadow Matrix Heavyweight Hoodie',
        size: 'L',
        color: { name: 'Onyx Black' },
        quantity: 1,
        price: 98,
        image: '/images/hoodie-collection.jpg',
      },
    ],
    subtotal: 98,
    discount: 0,
    shipping: 12,
    total: 110,
    status: 'Processing',
  },
  {
    orderId: 'PW-881923',
    date: 'Sep 30, 2026',
    customer: {
      fullName: 'Bilal Ahmed',
      username: 'bilal_street',
      email: 'bilal@pulse.io',
      phone: '+92 03219876543',
      address: 'DHA Phase 5, Lahore',
    },
    paymentMethod: 'Credit Card',
    items: [
      {
        id: 'item-2',
        title: 'Cyber-Spec Modular Techwear Jacket',
        size: 'XL',
        color: { name: 'Stealth Black' },
        quantity: 1,
        price: 185,
        image: '/images/jacket-collection.jpg',
      },
      {
        id: 'item-3',
        title: 'Midnight Echo Heavy Full-Zip Hoodie',
        size: 'XL',
        color: { name: 'Deep Obsidian' },
        quantity: 1,
        price: 108,
        image: '/images/hoodie-collection.jpg',
      },
    ],
    subtotal: 293,
    discount: 58.6,
    shipping: 0,
    total: 234.4,
    status: 'Shipped',
  },
];

const INITIAL_DISCOUNTS: DiscountCode[] = [
  {
    id: 'disc-1',
    code: 'PULSE20',
    type: 'percentage',
    value: 20,
    minSpend: 80,
    usedCount: 42,
    expiryDate: 'Dec 31, 2026',
    status: 'active',
  },
  {
    id: 'disc-2',
    code: 'DROP26',
    type: 'fixed',
    value: 25,
    minSpend: 150,
    usedCount: 19,
    expiryDate: 'Nov 15, 2026',
    status: 'active',
  },
  {
    id: 'disc-3',
    code: 'FREESHIP',
    type: 'fixed',
    value: 12,
    minSpend: 100,
    usedCount: 88,
    expiryDate: 'Dec 31, 2026',
    status: 'active',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'users' | 'orders' | 'discounts'
  >('overview');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [usersList, setUsersList] = useState<AdminUser[]>(INITIAL_USERS);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>(INITIAL_DEMO_ORDERS);
  const [discountsList, setDiscountsList] = useState<DiscountCode[]>(INITIAL_DISCOUNTS);

  // Products Tab View Mode: 'table' | 'grid'
  const [productViewMode, setProductViewMode] = useState<'table' | 'grid'>('table');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'hoodie' | 'jacket'>(
    'all',
  );

  // Users Tab Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<
    'all' | 'admin' | 'staff' | 'vip' | 'customer'
  >('all');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // ADD / EDIT PRODUCT MODAL STATE (UP TO 5 IMAGES)
  // ==========================================
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'hoodie' | 'jacket'>('hoodie');
  const [prodSubcategory, setProdSubcategory] = useState<
    'pullover' | 'zip_up' | 'bomber' | 'puffer' | 'techwear' | 'windbreaker'
  >('pullover');
  const [prodPrice, setProdPrice] = useState('98');
  const [prodComparePrice, setProdComparePrice] = useState('125');
  const [prodDiscountBadge, setProdDiscountBadge] = useState('20% OFF');
  const [prodGsm, setProdGsm] = useState('500');
  const [prodStock, setProdStock] = useState('24');
  const [prodFit, setProdFit] = useState<
    'Boxy Oversized' | 'Relaxed Fit' | 'Athletic Regular' | 'Ergonomic Techwear'
  >('Boxy Oversized');
  const [prodBadge, setProdBadge] = useState<
    'Bestseller' | 'New drop' | 'Limited run' | 'Low stock' | 'Sale' | ''
  >('New drop');
  const [prodDescription, setProdDescription] = useState(
    'Heavyweight architectural cut with reinforced seams and pre-shrunk French terry.',
  );

  // UP TO 5 IMAGES: Slot 0 = Primary, Slots 1-4 = Gallery
  const [prodImages, setProdImages] = useState<string[]>([
    '/images/hoodie-collection.jpg',
    '/images/jacket-collection.jpg',
    '/images/streetwear-hero-model.png',
  ]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // SIZES & COLORS
  const [selectedSizes, setSelectedSizes] = useState<('S' | 'M' | 'L' | 'XL' | 'XXL')[]>([
    'S',
    'M',
    'L',
    'XL',
  ]);

  // ==========================================
  // ADD USER MODAL STATE
  // ==========================================
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'vip' | 'staff' | 'admin'>(
    'customer',
  );
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'suspended'>('active');

  // ==========================================
  // ADD DISCOUNT MODAL STATE
  // ==========================================
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [newDiscCode, setNewDiscCode] = useState('');
  const [newDiscType, setNewDiscType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscValue, setNewDiscValue] = useState('20');
  const [newDiscMinSpend, setNewDiscMinSpend] = useState('80');

  // ==========================================
  // LOCAL STORAGE SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    try {
      // 1. Load Custom Products
      const savedProducts = localStorage.getItem('pulsewear_custom_products');
      if (savedProducts) {
        const parsed: Product[] = JSON.parse(savedProducts);
        const customIds = new Set(parsed.map((p) => p.id));
        const filteredDefault = PRODUCTS.filter((p) => !customIds.has(p.id));
        setProductsList([...parsed, ...filteredDefault]);
      }

      // 2. Load Users
      const savedUsers = localStorage.getItem('pulsewear_users_v1');
      if (savedUsers) {
        setUsersList(JSON.parse(savedUsers));
      }

      // 3. Load Orders
      const savedOrders = localStorage.getItem('pulsewear_orders_v1');
      if (savedOrders) {
        const parsedOrders: AdminOrder[] = JSON.parse(savedOrders);
        const mapped = parsedOrders.map((o) => ({ ...o, status: o.status || 'Processing' }));
        setOrdersList([...mapped, ...INITIAL_DEMO_ORDERS]);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveProductsToStorage = (updated: Product[]) => {
    setProductsList(updated);
    try {
      localStorage.setItem('pulsewear_custom_products', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const saveUsersToStorage = (updated: AdminUser[]) => {
    setUsersList(updated);
    try {
      localStorage.setItem('pulsewear_users_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // ==========================================
  // PRODUCT ACTIONS
  // ==========================================
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdSubtitle('500 GSM loopback French terry');
    setProdCategory('hoodie');
    setProdSubcategory('pullover');
    setProdPrice('98');
    setProdComparePrice('125');
    setProdDiscountBadge('20% OFF');
    setProdGsm('500');
    setProdStock('24');
    setProdFit('Boxy Oversized');
    setProdBadge('New drop');
    setProdDescription(
      'Heavyweight architectural cut with reinforced seams and pre-shrunk French terry.',
    );
    setProdImages(['/images/hoodie-collection.jpg']);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdTitle(prod.title);
    setProdSubtitle(prod.subtitle || '');
    setProdCategory(prod.category);
    setProdSubcategory(prod.subcategory || 'pullover');
    setProdPrice(prod.price.toString());
    setProdComparePrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setProdDiscountBadge(
      prod.discountOffer ||
        (prod.originalPrice
          ? `${Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF`
          : ''),
    );
    setProdGsm(prod.weightGsm ? prod.weightGsm.toString() : '500');
    setProdStock(prod.stock.toString());
    setProdFit(prod.fit || 'Boxy Oversized');
    setProdBadge((prod.badge as any) || '');
    setProdDescription(prod.description || '');

    // Fill up to 5 images
    const existingImgs =
      prod.images && prod.images.length > 0
        ? prod.images
        : ([prod.image, prod.secondaryImage].filter(Boolean) as string[]);
    setProdImages(existingImgs.slice(0, 5));
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) {
      alert('Please provide a product title');
      return;
    }

    const priceNum = parseFloat(prodPrice) || 89;
    const compareNum = parseFloat(prodComparePrice) || undefined;
    const gsmNum = parseInt(prodGsm) || 500;
    const stockNum = parseInt(prodStock) || 15;

    const mainImage =
      prodImages[0] ||
      (prodCategory === 'hoodie'
        ? '/images/hoodie-collection.jpg'
        : '/images/jacket-collection.jpg');
    const secondaryImg = prodImages[1] || undefined;

    if (editingProductId) {
      // Edit existing product
      const updated = productsList.map((p) => {
        if (p.id === editingProductId) {
          return {
            ...p,
            title: prodTitle,
            subtitle: prodSubtitle,
            price: priceNum,
            originalPrice: compareNum,
            discountOffer: prodDiscountBadge,
            category: prodCategory,
            subcategory: prodSubcategory,
            badge: prodBadge || undefined,
            description: prodDescription,
            weightGsm: gsmNum,
            fit: prodFit,
            sizes: selectedSizes,
            image: mainImage,
            secondaryImage: secondaryImg,
            images: prodImages.slice(0, 5),
            stock: stockNum,
          };
        }
        return p;
      });
      saveProductsToStorage(updated);
      showToast(`Product "${prodTitle}" updated successfully!`);
    } else {
      // Create new product
      const newProduct: Product = {
        id: `pw-${Date.now().toString(36)}`,
        title: prodTitle,
        slug: prodTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subtitle: prodSubtitle,
        price: priceNum,
        originalPrice: compareNum,
        discountOffer: prodDiscountBadge,
        category: prodCategory,
        subcategory: prodSubcategory,
        badge: prodBadge || undefined,
        description: prodDescription,
        fabricDetails: [
          `${gsmNum} GSM Luxury Heavyweight Knit`,
          'Enzyme pre-shrunk vintage wash',
          'Reinforced architectural stitching',
        ],
        features: [
          'Concealed EDC pocket with internal organizer',
          'Dropped shoulder boxy silhouette',
          'Heavyweight 2x2 ribbed collar and cuffs',
        ],
        weightGsm: gsmNum,
        fit: prodFit,
        colors: [
          { name: 'Onyx Black', hex: '#15181B', bgClass: 'bg-[#15181B]' },
          { name: 'Smoke Grey', hex: '#64748B', bgClass: 'bg-[#64748B]' },
        ],
        sizes: selectedSizes,
        image: mainImage,
        secondaryImage: secondaryImg,
        images: prodImages.slice(0, 5),
        stock: stockNum,
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: true,
      };

      saveProductsToStorage([newProduct, ...productsList]);
      showToast(`Product "${prodTitle}" published with ${prodImages.length} images!`);
    }

    setShowProductModal(false);
  };

  const handleDeleteProduct = (productId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}" from the store catalog?`)) {
      const updated = productsList.filter((p) => p.id !== productId);
      saveProductsToStorage(updated);
      showToast(`Product "${title}" has been deleted.`);
    }
  };

  const handleUpdateStock = (productId: string, delta: number) => {
    const updated = productsList.map((p) => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    saveProductsToStorage(updated);
  };

  // Image Slot Handlers (Up to 5 images)
  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    if (prodImages.length >= 5) {
      alert(
        'Maximum of 5 images allowed per product in accordance with standard store catalog requirements.',
      );
      return;
    }
    setProdImages([...prodImages, url.trim()]);
    setNewImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = prodImages.filter((_, i) => i !== index);
    setProdImages(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 5 - prodImages.length;
    if (availableSlots <= 0) {
      alert('You have reached the maximum limit of 5 images per product.');
      return;
    }

    const filesToRead = Array.from(files).slice(0, availableSlots);
    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        if (dataUrl) {
          setProdImages((prev) => (prev.length < 5 ? [...prev, dataUrl] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ==========================================
  // USER / CUSTOMER ACTIONS
  // ==========================================
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Name and Email are required.');
      return;
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now().toString(36)}`,
      fullName: newUserName.trim(),
      username: newUserUsername.trim() || newUserName.toLowerCase().replace(/\s+/g, '_'),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+92 300 0000000',
      role: newUserRole,
      status: newUserStatus,
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updated = [newUser, ...usersList];
    saveUsersToStorage(updated);
    setShowAddUserModal(false);
    showToast(`User account for "${newUserName}" added to directory!`);

    // Reset form
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('customer');
  };

  const handleRemoveUser = (userId: string, name: string) => {
    if (confirm(`Remove user "${name}" from the store directory? This action cannot be undone.`)) {
      const updated = usersList.filter((u) => u.id !== userId);
      saveUsersToStorage(updated);
      showToast(`User "${name}" was removed.`);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? ('suspended' as const) : ('active' as const);
        showToast(`User ${u.fullName} is now ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersToStorage(updated);
  };

  const handleUpdateUserRole = (userId: string, newRole: AdminUser['role']) => {
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveUsersToStorage(updated);
    showToast(`User role updated to ${newRole.toUpperCase()}.`);
  };

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    const updated = ordersList.map((ord) =>
      ord.orderId === orderId ? { ...ord, status: newStatus } : ord,
    );
    setOrdersList(updated);
    try {
      localStorage.setItem('pulsewear_orders_v1', JSON.stringify(updated));
    } catch {}
    showToast(`Order #${orderId} marked as ${newStatus}.`);
  };

  // ==========================================
  // DISCOUNT ACTIONS
  // ==========================================
  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscCode.trim()) return;

    const newDisc: DiscountCode = {
      id: `disc-${Date.now()}`,
      code: newDiscCode.toUpperCase().replace(/\s+/g, ''),
      type: newDiscType,
      value: parseFloat(newDiscValue) || 15,
      minSpend: parseFloat(newDiscMinSpend) || 50,
      usedCount: 0,
      expiryDate: 'Dec 31, 2026',
      status: 'active',
    };

    setDiscountsList([newDisc, ...discountsList]);
    setShowAddDiscountModal(false);
    setNewDiscCode('');
    showToast(`Promo Code ${newDisc.code} is now active!`);
  };

  const handleDeleteDiscount = (id: string, code: string) => {
    setDiscountsList(discountsList.filter((d) => d.id !== id));
    showToast(`Discount code ${code} removed.`);
  };

  // ==========================================
  // METRICS & COMPUTATIONS
  // ==========================================
  const totalRevenue = ordersList.reduce((acc, ord) => acc + ord.total, 0);
  const totalOrders = ordersList.length;
  const totalCustomers = usersList.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockCount = productsList.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = productsList.filter((p) => p.stock === 0).length;

  // Filtered Products
  const filteredProducts = productsList.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-in fade-in slide-in-from-bottom-5 fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-indigo-500/40 bg-[#0e1322] px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/30 backdrop-blur-xl">
          <CheckCircle2 className="h-5 w-5 text-[#D4FF00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Professional Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080B11]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-white/20 hover:text-white"
              title="Return to store front"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/images/pulsewear-logo.jpg"
                  alt="PulseWear Logo"
                  className="h-8 w-8 rounded-lg border border-indigo-500/40 object-cover shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#080B11] bg-[#D4FF00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-black tracking-tight text-white">
                    PULSEWEAR
                  </span>
                  <span className="rounded bg-[#D4FF00]/15 px-1.5 py-0.5 font-mono text-[9px] font-black text-[#D4FF00]">
                    MERCHANT
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Shopify-Grade Outerwear Management
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-white/20 hover:text-white sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>Live Storefront</span>
            </Link>

            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 rounded-xl bg-[#D4FF00] px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#D4FF00]/20 transition-all hover:brightness-105 active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2 text-xs font-bold text-indigo-300 transition-colors hover:bg-indigo-600/30 hover:text-white"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Shopify-Style) */}
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'border-[#D4FF00] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'border-[#D4FF00] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Products ({productsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'border-[#D4FF00] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Customers & Users ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'border-[#D4FF00] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Orders ({ordersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('discounts')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'discounts'
                  ? 'border-[#D4FF00] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Percent className="h-3.5 w-3.5" />
              <span>Discounts ({discountsList.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ========================================================
            TAB 1: OVERVIEW & STORE KPIS
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in space-y-8 duration-200">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#0C101A] p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Gross Sales</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-black text-white">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <span>↑ 24.8%</span>
                  <span className="text-slate-500">vs previous drop</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0C101A] p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-black text-white">
                  {totalOrders}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-400">
                  <span>100% fulfillment rate</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0C101A] p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Active Customers
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-black text-white">
                  {totalCustomers}
                </div>
                <div className="mt-1 text-xs text-purple-300">Verified buyers & VIP members</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0C101A] p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Avg. Order Value
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D4FF00]/10 text-[#D4FF00]">
                    <Tag className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-black text-white">
                  ${avgOrderValue.toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-slate-400">Heavyweight outerwear basket</div>
              </div>
            </div>

            {/* Quick Actions & Stock Alerts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Inventory Health Alert */}
              <div className="rounded-2xl border border-white/10 bg-[#0C101A] p-6 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Package className="h-5 w-5 text-[#D4FF00]" />
                    <h2 className="font-display text-base font-bold text-white">
                      Inventory Status & Catalog Health
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                    {productsList.length} Active SKUs
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <span className="text-xs font-semibold text-emerald-400">Healthy Stock</span>
                    <div className="mt-1 text-2xl font-black text-white">
                      {productsList.filter((p) => p.stock > 5).length}
                    </div>
                    <span className="text-[11px] text-slate-400">More than 5 units ready</span>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <span className="text-xs font-semibold text-amber-400">Low Stock Watch</span>
                    <div className="mt-1 text-2xl font-black text-white">{lowStockCount}</div>
                    <span className="text-[11px] text-slate-400">1 to 5 units remaining</span>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <span className="text-xs font-semibold text-red-400">Sold Out</span>
                    <div className="mt-1 text-2xl font-black text-white">{outOfStockCount}</div>
                    <span className="text-[11px] text-slate-400">Restock needed</span>
                  </div>
                </div>

                {/* Quick launch shortcut */}
                <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 sm:flex-row">
                  <div>
                    <h3 className="text-sm font-bold text-white">Launch Next Outerwear Drop</h3>
                    <p className="text-xs text-slate-400">
                      Add a new hoodie or tactical jacket with up to 5 high-res photos and custom
                      discount.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Product</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="rounded-2xl border border-white/10 bg-[#0C101A] p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="font-display text-base font-bold text-white">Latest Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#D4FF00] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {ordersList.slice(0, 4).map((ord) => (
                    <div
                      key={ord.orderId}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {ord.orderId}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : ord.status === 'Shipped'
                                  ? 'bg-cyan-500/20 text-cyan-400'
                                  : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {ord.customer.fullName} • {ord.items.length} garments
                        </div>
                      </div>
                      <div className="font-display text-sm font-black text-white">
                        ${ord.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PRODUCTS (SHOPIFY-LIKE CATALOG & MULTI-IMAGE)
           ======================================================== */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in space-y-6 duration-200">
            {/* Header Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-black text-white">Outerwear Catalog</h2>
                <p className="text-xs text-slate-400">
                  Manage products, stock inventory, discounts, and multi-image galleries.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* View toggle (Grid / Table) */}
                <div className="flex items-center rounded-xl border border-white/10 bg-[#0C101A] p-1">
                  <button
                    onClick={() => setProductViewMode('table')}
                    className={`rounded-lg p-1.5 transition-colors ${
                      productViewMode === 'table' ? 'bg-white/10 text-white' : 'text-slate-400'
                    }`}
                    title="Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setProductViewMode('grid')}
                    className={`rounded-lg p-1.5 transition-colors ${
                      productViewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-1.5 rounded-xl bg-[#D4FF00] px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#D4FF00]/20 hover:brightness-105 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0C101A] p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, SKU, or subtitle..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#D4FF00] focus:outline-none"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setProductCategoryFilter('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    productCategoryFilter === 'all'
                      ? 'bg-white text-black'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  All Outerwear
                </button>
                <button
                  onClick={() => setProductCategoryFilter('hoodie')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    productCategoryFilter === 'hoodie'
                      ? 'bg-[#D4FF00] font-black text-black'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  Hoodies
                </button>
                <button
                  onClick={() => setProductCategoryFilter('jacket')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    productCategoryFilter === 'jacket'
                      ? 'bg-[#D4FF00] font-black text-black'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  Jackets
                </button>
              </div>
            </div>

            {/* PRODUCT LIST (TABLE VIEW) */}
            {productViewMode === 'table' ? (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0C101A] shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-wider">
                        Garment Item
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                        Price / Offer
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Weight</th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Images</th>
                      <th className="px-5 py-3.5 text-right font-bold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredProducts.map((p) => {
                      const imageCount =
                        p.images && p.images.length > 0
                          ? p.images.length
                          : p.secondaryImage
                            ? 2
                            : 1;
                      return (
                        <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                                {p.badge && (
                                  <span className="absolute inset-x-0 bottom-0 bg-black/80 py-0.5 text-center font-mono text-[8px] font-bold text-[#D4FF00]">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-white">{p.title}</div>
                                <div className="line-clamp-1 text-[11px] text-slate-400">
                                  {p.subtitle}
                                </div>
                                <div className="font-mono text-[9px] text-slate-500">
                                  ID: {p.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-block rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-indigo-300">
                              {p.category}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm font-black text-white">
                                ${p.price}
                              </span>
                              {p.originalPrice && (
                                <span className="text-[11px] text-slate-500 line-through">
                                  ${p.originalPrice}
                                </span>
                              )}
                            </div>
                            {p.discountOffer && (
                              <span className="mt-0.5 inline-block rounded bg-[#D4FF00]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#D4FF00]">
                                {p.discountOffer}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  p.stock > 5
                                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                    : p.stock > 0
                                      ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                                      : 'border border-red-500/20 bg-red-500/10 text-red-400'
                                }`}
                              >
                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                              </span>
                              {/* Quick stock +/- */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateStock(p.id, -1)}
                                  className="h-5 w-5 rounded bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                  title="Decrease stock"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleUpdateStock(p.id, 1)}
                                  className="h-5 w-5 rounded bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                  title="Increase stock"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                            {p.weightGsm} GSM
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                              <ImageIcon className="h-3 w-3" />
                              <span>{imageCount} / 5</span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white"
                                title="Edit Product & Images"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* PRODUCT GRID VIEW (Shopify Style) */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => {
                  const imageCount =
                    p.images && p.images.length > 0 ? p.images.length : p.secondaryImage ? 2 : 1;
                  return (
                    <div
                      key={p.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C101A] shadow-lg transition-all hover:border-white/20"
                    >
                      {/* Image Preview with Gallery Dots */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Badges */}
                        <div className="absolute left-3 top-3 flex flex-col gap-1">
                          {p.badge && (
                            <span className="rounded bg-black/80 px-2 py-0.5 font-mono text-[9px] font-bold text-[#D4FF00] backdrop-blur-md">
                              {p.badge}
                            </span>
                          )}
                          {p.discountOffer && (
                            <span className="rounded bg-[#D4FF00] px-2 py-0.5 font-mono text-[9px] font-black text-black">
                              {p.discountOffer}
                            </span>
                          )}
                        </div>

                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[9px] text-white backdrop-blur-md">
                          <ImageIcon className="h-2.5 w-2.5" />
                          <span>{imageCount} imgs</span>
                        </div>
                      </div>

                      {/* Product Content */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono uppercase text-indigo-400">
                              {p.category}
                            </span>
                            <span>{p.weightGsm} GSM</span>
                          </div>
                          <h3 className="mt-1 line-clamp-1 font-display text-sm font-bold text-white">
                            {p.title}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{p.subtitle}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-display text-base font-black text-white">
                                ${p.price}
                              </span>
                              {p.originalPrice && (
                                <span className="text-xs text-slate-500 line-through">
                                  ${p.originalPrice}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                p.stock > 5
                                  ? 'text-emerald-400'
                                  : p.stock > 0
                                    ? 'text-amber-400'
                                    : 'text-red-400'
                              }`}
                            >
                              {p.stock > 0 ? `${p.stock} units` : 'Out of stock'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 hover:text-white"
                              title="Edit product"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              title="Delete product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: CUSTOMERS & USERS DIRECTORY (EASY ADD / REMOVE)
           ======================================================== */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in space-y-6 duration-200">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-black text-white">
                  Users & Customers Directory
                </h2>
                <p className="text-xs text-slate-400">
                  Easily add, remove, manage permissions, and inspect purchase histories for all
                  registered users.
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add New User</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0C101A] p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name, username, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    userRoleFilter === 'all'
                      ? 'bg-white text-black'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  All ({usersList.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('admin')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    userRoleFilter === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setUserRoleFilter('vip')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    userRoleFilter === 'vip'
                      ? 'bg-amber-500 font-black text-black'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  VIP Members
                </button>
                <button
                  onClick={() => setUserRoleFilter('customer')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    userRoleFilter === 'customer'
                      ? 'bg-indigo-600 text-white'
                      : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  Customers
                </button>
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0C101A] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider">
                      User / Account
                    </th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Purchases</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Joined</th>
                    <th className="px-5 py-3.5 text-right font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredUsers.map((u) => {
                    return (
                      <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                        {/* Name & Avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-900 to-purple-800 font-display font-bold text-white shadow-md">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt={u.fullName}
                                  className="h-full w-full rounded-xl object-cover"
                                />
                              ) : (
                                u.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-white">
                                <span>{u.fullName}</span>
                                {u.role === 'admin' && (
                                  <Shield className="h-3 w-3 text-purple-400" />
                                )}
                                {u.role === 'vip' && <Award className="h-3 w-3 text-amber-400" />}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400">
                                @{u.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <div className="text-white">{u.email}</div>
                          <div className="font-mono text-[10px] text-slate-500">{u.phone}</div>
                        </td>

                        {/* Role Selector */}
                        <td className="px-4 py-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                                : u.role === 'vip'
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                  : u.role === 'staff'
                                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                                    : 'border-white/10 bg-[#07090E] text-slate-300'
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="vip">VIP Member</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-opacity hover:opacity-80 ${
                              u.status === 'active'
                                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                : 'border border-red-500/20 bg-red-500/10 text-red-400'
                            }`}
                          >
                            ● {u.status}
                          </button>
                        </td>

                        {/* Purchases */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">${u.totalSpent.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">{u.ordersCount} orders</div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-3.5 text-[11px] text-slate-400">{u.joinedDate}</td>

                        {/* Actions (REMOVE USER) */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRemoveUser(u.id, u.fullName)}
                              className="flex h-8 items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              title="Remove user"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ORDERS FULFILLMENT
           ======================================================== */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in space-y-6 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-black text-white">
                  Orders Fulfillment Queue
                </h2>
                <p className="text-xs text-slate-400">
                  Track customer purchases, update delivery status, and review addresses.
                </p>
              </div>
              <span className="rounded-xl border border-white/10 bg-[#0C101A] px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                {ordersList.length} Total Orders
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0C101A] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                      Outerwear Items
                    </th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-right font-bold uppercase tracking-wider">
                      Fulfillment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {ordersList.map((ord) => (
                    <tr key={ord.orderId} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">
                        {ord.orderId}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {ord.date}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{ord.customer.fullName}</div>
                        <div className="text-[11px] text-slate-400">@{ord.customer.username}</div>
                        <div className="font-mono text-[10px] text-indigo-300">
                          {ord.customer.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px]">
                              {it.image && (
                                <img
                                  src={it.image}
                                  alt={it.title}
                                  className="h-6 w-6 rounded object-cover"
                                />
                              )}
                              <span>
                                {it.title} ({it.size}) x{it.quantity || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-display text-sm font-black text-white">
                        ${ord.total.toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">{ord.paymentMethod}</td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            ord.status === 'Delivered'
                              ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                              : ord.status === 'Shipped'
                                ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                                : ord.status === 'Cancelled'
                                  ? 'border border-red-500/30 bg-red-500/20 text-red-400'
                                  : 'border border-amber-500/30 bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status === 'Processing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.orderId, 'Shipped')}
                              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                            >
                              Mark Shipped
                            </button>
                          )}
                          {ord.status === 'Shipped' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.orderId, 'Delivered')}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.orderId, 'Cancelled')}
                              className="rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/15"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: DISCOUNTS & PROMOTIONAL OFFERS
           ======================================================== */}
        {activeTab === 'discounts' && (
          <div className="animate-in fade-in space-y-6 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-black text-white">
                  Discounts & Promo Codes
                </h2>
                <p className="text-xs text-slate-400">
                  Manage sitewide promotions, influencer coupons, and seasonal sales.
                </p>
              </div>

              <button
                onClick={() => setShowAddDiscountModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#D4FF00] px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#D4FF00]/20 hover:brightness-105"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Create Discount</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discountsList.map((disc) => (
                <div
                  key={disc.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0C101A] p-5 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black tracking-wider text-[#D4FF00]">
                        {disc.code}
                      </span>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                        {disc.status}
                      </span>
                    </div>

                    <div className="mt-3 font-display text-2xl font-black text-white">
                      {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Minimum order spend: ${disc.minSpend}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
                    <span>Used {disc.usedCount} times</span>
                    <button
                      onClick={() => handleDeleteDiscount(disc.id, disc.code)}
                      className="font-bold text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL: ADD / EDIT PRODUCT (UP TO 5 IMAGES & DISCOUNTS)
         ======================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
          <div className="my-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0C101A] p-6 shadow-2xl sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-lg font-black text-white">
                  {editingProductId ? 'Edit Product & Gallery' : 'Create New Outerwear Product'}
                </h3>
                <p className="text-xs text-slate-400">
                  Upload up to 5 images, set pricing, compare-at discounts, and streetwear
                  specifications.
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-6">
              {/* SECTION 1: PRODUCT IMAGES (UP TO 5 IMAGES) */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#D4FF00]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Product Media ({prodImages.length} / 5 Images)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Slot 1 = Main Storefront Card</span>
                </div>

                {/* 5 Slots Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const imgUrl = prodImages[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className={`relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-xl border transition-all ${
                          imgUrl
                            ? 'border-indigo-500/40 bg-black'
                            : 'border-dashed border-white/15 bg-white/[0.01]'
                        }`}
                      >
                        {imgUrl ? (
                          <>
                            <img
                              src={imgUrl}
                              alt={`Slot ${slotIdx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute left-1.5 top-1.5 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#D4FF00]">
                              {slotIdx === 0 ? '★ MAIN' : `#${slotIdx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(slotIdx)}
                              className="absolute right-1.5 top-1.5 rounded-full bg-red-600/90 p-1 text-white hover:bg-red-500"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <div className="p-2 text-center">
                            <ImageIcon className="mx-auto h-5 w-5 text-slate-600" />
                            <span className="mt-1 block text-[10px] text-slate-500">
                              Slot {slotIdx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Image Options */}
                {prodImages.length < 5 && (
                  <div className="mt-4 space-y-3 border-t border-white/5 pt-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {/* Local File Upload Button */}
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.08]">
                        <Upload className="h-3.5 w-3.5 text-[#D4FF00]" />
                        <span>Upload File (PNG / JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Image URL Input */}
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="text"
                          placeholder="Or paste image URL..."
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          className="flex-1 rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddImage(newImageUrlInput)}
                          className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Quick Streetwear Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
                      <span className="shrink-0 text-[10px] font-bold text-slate-500">
                        PRESETS:
                      </span>
                      {PRESET_IMAGES.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddImage(preset.url)}
                          className="shrink-0 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-300 hover:border-[#D4FF00] hover:text-white"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: TITLE & CATEGORY */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Product Title</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. Acid Matrix Heavyweight Zip Hoodie"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={prodSubtitle}
                    onChange={(e) => setProdSubtitle(e.target.value)}
                    placeholder="e.g. 500 GSM loopback French terry"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: PRICING & DISCOUNT OFFER (SHOPIFY LEVEL) */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-[#D4FF00]">
                  Pricing & Promotional Discounts
                </span>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Price ($)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="98.00"
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] py-2 pl-7 pr-3 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Compare-at Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Compare-at Price ($) <span className="text-slate-500">(Strikethrough)</span>
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={prodComparePrice}
                        onChange={(e) => {
                          setProdComparePrice(e.target.value);
                          // Auto calculate discount offer
                          const comp = parseFloat(e.target.value);
                          const cur = parseFloat(prodPrice);
                          if (comp > cur) {
                            const pct = Math.round(((comp - cur) / comp) * 100);
                            setProdDiscountBadge(`${pct}% OFF`);
                          }
                        }}
                        placeholder="125.00"
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] py-2 pl-7 pr-3 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Discount Offer Badge */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Discount Offer Badge
                    </label>
                    <input
                      type="text"
                      value={prodDiscountBadge}
                      onChange={(e) => setProdDiscountBadge(e.target.value)}
                      placeholder="e.g. 20% OFF or Save $27"
                      className="mt-1 w-full rounded-xl border border-[#D4FF00]/30 bg-[#07090E] px-3 py-2 text-xs font-bold text-[#D4FF00] focus:border-[#D4FF00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CATEGORY, WEIGHT & INVENTORY */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  >
                    <option value="hoodie">Heavyweight Hoodie</option>
                    <option value="jacket">Tactical Jacket / Shell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Subcategory</label>
                  <select
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  >
                    <option value="pullover">Pullover Hoodie</option>
                    <option value="zip_up">Full-Zip Hoodie</option>
                    <option value="bomber">Bomber Jacket</option>
                    <option value="techwear">Modular Techwear</option>
                    <option value="windbreaker">Windbreaker Shell</option>
                    <option value="puffer">Down Puffer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Weight (GSM)</label>
                  <input
                    type="number"
                    value={prodGsm}
                    onChange={(e) => setProdGsm(e.target.value)}
                    placeholder="500"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Stock Inventory</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="24"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4FF00] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#D4FF00]/20 hover:brightness-105 active:scale-95"
                >
                  {editingProductId ? 'Save Changes' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW USER / CUSTOMER
         ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0C101A] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Add New User / Customer
                </h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Farhan Ali"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Username (@handle)</label>
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="e.g. farhan_street"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. farhan@pulsewear.store"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="vip">VIP Member</option>
                    <option value="staff">Staff / Mod</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Status</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CREATE DISCOUNT PROMO CODE
         ======================================================== */}
      {showAddDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0C101A] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-[#D4FF00]" />
                <h3 className="font-display text-base font-bold text-white">
                  Create Promo Discount
                </h3>
              </div>
              <button
                onClick={() => setShowAddDiscountModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Discount Code</label>
                <input
                  type="text"
                  required
                  value={newDiscCode}
                  onChange={(e) => setNewDiscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. STREET25"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 font-mono text-xs uppercase text-[#D4FF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Type</label>
                  <select
                    value={newDiscType}
                    onChange={(e) => setNewDiscType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Value</label>
                  <input
                    type="number"
                    required
                    value={newDiscValue}
                    onChange={(e) => setNewDiscValue(e.target.value)}
                    placeholder="20"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Minimum Order Spend ($)
                </label>
                <input
                  type="number"
                  value={newDiscMinSpend}
                  onChange={(e) => setNewDiscMinSpend(e.target.value)}
                  placeholder="80"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090E] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDiscountModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4FF00] px-5 py-2 text-xs font-black uppercase text-black hover:brightness-105"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
