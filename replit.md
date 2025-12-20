# 8825 Export Portal

## Overview

This is the **8825 Portal** - a web application for submitting markdown export jobs. Users can input markdown content and request conversions to PDF, DOCX, or email formats. The system queues jobs for background processing by a separate worker service, with job status tracking and polling capabilities.

The application follows a full-stack TypeScript architecture with React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with path aliases (`@/` for client, `@shared/` for shared code)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints with Zod schema validation
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions
- **Development**: Vite dev server with HMR integration

### Shared Code Structure
- **Location**: `/shared/` directory
- **Schema**: Drizzle table definitions with Zod inference (`schema.ts`)
- **Routes**: Type-safe API route definitions with input/output schemas (`routes.ts`)

### Data Model
The core entity is `exportJobs`:
- `id`: Text primary key (generated with timestamp + random suffix)
- `userId`: Text (job owner)
- `markdown`: Text (source content)
- `target`: Text (output format: email, docx, pdf)
- `templateId`: Text (export template)
- `status`: Text (pending, processing, completed, failed)
- `artifactUrl`: Text (optional, result location)
- `error`: Text (optional, failure reason)
- `createdAt`/`completedAt`: Timestamps

### API Endpoints
- `POST /api/export` - Create new export job
- `GET /api/jobs/:id` - Get job status by ID
- `GET /api/jobs/pending` - List pending jobs (for worker polling)

### Build System
- **Development**: `npm run dev` runs tsx for server with Vite middleware
- **Production**: `npm run build` uses esbuild for server bundling and Vite for client
- **Database**: `npm run db:push` applies Drizzle schema migrations

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema management and migrations (stored in `/migrations/`)

### UI Framework Dependencies
- **Radix UI**: Full suite of accessible primitives (dialogs, dropdowns, forms, etc.)
- **Lucide React**: Icon library
- **Framer Motion**: Animation library (optional, for enhanced interactions)
- **Embla Carousel**: Carousel component
- **React Day Picker**: Calendar/date picker
- **Recharts**: Charting library
- **CMDK**: Command palette component

### External Integrations (Referenced but not fully implemented)
- **8825 API Gateway**: Parent system integration (port 8000)
- **Export Appliance**: Document conversion service (port 8080)
- **Tailscale/ngrok**: Secure tunnel options for external access

### Fonts
- Plus Jakarta Sans (display)
- Inter (body)
- Fira Code / Geist Mono (code)
- Architects Daughter (decorative)