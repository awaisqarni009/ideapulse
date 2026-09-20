# DESIGN.md — IdeaPulse

**Design System & Visual Specification**
Version 1.0 · Dark-only · Glassmorphism

---

## 1. Design direction

### 1.1 The concept: signal through glass

IdeaPulse is about scarcity and signal. You get five votes. Each one matters. The interface should feel like looking at something valuable held behind glass — visible, layered, lit from within, and not casually touchable.

The deep canvas (`#0B0F19`) is not "dark mode" as an inverted theme. It is a dark room, and the glass panels are the only lit objects in it. Light comes from two ambient sources that never move: an indigo bloom in the upper left and a cyan bloom in the lower right. Every panel's top edge catches a specular highlight consistent with that lighting. Every glow accent is the same light passing through the glass.

### 1.2 Where boldness is spent

One moment carries the design: **a vote landing.** The button compresses, a ring of light expands from the press point, the count rolls to its new value, and the quota HUD ticks down. That single 640 ms sequence is the most animated thing in the product.

Everything else stays quiet. Cards do not all fade-and-slide-up on scroll. Hover states are a 2-pixel lift and a border brightening, not a transform circus. Restraint around the vote is what makes the vote feel like it cost something.

### 1.3 Anti-patterns for this project

- No neon-on-black cyberpunk grid lines, scanlines, or terminal chrome.
- No purple-to-pink SaaS gradient washes used as decoration behind headings.
- No glass panel that isn't holding content — glass is a container, not a texture.
- No blurred element nested inside another blurred element (visually muddy, and it doubles the compositing cost).
- No all-caps tracked-out eyebrow labels above section headings.
- No `→` appended to button text.

---

## 2. Color

### 2.1 Canvas & surfaces

| Token             | Value                    | Use                                                   |
| ----------------- | ------------------------ | ----------------------------------------------------- |
| `--canvas`        | `#0B0F19`                | Page background. The single darkest value.            |
| `--canvas-deep`   | `#070A11`                | Behind modals, under the scrim.                       |
| `--surface-1`     | `rgba(255,255,255,0.03)` | Ambient panels, table rows                            |
| `--surface-2`     | `rgba(255,255,255,0.05)` | Cards, form fields                                    |
| `--surface-3`     | `rgba(255,255,255,0.08)` | Floating: dropdowns, modals, popovers                 |
| `--surface-4`     | `rgba(255,255,255,0.11)` | Toasts, tooltips — highest elevation                  |
| `--surface-solid` | `#131826`                | Opaque fallback when `backdrop-filter` is unsupported |

### 2.2 Accents

Three accents, each with a fixed job. They are never used interchangeably.

| Token             | Value     | Job                                                  |
| ----------------- | --------- | ---------------------------------------------------- |
| `--indigo`        | `#6366F1` | Primary actions, brand, links                        |
| `--indigo-bright` | `#818CF8` | Hover state of primary                               |
| `--indigo-deep`   | `#4338CA` | Pressed state, gradient terminus                     |
| `--violet`        | `#8B5CF6` | Voted / committed state, rewards, qualification      |
| `--violet-bright` | `#A78BFA` | Violet hover                                         |
| `--cyan`          | `#22D3EE` | Live data: counts, countdowns, realtime rank changes |
| `--cyan-bright`   | `#67E8F9` | Cyan hover, active pulse peak                        |

**Accent discipline.** Indigo means "you can act". Violet means "you have acted" or "this has been awarded". Cyan means "this number is live and changing". A user who learns those three meanings can read state from color alone at a glance — which is exactly why the palette is not applied decoratively.

### 2.3 Semantic

| Token       | Value     | Use                                     |
| ----------- | --------- | --------------------------------------- |
| `--success` | `#34D399` | Confirmations, verified badge           |
| `--warning` | `#FBBF24` | Quota running low, cooldown approaching |
| `--danger`  | `#F87171` | Rejections, destructive confirmations   |
| `--info`    | `#38BDF8` | Neutral system notices                  |

Each semantic color has a matching surface tint at 12% alpha and a border at 28% alpha, defined in §2.6.

### 2.4 Text

Text on glass is the hardest accessibility problem in this system. These values are specified as **solid hex, not alpha**, because alpha text over a variable-luminance backdrop produces unpredictable contrast.

| Token              | Value     | Contrast on `--canvas` | Use                                |
| ------------------ | --------- | ---------------------- | ---------------------------------- |
| `--text-primary`   | `#F1F4FB` | 16.8:1                 | Headings, body, counts             |
| `--text-secondary` | `#A9B2C8` | 8.1:1                  | Supporting copy, metadata          |
| `--text-tertiary`  | `#6E778F` | 4.6:1                  | Timestamps, placeholders, disabled |
| `--text-inverse`   | `#0B0F19` | —                      | Text on a filled accent button     |

