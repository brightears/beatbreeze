---
paths: src/lib/audio/**/*.ts
---

# Audio Engine Standards for Cloud Code

## Web Audio API Best Practices

### AudioContext Management

```typescript
// Create once, reuse
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Resume after user interaction (required by browsers)
async function ensureAudioContext(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}
```

### Node Connections

Always build audio graphs correctly:
```typescript
// Correct order: create → connect → start
const source = audioContext.createBufferSource();
const gain = audioContext.createGain();

source.buffer = audioBuffer;
source.connect(gain);
gain.connect(audioContext.destination);
source.start();

// Cleanup when done
source.onended = () => {
  source.disconnect();
  gain.disconnect();
};
```

## Timing and Scheduling

### Use AudioContext.currentTime

Never use `setTimeout` or `Date.now()` for audio timing:

```typescript
// Good - sample-accurate timing
const now = audioContext.currentTime;
gainNode.gain.setValueAtTime(1.0, now);
gainNode.gain.linearRampToValueAtTime(0.0, now + 0.035);

// Bad - imprecise timing
setTimeout(() => {
  gainNode.gain.value = 0;
}, 35);
```

### Scheduling Methods

Use the appropriate scheduling method:

| Method | Use Case |
|--------|----------|
| `setValueAtTime` | Set value at exact time |
| `linearRampToValueAtTime` | Linear fade (louder-sounding) |
| `exponentialRampToValueAtTime` | Natural fade (quieter-sounding) |
| `setTargetAtTime` | Exponential approach to value |

## Crossfading

### Standard Crossfade (35ms)

```typescript
const CROSSFADE_DURATION = 0.035; // 35ms masks browser gaps

function crossfade(
  currentGain: GainNode,
  nextGain: GainNode,
  startTime: number
): void {
  const endTime = startTime + CROSSFADE_DURATION;

  // Fade out current
  currentGain.gain.setValueAtTime(1.0, startTime);
  currentGain.gain.linearRampToValueAtTime(0.0, endTime);

  // Fade in next
  nextGain.gain.setValueAtTime(0.0, startTime);
  nextGain.gain.linearRampToValueAtTime(1.0, endTime);
}
```

### Equal Power Crossfade (smoother)

```typescript
function equalPowerCrossfade(progress: number): [number, number] {
  const fadeOut = Math.cos(progress * 0.5 * Math.PI);
  const fadeIn = Math.cos((1.0 - progress) * 0.5 * Math.PI);
  return [fadeOut, fadeIn];
}
```

## Ducking

### Standard Ducking Parameters

```typescript
const DUCK_CONFIG = {
  duckLevel: 0.15,      // 15% volume during duck
  attackTime: 0.3,       // 300ms to duck down
  releaseTime: 0.5,      // 500ms to restore
  holdTime: 0.1,         // 100ms minimum hold
};
```

### Ducking Implementation

```typescript
function duckMusic(musicGain: GainNode, config = DUCK_CONFIG): void {
  const now = audioContext.currentTime;

  // Use exponential for natural sound
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.exponentialRampToValueAtTime(
    Math.max(config.duckLevel, 0.001), // Can't ramp to 0
    now + config.attackTime
  );
}

function restoreMusic(musicGain: GainNode, config = DUCK_CONFIG): void {
  const now = audioContext.currentTime;

  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.exponentialRampToValueAtTime(
    1.0,
    now + config.releaseTime
  );
}
```

## OPFS Storage

### Use Web Worker for Sync Operations

```typescript
// Main thread - async operations
const root = await navigator.storage.getDirectory();
const fileHandle = await root.getFileHandle('track.mp3', { create: true });

// Web Worker - sync operations (faster for large files)
// In worker:
const accessHandle = await fileHandle.createSyncAccessHandle();
const buffer = new Uint8Array(data);
accessHandle.write(buffer, { at: 0 });
accessHandle.flush();
accessHandle.close();
```

### Caching Strategy

```typescript
const CACHE_CONFIG = {
  lookAheadHours: 4,         // Prefetch next 4 hours
  maxCacheSize: 500_000_000, // 500MB limit
  minFreeSpace: 100_000_000, // Keep 100MB free
};
```

## Error Handling

### Decode Errors

```typescript
async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Failed to load audio:', error);
    throw new AudioLoadError(url, error);
  }
}
```

### Context State Changes

```typescript
audioContext.onstatechange = () => {
  console.log('AudioContext state:', audioContext.state);

  if (audioContext.state === 'interrupted') {
    // iOS: audio session interrupted (e.g., phone call)
  }
};
```

## MediaSession Integration

```typescript
function updateMediaSession(track: Track): void {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist ?? 'Unknown Artist',
      album: track.album ?? 'Cloud Code',
      artwork: [
        { src: track.artworkUrl, sizes: '512x512', type: 'image/png' },
      ],
    });
  }
}
```

## Performance Guidelines

1. **Reuse nodes** when possible instead of creating new ones
2. **Disconnect nodes** when done to prevent memory leaks
3. **Use AudioWorklet** for custom processing (not ScriptProcessorNode)
4. **Decode audio in advance** for gapless playback
5. **Monitor AudioContext.currentTime** not wall clock time
