---
argument-hint: [feature-name]
description: Add a new feature to the audio engine
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Add Audio Engine Feature: $ARGUMENTS

## Current Audio Engine Structure
!`find src/lib/audio -name "*.ts" 2>/dev/null | head -20 || echo "Audio directory not found"`

## Existing Audio Engine Code
!`cat src/lib/audio/engine/AudioEngine.ts 2>/dev/null | head -100 || echo "AudioEngine not created yet"`

## Your Task

Add a new feature `$ARGUMENTS` to the audio engine:

1. **Analyze** the existing audio engine architecture
2. **Design** the feature following Web Audio API patterns
3. **Implement** with proper TypeScript types
4. **Test** the feature works correctly

## Audio Engine Architecture

```
src/lib/audio/
├── engine/
│   ├── AudioEngine.ts       # Main orchestrator
│   ├── CrossfadeController.ts
│   └── TrackPlayer.ts
├── ducking/
│   ├── DuckingController.ts
│   └── MessageQueue.ts
├── offline/
│   ├── OPFSCache.ts
│   └── PrefetchManager.ts
└── state/
    └── playbackState.svelte.ts
```

## Web Audio API Patterns

### Node Creation
```typescript
const gainNode = audioContext.createGain();
const sourceNode = audioContext.createBufferSource();
sourceNode.buffer = audioBuffer;
sourceNode.connect(gainNode);
gainNode.connect(audioContext.destination);
```

### Precise Timing
```typescript
// Use AudioContext.currentTime for sample-accurate scheduling
const now = audioContext.currentTime;
gainNode.gain.setValueAtTime(1.0, now);
gainNode.gain.linearRampToValueAtTime(0.0, now + 0.035);
```

### Cleanup
```typescript
// Disconnect nodes when done
sourceNode.disconnect();
gainNode.disconnect();
```

## Technical Constraints

1. **Gapless**: Browser has ~45ms gaps, use 35ms crossfades
2. **iOS**: No background audio in PWA, need Capacitor
3. **Service Workers**: Can't play audio, only cache
4. **OPFS**: Use Web Worker for sync operations

## Template

```typescript
// src/lib/audio/[feature]/$ARGUMENTS.ts
import type { AudioContext } from 'standardized-audio-context';

interface ${ARGUMENTS}Config {
  // Configuration options
}

export class $ARGUMENTS {
  private context: AudioContext;
  private config: ${ARGUMENTS}Config;

  constructor(context: AudioContext, config: Partial<${ARGUMENTS}Config> = {}) {
    this.context = context;
    this.config = { ...defaultConfig, ...config };
  }

  // Feature methods
}
```

Also add tests in `src/lib/audio/[feature]/$ARGUMENTS.test.ts`.