`--text-tertiary` is at the 4.5:1 floor on the darkest canvas. It is **forbidden** on `--surface-3` and above, where the lighter backdrop pushes it below AA. Use `--text-secondary` there.

### 2.5 Borders & edges

| Token              | Value                    | Use                               |
| ------------------ | ------------------------ | --------------------------------- |
| `--border-subtle`  | `rgba(255,255,255,0.06)` | Dividers inside a panel           |
| `--border-default` | `rgba(255,255,255,0.10)` | The standard glass edge           |
| `--border-strong`  | `rgba(255,255,255,0.16)` | Hover, focus-within               |
| `--border-accent`  | `rgba(99,102,241,0.45)`  | Active/selected                   |
| `--edge-specular`  | `rgba(255,255,255,0.14)` | Top-edge highlight (inset shadow) |

### 2.6 Tint surfaces

```css
--tint-indigo: rgba(99, 102, 241, 0.12);
--tint-violet: rgba(139, 92, 246, 0.12);
--tint-cyan: rgba(34, 211, 238, 0.12);
--tint-success: rgba(52, 211, 153, 0.12);
--tint-warning: rgba(251, 191, 36, 0.12);
--tint-danger: rgba(248, 113, 113, 0.12);
```

### 2.7 Ambient lighting

Two fixed radial glows sit behind everything, on the `<body>`. They never animate and never move — they establish where the light comes from so every specular highlight is consistent.

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(60rem 40rem at 12% -6%, rgba(99, 102, 241, 0.16), transparent 62%),
    radial-gradient(52rem 36rem at 92% 108%, rgba(34, 211, 238, 0.12), transparent 60%),
    radial-gradient(40rem 30rem at 68% 24%, rgba(139, 92, 246, 0.07), transparent 66%);
}
```

---

## 3. Typography

Two families, clearly distinct in structure.

| Role      | Family            | Why this one                                                                                                                                         |
| --------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display   | **Space Grotesk** | Its squared terminals and single-storey `a` read as engineered rather than editorial. It gives headings a built quality without tipping into sci-fi. |
| Body / UI | **Geist Sans**    | Neutral, tightly fit, and drawn for interfaces at small sizes. Falls back to Inter, then system UI.                                                  |

No third family. Numeric data uses Geist with `font-variant-numeric: tabular-nums lining-nums` so counters and countdowns don't shift width as digits change — that solves the alignment problem a monospace face would otherwise be brought in for.

```css
--font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
--font-body: 'Geist Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
--numeric: tabular-nums lining-nums;
```

### 3.1 Type scale

A 1.25 (major third) scale, rounded to whole pixels.

| Token             | Size / line-height | Weight | Tracking | Family  | Use                           |
| ----------------- | ------------------ | ------ | -------- | ------- | ----------------------------- |
| `--type-display`  | 56 / 60            | 600    | −0.03em  | Display | Landing hero                  |
| `--type-h1`       | 40 / 46            | 600    | −0.025em | Display | Page titles                   |
| `--type-h2`       | 30 / 38            | 600    | −0.02em  | Display | Section headings              |
| `--type-h3`       | 22 / 30            | 600    | −0.015em | Display | Card titles, idea titles      |
| `--type-h4`       | 18 / 26            | 500    | −0.01em  | Body    | Sub-headings                  |
| `--type-body-lg`  | 17 / 28            | 400    | 0        | Body    | Idea body text                |
| `--type-body`     | 15 / 24            | 400    | 0        | Body    | Default UI text               |
| `--type-body-sm`  | 13.5 / 20          | 400    | 0        | Body    | Metadata, helper text         |
| `--type-caption`  | 12 / 16            | 500    | 0.01em   | Body    | Timestamps, badge text        |
| `--type-count-xl` | 44 / 44            | 600    | −0.02em  | Display | Hero vote counts, `--numeric` |
| `--type-count`    | 20 / 24            | 600    | −0.01em  | Display | Card vote counts, `--numeric` |

**Mobile scale-down** (below 768px): display 40/44, h1 30/36, h2 24/30, h3 19/26. Body sizes are unchanged — shrinking body text below 15px on mobile hurts more than it saves.

### 3.2 Measure

Body copy caps at `68ch`. Idea bodies render in a `--type-body-lg` column at `--measure` width, centered in the detail layout.

```css
--measure: 68ch;
```

### 3.3 Rules

- Sentence case everywhere, including buttons and labels. No all-caps.
- Never accent a single word in a heading with a different color or weight.
- Idea titles render in `--type-h3` at 600 weight; they are content, not chrome, and get no decorative treatment.
- Numbers that update live (`vote_count`, countdowns) always carry `--numeric` and `--cyan`.

---

## 4. The glass system

### 4.1 Layer model

Every surface belongs to exactly one layer. Layers do not nest — a card on layer 2 never contains another blurred panel.

| Layer | Name     | Blur | Saturate | Background    | Border             | Shadow        |
| ----- | -------- | ---- | -------- | ------------- | ------------------ | ------------- |
| L0    | Canvas   | —    | —        | `--canvas`    | —                  | —             |
| L1    | Ambient  | 8px  | 120%     | `--surface-1` | `--border-subtle`  | `--shadow-sm` |
| L2    | Panel    | 16px | 140%     | `--surface-2` | `--border-default` | `--shadow-md` |
| L3    | Floating | 24px | 150%     | `--surface-3` | `--border-default` | `--shadow-lg` |
| L4    | Overlay  | 40px | 160%     | `--surface-4` | `--border-strong`  | `--shadow-xl` |

```css
--blur-sm: 8px;
--blur-md: 16px;
--blur-lg: 24px;
--blur-xl: 40px;

