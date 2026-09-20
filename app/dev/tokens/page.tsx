import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Tokens Gallery — IdeaPulse',
  description:
    'Visual verification for colors, typography, glass surfaces, shadows, glows, and radiuses.',
};

const surfaces = [
  { name: '--canvas', value: '#0B0F19', desc: 'Page background canvas' },
  { name: '--canvas-deep', value: '#070A11', desc: 'Behind modals and scrim' },
  { name: '--surface-solid', value: '#131826', desc: 'Opaque fallback for glass' },
  { name: '--surface-1', value: 'rgba(255,255,255,0.03)', desc: 'L1: Ambient panels & table rows' },
  { name: '--surface-2', value: 'rgba(255,255,255,0.05)', desc: 'L2: Standard cards & fields' },
  {
    name: '--surface-3',
    value: 'rgba(255,255,255,0.08)',
    desc: 'L3: Floating dropdowns & popovers',
  },
  {
    name: '--surface-4',
    value: 'rgba(255,255,255,0.11)',
    desc: 'L4: Toasts & high elevation modals',
  },
];

const accents = [
  { name: '--indigo', value: '#6366F1', grammar: 'Indigo = You can act (Primary actions, links)' },
  { name: '--indigo-bright', value: '#818CF8', grammar: 'Indigo hover' },
  { name: '--indigo-deep', value: '#4338CA', grammar: 'Indigo pressed state' },
  {
    name: '--violet',
    value: '#8B5CF6',
    grammar: 'Violet = You have acted (Voted, rewarded, qualified)',
  },
  { name: '--violet-bright', value: '#A78BFA', grammar: 'Violet hover' },
  {
    name: '--cyan',
    value: '#22D3EE',
    grammar: 'Cyan = Live data (Counts, countdowns, realtime rank)',
  },
  { name: '--cyan-bright', value: '#67E8F9', grammar: 'Cyan hover / pulse peak' },
];

const semantics = [
  { name: '--success', value: '#34D399', desc: 'Confirmations, verified badge' },
  { name: '--warning', value: '#FBBF24', desc: 'Quota running low, warnings' },
  { name: '--danger', value: '#F87171', desc: 'Rejections, destructive confirmation' },
  { name: '--info', value: '#38BDF8', desc: 'System notices' },
];

const radiuses = [
  { name: '--radius-xs', size: '6px', desc: 'Badges, chips' },
  { name: '--radius-sm', size: '10px', desc: 'Inputs, small buttons' },
  { name: '--radius-md', size: '14px', desc: 'Leaderboard rows, ambient panels' },
  { name: '--radius-lg', size: '20px', desc: 'Idea cards, standard containers' },
  { name: '--radius-xl', size: '28px', desc: 'Modals, floating sheets' },
  { name: '--radius-full', size: '9999px', desc: 'HUD, pill badges' },
];

