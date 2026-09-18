---
name: Civic Hydrology
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#41484a'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#71787b'
  outline-variant: '#c1c8cb'
  surface-tint: '#3e6470'
  primary: '#002028'
  on-primary: '#ffffff'
  primary-container: '#0a3641'
  on-primary-container: '#799fac'
  inverse-primary: '#a5cdda'
  secondary: '#376757'
  on-secondary: '#ffffff'
  secondary-container: '#baeed9'
  on-secondary-container: '#3d6d5d'
  tertiary: '#00211d'
  on-tertiary: '#ffffff'
  tertiary-container: '#003832'
  on-tertiary-container: '#3ba99b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1e9f7'
  primary-fixed-dim: '#a5cdda'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#254c57'
  secondary-fixed: '#baeed9'
  secondary-fixed-dim: '#9ed1bd'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#1d4f40'
  tertiary-fixed: '#8cf5e4'
  tertiary-fixed-dim: '#6fd8c8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-trust, responsive civic infrastructure interface. It balances institutional accountability with citizen accessibility, turning civic reporting and civil drainage maintenance from bureaucratic chore into an actionable, transparent operational workflow.

### Emotional Disposition & Personality
- **Authoritative yet Approachable:** The visual tone conveys engineering-level precision and public-sector transparency without institutional sterility.
- **Urgent & Clarity-Driven:** When water infrastructure clogs or backs up, quick triage is critical. The system prioritizes rapid scanning, clear severity levels, and friction-free status tracking.
- **Tactile Ecological Responsibility:** Rooted in clean waterways, urban storm resilience, and environmental duty.

### Design Movement: Modern Civic Functionalism
A hybrid of **Modern Corporate** reliability and **Utilitarian Field Tooling**:
- Hyper-legible data density that survives direct sunlight on mobile fieldwork and high-volume operations room dashboards.
- 1px crisp structural division lines paired with tonal surface layering rather than heavy elevation.
- Controlled visual weight: High saturation is reserved strictly for real-world blockers, flood warnings, and escalation statuses.

## Colors

The palette draws from tidal estuaries, urban hydrology, and robust municipal signage. High-contrast typography and strict role-based tinting govern every token.

### Palette Architecture
- **Primary (`#0A3641` - Deep Riparian Teal):** The governing color for navigational anchors, brand headers, primary call-to-actions, and confirmed system milestones.
- **Secondary (`#1B4D3E` - Forest Conduit Green):** Used for municipal verification badges, resolved report states, sustainable drainage metrics, and operational dispatch indicators.
- **Tertiary (`#2A9D8F` - Fresh Moss / Flow):** An active highlight tone used for interactive telemetry, focused states, filter chips, and live channel progress indicators.
- **Neutral (`#1E293B` - Slate Core):** Delivers WCAG AAA-compliant text on light surfaces. Neutral surface washes pivot on `#F4F6F4` (Cool Wash) and `#FFFFFF` (Surface Elevated) to evoke aerated, pristine water clarity.

### Functional Alerts & Escalations
Alert colors must never be decorative:
- **Urgent Blockage / Breach (`#D9381E` / `#EA580C`):** Strictly reserved for severe drainage failures, active overflow hazards, and urgent dispatch delays.
- **Pending / Monitored Triage (`#E76F51`):** Applied to aging tickets, rain warnings, and pre-monsoon inspection tags.
- **Surface Foundations:** Background canvas sits at `#F4F6F4`, card surfaces at `#FFFFFF`, and subtle interior framing at `#E2E8F0`.

## Typography

The type system brings balance between the technical authority of an operational dispatch terminal and the clean, intuitive warmth required for citizen engagement.

### Hierarchy & Applications
- **Display & Headlines (Plus Jakarta Sans):** Selected for its modern, robust geometric proportions and slightly rounded apertures that keep municipal data human-centered and clean. Headlines retain tight tracking (`-0.01em` to `-0.02em`) to maintain editorial impact in tight dashboard spaces.
- **Body & Data Grid (Inter):** Systemic, neutral, and engineered for high optical performance. Inter handles GPS coordinates, canal telemetry metrics, inspector lognotes, and tracking IDs with maximum distinction between glyphs.
- **Labels, Badges, & Metadata:** Set in `Inter` semi-bold (`600`) with expanded tracking (`0.01em` to `0.04em`) to establish crisp legibility for status badges (e.g., `CLEARED`, `CRITICAL CLOG`, `IN PROGRESS`).

## Layout & Spacing

The layout operates on a disciplined 8px base rhythm (`0.5rem`), ensuring uniform alignment across dense data displays and simple citizen submission forms.

### Grid & Responsiveness
- **Desktop (1200px+):** 12-column responsive fluid grid with 32px (`2rem`) gutters and 48px (`3rem`) screen margins. Max content container is capped at 1440px to preserve metric card scannability.
- **Tablet / In-Cab Field Devices (768px - 1199px):** 8-column layout with 24px (`1.5rem`) gutters and 24px margins. Side panels dock to bottom sheets or slide-over trays.
- **Mobile (320px - 767px):** 4-column layout with 16px (`1rem`) gutters and 16px margins. Floating bottom command bars handle camera uploads, emergency reporting, and status tracking.