--saturate-sm: 120%;
--saturate-md: 140%;
--saturate-lg: 150%;
--saturate-xl: 160%;
```

The `saturate()` companion to `blur()` is what separates convincing glass from grey fog. Blurring alone desaturates whatever is behind the panel; boosting saturation restores the color the blur washed out, so the ambient indigo and cyan glows still read through the glass.

### 4.2 The base glass recipe

```css
.glass {
  position: relative;
  background: var(--surface-2);
  backdrop-filter: blur(var(--blur-md)) saturate(var(--saturate-md));
  -webkit-backdrop-filter: blur(var(--blur-md)) saturate(var(--saturate-md));
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow:
    inset 0 1px 0 var(--edge-specular),
    /* specular top edge — the light source */ var(--shadow-md);
}

/* Opaque fallback where backdrop-filter is unavailable */
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: var(--surface-solid);
  }
}
```

The `inset 0 1px 0` highlight is the single most important line in this system. It is what makes a panel read as a physical pane catching light from above rather than a translucent rectangle.

### 4.3 Gradient borders

For emphasis surfaces — a qualified idea, the active leaderboard leader, the primary CTA — the flat border is replaced with a gradient border using the two-background padding-box/border-box technique.

```css
.glass--gradient-border {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--surface-2), var(--surface-2)) padding-box,
    linear-gradient(
        135deg,
        rgba(99, 102, 241, 0.7) 0%,
        rgba(139, 92, 246, 0.45) 45%,
        rgba(34, 211, 238, 0.6) 100%
      )
      border-box;
}
```

Because `background` is overridden here, `backdrop-filter` still applies but the translucent surface color is baked into the padding-box layer. For a gradient-bordered panel that must also blur, use a pseudo-element ring instead:

```css
.glass--ring {
  position: relative;
}
.glass--ring::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--indigo), var(--violet) 48%, var(--cyan));
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.55;
  transition: opacity var(--dur-md) var(--ease-standard);
}
.glass--ring:hover::after {
  opacity: 1;
}
```

### 4.4 Glow

Glow is a colored shadow, never a filter. `filter: drop-shadow` on a blurred element forces an extra compositing pass and visibly degrades scroll performance.

```css
--glow-indigo-sm: 0 0 0 1px rgba(99, 102, 241, 0.3), 0 4px 20px -4px rgba(99, 102, 241, 0.35);
--glow-indigo-md: 0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 32px -6px rgba(99, 102, 241, 0.5);
--glow-indigo-lg: 0 0 0 1px rgba(99, 102, 241, 0.5), 0 12px 48px -8px rgba(99, 102, 241, 0.62);
--glow-violet-md: 0 0 0 1px rgba(139, 92, 246, 0.4), 0 8px 32px -6px rgba(139, 92, 246, 0.5);
--glow-cyan-md: 0 0 0 1px rgba(34, 211, 238, 0.4), 0 8px 32px -6px rgba(34, 211, 238, 0.45);
--glow-danger-md: 0 0 0 1px rgba(248, 113, 113, 0.4), 0 8px 28px -8px rgba(248, 113, 113, 0.42);
```

### 4.5 Elevation shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 8px 24px -8px rgba(0, 0, 0, 0.48);
--shadow-lg: 0 20px 48px -12px rgba(0, 0, 0, 0.58);
--shadow-xl: 0 32px 72px -16px rgba(0, 0, 0, 0.68);
```

### 4.6 Performance budget

`backdrop-filter` is the most expensive property in this system. Hard limits:

- **Maximum 12 blurred elements in the viewport at once.** Feed cards use L2 glass; beyond 12 visible cards, virtualize or switch off-screen cards to `--surface-solid`.
- **Never nest blurred elements.** A badge inside a glass card uses a tint background, not its own `backdrop-filter`.
- **Never animate `backdrop-filter`.** Animate `opacity` and `transform` only.
- **Do not set `will-change: backdrop-filter`.** It forces a permanent layer and increases memory without improving frame time.
- On scroll containers with many glass cards, apply `contain: paint` to each card.
- Test on a mid-range Android device. If sustained scroll drops below 50 fps, drop feed cards from `--blur-md` to `--blur-sm`.

