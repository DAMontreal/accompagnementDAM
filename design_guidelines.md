# Design Guidelines: DAM Accompagnement CRM

## Design Approach

**Selected Approach:** Design System - Linear/Notion-Inspired with Warm Professionalism

**Justification:** Utility-focused data management tool requiring efficiency and clarity, enhanced with warm brand personality reflecting the organization's mission to support diverse artists. The orange energy balanced with sophisticated black creates approachable professionalism.

**Core Principles:**
- Warm professionalism through strategic orange accents
- Scannable data architecture for rapid team decisions
- Trust-building sophistication for artist relationships
- Consistent patterns reducing cognitive load across modules

## Color Palette

**Light Mode:**
- Background: 30 25% 96% (warm light grey)
- Surface: 0 0% 100% (pure white cards)
- Border: 30 12% 88% (subtle warm dividers)
- Text Primary: 30 7% 18% (brand black)
- Text Secondary: 30 5% 45% (warm grey)
- Primary Brand: 35 92% 55% (vibrant orange)
- Primary Hover: 35 92% 48%
- Success: 142 71% 45% (grants accepted)
- Warning: 35 92% 55% (use primary for deadlines)
- Destructive: 0 84% 60% (declined applications)
- Accent Black: 30 7% 18% (headers, emphasis)

**Dark Mode:**
- Background: 30 7% 12%
- Surface: 30 7% 18%
- Border: 30 5% 28%
- Text Primary: 30 25% 96%
- Text Secondary: 30 15% 70%
- Primary Brand: 35 92% 60%
- Primary Hover: 35 92% 65%

## Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - data clarity
- Display: 'Sora' (Google Fonts) - warm headings with personality
- Mono: 'JetBrains Mono' - technical data

**Type Scale:**
- H1: 2.5rem, font-weight: 700, font-family: Sora, letter-spacing: -0.02em, color: accent-black
- H2: 1.75rem, font-weight: 600, font-family: Sora
- H3: 1.25rem, font-weight: 600, font-family: Inter
- Body: 0.9375rem (15px), font-weight: 400, line-height: 1.6
- Small: 0.8125rem (13px), font-weight: 500
- Labels: 0.75rem (12px), font-weight: 600, text-transform: uppercase, letter-spacing: 0.08em, color: text-secondary

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 20** (e.g., p-6, gap-8, mb-12)

**Grid Structure:**
- Sidebar: 320px fixed, collapses to 72px icon-only, subtle warm background (30 25% 94%)
- Main content: max-w-7xl with px-8 lg:px-12
- Detail views: 65/35 split (content/metadata sidebar)
- Dashboard cards: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 with gap-8
- Data tables: Full-width with sticky headers, horizontal scroll on mobile

## Component Library

**Navigation:**
- Sidebar: Grouped sections with orange accent on active items, section headers in uppercase labels, icons from Heroicons
- Top bar: Global search with cmd+K shortcut, notification bell with orange badge counter, user dropdown with avatar
- Breadcrumbs: Orange separators, last item in accent-black
- Tabs: Underline style with orange active indicator, 4px thick border-b-4

**Data Display:**
- Tables: Hover row bg-surface/50, sortable headers with directional arrows, sticky first column for names, row actions reveal on hover (edit, delete icons), striped rows optional for dense data
- Status badges: Rounded-full px-4 py-1.5 text-xs font-semibold (green=accepted, orange=pending, red=declined, grey=draft)
- Metric cards: Large number text-4xl font-bold Sora, icon in orange circle background (35 92% 95%), trend arrows, subtle gradient backgrounds
- Activity timeline: Orange connection line, circular node icons, timestamps in mono font, expandable details

**Forms:**
- Inputs: border-2 border-border rounded-xl px-4 py-3, focus:border-primary focus:ring-4 focus:ring-primary/10
- Labels: Above inputs, font-weight: 600, text-sm, mb-2
- Text areas: min-h-40 with character counter, resize-y
- Selects: Custom dropdown with search, orange checkmarks for selected items
- Date pickers: Calendar with orange selected dates, range selection for grant periods
- File upload: Drag-drop zone with dashed orange border, thumbnail grid preview
- Multi-select: Removable chips with orange close icon, input grows with selections

**Cards:**
- Artist cards: Rounded-2xl shadow-sm border-2 border-border hover:border-primary/30 transition-colors, p-8, avatar 56px, discipline tags below name, last contact date in small mono, action buttons in footer
- Opportunity cards: Deadline badge in top-right with countdown, orange if urgent (<7 days), eligibility checklist, application count badge
- Dashboard widgets: White surface with subtle shadow, rounded-2xl, orange header accent bar (border-l-4), p-6

