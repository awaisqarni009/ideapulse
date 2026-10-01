'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart-context';
import { CheckCircle2, ShieldCheck, ArrowLeft, Truck, CreditCard, Banknote } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
];

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, promoCode, clearCart } = useCart();

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet'>('cod');

  // Errors & Confirmation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Validation strictly adhering to Teacher requirements
  const validateForm = () => {
    const errs: Record<string, string> = {};

    // 1. Full Name: letters only, no numbers or signs
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (!/^[A-Za-z\s]+$/.test(fullName.trim())) {
      errs.fullName = 'Full name must contain letters only (no numbers or symbols)';
    }

    // 2. Username: separate field
    if (!username.trim()) {
      errs.username = 'Username is required';
    } else if (username.length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }

    // 3. Email
    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Valid email is required for tracking updates';
    }

    // 4. Phone Number: exactly 11 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (!digitsOnly) {
      errs.phoneNumber = 'Phone number is required';
    } else if (digitsOnly.length !== 11) {
      errs.phoneNumber = `Phone number must be exactly 11 digits (current: ${digitsOnly.length})`;
    }

    // 5. Address
    if (!streetAddress.trim()) {
      errs.streetAddress = 'Shipping street address is required';
    }
    if (!city.trim()) {
      errs.city = 'City is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) {
      alert('Your cart is empty! Add garments before checkout.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `PW-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderPayload = {
        orderId,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        customer: {
          fullName,
          username,
          email,
          phone: `${countryCode} ${phoneNumber}`,
          address: `${streetAddress}, ${city} ${postalCode}`,
        },
        paymentMethod:
          paymentMethod === 'cod'
            ? 'Cash on Delivery (COD)'
            : paymentMethod === 'card'
              ? 'Credit Card'
              : 'Digital Wallet',
        items: [...items],
        subtotal,
        discount,
        shipping,
        total,
      };

      // Save order in localStorage for history
      try {
        const pastOrders = JSON.parse(localStorage.getItem('pulsewear_orders_v1') || '[]');
        localStorage.setItem('pulsewear_orders_v1', JSON.stringify([orderPayload, ...pastOrders]));
      } catch {
        // ignore
      }

      setConfirmedOrder(orderPayload);
      clearCart();
      setIsSubmitting(false);
    }, 900);
  };

  // If order confirmed, show order confirmation screen!
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#07090e] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-500/30 bg-[#0e131f] p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl text-emerald-400">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              ORDER CONFIRMED & IN QUEUE
            </span>
            <h1 className="mt-2 font-display text-3xl font-black text-white">
              Thank You, {confirmedOrder.customer.fullName}!
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Order ID:{' '}
              <strong className="font-mono text-indigo-400">{confirmedOrder.orderId}</strong>
            </p>
          </div>

          {/* Delivery Timeline */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#07090e] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispatch Pipeline
            </h3>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
              <div className="flex flex-col items-center gap-1 font-bold text-emerald-400">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
                  ✓
                </span>
                <span>Confirmed</span>
              </div>
              <div className="mx-2 h-0.5 flex-1 bg-emerald-500/40" />
              <div className="flex flex-col items-center gap-1 font-bold text-indigo-400">
                <span className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  2
                </span>
                <span>Packing</span>
              </div>
              <div className="mx-2 h-0.5 flex-1 bg-white/10" />
              <div className="flex flex-col items-center gap-1 text-slate-500">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-400">
                  3
                </span>
                <span>Shipped</span>
              </div>
              <div className="mx-2 h-0.5 flex-1 bg-white/10" />
              <div className="flex flex-col items-center gap-1 text-slate-500">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-400">
                  4
                </span>
                <span>Delivered</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#07090e] p-5 text-xs text-slate-300">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <div>
                <span className="block text-slate-500">Deliver To:</span>
                <strong className="text-white">{confirmedOrder.customer.fullName}</strong> (@
                {confirmedOrder.customer.username})
                <p className="text-slate-400">{confirmedOrder.customer.address}</p>
                <p className="font-mono text-indigo-400">{confirmedOrder.customer.phone}</p>
              </div>
              <div className="text-right">
                <span className="block text-slate-500">Payment:</span>
                <strong className="text-white">{confirmedOrder.paymentMethod}</strong>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-white/5">
              {confirmedOrder.items.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={it.image}
                      alt={it.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-semibold text-white">{it.title}</div>
                      <div className="text-[11px] text-slate-400">
                        Size {it.size} • {it.color.name} (x{it.quantity})
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-white">
                    ${(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-bold text-white">
              <span>Total Paid / Due</span>
              <span className="font-display text-base text-indigo-400">
                ${confirmedOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500"
            >
              Continue Exploring Drops
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Back button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Outerwear Collection</span>
        </Link>

        <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
          SECURE DISPATCH CHECKOUT
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Complete your delivery details below to finalize your pulse apparel order.
        </p>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0e131f] p-12 text-center">
            <p className="text-sm text-slate-400">Your bag is currently empty.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white"
            >
              Shop Outerwear Drops
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 7 Columns: Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-6 lg:col-span-7">
              {/* Card 1: Customer Identity */}
              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-6">
                <h2 className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-wider text-white">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>1. Customer Identity (Course Compliant)</span>
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name <span className="text-rose-400">*</span>
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        (Letters only)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                      placeholder="e.g. Awais Qarni"
                      className={`mt-1.5 w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                        errors.fullName
                          ? 'border-rose-500'
                          : 'border-white/10 focus:border-indigo-500'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-[11px] text-rose-400">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Username (Separate) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Username <span className="text-rose-400">*</span>
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        (Separate field)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      }
                      placeholder="e.g. awais_streetwear"
                      className={`mt-1.5 w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                        errors.username
                          ? 'border-rose-500'
                          : 'border-white/10 focus:border-indigo-500'
                      }`}
                    />
                    {errors.username && (
                      <p className="mt-1 text-[11px] text-rose-400">{errors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. client@pulsewear.com"
                      className={`mt-1.5 w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                        errors.email ? 'border-rose-500' : 'border-white/10 focus:border-indigo-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-rose-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone with Country Code & exactly 11 digits */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Phone Number <span className="text-rose-400">*</span>
                      <span className="ml-1 text-[10px] font-normal text-indigo-400">
                        (Country Code + Exactly 11 Digits)
                      </span>
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#07090e] px-3 py-2.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        maxLength={11}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="03001234567 (11 digits)"
                        className={`flex-1 rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                          errors.phoneNumber
                            ? 'border-rose-500'
                            : 'border-white/10 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.phoneNumber ? (
                      <p className="mt-1 text-[11px] text-rose-400">{errors.phoneNumber}</p>
                    ) : (
                      <p className="mt-1 text-[10px] text-slate-500">
                        Digits entered: {phoneNumber.length} / 11
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Shipping Destination */}
              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-6">
                <h2 className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-wider text-white">
                  <Truck className="h-4 w-4 text-indigo-400" />
                  <span>2. Delivery Destination</span>
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Street Address & Apartment <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. House 42, Sector F-7/2"
                      className={`mt-1.5 w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                        errors.streetAddress
                          ? 'border-rose-500'
                          : 'border-white/10 focus:border-indigo-500'
                      }`}
                    />
                    {errors.streetAddress && (
                      <p className="mt-1 text-[11px] text-rose-400">{errors.streetAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      City <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Islamabad"
                      className={`mt-1.5 w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                        errors.city ? 'border-rose-500' : 'border-white/10 focus:border-indigo-500'
                      }`}
                    />
                    {errors.city && <p className="mt-1 text-[11px] text-rose-400">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 44000"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Payment Method */}
              <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-6">
                <h2 className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-wider text-white">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <span>3. Payment Protocol</span>
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="h-6 w-6 text-emerald-400" />
                    <span className="mt-2 text-xs font-bold">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-500">Pay when arrived</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 text-indigo-400" />
                    <span className="mt-2 text-xs font-bold">Credit/Debit Card</span>
                    <span className="text-[10px] text-slate-500">Visa / Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl"></span>
                    <span className="mt-1 text-xs font-bold">Digital Pay</span>
                    <span className="text-[10px] text-slate-500">Apple / Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="active:scale-98 w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-600/30 transition-all hover:opacity-95 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Securing Order...'
                  : `Confirm & Place Order • $${total.toFixed(2)}`}
              </button>
            </form>

            {/* Right 5 Columns: Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#0e131f] p-6 shadow-xl">
                <h3 className="border-b border-white/10 pb-3 font-display text-base font-bold text-white">
                  Order Summary ({items.length} garments)
                </h3>

                <div className="mt-4 max-h-[340px] divide-y divide-white/10 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                      />
                      <div className="flex-1 text-xs">
                        <div className="line-clamp-1 font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.color.name} • Size{' '}
                          <strong className="text-indigo-400">{item.size}</strong> (x{item.quantity}
                          )
                        </div>
                        <div className="mt-1 font-bold text-slate-200">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({promoCode})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Express Worldwide Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="font-semibold text-emerald-400">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base font-extrabold text-white">
                    <span>Grand Total</span>
                    <span className="text-indigo-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-1 rounded-xl border border-white/10 bg-[#07090e] p-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <span>✓</span>
                    <span>Direct Factory Dispatched</span>
                  </div>
                  <div>Inspected for stitches, GSM weight & water resistance.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