---

## 5. Geometry

### 5.1 Radius

```css
--radius-xs: 6px; /* badges, chips, tags */
--radius-sm: 10px; /* inputs, small buttons */
--radius-md: 14px; /* buttons, list rows */
--radius-lg: 20px; /* cards, panels */
--radius-xl: 28px; /* modals, hero panels */
--radius-full: 9999px;
```

Radius encodes hierarchy: the bigger the surface, the larger the radius. A 20px radius on a 32px-tall badge and a 20px radius on a 600px modal is the flattening that makes generated interfaces look like a component kit rather than a designed system.

### 5.2 Spacing

A 4px base scale.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

Section rhythm: `--space-20` between major page sections on desktop, `--space-12` on mobile. Card padding: `--space-6`. Panel padding: `--space-8`.

### 5.3 Layout

```css
--container-max: 1200px;
--container-narrow: 760px; /* idea detail reading column */
--gutter: clamp(16px, 4vw, 32px);
--header-height: 64px;
```

| Breakpoint | Width     | Feed grid                           |
| ---------- | --------- | ----------------------------------- |
| `sm`       | 360–639   | 1 column                            |
| `md`       | 640–1023  | 2 columns                           |
| `lg`       | 1024–1279 | 2 columns + sticky leaderboard rail |
| `xl`       | 1280+     | 3 columns + rail                    |

Content is left-aligned throughout. The only centered text in the product is the landing hero and empty states.

---

## 6. Motion

### 6.1 Tokens

```css
--dur-instant: 90ms; /* state color flips */
--dur-xs: 140ms; /* hover, focus */
--dur-sm: 200ms; /* button press, toggle */
--dur-md: 280ms; /* panel open, tooltip */
--dur-lg: 400ms; /* modal, page transition */
--dur-xl: 640ms; /* the vote sequence */

--ease-standard: cubic-bezier(0.2, 0, 0, 1); /* default in/out */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* entrances */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0); /* exits */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot, used sparingly */
```

Framer Motion spring equivalents:

```ts
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 }, // buttons
  smooth: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }, // panels
  rank: { type: 'spring', stiffness: 300, damping: 32, mass: 1.0 }, // leaderboard reorder
} as const;
```

### 6.2 Principles

1. **Motion answers an action.** If nothing was clicked, tapped, or changed on the server, nothing should move.
2. **One orchestrated moment per page.** The landing page has a staggered hero entrance. No other page does. Feed cards appear without animation.
3. **Direction carries meaning.** Things that enter from above are informational (toasts). Things that scale up from their origin are the result of your action (vote confirmation, modals).
4. **Never animate layout properties.** `transform` and `opacity` only. A leaderboard reorder uses Framer Motion's `layout` prop, which compiles to transforms.

### 6.3 The vote sequence — the signature interaction

Total duration 640 ms, five overlapping stages:

| t (ms) | Element   | Change                                                                                                                                                     |
| ------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0      | Button    | `scale: 0.96`, 90 ms, `--ease-in`                                                                                                                          |
| 60     | Ring      | Pseudo-element ring expands `scale 0.8 → 1.9`, `opacity 0.9 → 0`, 420 ms, `--ease-out`                                                                     |
| 90     | Button    | `scale: 0.96 → 1`, spring `snappy`                                                                                                                         |
| 120    | Button    | Border and glow cross-fade indigo → violet, 200 ms                                                                                                         |
| 140    | Count     | Old digit slides up and out (`y: -14`, `opacity: 0`), new digit slides in from below (`y: 14 → 0`), 260 ms, `--ease-out`, tabular width so nothing reflows |
| 200    | Icon      | Outline pulse icon swaps to filled, `scale 1 → 1.18 → 1`, spring `snappy`                                                                                  |
| 260    | Quota HUD | Pip N extinguishes: `opacity 1 → 0.25`, `scale 1 → 0.85`, 200 ms                                                                                           |
| 400    | Card      | Border settles to violet resting state                                                                                                                     |

```tsx
// components/vote-button/motion.ts
export const voteRing = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1.9,
    opacity: [0, 0.9, 0],
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.06 },
  },
};

export const countRoll = {
  initial: { y: 14, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: -14, opacity: 0, transition: { duration: 0.18, ease: [0.7, 0, 0.84, 0] } },
};
```

**On rejection**, the sequence is replaced by a single horizontal shake — `x: [0, -6, 5, -3, 0]` over 260 ms — the button returns to its unvoted state, and an inline reason appears beneath it. No red flash on the whole card. The failure is local to the control that failed.

### 6.4 Other animations

