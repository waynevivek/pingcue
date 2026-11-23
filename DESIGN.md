---
name: PingCue
description: Calm, trustworthy invoice email chaser for solo freelancers who send payment links by email or WhatsApp.
colors:
  pine-slate: "#16382f"
  pine-slate-deep: "#0f2922"
  pine-tint: "#eaf0ec"
  brass-ochre: "#b47818"
  brass-surface: "#fbf5e6"
  brass-border: "#e5cf99"
  brass-ink: "#744908"
  overdue-crimson: "#b91c1c"
  overdue-surface: "#fdf2f2"
  overdue-border: "#f3c6c6"
  overdue-ink: "#991b1b"
  paid-green: "#166534"
  paid-surface: "#eef7f1"
  paid-border: "#bddbc8"
  paid-ink: "#14532d"
  warm-paper: "#f7f5f0"
  crisp-sheet: "#ffffff"
  pine-ink: "#16241e"
  muted-sage-ink: "#55635c"
  muted-surface: "#efede6"
  hairline-border: "#dedbd2"
  input-border: "#cac6ba"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "3.5rem"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.pine-slate}"
    textColor: "{colors.warm-paper}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.pine-slate-deep}"
  button-outline:
    backgroundColor: "{colors.crisp-sheet}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-success:
    backgroundColor: "{colors.paid-green}"
    textColor: "{colors.crisp-sheet}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-destructive:
    backgroundColor: "{colors.overdue-crimson}"
    textColor: "{colors.crisp-sheet}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "32px"
  badge-neutral:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.muted-sage-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-firm:
    backgroundColor: "{colors.brass-surface}"
    textColor: "{colors.brass-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-overdue:
    backgroundColor: "{colors.overdue-surface}"
    textColor: "{colors.overdue-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-paid:
    backgroundColor: "{colors.paid-surface}"
    textColor: "{colors.paid-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  card-sheet:
    backgroundColor: "{colors.crisp-sheet}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.crisp-sheet}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "44px"
---

# Design System: PingCue

## Overview

**Creative North Star: "Passbook & Dispatch"**

PingCue draws its visual language from classic banking passbooks and postal dispatch slips—calm, dated, and trustworthy without feeling stiff or corporate. Solo freelancers in India and abroad often check unpaid invoices on a phone between calls; the interface meets that moment with warm off-white paper clarity, crisp hairline structure, editorial serif headlines, and unmistakable state hierarchy where overdue urgency reads immediately without visual noise.

Built on Next.js 16, Tailwind CSS 4, and `shadcn/ui` primitives, the system pairs warm paper surfaces with grounded Deep Green ink (`#16382f`) and one restrained Amber accent (`#b47818`). Its signature centerpiece is the **Escalation Cadence Demo**, an invoice dispatch sheet showing live partial-payment progress alongside a 6-step escalation timeline (`-3d` through `+30d`) and live Email / WhatsApp / Pause previews. Motion stays crisp and restrained (`150ms`–`200ms` transitions) and yields immediately to `prefers-reduced-motion`.

**Key Characteristics:**
- Warm off-white paper ground (`#f7f5f0`) and Crisp Sheet cards (`#ffffff`) anchored by Deep Green (`#16382f`)
- Single warm Amber accent (`#b47818`) reserved for `Partial` and `Firm` overdue escalation steps
- Editorial `Newsreader` serif display headlines paired with clean `Figtree` UI sans and `JetBrains Mono` (`tabular-nums`)
- Mobile-first `4px`-grid spacing (`3×2` cadence grid on `375px`, `6×1` on desktop) with zero horizontal overflow
- Zero purple/blue gradients, zero glow effects, zero `Inter`, zero emoji icons, and zero rounded-square icon tiles above headings

## Colors

A warm daylight palette anchored by off-white paper and deep green ink, using warm amber as the single primary accent for partial and firm-escalation states.

### Primary
- **Deep Pine Slate** (`#16382f`): Primary structural ink, brand mark tile, active links, Founding Pass conversion buttons, and dark closing band ground.
- **Deep Pine Hover** (`#0f2922`): Hover and active state for primary buttons and links.
- **Pine Tint** (`#eaf0ec`): Soft secondary surface for active filter tabs, paused status stamps, and selected friendly cadence steps.

### Secondary
- **Brass Ochre** (`#b47818`): Single accent reserved for the *Firm* escalation stage (`+7d`, `+14d`), `Partial` payment badges, and non-blocking setup/limit notices (`#fbf5e6` surface, `#e5cf99` border, `#744908` ink).

