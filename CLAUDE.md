# Cloud Code - B2B Music Platform for BMAsia

## Project Overview

Cloud Code is a web-first B2B music streaming platform designed to replace BeatBreeze. It features drag-drop scheduling, weather automation, multi-zone management, AI integration, and offline-first architecture.

**Target Market**: Hospitality, retail, and commercial venues in Asia
**Business Model**: $20-25/zone/month with royalty-free content

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | SvelteKit + Svelte 5 | UI framework with runes for state |
| Database | Render PostgreSQL | Managed PostgreSQL with auto-backups |
| Hosting | Render Web Service | Auto-deploy from GitHub |
| Storage | Cloudflare R2 | Audio files (zero egress) |
| Real-time | MQTT (EMQX) | Zone control and status |
| Offline | OPFS | 3-4x faster than IndexedDB |
| Native | Capacitor | iOS/Android apps |

## Infrastructure (Render.com)

### GitHub Repository
- **URL**: https://github.com/brightears/beatbreeze
- **Branch**: main
- **Auto-deploy**: Enabled

### PostgreSQL Database
- **ID**: `dpg-d599alggjchc73aj87bg-a`
- **Name**: cloudcode-db
- **Region**: Singapore
- **Plan**: basic_256mb
- **Dashboard**: https://dashboard.render.com/d/dpg-d599alggjchc73aj87bg-a

### Web Service
- **ID**: `srv-d59a1keuk2gs73e36a9g`
- **Name**: cloudcode
- **URL**: https://cloudcode-4g2d.onrender.com
- **Region**: Singapore
- **Plan**: starter
- **Runtime**: Docker (Node 22 LTS)
- **Dashboard**: https://dashboard.render.com/web/srv-d59a1keuk2gs73e36a9g

### Render API
- **Base URL**: `https://api.render.com/v1`
- **Owner ID**: `tea-d13uhr3uibrs73btc1p0`
- API key stored in `.env` as `RENDER_API_KEY`

## Project Structure

```
bmamusic/
├── src/
│   ├── routes/           # SvelteKit routes
│   │   ├── (auth)/       # Login, register
│   │   ├── (app)/        # Authenticated routes
│   │   ├── player/       # Zone player (kiosk mode)
│   │   └── api/          # API endpoints
│   └── lib/
│       ├── audio/        # Audio engine, ducking, offline
│       ├── components/   # UI components
│       ├── server/       # Server utilities
│       └── types/        # TypeScript interfaces
├── prisma/               # Database schema
├── static/               # Static assets
└── .claude/              # Claude Code configuration
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run Vitest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier format
npm run check            # svelte-check type validation

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
```

## Architecture Guidelines

### Audio Engine
- Web Audio API with 35ms crossfades (masks browser gapless limitations)
- OPFS for offline caching (prefetch next 4 hours)
- Ducking: 300ms attack, 500ms release, 15% duck level
- MediaSession for lock screen controls

### State Management
- Svelte 5 Runes (`$state`, `$derived`, `$effect`)
- Context for SSR-safe global state
- MQTT for real-time zone sync

### Database
- Row-Level Security (RLS) for multi-tenancy
- Organizations → Venues → Zones hierarchy
- Schedules use RFC 5545 RRULE for recurrence

### API Routes
- SvelteKit form actions for mutations
- Server-side validation with Zod
- Proper error handling with typed responses

## Code Standards

@.claude/rules/typescript.md
@.claude/rules/svelte-components.md
@.claude/rules/testing.md
@.claude/rules/audio-engine.md

## Critical Technical Constraints

1. **iOS PWA**: Background audio stops when minimized → Need native Capacitor app
2. **Gapless**: 45ms gaps on Chrome/Firefox → Use 35ms crossfades
3. **No Spotify/YouTube**: ToS prohibits commercial use → Royalty-free only
4. **Service Workers**: Can't play audio → Only cache assets

## Environment Variables

```bash
# Render API (for infrastructure management)
RENDER_API_KEY=

# Database (Render PostgreSQL)
DATABASE_URL=              # External connection string
DATABASE_URL_INTERNAL=     # Internal (use on Render services)

# Cloudflare R2 (audio storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=cloudcode-audio
R2_PUBLIC_URL=

# MQTT (real-time zone control)
MQTT_BROKER_URL=
MQTT_USERNAME=
MQTT_PASSWORD=

# App Configuration
NODE_ENV=development
ORIGIN=https://cloudcode-0dpi.onrender.com

# Optional: Supabase Auth (if using Supabase Auth instead of custom)
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=

# Optional: AI Features
OPENAI_API_KEY=
```

## MVP Timeline (10-12 Weeks)

- **Week 1-2**: Project foundation, content management system
- **Week 3-4**: Track upload, metadata, playlists
- **Week 5-6**: Audio engine with crossfades and ducking
- **Week 7-8**: Scheduling system with drag-drop calendar
- **Week 9-10**: Multi-zone dashboard, MQTT integration
- **Week 11-12**: Polish, testing, pilot deployment

## Custom Agents

This project includes specialized Claude Code agents:
- `audio-engine-expert` - Web Audio API, crossfading, ducking
- `sveltekit-specialist` - Components, routes, stores
- `supabase-architect` - Database, RLS, real-time
- `scheduler-builder` - Calendar UI, RRULE, conflicts
- `mqtt-integrator` - Real-time messaging, zone control

## Custom Commands

- `/component [name]` - Create new Svelte component
- `/route [path]` - Create new SvelteKit route
- `/test [file]` - Generate tests for a file
- `/db-table [name]` - Add new database table
- `/audio-feature [name]` - Add audio engine feature

## Development Workflow

### After Making Changes
```bash
npm run check        # Always run after changes
npm run build        # Verify production build
git add . && git commit && git push  # Deploy to Render
```

### Verification Loop (CRITICAL)
Always verify work for 2-3x quality improvement:
1. After UI changes → Test at https://cloudcode-4g2d.onrender.com
2. After API changes → Test with curl or browser
3. After any change → Run `npm run check`

### PostToolUse Hook
Code is auto-formatted with Prettier after Write/Edit operations.
Config: `.claude/settings.json`

## Things NOT To Do

- **Don't use Svelte stores** → Use Svelte 5 runes ($state, $derived, $effect)
- **Don't use `any` type** → Use `unknown` with type guards
- **Don't use `durationSeconds`** → Field is `duration` in Prisma schema
- **Don't create unnecessary files** → Prefer editing existing files
- **Don't add emojis** → Unless user requests
- **Don't run local dev** → We deploy everything to Render
- **Don't guess organization IDs** → Use 'demo-org-id' for testing