| Interaction         | Spec                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card hover          | `translateY(-2px)`, border → `--border-strong`, ring opacity 0.55 → 1, glow `sm` → `md`. 140 ms, `--ease-standard`.                                              |
| Button hover        | Background lightens one step, glow `sm` → `md`. 140 ms.                                                                                                          |
| Button press        | `scale: 0.97`, 90 ms.                                                                                                                                            |
| Focus ring          | Appears instantly, no transition. Delayed focus rings read as lag.                                                                                               |
| Modal open          | Backdrop `opacity 0 → 1` 200 ms; panel `scale 0.96 → 1`, `y 12 → 0`, spring `smooth`.                                                                            |
| Modal close         | Reverse at 0.7× duration, `--ease-in`.                                                                                                                           |
| Toast               | Enter `y: -16 → 0`, `opacity 0 → 1`, 280 ms `--ease-out`. Auto-dismiss 5 s. Exit `x: 0 → 24`, `opacity → 0`, 200 ms.                                             |
| Dropdown            | `scale 0.97 → 1`, `y -6 → 0`, 200 ms, transform-origin at the trigger.                                                                                           |
| Leaderboard reorder | Framer `layout` with spring `rank`. Rows that moved up flash a 1px cyan left border for 600 ms.                                                                  |
| Countdown tick      | No animation on the seconds digit. A per-second animation in a persistent header is visual noise and a constant repaint.                                         |
| Cycle close         | One-time celebration: qualified rows sweep a soft violet highlight left-to-right, 900 ms, once per user per cycle. Stored in `localStorage` so it never repeats. |
| Skeleton            | Background-position shimmer, 1.6 s linear infinite. The only looping animation in the product, and only while data is pending.                                   |

### 6.5 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
const reduce = useReducedMotion();
<motion.div layout={!reduce} transition={reduce ? { duration: 0 } : spring.rank} />;
```

Under reduced motion the vote still gives feedback — the color flips, the count changes, the pip extinguishes — but instantly, with no ring, no roll, and no scale. **Feedback is not optional; animation is.**

---

## 7. Components

### 7.1 Buttons

| Variant       | Resting                                                                                  | Hover                                                                          | Active                            | Focus                                  | Disabled                                       |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------- | -------------------------------------- | ---------------------------------------------- |
| **Primary**   | `linear-gradient(135deg, --indigo, --indigo-deep)`, `--text-primary`, `--glow-indigo-sm` | Gradient shifts to `--indigo-bright`→`--indigo`, `--glow-indigo-md`, `y: -1px` | `scale: 0.97`, `--glow-indigo-sm` | 2px `--indigo-bright` ring, 2px offset | `opacity: 0.4`, no glow, `cursor: not-allowed` |
| **Secondary** | L2 glass, `--border-default`, `--text-primary`                                           | `--border-strong`, `--surface-3`                                               | `scale: 0.97`                     | Same ring                              | `opacity: 0.4`                                 |
| **Ghost**     | Transparent, `--text-secondary`                                                          | `--surface-1`, `--text-primary`                                                | `scale: 0.98`                     | Same ring                              | `opacity: 0.4`                                 |
| **Danger**    | `--tint-danger`, `1px rgba(248,113,113,0.28)`, `--danger` text                           | `--glow-danger-md`, border 0.45 alpha                                          | `scale: 0.97`                     | 2px `--danger` ring                    | `opacity: 0.4`                                 |

Sizes: `sm` 32px (`--space-3` padding, 13.5px), `md` 40px (`--space-4`, 15px), `lg` 48px (`--space-6`, 17px). All use `--radius-md`. Minimum touch target 44×44 on coarse pointers — pad `sm` buttons with a transparent hit area rather than growing them visually.

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font: 500 15px/1 var(--font-body);
  transition:
    background var(--dur-xs) var(--ease-standard),
    box-shadow var(--dur-xs) var(--ease-standard),
    transform var(--dur-sm) var(--ease-standard),
    border-color var(--dur-xs) var(--ease-standard);
}
.btn:focus-visible {
  outline: 2px solid var(--indigo-bright);
  outline-offset: 2px;
}
```

**Loading state:** the label stays in place and is set to `opacity: 0.55`; a 16px spinner replaces the leading icon. The button width never changes — width shifts move whatever is next to it.

### 7.2 Vote button

The most specified control in the product.