### Rhythmic Discipline
- Components employ compact padding (`space-sm` / 8px and `space-md` / 16px) internally to prevent sprawling layouts.
- Data tables, telemetry feeds, and dispatch logs use strict `space-xs` (4px) and `space-sm` (8px) gaps to preserve informational density.

## Elevation & Depth

This system intentionally rejects dramatic, dark drop-shadows in favor of an airy, controlled civic-utility depth model based on **Tonal Layering** and **Subtle Boundary Borders**.

### Depth Tiers
- **Base Canvas (Level 0):** Hex `#F4F6F4`. Unshadowed. Acts as the stable substrate for all map layers and structural feeds.
- **Surface Neutral (Level 1):** Hex `#FFFFFF` with a crisp `1px solid #E2E8F0` border. Used for standard report cards, queue lists, and table rows. Elevation is rendered with an ambient, tinted shadow: `0 1px 3px rgba(10, 54, 65, 0.04), 0 1px 2px rgba(10, 54, 65, 0.02)`.
- **Active / Interactive Surface (Level 2):** Applied on card hover, filter dropdowns, and dispatch cards: `0 4px 12px rgba(10, 54, 65, 0.06), 0 1px 3px rgba(10, 54, 65, 0.04)` combined with an active border highlight in `#CBD5E1`.
- **Overlays, Modals, & Triage Panels (Level 3):** Urgent report detail cards, mobile photo inspection trays, and incident modals: `0 12px 32px rgba(10, 54, 65, 0.12), 0 2px 6px rgba(10, 54, 65, 0.04)` over a translucent `#0A3641` scrim at 35% opacity.

## Shapes

The design system uses a balanced, restrained corner radius (`0.5rem` / 8px base) that avoids both the clinical austerity of razor-sharp edges and the informal consumer-playfulness of pill shapes.

### Corner Radii Guidelines
- **Micro UI Elements (6px - 8px):** Badges, input fields, checkboxes, tooltips, and table row selection indicators.
- **Containers & Surface Panels (8px - 12px / `rounded-lg`):** Incident overview cards, telemetry widgets, map preview frames, and photo proof cards.
- **Overlays & Drawers (16px / `rounded-xl`):** Mobile pull-up sheets and major alert overlays (applied only to top corners for mobile bottom sheets).
- **Fully Rounded (`9999px`):** Reserved exclusively for circular avatar units, map geolocation pins, and numeric status indicators.

## Components

### Buttons
- **Primary:** Background `#0A3641`, foreground `#FFFFFF`, border `1px solid transparent`, height 40px (desktop) / 48px (mobile touch targets). Hover state darkens to `#06242B`. Focus ring uses a 2px offset ring in `#2A9D8F`.
- **Secondary / Municipal:** Background `#1B4D3E`, foreground `#FFFFFF`. Used for municipal crew dispatch and status progression triggers.
- **Outline / Filter:** Background `#FFFFFF`, foreground `#1E293B`, border `1px solid #E2E8F0`. Hover uses `#F8FAFC` surface wash.
- **Destructive / Escalation:** Background `#D9381E`, foreground `#FFFFFF`. Strictly for critical emergency priority elevation and blockage warnings.

### Status Badges & Chips
- **Layout:** Compact padding (2px top/bottom, 8px left/right), radius 6px, text style `label-sm` in uppercase.
- **Resolved / Free Flow:** Background `#E8F5E9`, text `#1B4D3E`, border `1px solid #C8E6C9`.
- **Under Inspection:** Background `#E0F2F1`, text `#0F4C5C`, border `1px solid #B2DFDB`.
- **Critical Clog / Flood Threat:** Background `#FEE2E2`, text `#991B1B`, border `1px solid #FECACA`.

### Form Inputs & Geospatial Selectors
- **Input Fields:** 40px height, background `#FFFFFF`, border `1px solid #CBD5E1`, text `#1E293B`, placeholder `#94A3B8`. 
- **Active State:** Focus changes border to `#2A9D8F` with a `0 0 0 3px rgba(42, 157, 143, 0.15)` glow.
- **Validation:** Clear icon status indicator at the right edge; error states adopt `#D9381E` border and persistent caption.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** 18px × 18px, radius 4px. Unchecked has a 1.5px border `#94A3B8` on `#FFFFFF`. Checked is filled with `#0A3641` featuring a crisp white SVG check icon.
- **Radio Buttons:** 18px × 18px circular frame. Active state displays an interior concentric ring in `#0A3641`.

### Data Cards & Infrastructure Feeds
- **Structure:** Encased in 1px `#E2E8F0` border with `#FFFFFF` background. Structured with a top metadata bar (Ticket ID, Timestamp, Geotag), an evidence image slot, and a clear linear progress tracker displaying: `Reported → Dispatched → In Progress → Cleared`.
- **Telemetry Indicators:** Mini sparklines and water level indicators utilize `#2A9D8F` for safe depths transitioning dynamically to `#D9381E` when culvert thresholds exceed 85% capacity.