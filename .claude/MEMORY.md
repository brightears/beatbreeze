# Cloud Code - Persistent Memory

**Last Updated**: 2025-12-30

## Project Status: Phase 2 In Progress - Content Management System

### What's Been Built

**Phase 1: Infrastructure**
- SvelteKit + Svelte 5 + TypeScript project
- Prisma schema with 12 tables (multi-tenant architecture)
- Docker-based deployment on Render
- PostgreSQL database on Render (Singapore region)
- Claude Code infrastructure (5 agents, 5 commands, 7 skills, 4 rules)

**Phase 2: Content Management System (In Progress)**
- Cloudflare R2 storage integration (`src/lib/server/storage/r2.ts`)
- Track upload API with presigned URLs (`/api/upload`, `/api/tracks`)
- Drag-drop track uploader component (`TrackUploader.svelte`)
- Track library page with search/filter (`/tracks`)
- Track metadata editor (`/tracks/[id]`)
- Base UI components (Button.svelte)

### Live Infrastructure

| Resource | ID | URL/Connection |
|----------|-----|----------------|
| GitHub Repo | brightears/beatbreeze | https://github.com/brightears/beatbreeze |
| PostgreSQL | dpg-d599alggjchc73aj87bg-a | Internal: `dpg-d599alggjchc73aj87bg-a/cloudcode` |
| Web Service | srv-d59a1keuk2gs73e36a9g | https://cloudcode-4g2d.onrender.com |
| Render Owner | tea-d13uhr3uibrs73btc1p0 | API access via RENDER_API_KEY |
| Cloudflare R2 | e44a38bf6f4797364e4f4a91b94277fd | Bucket: `cloudcode-audio` |

### Cloudflare R2 Credentials
- **Account ID**: e44a38bf6f4797364e4f4a91b94277fd
- **Access Key ID**: e569d3da50532b29e3928977cf9a49d4
- **Secret Access Key**: (stored in .env and Render env vars)
- **S3 Endpoint**: https://e44a38bf6f4797364e4f4a91b94277fd.r2.cloudflarestorage.com
- **Bucket Name**: cloudcode-audio (APAC region)
- **Render Env Vars**: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT

### Database Credentials
- **User**: cloudcode_user
- **Database**: cloudcode
- **Password**: 4FC1Vuv6AjJC3XBSs3XpaKRxARaqBQCu
- **External Host**: dpg-d599alggjchc73aj87bg-a.singapore-postgres.render.com:5432
- **Internal Host**: dpg-d599alggjchc73aj87bg-a (use on Render services)

### Database Schema (12 Tables)
1. `organizations` - Multi-tenant root (id, name, slug, timezone)
2. `users` - Auth users (email, role: OWNER/ADMIN/MEMBER/VIEWER)
3. `venues` - Physical locations (name, address, lat/lng, timezone)
4. `zones` - Audio outputs (name, status: ONLINE/OFFLINE/PLAYING/PAUSED/ERROR)
5. `tracks` - Content library (title, artist, duration, bpm, genre, mood[], fileUrl)
6. `playlists` - Playlist containers
7. `playlist_tracks` - M2M junction with position
8. `schedule_blocks` - RRULE-based scheduling (startTime, endTime, rrule, priority)
9. `messages` - Announcements (type: ANNOUNCEMENT/PROMOTION/EMERGENCY)
10. `message_schedules` - When to play messages
11. `weather_rules` - Weather automation (conditions JSON, playlistId)
12. `now_playing` - Real-time zone state
13. `audit_logs` - Activity tracking

### Technology Decisions Made
- **Frontend**: SvelteKit + Svelte 5 Runes (NOT stores)
- **Database**: Render PostgreSQL (NOT Supabase - simpler for MVP)
- **Hosting**: Render with Docker (Node 22 LTS)
- **Audio**: Web Audio API + Howler.js
- **Offline**: OPFS (3-4x faster than IndexedDB)
- **Scheduling**: rrule.js (RFC 5545)
- **Real-time**: MQTT (to be configured)
- **Storage**: Cloudflare R2 (fully configured on Render)

### Critical Technical Constraints
1. iOS PWA: No background audio → Need Capacitor for native
2. Gapless: 45ms gaps on Chrome/Firefox → Use 35ms crossfades
3. No Spotify/YouTube: ToS prohibits → Royalty-free only
4. Service Workers: Can't play audio → Only cache assets

### Next Development Phase: Playlist System
Remaining CMS tasks:
1. Playlist CRUD (create, edit, reorder tracks)
2. Playlist browser with search/filter
3. Drag-drop playlist editor
4. Then move to Phase 3: Scheduling System

### Key Files to Know

**Infrastructure**
- `prisma/schema.prisma` - Database schema (14 models)
- `src/lib/types/index.ts` - TypeScript definitions
- `src/lib/server/db/prisma.ts` - Prisma client singleton
- `Dockerfile` - Production build configuration

**Content Management**
- `src/lib/server/storage/r2.ts` - R2 upload/download service
- `src/routes/api/tracks/+server.ts` - Track list/create API
- `src/routes/api/tracks/[id]/+server.ts` - Track CRUD API
- `src/routes/api/upload/+server.ts` - Presigned URL generation
- `src/lib/components/ui/TrackUploader.svelte` - Upload component
- `src/routes/(app)/tracks/+page.svelte` - Track library page
- `src/routes/(app)/tracks/[id]/+page.svelte` - Track editor

**Claude Code**
- `.claude/skills/` - 7 context-aware skills
- `.claude/agents/` - 5 specialized agents

### Render API Usage
```bash
# List services
curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Trigger deploy
curl -s -X POST "https://api.render.com/v1/services/{serviceId}/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Check deploy status
curl -s -X GET "https://api.render.com/v1/services/{serviceId}/deploys?limit=1" \
  -H "Authorization: Bearer $RENDER_API_KEY"
```

### User Preferences
- Web-first, then native iOS/Android via Capacitor
- Target: $20-25/zone/month pricing
- MVP timeline: 10-12 weeks
- Region focus: Asia (Thailand/Singapore)
- No local development - everything on Render

### Agent Usage Guidelines
Use these agents for complex tasks:
- `audio-engine-expert` - Web Audio, crossfading, ducking
- `sveltekit-specialist` - Components, routes, Svelte 5 patterns
- `supabase-architect` - Database, RLS (even though using Render PG)
- `scheduler-builder` - Calendar UI, RRULE
- `mqtt-integrator` - Real-time messaging

### Skills Auto-Trigger Keywords
- "RLS", "row-level security" → supabase-rls skill
- "crossfade", "gapless" → web-audio-crossfade skill
- "ducking", "announcements" → audio-ducking skill
- "OPFS", "offline" → opfs-caching skill
- "RRULE", "recurring" → rrule-scheduling skill
- "runes", "$state", "$derived" → svelte5-runes skill