| State               | Appearance                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Available**       | 44px pill, L2 glass, `--border-default`, outline pulse icon in `--indigo`, count in `--text-primary` `--numeric`. Hover: `--glow-indigo-md`, border `--border-accent`.          |
| **Voted**           | `--tint-violet` background, `1px rgba(139,92,246,0.45)`, filled icon in `--violet-bright`, `--glow-violet-md`. Cursor `default`. Tooltip: "You voted for this."                 |
| **Retractable**     | Voted state plus a small `×` affordance that appears on hover during the 10-minute window, with a tooltip showing the remaining time.                                           |
| **Quota exhausted** | `opacity: 0.45`, no glow, `cursor: not-allowed`. Tooltip: "Next vote in 3h 41m."                                                                                                |
| **Own idea**        | `opacity: 0.35`, icon replaced with a lock glyph. Tooltip: "You can't vote on your own idea."                                                                                   |
| **Anonymous**       | Fully enabled appearance — clicking opens the sign-in modal and replays the vote afterward. Never disable a control for a logged-out user; that removes the path to conversion. |
| **Pending**         | Icon swaps to a spinner, count holds the optimistic value, control is `pointer-events: none`.                                                                                   |
| **Rejected**        | Shake, revert to Available, inline reason below.                                                                                                                                |

### 7.3 Idea card (feed)

```
┌─ L2 glass · radius-lg · padding space-6 ─────────────┐
│  ┌──────┐  Maya Chen · 4h ago                        │  avatar 32px
│  │ MC   │  ai · offline-first                        │  tags as chips
│  └──────┘                                            │
│                                                      │
│  Offline-first sync for field research teams         │  h3, 2-line clamp
│                                                      │
│  A conflict-resolution layer that lets researchers    │  body-sm, secondary,
│  work for weeks without connectivity and merge...     │  3-line clamp
│                                                      │
│  ────────────────────────────────────────────────    │  border-subtle
│  ⚡ 38 · 12 to qualify            [ ▲ Vote ]          │
└──────────────────────────────────────────────────────┘
```

- Hover: `translateY(-2px)`, gradient ring to full opacity, `--glow-indigo-sm`. 140 ms.
- Qualified: permanent gradient ring at 0.8 opacity, a violet "Qualified" badge replaces the progress text, `--glow-violet-md` at rest.
- The whole card is a link; the vote button is a nested interactive element with `e.stopPropagation()` and its own focus stop.
- Keyboard: the card is one tab stop, the vote button is the next.

### 7.4 Quota HUD

Persistent in the header for signed-in users.

```
┌─ L3 glass · radius-full · h 36px ─────────────────┐
│  ● ● ● ○ ○   3 left · resets 4h 12m                │
└───────────────────────────────────────────────────┘
```

- Filled pip: 8px circle, `--cyan`, `--glow-cyan-md` at 40% strength.
- Spent pip: 8px circle, `rgba(255,255,255,0.14)`, no glow.
- At 1 vote remaining the label turns `--warning`.
- At 0 the pips all dim to 0.25 and the label reads "No votes left · back in 3h 41m".
- The countdown recomputes client-side every 30 s from a server-provided `nextSlotAt` — never from a client-side clock accumulating drift.

### 7.5 Qualification progress

```
38 / 50 verified votes
[████████████████████░░░░░░░░]  12 to go
```

