---
name: PingCue
description: Calm, trustworthy invoice email chaser for solo freelancers who send payment links by email or WhatsApp.
---

<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

# Design System: PingCue

## Overview

**Creative North Star: "Passbook & Dispatch"**

PingCue draws its visual language from classic banking passbooks and postal dispatch slips—calm, dated, and trustworthy without feeling stiff or corporate. Solo freelancers in India and abroad often check unpaid invoices on a phone between calls; the interface meets that moment with daylight-first paper clarity, crisp hairline structure, and unmistakable state hierarchy where overdue urgency reads immediately without visual noise.

Built on Next.js, Tailwind CSS, and `shadcn/ui` primitives (replacing the temporary draft UI), the system pairs mineral-tinted surfaces with grounded dark pine ink and dated dispatch stamps. Its signature reusable pattern is the **Escalation Cadence Rail**, where reminder offsets (`-3d` through `+30d`) step visibly across tones from calm mineral to brass to crimson. Motion remains brisk, restrained, and strictly obedient to `prefers-reduced-motion`.

**Key Characteristics:**
- Daylight-first passbook surfaces (`#f6f7f4` mineral ground, `#ffffff` work sheets) anchored by Deep Pine Slate (`#16382f`)
- Predictable tonal escalation from polite mineral to Brass Ochre (`#b47818`) at Firm steps to crimson (`#b91c1c`) at Overdue/Final
- High-legibility `tabular-nums` monospace figures for multi-currency amounts (`INR`, `USD`, `EUR`, `GBP`), dates, and schedule offsets
- Mobile-first density suited for single-thumb checking and quick pauses on phones
- Zero stock photos, zero purple gradients, and zero emoji in UI labels

## Colors

A restrained-to-committed daylight palette anchored by mineral paper and pine ink, reserving warm ochre and crimson strictly for escalation and overdue states.

### Primary
- **Deep Pine Slate** (`#16382f`): Primary structural ink, brand anchor, and primary conversion action (`Get Founding Pass — $19`). `[hover, active, and foreground contrast tokens to be resolved during implementation]`

### Secondary
- **Brass Ochre** (`#b47818`): Reserved for the *Firm* escalation stage (`+7d`, `+14d`), partial-payment callouts, and deliberate warning emphasis. `[tint and border ramp to be resolved during implementation]`

### Neutral
- **Mineral Paper** (`#f6f7f4`): Default page canvas and subdued passbook background.
- **Crisp Sheet** (`#ffffff`): Primary invoice cards, tables, forms, and interactive containers sitting cleanly on Mineral Paper.
- **Slate Ink & Hairlines**: High-contrast dark ink for prose, muted secondary metadata ink, and crisp 1px neutral hairlines separating passbook entries. `[exact neutral hex/OKLCH ramp and border tokens to be resolved during implementation]`

### Semantic Accents (provisional)
- **Overdue / Final Crimson** (`#b91c1c`): Overdue status badges, overdue currency totals, and `+30d` final-notice emphasis.
- **Paid / WhatsApp Green**: Settled invoices and zero-API WhatsApp action accents. `[exact semantic hex/OKLCH tokens to be resolved during implementation]`

### Named Rules
**The One-Way Escalation Rule.** Tonal warmth and urgency only increase along the overdue timeline—from calm Mineral Paper (`-3d`, `0d`, `+3d`), to Brass Ochre (`+7d`, `+14d`), to Crimson (`+30d` / overdue). Never use ochre or crimson for neutral or friendly states.

**The Zero-Purple Rule.** Never introduce purple or violet gradients, glows, or tinted surfaces anywhere across marketing sections, cards, badges, or focus rings.

## Typography

**Display Font:** `Bricolage Grotesque` (fallback: `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** `Figtree` (fallback: `ui-sans-serif, system-ui, sans-serif`)
**Label/Mono Font:** `JetBrains Mono` (fallback: `ui-monospace, SFMono-Regular, monospace`)

**Character:** Approachable modern warmth in headings (`Bricolage Grotesque`) balanced against crisp, compact UI legibility (`Figtree`) and precision tabular bookkeeping figures (`JetBrains Mono`).

### Hierarchy
- **Display** (`[weight, size/clamp, line-height to be resolved during implementation]`): Hero headlines and top-level marketing statements.
- **Headline** (`[weight, size, line-height to be resolved during implementation]`): Page titles (`Dashboard`, `Invoices`) and landing section headings.
- **Title** (`[weight, size, line-height to be resolved during implementation]`): Card headings, invoice titles, and pricing tier headers.
- **Body** (`[weight, size, line-height to be resolved during implementation]`): Explanatory prose, reminder preview copy, and table details.
- **Label** (`[weight, size, letter-spacing to be resolved during implementation]`): Currency codes, reminder offsets (`-3d`, `+7d`), dates, and dispatch badges set in `JetBrains Mono`.

### Named Rules
**The Tabular Money Rule.** Every currency amount (`INR`, `USD`, `EUR`, `GBP`), invoice balance, date, and reminder day offset must render with `tabular-nums` in `JetBrains Mono` so totals align vertically across mobile cards and desktop tables.

## Layout

Mobile-first single-column rhythm designed for one-handed phone scanning, expanding cleanly into structured multi-column grids and tables on tablet and desktop screens. Vertical spacing maintains generous breathing room above section headings and tighter grouping within each invoice or dispatch card. `[exact container max-widths, breakpoints, and spacing scale to be resolved during implementation]`

## Elevation & Depth

Surfaces rely on tonal contrast and 1px hairline borders rather than drop shadows—Crisp Sheet (`#ffffff`) elements rest cleanly atop the Mineral Paper (`#f6f7f4`) ground. Shadows are reserved strictly for transient overlay layers such as modal dialogs, popovers, and sheets. `[exact overlay shadow values to be resolved during implementation]`

### Named Rules
**The Flat-By-Default Rule.** Resting cards, tables, and cadence rails stay flat with hairline borders; depth signals an interactive layer change (dialogs, dropdowns), never decorative decoration.

## Shapes

Disciplined, quiet geometry aligned with `shadcn/ui` primitives: modest, crisp corners across cards, buttons, and inputs paired with compact pill/stamp badges for invoice statuses and dispatch offsets. `[exact radius scale tokens to be resolved during implementation]`

## Do's and Don'ts

### Do:
- **Do** demonstrate the actual escalating cadence (`-3d` to `+30d`), partial-balance math, and 1-click actions cleanly on mobile and desktop.
- **Do** pair status colors with explicit text labels (`Unpaid`, `Partial`, `Overdue`, `Paid`, `Paused`) so meaning is never conveyed by color alone.
- **Do** enforce `tabular-nums` on every monetary value, balance, date, and reminder offset.
- **Do** implement upcoming UI surfaces with `shadcn/ui` primitives styled directly to the Passbook & Dispatch tokens.
- **Do** keep mobile tap targets generous for freelancers working from a phone.

### Don't:
- **Don't** include stock photography, purple gradients, or emoji inside UI labels, buttons, tabs, or headings.
- **Don't** carry forward the temporary draft's cobalt (`#2563eb`), terracotta (`#c2410c`), or `Calistoga` styling in new or redesigned surfaces.
- **Don't** fabricate testimonials, customer logos, user counts, or collection benchmarks.
- **Don't** stack competing decorative shadows on flat passbook cards.
