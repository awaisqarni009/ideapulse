'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS, Product } from '@/lib/store/products';
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
} from 'lucide-react';

interface AdminOrder {
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
  items: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status?: 'Processing' | 'Shipped' | 'Delivered';
}

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
      },
      {
        id: 'item-3',
        title: 'Midnight Echo Heavy Full-Zip Hoodie',
        size: 'XL',
        color: { name: 'Deep Obsidian' },
        quantity: 1,
        price: 108,
      },
    ],
    subtotal: 293,
    discount: 58.6,
    shipping: 0,
    total: 234.4,
    status: 'Shipped',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>(INITIAL_DEMO_ORDERS);

  // New product form modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'hoodie' | 'jacket'>('hoodie');
  const [newPrice, setNewPrice] = useState('89');
  const [newGsm, setNewGsm] = useState('500');
  const [newStock, setNewStock] = useState('20');

  // Load any real orders placed from checkout
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('pulsewear_orders_v1');
      if (savedOrders) {
        const parsed: AdminOrder[] = JSON.parse(savedOrders);
        const mapped = parsed.map((o) => ({ ...o, status: o.status || 'Processing' }));
        setOrdersList([...mapped, ...INITIAL_DEMO_ORDERS]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Update order status
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: 'Processing' | 'Shipped' | 'Delivered',
  ) => {
    setOrdersList((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? { ...ord, status: newStatus } : ord)),
    );
  };

  // Add new product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProd: Product = {
      id: `pw-${Date.now()}`,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/\s+/g, '-'),
      subtitle: `${newGsm} GSM Custom Outerwear Drop`,
      price: parseFloat(newPrice) || 99,
      category: newCategory,
      subcategory: newCategory === 'hoodie' ? 'pullover' : 'techwear',
      badge: 'NEW DROP',
      description: 'Newly added outerwear item via the Admin Management Deck.',
      fabricDetails: ['100% Heavyweight Cotton or DWR Technical Shell'],
      features: ['Architectural silhouette', 'Reinforced stitching'],
      weightGsm: parseInt(newGsm) || 450,
      fit: 'Boxy Oversized',
      colors: [
        { name: 'Onyx Black', hex: '#0a0d14', bgClass: 'bg-[#0a0d14]' },
        { name: 'Smoke Grey', hex: '#64748b', bgClass: 'bg-[#64748b]' },
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      image:
        newCategory === 'hoodie'
          ? '/images/hoodie-collection.jpg'
          : '/images/jacket-collection.jpg',
      stock: parseInt(newStock) || 15,
      rating: 5.0,
      reviewsCount: 1,
    };

    setProductsList([newProd, ...productsList]);
    setShowAddProductModal(false);
    setNewTitle('');
    alert(`Product "${newTitle}" created and added to active inventory!`);
  };

  // Metrics
  const totalRevenue = ordersList.reduce((acc, ord) => acc + ord.total, 0);
  const totalItemsSold = ordersList.reduce(
    (acc, ord) => acc + ord.items.reduce((sum, it) => sum + (it.quantity || 1), 0),
    0,
  );
  const totalActiveOrders = ordersList.filter((o) => o.status !== 'Delivered').length;

  return (
    <div className="min-h-screen bg-[#07090e] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Top Header Bar */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:text-white"
              title="Return to storefront"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/pulsewear-logo.jpg"
                  alt="PulseWear Logo"
                  className="h-9 w-9 rounded-xl border border-indigo-500/30 object-cover shadow-md shadow-indigo-500/20"
                />
                <h1 className="font-display text-2xl font-black text-white">
                  PULSEWEAR ADMIN EXECUTIVE
                </h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  ● SYSTEM NOMINAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Outerwear Inventory, Orders Fulfillment & Anti-Abuse Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              View Live Storefront
            </Link>
            <a
              href="http://localhost/admin.php"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-4 py-2 text-xs font-bold text-indigo-300 transition-colors hover:bg-indigo-600 hover:text-white"
            >
              Open PHP Admin Portal
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Outerwear Catalog ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Orders Fulfillment ({ordersList.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Gross Revenue</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 font-display text-2xl font-black text-white">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="mt-1 text-[11px] text-emerald-400">↑ 18.4% vs last week</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Outerwear Units Sold</span>
                  <Package className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="mt-2 font-display text-2xl font-black text-white">
                  {totalItemsSold} Garments
                </div>
                <div className="mt-1 text-[11px] text-indigo-300">500 GSM French Terry #1</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Fulfillment Queue</span>
                  <ShoppingCart className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-2 font-display text-2xl font-black text-white">
                  {totalActiveOrders} Active
                </div>
                <div className="mt-1 text-[11px] text-amber-400">All pending COD & Paid</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Avg. Order Value</span>
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="mt-2 font-display text-2xl font-black text-white">
                  ${ordersList.length ? (totalRevenue / ordersList.length).toFixed(2) : '0'}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">Across all categories</div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-slate-900/60 p-6 sm:flex-row">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Seasonal Inventory Management
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  Update product stock levels or launch new hoodie & jacket drops directly into the
                  live catalog.
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Outerwear Piece</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Products Catalog */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Active Styles in Storefront:{' '}
                <strong className="text-white">{productsList.length}</strong>
              </span>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e131f]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Weight</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Rating</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {productsList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="flex items-center gap-3 px-4 py-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] uppercase text-indigo-400">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 font-mono">{item.weightGsm} GSM</td>
                      <td className="px-4 py-3 font-bold text-white">${item.price}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">
                          {item.stock} in stock
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-400">★ {item.rating}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => alert(`Edit feature for ${item.title}`)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 hover:border-white/20 hover:text-white"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders Fulfillment */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e131f]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order ID</th>
                    <th className="px-4 py-3 font-semibold">Customer Details</th>
                    <th className="px-4 py-3 font-semibold">Garments</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {ordersList.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-white/[0.01]">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                        {ord.orderId}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {ord.date}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{ord.customer.fullName}</div>
                        <div className="text-[11px] text-slate-400">@{ord.customer.username}</div>
                        <div className="font-mono text-[10px] text-indigo-300">
                          {ord.customer.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300">
                            {it.title} ({it.size}) x{it.quantity || 1}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-white">
                        ${ord.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{ord.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ord.status === 'Shipped'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ord.status || 'Processing'}
                        </span>
                      </td>
                      <td className="space-x-1 px-4 py-3 text-right">
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.orderId, 'Shipped')}
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                        >
                          Ship
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.orderId, 'Delivered')}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                        >
                          Deliver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0e131f] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-base font-bold text-white">
                  Add New Outerwear Drop
                </h3>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Acid Fade Heavy Zip Hoodie"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#07090e] px-3 py-2 text-xs text-white"
                    >
                      <option value="hoodie">Heavyweight Hoodie</option>
                      <option value="jacket">Jacket / Shell</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Weight (GSM)
                    </label>
                    <input
                      type="number"
                      value={newGsm}
                      onChange={(e) => setNewGsm(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Price ($)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Save & Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