- Track: `rgba(255,255,255,0.08)`, 6px, `--radius-full`.
- Fill: `linear-gradient(90deg, --indigo, --violet)`, animated width, 400 ms `--ease-out`, `--glow-indigo-sm`.
- At 100%: fill switches to `linear-gradient(90deg, --violet, --cyan)` with `--glow-violet-md`, label becomes "Qualified".
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label="Verified votes toward qualification"`.

### 7.6 Leaderboard row

```
┌─ L1 glass · radius-md · h 72px ──────────────────────────────┐
│  01   Offline-first sync for field research teams             │
│       Maya Chen                          Qualified    ⚡ 61    │
└───────────────────────────────────────────────────────────────┘
```

- Rank numeral: `--type-count`, `--numeric`. Ranks 1–3 use `--violet-bright`; the rest use `--text-tertiary`. No medal emoji, no trophy icons.
- Rank 1 row gets the gradient ring and `--glow-violet-md`.
- On realtime rank change: Framer `layout` reorder with spring `rank`; rows that moved up flash a 1px `--cyan` left border for 600 ms.
- Rows are `<li>` inside an `<ol>`, so rank is conveyed structurally, not only visually.

### 7.7 Inputs

```css
.input {
  background: var(--surface-2);
  backdrop-filter: blur(var(--blur-sm)) saturate(var(--saturate-sm));
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font: 400 15px/1.4 var(--font-body);
  transition:
    border-color var(--dur-xs) var(--ease-standard),
    box-shadow var(--dur-xs) var(--ease-standard);
}
.input::placeholder {
  color: var(--text-tertiary);
}
.input:hover {
  border-color: var(--border-strong);
}
.input:focus {
  outline: none;
  border-color: var(--indigo);
  box-shadow: var(--glow-indigo-sm);
}
.input[aria-invalid='true'] {
  border-color: var(--danger);
  box-shadow: var(--glow-danger-md);
}
```

- Labels sit above the field in `--type-body-sm`, `--text-secondary`. No floating labels — they hurt scannability on a long form and break autofill styling.
- Character counters appear at 80% of the limit, turn `--warning` at 95%, `--danger` at 100%.
- Error text appears below the field in `--danger`, `--type-body-sm`, wired via `aria-describedby`.

### 7.8 Badges

32px tall, `--radius-xs`, `--type-caption`, tint background with a 28%-alpha border of the same hue. No glass, no blur — a badge sitting on a glass card must not blur again.

| Badge        | Tint             | Text              |
| ------------ | ---------------- | ----------------- |
| Qualified    | `--tint-violet`  | `--violet-bright` |
| Verified     | `--tint-success` | `--success`       |
| New          | `--tint-cyan`    | `--cyan-bright`   |
| Under review | `--tint-warning` | `--warning`       |
| Withdrawn    | `--surface-2`    | `--text-tertiary` |

### 7.9 Modal

- Backdrop: `rgba(7,10,17,0.72)` + `backdrop-filter: blur(6px)`.
- Panel: L4 glass, `--radius-xl`, `--space-8` padding, max-width 520px, `--shadow-xl`.
- Focus trapped on open; focus returns to the trigger on close; `Escape` closes.
- The vote-from-anonymous modal is the one exception to "one orchestrated moment" — it enters with spring `smooth` because it interrupts an action the user was mid-way through and needs to explain itself.

### 7.10 Toast

L4 glass, `--radius-lg`, max-width 380px, top-right on desktop, top-center full-width-minus-gutter on mobile. A 2px left border in the semantic color. `role="status"` for success, `role="alert"` for errors. Maximum 3 stacked; the oldest is dropped.

### 7.11 Empty states

Every list has one. Structure: a 56px line-art glyph at `--text-tertiary`, a `--type-h4` line stating the situation, a `--type-body-sm` line in `--text-secondary` stating what to do, and one primary action.

| Surface                | Heading                                  | Action               |
| ---------------------- | ---------------------------------------- | -------------------- |
| Feed, no results       | No ideas match these filters             | Clear filters        |
| Feed, no ideas at all  | This cycle is waiting for its first idea | Post an idea         |
| Leaderboard, empty     | Nothing has been voted on yet this cycle | Browse ideas         |
| Profile, no ideas      | Maya hasn't posted an idea yet           | —                    |
| Your profile, no ideas | You haven't posted an idea yet           | Post your first idea |
| Rewards, none          | No idea reached 50 votes this cycle      | See cycle 12 results |

Empty states never apologize and never use the word "oops".

---

## 8. Accessibility

| Requirement        | Standard                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Text contrast      | 4.5:1 minimum, measured against the **lightest** possible backdrop behind the glass, not against `--canvas`     |
| Non-text contrast  | 3:1 for borders, icons, focus indicators                                                                        |
| Focus visible      | 2px `--indigo-bright` outline, 2px offset, on every interactive element, never removed                          |
| Keyboard           | Full operation without a pointer; logical tab order; skip-to-content link as the first tab stop                 |
| Target size        | 44×44 CSS px minimum on coarse pointers                                                                         |
| Motion             | `prefers-reduced-motion` honored globally; feedback preserved without animation                                 |
| Live regions       | Vote count changes announced via `aria-live="polite"`; errors via `role="alert"`                                |
| Color independence | Qualified state carries a text label, not only a violet ring. Verified state carries a badge, not only a color. |
| Semantics          | Leaderboard is `<ol>`; idea cards are `<article>`; the feed is `<main>`                                         |
| Forms              | Every input has a `<label>`; errors linked by `aria-describedby`; `aria-invalid` on failure                     |
| Zoom               | Usable at 200% zoom with no horizontal scroll                                                                   |

**The glass contrast trap.** A translucent panel over the ambient indigo glow is measurably lighter than one over bare canvas. All text contrast must be validated against the worst case — panel over the brightest part of the glow. Where a panel can sit over a glow, raise its background opacity to 0.08 minimum so the backdrop's luminance variation is damped.

---

## 9. Token reference

```css
:root {
  /* Canvas & surfaces */
  --canvas: #0b0f19;
  --canvas-deep: #070a11;
  --surface-solid: #131826;
  --surface-1: rgba(255, 255, 255, 0.03);
  --surface-2: rgba(255, 255, 255, 0.05);
  --surface-3: rgba(255, 255, 255, 0.08);
  --surface-4: rgba(255, 255, 255, 0.11);

  /* Accents */
  --indigo: #6366f1;
  --indigo-bright: #818cf8;
  --indigo-deep: #4338ca;
  --violet: #8b5cf6;
  --violet-bright: #a78bfa;
  --cyan: #22d3ee;
  --cyan-bright: #67e8f9;

  /* Semantic */
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #f87171;
  --info: #38bdf8;

  /* Tints */
  --tint-indigo: rgba(99, 102, 241, 0.12);
  --tint-violet: rgba(139, 92, 246, 0.12);
  --tint-cyan: rgba(34, 211, 238, 0.12);
  --tint-success: rgba(52, 211, 153, 0.12);
  --tint-warning: rgba(251, 191, 36, 0.12);
  --tint-danger: rgba(248, 113, 113, 0.12);

  /* Text */
  --text-primary: #f1f4fb;
  --text-secondary: #a9b2c8;
  --text-tertiary: #6e778f;
  --text-inverse: #0b0f19;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.16);
  --border-accent: rgba(99, 102, 241, 0.45);
  --edge-specular: rgba(255, 255, 255, 0.14);

  /* Glass */
  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 24px;
  --blur-xl: 40px;
  --saturate-sm: 120%;
  --saturate-md: 140%;
  --saturate-lg: 150%;
  --saturate-xl: 160%;

  /* Shadows & glows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px -8px rgba(0, 0, 0, 0.48);
  --shadow-lg: 0 20px 48px -12px rgba(0, 0, 0, 0.58);
  --shadow-xl: 0 32px 72px -16px rgba(0, 0, 0, 0.68);
  --glow-indigo-sm: 0 0 0 1px rgba(99, 102, 241, 0.3), 0 4px 20px -4px rgba(99, 102, 241, 0.35);
  --glow-indigo-md: 0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 32px -6px rgba(99, 102, 241, 0.5);
  --glow-indigo-lg: 0 0 0 1px rgba(99, 102, 241, 0.5), 0 12px 48px -8px rgba(99, 102, 241, 0.62);
  --glow-violet-md: 0 0 0 1px rgba(139, 92, 246, 0.4), 0 8px 32px -6px rgba(139, 92, 246, 0.5);
  --glow-cyan-md: 0 0 0 1px rgba(34, 211, 238, 0.4), 0 8px 32px -6px rgba(34, 211, 238, 0.45);
  --glow-danger-md: 0 0 0 1px rgba(248, 113, 113, 0.4), 0 8px 28px -8px rgba(248, 113, 113, 0.42);

  /* Radius */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Layout */
  --container-max: 1200px;
  --container-narrow: 760px;
  --gutter: clamp(16px, 4vw, 32px);
  --header-height: 64px;
  --measure: 68ch;

  /* Type */
  --font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Geist Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Motion */
  --dur-instant: 90ms;
  --dur-xs: 140ms;
  --dur-sm: 200ms;
  --dur-md: 280ms;
  --dur-lg: 400ms;
  --dur-xl: 640ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Z-index */
  --z-base: 0;
  --z-sticky: 100;
  --z-header: 200;
  --z-dropdown: 300;
  --z-modal-backdrop: 400;
  --z-modal: 401;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

### 9.1 Tailwind mapping

```js
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#0B0F19', deep: '#070A11', solid: '#131826' },
        indigo: { DEFAULT: '#6366F1', bright: '#818CF8', deep: '#4338CA' },
        violet: { DEFAULT: '#8B5CF6', bright: '#A78BFA' },
        cyan: { DEFAULT: '#22D3EE', bright: '#67E8F9' },
        ink: { 1: '#F1F4FB', 2: '#A9B2C8', 3: '#6E778F' },
      },
      backdropBlur: { glass: '16px', panel: '24px', overlay: '40px' },
      borderRadius: { xs: '6px', sm: '10px', md: '14px', lg: '20px', xl: '28px' },
      boxShadow: {
        'glow-indigo': 'var(--glow-indigo-md)',
        'glow-violet': 'var(--glow-violet-md)',
        'glow-cyan': 'var(--glow-cyan-md)',
        glass: 'inset 0 1px 0 rgba(255,255,255,.14), 0 8px 24px -8px rgba(0,0,0,.48)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.2,0,0,1)',
        out: 'cubic-bezier(.16,1,.3,1)',
      },
    },
  },
};
```

---

## 10. Design QA checklist

Before any screen ships:

- [ ] No nested `backdrop-filter`
- [ ] 12 or fewer blurred elements in the viewport
- [ ] Every glass panel has the `inset 0 1px 0` specular edge
- [ ] Radius matches the surface size tier
- [ ] Accent colors used per their assigned meaning (indigo = act, violet = acted, cyan = live)
- [ ] All live numbers use `--numeric`
- [ ] Text contrast validated over the brightest backdrop, not just the canvas
- [ ] Focus ring visible on every interactive element
- [ ] Reduced-motion verified: feedback preserved, animation removed
- [ ] Empty state designed
- [ ] Error state designed, with a specific message and a rule link
- [ ] Loading state does not change the layout's dimensions
- [ ] Usable at 360px and at 200% zoom
- [ ] Scroll sustained above 50 fps on a mid-range Android device