### Neutral
- **Warm Paper** (`#f7f5f0`): Default page canvas and recessed preview surface.
- **Crisp Sheet** (`#ffffff`): Primary invoice cards, tables, forms, modals, and sticky navigation headers.
- **Deep Pine-Charcoal Ink** (`#16241e`): Primary body and display copy.
- **Muted Sage Ink** (`#55635c`): Secondary metadata, table headers, helper hints, and unselected navigation links.
- **Muted Surface & Hairlines**: `#efede6` muted surface, `#dedbd2` `1px` card/row hairlines, `#cac6ba` input borders.

### Semantic Accents
- **Overdue / Final Crimson** (`#b91c1c`): Destructive actions, overdue balances, overdue badges, and `+30d` final-notice stamps (`#fdf2f2` surface, `#f3c6c6` border, `#991b1b` ink).
- **Paid / WhatsApp Green** (`#166534`): Paid badges, collected totals, sent schedule confirmations, and zero-API `wa.me` action buttons (`#eef7f1` surface, `#bddbc8` border, `#14532d` ink).

### Named Rules
**The One-Way Escalation Rule.** Tonal warmth and urgency only increase along the overdue timeline—from calm Warm Paper (`-3d`, `0d`, `+3d`), to Brass Ochre (`+7d`, `+14d`), to Crimson (`+30d` / overdue). Never use ochre or crimson for neutral or friendly states.

**The Zero-Purple Rule.** Never introduce purple or blue gradients, glows, or tinted surfaces anywhere across marketing sections, cards, badges, or focus rings.

## Typography

**Display Font:** `Newsreader` (fallback: `Georgia, serif`)
**Body Font:** `Figtree` (fallback: `ui-sans-serif, system-ui, sans-serif`)
**Label/Mono Font:** `JetBrains Mono` (fallback: `ui-monospace, SFMono-Regular, monospace`)

**Character:** Editorial warmth and trustworthiness in `Newsreader` display headlines paired against clean, compact UI legibility in `Figtree` and precision tabular bookkeeping figures in `JetBrains Mono`.

### Hierarchy
- **Display** (`500`, `2.25rem`–`3.5rem`, `1.04`–`1.08`, `-0.025em` tracking): Landing hero `<h1>` only.
- **Headline** (`500`, `1.875rem`–`2.25rem`, `1.15`, `-0.02em` tracking): Landing section headings and closing statement; app page titles.
- **Title** (`600`, `1rem`–`1.25rem`, `1.35`): Card headings, ledger row titles, and pricing tier headers.
- **Body** (`400`–`500`, `0.875rem`–`1.125rem`, `1.6`, max measure `46ch`–`66ch`): Explanatory copy, email dispatch previews, FAQ answers, and legal prose.
- **Label** (`500`–`600`, `0.75rem`, `1.4`, `tabular-nums`): Currency totals, reminder offsets (`-3d`, `+7d`), timestamps, and status stamps set in `JetBrains Mono`.

### Named Rules
**The Tabular Money Rule.** Every currency amount (`INR`, `USD`, `EUR`, `GBP`), invoice balance, date, and reminder day offset must render with `font-variant-numeric: tabular-nums` in `JetBrains Mono` so totals align vertically across mobile cards and desktop tables.

## Layout

Mobile-first single-column stacking designed for `375px` phone scanning with zero horizontal overflow, expanding to asymmetric 12-column spreads (`min-w-0` on all grid tracks) on desktop (`lg:1024px+`). Public landing containers cap at `max-w-6xl` (`1152px`) for navigation, hero, and workflow ledger, `max-w-4xl` (`896px`) for pricing, `max-w-3xl` (`768px`) for FAQ and legal pages, and `max-w-5xl` (`1024px`) for the closing band. Vertical spacing stays on the `4px` grid (`py-12` on mobile, `lg:py-24` on desktop).

## Elevation & Depth

Surfaces rely on tonal contrast and `1px` hairline borders (`#dedbd2`) rather than heavy drop shadows. Only the hero dispatch artifact carries a soft neutral paper shadow, and transient modal overlays use a deeper neutral shadow over a dark ink scrim—zero colored halos or glows anywhere.

### Shadow Vocabulary
- **Artifact Card** (`box-shadow: 0 1px 2px rgba(22, 36, 30, 0.04), 0 12px 28px -12px rgba(22, 36, 30, 0.10)`): Subtle paper contact lift on the landing hero `EscalationCadenceDemo` artifact.
- **Overlay Dialog** (`box-shadow: 0 18px 40px -14px rgba(20, 34, 29, 0.28)`): Applied exclusively to `DialogContent` over a `45%` ink scrim.

