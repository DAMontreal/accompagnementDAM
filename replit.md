# Artist Accompaniment CRM

## Overview

This is a comprehensive CRM system designed specifically for non-profit organizations that support diverse artists. The application centralizes artist management, grant/funding opportunity tracking, task management, waitlist handling, and email campaign capabilities. Built with a focus on efficiency and clarity, it provides internal teams with tools to manage artist accompaniment programs, track application outcomes, and measure organizational impact.

The system is designed to handle the full lifecycle of artist support: from initial contact and waitlist management, through personalized accompaniment plans, to grant application tracking and impact reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (instead of React Router)

**UI Component System:**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design philosophy: Linear/Notion-inspired productivity interface emphasizing clarity over decoration
- Custom color palette with sophisticated purple primary color (#8B5CF6) aligned with arts/culture context
- Typography: Inter for UI elements, JetBrains Mono for technical data

**State Management:**
- TanStack Query (React Query) v5 for server state management and caching
- React Hook Form with Zod validation for form handling
- Local component state with React hooks

**Key Frontend Patterns:**
- Form validation using `@hookform/resolvers` with Zod schemas shared between client and server
- Query invalidation pattern for optimistic UI updates after mutations
- Custom toast notifications for user feedback
- Theme provider supporting light/dark modes

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js for the REST API server
- TypeScript throughout with ESM module system
- Development with `tsx` for TypeScript execution, production build with esbuild

**API Design:**
- RESTful API endpoints organized by resource type
- Centralized route registration in `server/routes.ts`
- Express middleware for JSON parsing, logging, and error handling
- Storage abstraction layer (`server/storage.ts`) separating business logic from data access

**Data Layer:**
- Drizzle ORM as the type-safe database toolkit
- Schema-first approach with shared types between frontend and backend
- Zod schemas for runtime validation using `drizzle-zod` integration
- Connection pooling via `@neondatabase/serverless` with WebSocket support

**Core Domain Models:**
- **Artists**: Complete 360° profiles with contact info, artistic disciplines, portfolios, and internal notes
- **Interactions**: Historical record of all communications (meetings, calls, emails, Calendly appointments)
- **Accompaniment Plans**: Personalized support plans with goals and action items
- **Opportunities**: Grant/funding opportunities with deadlines and eligibility criteria
- **Applications**: Artist grant applications with status tracking
- **Documents**: File storage references for CVs, proposals, budgets
- **Tasks**: Internal team task management with priorities and assignments
- **Waitlist**: Queue management for appointment scheduling
- **Email Campaigns**: Segmented communication campaigns with targeting criteria

### Database Schema Design

**Architectural Decisions:**
- PostgreSQL as the primary database (configured via Drizzle with Neon serverless driver)
- Enum types for constrained values (disciplines, interaction types, statuses, priorities)
- UUID primary keys for all entities
- Timestamp tracking (`createdAt`, `updatedAt`) on all tables
- Foreign key relationships with cascading deletes where appropriate
- JSONB fields for flexible metadata storage (segmentation criteria, custom fields)

**Key Relationships:**
- One-to-many: Artist → Interactions, Applications, Documents, Accompaniment Plans
- One-to-many: Opportunity → Applications
- Optional many-to-one: Task → Artist (tasks can be internal or artist-specific)

### External Dependencies

**Database:**
- Neon Serverless PostgreSQL for production database hosting
- WebSocket-based connection via `@neondatabase/serverless` package
- Drizzle Kit for schema migrations and database push operations

**Third-Party Integrations (Planned/Referenced):**
- Calendly integration for appointment scheduling (interactions marked with type `calendly_appointment`)
- Outlook/email system integration for archiving important communications
- File storage system for document management (currently using local uploads directory)
  - NOTE: Production should use Replit Object Storage for proper file handling
  - Current implementation has file validation (PDF, DOC, DOCX, JPG, PNG) and 10MB size limit
  - File deletion cleanup needs to be implemented for production

**Development Tools:**
- Replit-specific plugins for development experience (cartographer, dev banner, runtime error overlay)
- Vite HMR for fast development iteration

**UI Libraries:**
- Comprehensive Radix UI primitives for accessible components
- Recharts for data visualization and impact reporting charts
- date-fns for date formatting and manipulation (French locale support)
- Lucide React for consistent iconography

### Configuration & Environment

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (critical for both development and production)
- `NODE_ENV`: Environment indicator (development/production)

**Build & Deployment:**
- Client builds to `dist/public` via Vite
- Server bundles to `dist/index.js` via esbuild with external packages
- Production mode serves static assets from build directory
- Development mode uses Vite middleware for HMR

**Path Aliases:**
- `@/` → `client/src/` (frontend components and utilities)
- `@shared/` → `shared/` (shared types and schemas)
- `@assets/` → `attached_assets/` (static assets)

### Design System Specifications

**Color Semantics:**
- Primary: Sophisticated purple for brand identity and primary actions
- Success: Green for accepted grants/positive outcomes
- Warning: Orange for upcoming deadlines
- Destructive: Red for declined applications and critical actions

**Responsive Behavior:**
- Mobile-first approach with sidebar collapsing to sheet on mobile devices
- Breakpoint at 768px for mobile/desktop differentiation
- Touch-friendly tap targets and spacing on mobile

**Accessibility Considerations:**
- ARIA labels and semantic HTML throughout
- Keyboard navigation support via Radix UI
- Focus management and screen reader compatibility
- Proper contrast ratios in both light and dark modes