export default function TokensDevPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-12 border-b border-white/10 pb-6">
        <span className="inline-block rounded bg-indigo/20 px-2.5 py-1 text-xs font-semibold text-indigo-bright">
          Verification Gallery [T-0.14]
        </span>
        <h1 className="type-h1 mt-3 text-ink-1">IdeaPulse Design Tokens</h1>
        <p className="type-body mt-2 text-ink-2">
          Strict verification against <code className="text-cyan">DESIGN.md</code> §9. Dark-only
          glassmorphism, signal through glass.
        </p>
      </header>

      {/* 1. Accent Grammar */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">1. Accent Grammar (DESIGN.md §2.2)</h2>
        <p className="type-body-sm mb-6 text-ink-2">
          Indigo, Violet, and Cyan carry strict semantic meaning across the application.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accents.map((accent) => (
            <div
              key={accent.name}
              className="glass duration-140 p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3">
                <span
                  className="h-9 w-9 rounded-md border border-white/20 shadow-sm"
                  style={{ backgroundColor: accent.value }}
                />
                <div>
                  <div className="font-mono text-sm font-semibold text-ink-1">{accent.name}</div>
                  <div className="font-mono text-xs text-ink-3">{accent.value}</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-2">{accent.grammar}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Canvas & Glass Surfaces */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">2. Canvas & Glass Surfaces (DESIGN.md §4.1)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {surfaces.map((s) => (
            <div key={s.name} className="glass p-5">
              <div
                className="mb-3 h-14 w-full rounded-md border border-white/10"
                style={{ background: s.value }}
              />
              <div className="font-mono text-sm font-semibold text-ink-1">{s.name}</div>
              <div className="font-mono text-xs text-ink-3">{s.value}</div>
              <p className="mt-2 text-xs text-ink-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Glass System Hierarchy */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">
          3. Glass Layers (L1 – L4 with Specular Top Edge)
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="glass-ambient p-6">
            <span className="text-xs font-semibold text-ink-3">
              Layer 1 Ambient (8px blur, 120% saturate)
            </span>
            <h3 className="type-h3 mt-2 text-ink-1">Ambient Surface</h3>
            <p className="type-body-sm mt-2 text-ink-2">
              Used for background table rows, quiet sections, and subtle wrappers.
            </p>
          </div>

          <div className="glass p-6">
            <span className="text-xs font-semibold text-indigo-bright">
              Layer 2 Panel (16px blur, 140% saturate)
            </span>
            <h3 className="type-h3 mt-2 text-ink-1">Standard Card Surface</h3>
            <p className="type-body-sm mt-2 text-ink-2">
              The primary container for idea cards and form panels. Features the specular top edge
              highlight.
            </p>
          </div>

          <div className="glass-floating p-6">
            <span className="text-xs font-semibold text-violet-bright">
              Layer 3 Floating (24px blur, 150% saturate)
            </span>
            <h3 className="type-h3 mt-2 text-ink-1">Floating Surface</h3>
            <p className="type-body-sm mt-2 text-ink-2">
              Used for dropdowns, popovers, and the header quota HUD.
            </p>
          </div>

          <div className="glass-overlay p-6">
            <span className="text-xs font-semibold text-cyan-bright">
              Layer 4 Overlay (40px blur, 160% saturate)
            </span>
            <h3 className="type-h3 mt-2 text-ink-1">Modal / Toast Overlay</h3>
            <p className="type-body-sm mt-2 text-ink-2">
              The highest elevation glass surface, used for modal dialogs and toasts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Typography Hierarchy */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">4. Typography Scale (DESIGN.md §3)</h2>
        <div className="glass space-y-6 p-8">
          <div>
            <span className="font-mono text-xs text-ink-3">
              --type-display (56px Space Grotesk)
            </span>
            <div className="type-display text-ink-1">Signal Through Glass</div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-h1 (40px Space Grotesk)</span>
            <div className="type-h1 text-ink-1">Community Idea Incubator</div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-h2 (30px Space Grotesk)</span>
            <div className="type-h2 text-ink-1">Cycle 12 Live Leaderboard</div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-h3 (22px Space Grotesk)</span>
            <div className="type-h3 text-ink-1">Offline-first sync for field research teams</div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-h4 (18px Geist Sans)</span>
            <div className="type-h4 text-ink-1">Subheading for structured sections</div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-body-lg (17px Geist Sans)</span>
            <div className="type-body-lg max-w-[68ch] text-ink-1">
              A conflict-resolution layer that lets researchers work for weeks without connectivity
              and merge data safely when back in signal range.
            </div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-body (15px Geist Sans)</span>
            <div className="type-body text-ink-1">
              Standard UI copy, inputs, table items, and notifications.
            </div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-body-sm (13.5px Geist Sans)</span>
            <div className="type-body-sm text-ink-2">
              Secondary helper copy, metadata, author timestamps.
            </div>
          </div>
          <div>
            <span className="font-mono text-xs text-ink-3">--type-caption (12px Geist Sans)</span>
            <div className="type-caption text-ink-3">POSTED 4 HOURS AGO · VERIFIED VOTE</div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <span className="font-mono text-xs text-ink-3">
              --numeric tabular digits (--type-count-xl & --type-count)
            </span>
            <div className="mt-2 flex items-baseline space-x-6">
              <span className="type-count-xl text-cyan">42</span>
              <span className="type-count text-cyan">⚡ 1,280 votes</span>
              <span className="font-mono text-sm text-ink-3">03:41:29 remaining</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Semantics & Badges */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">5. Semantics & Badges (DESIGN.md §7.8)</h2>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {semantics.map((sem) => (
            <div key={sem.name} className="glass p-5">
              <div className="flex items-center space-x-3">
                <span className="h-8 w-8 rounded-md" style={{ backgroundColor: sem.value }} />
                <div>
                  <div className="font-mono text-sm font-semibold text-ink-1">{sem.name}</div>
                  <div className="font-mono text-xs text-ink-3">{sem.value}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-2">{sem.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass p-6">
          <div className="mb-4 font-mono text-xs text-ink-3">
            Badge components (tint background + 28% alpha border)
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="bg-violet/12 inline-flex items-center rounded-[6px] border border-violet/30 px-3 py-1 text-xs font-medium text-violet-bright">
              Qualified
            </span>
            <span className="border-success/30 bg-success/12 text-success inline-flex items-center rounded-[6px] border px-3 py-1 text-xs font-medium">
              Verified
            </span>
            <span className="bg-cyan/12 inline-flex items-center rounded-[6px] border border-cyan/30 px-3 py-1 text-xs font-medium text-cyan-bright">
              New
            </span>
            <span className="border-warning/30 bg-warning/12 text-warning inline-flex items-center rounded-[6px] border px-3 py-1 text-xs font-medium">
              Under review
            </span>
            <span className="inline-flex items-center rounded-[6px] border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-ink-3">
              Withdrawn
            </span>
          </div>
        </div>
      </section>

      {/* 6. Radiuses */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">6. Radius Hierarchy (DESIGN.md §2.8)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {radiuses.map((r) => (
            <div key={r.name} className="glass p-4 text-center">
              <div
                className="mx-auto mb-3 h-14 w-14 border border-indigo/40 bg-indigo/10"
                style={{ borderRadius: r.size }}
              />
              <div className="font-mono text-xs font-semibold text-ink-1">{r.name}</div>
              <div className="text-xs text-ink-3">{r.size}</div>
              <div className="mt-1 text-[11px] text-ink-2">{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Glows & Focus Ring */}
      <section className="mb-14">
        <h2 className="type-h2 mb-4 text-ink-1">7. Glow Accents & Focus Indicator</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="glass flex h-32 items-center justify-center p-6 shadow-glow-indigo">
            <span className="text-sm font-semibold text-indigo-bright">--glow-indigo-md</span>
          </div>
          <div className="glass flex h-32 items-center justify-center p-6 shadow-glow-violet">
            <span className="text-sm font-semibold text-violet-bright">--glow-violet-md</span>
          </div>
          <div className="glass flex h-32 items-center justify-center p-6 shadow-glow-cyan">
            <span className="text-sm font-semibold text-cyan-bright">--glow-cyan-md</span>
          </div>
        </div>

        <div className="glass mt-6 p-6">
          <div className="mb-2 font-mono text-xs text-ink-3">Interactive Focus Ring Test</div>
          <p className="type-body-sm mb-4 text-ink-2">
            Tab into this input or button to verify the 2px <code>--indigo-bright</code> focus
            outline with 2px offset.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="Test focus visible outline..."
              className="input max-w-sm"
            />
            <button className="glass rounded-[10px] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
              Interactive Action
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
