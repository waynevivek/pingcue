---
name: PingCue
description: Playful, crisp invoice chaser for solo freelancers who send payment links by email or WhatsApp.
colors:
  ink-black: "#111111"
  ink-hover: "#262626"
  muted-zinc: "#52525b"
  canvas-white: "#ffffff"
  surface-soft: "#fafafa"
  pill-surface: "#f4f4f5"
  hairline-border: "#e4e4e7"
  mint-brand: "#c3f584"
  sky-stage-top: "#5bc2ff"
  sky-stage-mid: "#84d6ff"
  meadow-soft: "#c7f584"
  meadow-deep: "#a8ec62"
  pastel-butter: "#fff1a8"
  pastel-coral: "#ffd7dc"
  pastel-mint: "#d6f7a3"
  pastel-periwinkle: "#d9e6ff"
  friendly-surface: "#dcfce7"
  friendly-border: "#bbf7d0"
  friendly-ink: "#14532d"
  firm-surface: "#fef08a"
  firm-border: "#fde047"
  firm-ink: "#713f12"
  overdue-surface: "#ffe4e6"
  overdue-border: "#fecdd3"
  overdue-ink: "#9f1239"
  primary-badge-surface: "#dbeafe"
  primary-badge-border: "#bfdbfe"
  primary-badge-ink: "#1e3a8a"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "-0.01em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  input: "12px"
  card: "24px"
  bento: "28px"
  stage: "32px"
  pill: "9999px"
---

# Design System: PingCue

## Overview

**Creative North Star: "Crisp Ink & Playful Daylight"**

PingCue pairs high-contrast monochrome ink (`#111111` on `#ffffff` and `#fafafa`) with tactile pastel accents (mint-lime `#c3f584` brand mark, butter yellow `#fff1a8`, soft coral `#ffd7dc`, mint `#d6f7a3`, periwinkle `#d9e6ff`, and sky-and-meadow illustrated stage framing) so chasing unpaid invoices feels calm, friendly, and effortless rather than stressful or bureaucratic.

Built on Next.js 16, Tailwind CSS 4, and `shadcn/ui` primitives (`components/ui/*`), every surface prioritizes phone-first scannability, pill-shaped primary actions, explicit status labels, and `tabular-nums` alignment for currency amounts, dates, and reminder offsets.

## Colors

### Core Ink & Neutrals
- **Primary Ink (`#111111` / hover `#262626`):** Headlines, primary pill CTAs, active tabs, and email CTA buttons.
- **Secondary Ink (`#52525b`):** Subtitles, metadata, helper copy, and inactive nav labels.
- **Grounds:** Pure White (`#ffffff`) for landing canvas, cards, and modals; Soft Gray (`#fafafa`) for authenticated app background; Pill Neutral (`#f4f4f5`) for secondary pills and nav containers.
- **Borders:** Subtle translucent ink hairlines (`border-black/[0.06]` to `border-black/12`).

### Brand & Playful Accents
- **Mint-Lime Brand Tile (`#c3f584`):** Unified `BrandMark` tile, `success` action buttons, and favicon/app icon.
- **Sky-and-Meadow Stage (`#5bc2ff` / `#84d6ff` / `#c7f584` / `#a8ec62`):** Signature illustrated framing behind the Hero `EscalationCadenceDemo`, `/login`, `/auth/reset-password`, and Open Graph social card.
- **Pastel Bento Surfaces:** Butter (`#fff1a8`), Coral (`#ffd7dc`), Mint (`#d6f7a3`), and Periwinkle (`#d9e6ff`) for landing bento cards and non-blocking notices.

### Semantic Status & Escalation Badges
- **Friendly / Paid (`#dcfce7` bg, `#bbf7d0` border, `#14532d` ink):** `-3d`/`0d`/`+3d`, `Paid`, `Delivered`, and `Founding Pass`.
- **Firm / Partial (`#fef08a` bg, `#fde047` border, `#713f12` ink):** `+7d`/`+14d`, `Partial`, `WhatsApp nudge`, and warning notices.
- **Overdue / Final / Error (`#ffe4e6` bg, `#fecdd3` border, `#9f1239` ink):** `+30d`, `Overdue`, `Bounced`, `Spam complaint`, and destructive confirmations.
- **Info / Paused (`#dbeafe` bg, `#bfdbfe` border, `#1e3a8a` ink):** `Paused until`, `Test email`, and next-step pills.

### Named Rules
- **The One-Way Escalation Rule:** Urgency increases monotonically along the timeline: Friendly (green/neutral) → Firm (amber/yellow) → Final notice / Overdue (rose/crimson).
- **The Tabular Money Rule:** Every currency amount (`INR`, `USD`, `EUR`, `GBP`), invoice balance, date, and reminder offset renders with `tabular-nums` in `JetBrains Mono` (`.font-mono`).
- **The Zero-Purple Rule:** No purple gradients, neon glows, stock photos, or emoji UI icons.

## Typography

- **Primary UI & Display Font:** `Figtree` (`--font-figtree`, weights `400`, `500`, `600`, `700`) with tight negative tracking on headings (`-0.03em` to `-0.04em`).
- **Numeric / Code Font:** `JetBrains Mono` (`--font-jetbrains-mono`, weights `400`, `500`, `600`) with `font-variant-numeric: tabular-nums`.

## Components (`components/ui/*` & `app/components/*`)

- **BrandMark (`app/components/BrandMark.tsx`):** Single Server-Component source of truth for the mint-lime rounded-square envelope mark + `PingCue` wordmark (re-exported as `PlayfulBrandMark` in `HeroStickers.tsx`).
- **Buttons (`components/ui/button.tsx`):** Full pill (`rounded-full`) across `default` (`#111111`), `secondary` (`#f4f4f5`), `outline`, `ghost`, `destructive` (`#e11d48`), `success` (`#c3f584`), and `inverted`.
- **Badges (`components/ui/badge.tsx`):** Pill status badges (`neutral`, `primary`, `firm`, `overdue`, `paid`, `outline`).
- **Cards (`components/ui/card.tsx`):** `rounded-[24px]`, white surface, `border-black/[0.08]`, soft ambient shadow.
- **Dialogs (`components/ui/dialog.tsx`):** Radix Dialog, `rounded-[28px]`, `bg-black/40` backdrop blur scrim.
- **Inputs (`components/ui/input.tsx`):** `h-11`, `rounded-xl`, `#fafafa` resting fill transitioning to `#ffffff` on focus with `#111111` ring.

## Motion & Accessibility

- Crisp `150ms–200ms` transitions and tactile hover micro-lifts, immediately disabled under `@media (prefers-reduced-motion: reduce)`.
- Keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-[#111111]`) on all interactive controls.
- Mobile-first layouts (`md:hidden` cards + `hidden md:block` desktop tables on `/invoices`) with zero horizontal overflow at `375px`.
