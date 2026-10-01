'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowUpRight, Truck, RefreshCw, Sparkles } from 'lucide-react';
import { PulseWearLogo } from '@/app/components/ui/logo';

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#07090e] text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Streetwear Ethos */}
          <div className="lg:col-span-2">
            <PulseWearLogo size="md" />

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
              Engineered for warmth. Cut for the streets. Heavyweight 500 GSM loopback cotton
              hoodies and 3-layer weatherproof tactical jackets built to outlast trends.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Truck className="h-4 w-4 text-indigo-400" />
                <span>Worldwide Express Shipping</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>30-Day Free Returns</span>
              </div>
            </div>
          </div>

          {/* Col 3: Collections */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Collections</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/?category=hoodie" className="transition-colors hover:text-white">
                  Heavyweight Hoodies (500 GSM)
                </Link>
              </li>
              <li>
                <Link href="/?category=jacket" className="transition-colors hover:text-white">
                  Modular Techwear Jackets
                </Link>
              </li>
              <li>
                <Link href="/?category=jacket" className="transition-colors hover:text-white">
                  Sub-Zero Down Puffers
                </Link>
              </li>
              <li>
                <Link href="/?category=hoodie" className="transition-colors hover:text-white">
                  Distressed Vintage Pullovers
                </Link>
              </li>
              <li>
                <Link href="/?category=bestseller" className="transition-colors hover:text-white">
                  Signature Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Care & Portals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Client Service
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link href="/#lookbook" className="transition-colors hover:text-white">
                  Material & Fabric Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  Executive Admin Portal
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost/admin.php"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  PHP Admin (XAMPP)
                </a>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Quality Guarantee */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quality Assurance
            </h3>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0e131f] p-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Heavyweight Certified</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                Zero polyester filler fabrics. Each garment is independently weighed and inspected
                before dispatch.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-300">
                <Mail className="h-3 w-3 text-slate-500" />
                <span>support@pulsewear.store</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} PULSEWEAR Streetwear Collective. Web Engineering
            Project.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-300">
              Privacy Notice
            </Link>
            <Link href="/" className="hover:text-slate-300">
              Terms of Sale
            </Link>
            <Link href="/admin" className="text-indigo-400 hover:text-indigo-300">
              Store Manager
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
