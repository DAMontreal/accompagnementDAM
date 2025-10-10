# Design Guidelines: Artist Accompaniment CRM

## Design Approach

**Selected Approach:** Design System - Linear/Notion-Inspired Productivity Interface

**Justification:** This is a utility-focused, data-intensive internal tool requiring efficiency, clarity, and stability. Linear's clean aesthetic paired with Notion's information hierarchy provides the perfect foundation for complex data management while maintaining visual sophistication appropriate for arts sector work.

**Core Principles:**
- Clarity over decoration - every element serves a function
- Scannable information architecture for quick team decisions
- Subtle sophistication that respects the creative industry context
- Consistent patterns that reduce cognitive load across modules

## Color Palette

**Light Mode:**
- Background: 0 0% 100% (pure white)
- Surface: 0 0% 98% (off-white cards/panels)
- Border: 220 13% 91% (subtle dividers)
- Text Primary: 222 47% 11% (near-black)
- Text Secondary: 215 16% 47% (muted gray)
- Primary Brand: 262 83% 58% (sophisticated purple - arts/culture aligned)
- Primary Hover: 262 83% 52%
- Success: 142 71% 45% (grant accepted)
- Warning: 38 92% 50% (upcoming deadlines)
- Destructive: 0 84% 60% (declined applications)

**Dark Mode:**
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 19% 27%
- Text Primary: 0 0% 98%
- Text Secondary: 215 20% 65%
- Primary Brand: 262 83% 65%
- Primary Hover: 262 83% 70%

## Typography

**Font Families:**
- Primary: 'Inter' (via Google Fonts CDN) - exceptional readability for data tables and forms
- Mono: 'JetBrains Mono' - for IDs, dates, technical data

**Type Scale:**
- Headings H1: 2.25rem (36px), font-weight: 700, letter-spacing: -0.02em
- Headings H2: 1.5rem (24px), font-weight: 600
- Headings H3: 1.125rem (18px), font-weight: 600
- Body: 0.875rem (14px), font-weight: 400, line-height: 1.5
- Small: 0.75rem (12px), font-weight: 500
- Labels: 0.8125rem (13px), font-weight: 500, text-transform: uppercase, letter-spacing: 0.05em

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-8, mb-12)

**Grid Structure:**
- Sidebar: 280px fixed width, collapsible to 64px icon-only on smaller screens
- Main content: max-w-7xl with px-6 lg:px-8
- Two-column detail views: 60/40 split (main content/sidebar metadata)
- Card grids: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 with gap-6

**Container Rules:**
- Dashboard widgets: Contained cards with p-6
- Tables: Full-width with horizontal scroll on mobile
- Forms: max-w-2xl for optimal readability
- Modals: max-w-4xl for artist profiles, max-w-md for simple confirmations

## Component Library

**Navigation:**
- Vertical sidebar with icon + label, grouped sections (Artists, Opportunities, Team, Reports)
- Top bar: Search (cmd+K style), notifications bell, user avatar dropdown
- Breadcrumbs on detail pages for navigation context
- Tab navigation for multi-section pages (e.g., Artist Profile tabs: Overview, History, Documents, Applications)

**Data Display:**
- Tables: Striped rows, hover state, sortable headers with arrow indicators, row actions on hover (view, edit, delete)
- Status badges: Rounded-full px-3 py-1 with semantic colors (green=accepted, yellow=pending, red=declined, gray=draft)
- Stats cards: Icon on left, number (text-3xl font-bold), label below, subtle background tint matching icon color
- Timeline/Activity feed: Left-aligned icons, timestamps in muted text, expandable entries

**Forms:**
- Input fields: border border-border rounded-lg px-4 py-2.5, focus:ring-2 focus:ring-primary
- Text areas: min-h-32 with resize-y
- Select dropdowns: Chevron icon, searchable for long lists (e.g., artist selection)
- Date pickers: Calendar overlay with range selection for grant deadlines
- File upload: Drag-and-drop zones with preview thumbnails for portfolios/documents
- Multi-select tags: Pill-style removable chips for disciplines, diversity categories

**Cards:**
- Artist cards: Rounded-xl shadow-sm border, p-6, includes avatar, name, discipline, last contact date, quick action buttons
- Opportunity cards: Deadline countdown prominently displayed, eligibility criteria as checkboxes, application status indicator
- Dashboard metric cards: Large number display, trend indicator (↑↓), sparkline chart optional

**Buttons:**
- Primary: bg-primary text-white rounded-lg px-4 py-2 font-medium
- Secondary: bg-surface border border-border
- Ghost: hover:bg-surface/50
- Icon-only: p-2 rounded-md
- Destructive actions: bg-destructive text-white

**Modals & Overlays:**
- Slide-over panels: Right-side drawer for quick edits (640px width)
- Full modals: Centered overlay for artist profile creation, max-w-4xl
- Toast notifications: Top-right corner, auto-dismiss success messages, manual dismiss for errors
- Confirmation dialogs: Simple centered modal, clear action buttons

**Empty States:**
- Illustration or large icon (from Heroicons), heading, descriptive text, primary CTA button
- Example: "No artists yet" with "Add your first artist" button

## Specific Module Designs

**Artist Profile 360:**
- Header: Large avatar, name, discipline badges, contact info, edit button
- Tabs: Overview, Interaction History, Accompaniment Plan, Documents, Applications
- Timeline view for interaction history with filtering by type (meeting, email, call)
- Accompaniment plan as kanban board with drag-drop task stages

**Opportunities Database:**
- Filterable table view with saved filter presets
- Card grid view toggle option
- Application tracking shows artist names linked, deadlines with color-coded urgency

**Dashboard:**
- 3-column metric cards at top (artists active, applications pending, total funding secured)
- Today's calendar below with time blocks
- Priority tasks list (checkbox completion)
- Upcoming deadlines widget with countdown

**Email Campaign Module:**
- Left panel: Segmentation builder with AND/OR logic visual
- Center: Email composer with merge field dropdown
- Right panel: Preview and recipient count
- Send confirmation with scheduled sending option

**Waitlist System:**
- Queue visualization showing position numbers
- Automatic priority contact with one-click "Notify Next 5" button
- Status tracking (notified, booked, expired)

**Reports Generator:**
- Filter sidebar: Date range, discipline checkboxes, diversity categories
- Preview pane: Live-updating charts (bar, pie, line)
- Export options: PDF, CSV, Excel
- Chart library: Recharts or similar for clean visualizations

## Animations

Minimal, purposeful motion only:
- Page transitions: Subtle fade-in (200ms)
- Card hover: Slight lift (shadow increase)
- Button clicks: Quick scale feedback (100ms)
- Drawer open/close: Slide transition (300ms ease-in-out)

NO auto-playing carousels, parallax, or decorative animations.

## Accessibility

- All interactive elements keyboard navigable
- Focus indicators: 2px ring in primary color
- Form labels always visible (no placeholder-only)
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Dark mode: Consistent implementation across all inputs and surfaces
- Screen reader announcements for dynamic content updates (e.g., "Application status changed to Accepted")

## Images

**Profile Avatars:** Circular, 40px standard size, 64px in headers, fallback to initials on colored background
**Document Thumbnails:** PDF/file icons from Heroicons, 48px size in document lists
**Empty State Illustrations:** Optional subtle line art, never stock photos
**NO hero images** - this is a productivity tool, not a marketing site