---
paths: src/**/*.ts, src/**/*.tsx
---

# TypeScript Standards for Cloud Code

## Strict Mode

This project uses TypeScript strict mode. Never use:
- `any` type (use `unknown` and type guards instead)
- Non-null assertions (`!`) without justification
- Type casting (`as`) without validation

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isPlaying` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_BASE_URL` |
| Functions | camelCase | `getUserById`, `handleClick` |
| Classes | PascalCase | `AudioEngine`, `TrackPlayer` |
| Interfaces | PascalCase | `Track`, `UserSettings` |
| Types | PascalCase | `PlaybackState`, `ZoneStatus` |
| Enums | PascalCase | `PlaybackStatus.PLAYING` |
| Files | kebab-case | `audio-engine.ts`, `track-player.ts` |

## Type Definitions

### Prefer Interfaces for Objects
```typescript
// Good
interface Track {
  id: string;
  title: string;
  artist?: string;
}

// Avoid for objects
type Track = {
  id: string;
  title: string;
};
```

### Use Type Aliases for Unions and Complex Types
```typescript
// Good
type PlaybackState = 'idle' | 'playing' | 'paused' | 'loading';
type EventHandler<T> = (event: T) => void;
```

### Always Type Function Parameters and Returns
```typescript
// Good
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Bad - implicit any
function formatDuration(seconds) {
  // ...
}
```

## Import Organization

Order imports as follows:
1. External packages (npm modules)
2. Internal aliases (`$lib/`, `$app/`)
3. Relative imports (local files)
4. Type imports

```typescript
// External
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Internal aliases
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

// Relative
import { formatDuration } from './utils';
import type { Track } from './types';
```

## Error Handling

### Use Result Types for Expected Errors
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchTrack(id: string): Promise<Result<Track>> {
  try {
    const track = await db.track.findUnique({ where: { id } });
    if (!track) {
      return { success: false, error: new Error('Track not found') };
    }
    return { success: true, data: track };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Throw for Unexpected Errors
```typescript
// Unexpected errors should throw
if (!audioContext) {
  throw new Error('AudioContext not initialized');
}
```

## Async/Await

Always use async/await over raw promises:

```typescript
// Good
async function loadTrack(id: string): Promise<Track> {
  const response = await fetch(`/api/tracks/${id}`);
  const data = await response.json();
  return data.track;
}

// Avoid
function loadTrack(id: string): Promise<Track> {
  return fetch(`/api/tracks/${id}`)
    .then(res => res.json())
    .then(data => data.track);
}
```

## Null Checks

### Use Optional Chaining
```typescript
// Good
const trackName = currentTrack?.title ?? 'Unknown';

// Avoid
const trackName = currentTrack && currentTrack.title ? currentTrack.title : 'Unknown';
```

### Use Nullish Coalescing
```typescript
// Good - only defaults for null/undefined
const volume = settings.volume ?? 0.8;

// Be careful - this also defaults for 0
const volume = settings.volume || 0.8;
```
