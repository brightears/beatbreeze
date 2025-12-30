# Cloud Code - Persistent Memory

**Last Updated**: 2025-12-29

## Project Status: Phase 1 Complete - Infrastructure Ready

### What's Been Built
- SvelteKit + Svelte 5 + TypeScript project
- Prisma schema with 12 tables (multi-tenant architecture)
- Docker-based deployment on Render
- PostgreSQL database on Render (Singapore region)
- Claude Code infrastructure (5 agents, 5 commands, 7 skills, 4 rules)

### Live Infrastructure

| Resource | ID | URL/Connection |
|----------|-----|----------------|
| GitHub Repo | brightears/beatbreeze | https://github.com/brightears/beatbreeze |
| PostgreSQL | dpg-d599alggjchc73aj87bg-a | Internal: `dpg-d599alggjchc73aj87bg-a/cloudcode` |
| Web Service | srv-d59a1keuk2gs73e36a9g | https://cloudcode-4g2d.onrender.com |
| Render Owner | tea-d13uhr3uibrs73btc1p0 | API access via RENDER_API_KEY |

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
- **Storage**: Cloudflare R2 (to be configured)

### Critical Technical Constraints
1. iOS PWA: No background audio → Need Capacitor for native
2. Gapless: 45ms gaps on Chrome/Firefox → Use 35ms crossfades
3. No Spotify/YouTube: ToS prohibits → Royalty-free only
4. Service Workers: Can't play audio → Only cache assets

### Next Development Phase: Content Management System
According to the plan, Week 3-4 should focus on:
1. Track upload interface (drag-drop, batch)
2. Metadata editor (title, artist, genre, mood, BPM)
3. Playlist CRUD (create, edit, reorder)
4. Content library browser with search/filter
5. R2 upload integration

### Key Files to Know
- `prisma/schema.prisma` - Database schema
- `src/lib/types/index.ts` - TypeScript definitions
- `src/lib/server/db/prisma.ts` - Prisma client singleton
- `Dockerfile` - Production build configuration
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
