'use client';

import React from 'react';
import Link from 'next/link';
import { PulseWearLogo } from '@/app/components/ui/logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#15181B] px-4 pb-12 pt-16 text-[#8A8F95] sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <PulseWearLogo size="md" showTagline={false} />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#8A8F95]">
              Dense 500 GSM loopback French terry hoodies and 20,000 mm waterproof tactical shells,
              built to outlast the season.
            </p>
            <div className="mt-4 font-mono text-[11px] text-[#8A8F95]">
              Worldwide fulfillment · Carbon neutral shipping
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link
                  href="/?category=hoodie#catalog"
                  className="transition-colors hover:text-white"
                >
                  500 GSM Hoodies
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=jacket#catalog"
                  className="transition-colors hover:text-white"
                >
                  Tactical Jackets
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=bestseller#catalog"
                  className="transition-colors hover:text-white"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/?category=new#catalog" className="transition-colors hover:text-white">
                  New Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Col (§7.8: Shipping, Returns, Size guide, Track order) */}
          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Help
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  30-Day Returns
                </Link>
              </li>
              <li>
                <a href="#catalog" className="transition-colors hover:text-white">
                  Size Guide
                </a>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company Col */}
          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Privacy Notice
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="transition-colors hover:text-white">
                  Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 font-mono text-xs text-[#8A8F95] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} PULSEWEAR. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>500 GSM Organic Loopback</span>
            <span>·</span>
            <span>20,000 MM Hydrostatic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
