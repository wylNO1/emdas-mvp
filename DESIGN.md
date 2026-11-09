---
version: alpha
name: Sentry-Dashboard-tokens-for-EMDAS
description: Dark, data-dense observability dashboard tokens inspired by Sentry's product UI (not the VoltAgent Sentri marketing DESIGN.md). Midnight charcoal canvas, pink-purple accent, dense charts/tables, restrained chrome — for industrial monitoring demos.
colors:
  canvas: "#1a1625"
  canvas-elevated: "#2d2a3a"
  surface: "#252130"
  surface-hover: "#2f2b3c"
  border: "#3d3849"
  border-subtle: "#342f40"
  ink: "#f5f3f7"
  ink-muted: "#a8a1b3"
  ink-subtle: "#7a7388"
  accent: "#6c5fc7"
  accent-hover: "#7e72d4"
  accent-pink: "#e1567c"
  accent-soft: "rgba(108, 95, 199, 0.16)"
  success: "#33b074"
  warning: "#f0b429"
  danger: "#f55459"
  chart-1: "#6c5fc7"
  chart-2: "#e1567c"
  chart-3: "#33b074"
  chart-4: "#f0b429"
  chart-5: "#58a6ff"
typography:
  sans: "Inter, Rubik, system-ui, -apple-system, sans-serif"
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  unit: "8px"
---

# Sentry-style Dashboard DESIGN.md (EMDAS)

> Source note: VoltAgent `design-md/sentry/DESIGN.md` currently ships a **Sentri-Inspired marketing** system. Yulong chose option A — this file is a **product-dashboard** token set for EMDAS MVP (deep dark, pink-purple accent, data-dense). Do not follow Sentri mascots/lime marketing chrome.

## 1. Visual Theme & Atmosphere

Industrial observability console: near-black violet-charcoal canvas, dense information, quiet chrome. One accent purple (`#6c5fc7`) for primary actions and focus; pink (`#e1567c`) reserved for critical alerts and fault emphasis. No playful mascots, no lime marketing chips, no starfield heroes.

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| canvas | `#1a1625` | App background |
| surface | `#252130` | Cards, panels, side nav |
| canvas-elevated | `#2d2a3a` | Raised panels, modals |
| border | `#3d3849` | Card/table borders |
| ink | `#f5f3f7` | Primary text |
| ink-muted | `#a8a1b3` | Secondary labels |
| accent | `#6c5fc7` | Primary button, active nav, links |
| accent-pink | `#e1567c` | Critical / fault |
| success / warning / danger | `#33b074` / `#f0b429` / `#f55459` | Health states |

## 3. Typography

- UI: Inter / Rubik / system-ui; body 14px, labels 12px, titles 18–24px medium.
- Numbers & code: monospace for sensor values, RUL, confidence.
- Dense line-height (~1.35–1.45); avoid oversized marketing display type.

## 4. Components

- **App shell**: left nav (~220px) on `surface`, main on `canvas`.
- **Cards**: `surface`, 1px `border`, radius 6–8px, padding 16px; no heavy shadows.
- **Buttons**: primary fill `accent`; secondary ghost with `border`; danger uses `danger`.
- **Tables**: compact rows, sticky header, muted zebra optional; numeric columns right-aligned mono.
- **Charts**: dark gridlines (`border-subtle`); series use chart-1…5; tooltips elevated surface.
- **Badges**: health Normal/Warning/Critical with success/warning/danger fills at low opacity + solid text.
- **Tabs**: underline active with `accent`; inactive `ink-muted`.

## 5. Layout

- 8px spacing scale; page gutters 16–24px.
- Overview: KPI row + device card grid.
- Device detail: header meta + 3 tabs (监测 / 诊断 / 寿命).
- Prefer data density over whitespace marketing.

## 6. Depth

Flat surfaces + hairline borders. Elevation only for dropdowns/modals (`canvas-elevated`). No neon glow except subtle focus ring `accent-soft`.

## 7. Do's and Don'ts

**Do**
- Chinese UI copy; mark demo algorithms clearly.
- Keep critical faults pink/red, healthy green.
- Monospace for live numbers.

**Don't**
- Sentri lime chips, sticker mascots, starfield heroes.
- Light marketing pricing cards as the main app chrome.
- Oversized display typography that wastes dashboard space.

## 8. Responsive

- Collapse left nav to icons under 960px.
- Charts full-width stack on mobile; touch targets ≥40px.

## 9. Agent Prompt Guide

Build EMDAS UI as a **dark Sentry-like ops dashboard**: charcoal panels, purple primary, pink for faults, dense charts/tables, Chinese labels. Ignore any Sentri marketing DESIGN.md if still cached elsewhere.