**Buttons:**
- Primary: bg-primary text-white rounded-xl px-6 py-3 font-semibold shadow-sm hover:shadow-md
- Secondary: bg-white border-2 border-border text-accent-black hover:border-primary/50
- Ghost: text-primary hover:bg-primary/10
- Icon-only: p-3 rounded-lg hover:bg-surface
- Destructive: bg-destructive text-white

**Modals & Overlays:**
- Slide-over: 720px width, right-side entry, orange accent border-l-4, close icon in top-right
- Full modals: max-w-5xl centered, orange title bar, rounded-2xl, backdrop-blur
- Toasts: Top-right corner stack, rounded-xl, orange left border for success, auto-dismiss 4s
- Confirmations: Centered max-w-md, clear action buttons with destructive warnings

**Empty States:**
- Large Heroicon in orange (96px), Sora heading text-2xl, descriptive text max-w-md, primary CTA button, subtle illustration background optional

## Module-Specific Designs

**Artist Profile 360:**
- Hero header: Full-width bg-gradient-to-r from-primary/10 to-transparent, avatar 96px with orange ring-4, name in Sora text-3xl, discipline badges, contact icons with orange hover states
- Sticky tab bar: Overview | History | Plan | Documents | Applications
- Interaction timeline: Chronological cards with orange timestamp badges, filter toolbar above
- Accompaniment plan: Kanban columns with orange headers, draggable task cards, progress indicators

**Opportunities Hub:**
- View toggle: Table/Grid/Calendar views in segmented control
- Filter panel: Collapsible left sidebar (280px) with checkbox groups, saved filter presets as orange pills
- Deadline visualization: Color-coded urgency (grey >30 days, orange 7-30 days, red <7 days)
- Quick apply: Inline artist selection dropdown with search

**Dashboard Command Center:**
- Top metrics: 4-column grid, large numbers in Sora, mini sparkline charts, percentage changes with trend arrows
- Calendar widget: Weekly view with orange event blocks, click to expand details
- Priority tasks: Checkboxes with orange checked state, drag to reorder, due dates in mono
- Upcoming deadlines: Countdown timers, orange progress bars showing time remaining

**Campaign Builder:**
- Three-panel layout: Audience (left 30%) | Composer (center 40%) | Preview (right 30%)
- Segment builder: Visual AND/OR logic blocks, orange connection lines
- Merge fields: Dropdown with orange {{tags}}, live preview updates
- Schedule: Calendar picker with timezone selector, send now or schedule options

**Waitlist Manager:**
- Queue visualization: Numbered list with position badges, priority flags in orange
- Batch actions: "Notify Next 5" prominent button, status filters above
- Contact history: Expandable rows showing notification timestamps, response tracking
- Auto-escalation: Visual indicator when contact expires, one-click re-notify

**Reports Studio:**
- Filter builder: Left panel (320px) with date range, multi-select dropdowns for disciplines/diversity
- Chart area: Responsive grid of visualizations (bar, line, pie, donut), orange data colors
- Export toolbar: PDF/CSV/Excel buttons, custom template selector
- Comparison mode: Side-by-side period analysis with variance indicators

## Animations

**Purposeful Motion Only:**
- Page transitions: Fade-in 250ms
- Card interactions: Lift on hover (translateY -2px, shadow-lg), 200ms ease-out
- Button feedback: Scale 0.98 on click, 100ms
- Drawer slides: 350ms cubic-bezier ease
- Loading states: Orange spinner, skeleton screens for tables

**NO decorative animations, parallax, or auto-play elements**

## Accessibility

- Keyboard navigation: Full support with visible focus rings (ring-4 ring-primary/40)
- Color contrast: Orange text on white meets WCAG AA (4.8:1), black text meets AAA (14:1)
- Dark mode: Consistent across all form inputs, cards, and surfaces
- Form labels: Always visible, never placeholder-only
- Screen reader: ARIA labels for dynamic updates, status announcements for application changes
- Skip links: Jump to main content, bypass navigation

## Images

**Profile Avatars:**
- Circular 48px default, 64px in cards, 96px in profile headers
- Fallback: Initials on orange gradient background
- Orange ring-2 for online status indicator

**Document Icons:**
- Heroicons for file types (PDF, DOC, XLS), 56px in document grids
- Orange accent color for active/selected documents

**Empty State Graphics:**
- Minimal line illustrations in orange/black duo-tone
- Subtle background patterns using brand colors at low opacity

**NO hero images** - Productivity tool focused on data and efficiency, visual brand established through color and typography