### Named Rules
**The Flat-By-Default Rule.** Resting cards, tables, and FAQ rows stay flat with hairline borders; depth signals an interactive layer change (hero centerpiece artifact or modal dialogs), never decorative glow.

## Shapes

Quiet, practical corners aligned with `shadcn/ui` primitives: `6px` (`rounded-md`) on compact stamp badges and small buttons, `8px` (`rounded-lg`) on primary buttons, inputs, and cadence step tiles, and `12px` (`rounded-xl`) on passbook sheets, cards, and modal dialogs.

## Components

Built on `shadcn/ui` primitives (`components/ui/*`) styled exclusively through PingCue design tokens.

### Buttons
- **Shape:** `8px` radius (`rounded-lg`); `40px` default height, `44px` large CTA height, `32px` compact header/action height.
- **Primary:** Deep Pine Slate (`#16382f`) background, Warm Paper (`#f7f5f0`) text, `150ms` transition to `#0f2922` on hover.
- **Outline / Secondary:** Crisp Sheet (`#ffffff`) with `#dedbd2` hairline border or `#eaf0ec` Pine Tint fill.
- **Success / Destructive / Inverted:** Paid Green (`#166534`), Crimson (`#b91c1c`), and Crisp Sheet (`#ffffff`) with `#16382f` ink on the Deep Green closing band.

### Badges / Stamps
- **Style:** Compact monospace stamps (`6px` radius, `1px` border, `2px 8px` padding, `tabular-nums`).
- **States:** `neutral` (`Unpaid`), `firm` Brass Ochre (`Partial`, `One-time · No subscription`), `overdue` Crimson (`Overdue`, `Final`), `paid` Green (`Paid`, `Zero-API wa.me`), and `primary` Pine Tint (`Founding Pass`, `Paused until`).

### Cards / Passbook Sheets
- **Corner Style:** `12px` radius (`rounded-xl`).
- **Background:** Crisp Sheet (`#ffffff`) over Warm Paper (`#f7f5f0`).
- **Border:** `1px solid #dedbd2` hairline border (`2px solid #16382f` on the highlighted Founding Pass pricing tier).

### Inputs / Fields
- **Style:** Crisp Sheet (`#ffffff`) fill, `1px solid #cac6ba` border, `8px` radius (`rounded-lg`), `44px` height (`h-11`), `#16382f` caret color.

### Navigation
- **Style:** Solid Crisp Sheet (`#ffffff`) sticky top bar with `1px` bottom hairline, `BrandMark` in `Figtree` (`font-sans`) on left, plain text nav links (`hover:text-primary`), `Sign in` link (`whitespace-nowrap`), and compact Deep Pine Slate CTA on right.

### Escalation Cadence Demo
- Passbook dispatch centerpiece featuring invoice balance (`₹20,000 left` of `₹45,000 INR`), `55.6%` Deep Green settlement progress bar, a `3×2` (mobile) / `6×1` (desktop) clickable timeline (`-3d` through `+30d`), Email / WhatsApp preview switcher, and live Pause / Resume toggle.

### FAQ Accordion
- Accessible hairline-divided disclosure list (`FaqAccordion`) with `16px` `ChevronDown` rotation (`1.5px` stroke), `aria-expanded` / `aria-controls` wiring, and `66ch` readable measure.

## Do's and Don'ts

### Do:
- **Do** demonstrate the actual escalating cadence (`-3d` to `+30d`), partial-balance math, and 1-click actions cleanly on `375px` mobile and `1440px` desktop.
- **Do** pair status colors with explicit text labels (`Unpaid`, `Partial`, `Overdue`, `Paid`, `Paused`) so meaning is never conveyed by color alone.
- **Do** enforce `tabular-nums` on every monetary value, balance, date, and reminder offset.
- **Do** implement UI surfaces with `shadcn/ui` compound primitives (`CardHeader`, `CardContent`, `CardFooter`, `Dialog`, `Button`) imported individually.
- **Do** keep typography cleanly scaled on a `4px` spacing grid with weights `400`–`600`.

### Don't:
- **Don't** include purple/blue gradients, glow effects, `Inter`, emoji icons, or rounded-square icon tiles above headings.
- **Don't** fabricate testimonials, customer logos, user counts, or collection benchmarks.
- **Don't** stack competing decorative shadows or nested bordered cards inside flat passbook sheets.
