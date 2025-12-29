---
paths: src/**/*.test.ts, src/**/*.spec.ts, tests/**/*.ts
---

# Testing Standards for Cloud Code

## Testing Framework

- **Vitest** for unit and integration tests
- **@testing-library/svelte** for component tests
- **Playwright** for E2E tests (future)

## Test File Location

Place test files next to the source files:
```
src/lib/audio/
├── engine.ts
├── engine.test.ts    # ← Test file here
├── crossfade.ts
└── crossfade.test.ts
```

## Test Structure

### Describe Blocks
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AudioEngine', () => {
  // Setup/teardown at describe level
  beforeEach(() => {
    // Common setup
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('play', () => {
    it('should start playback when called', () => {
      // Test
    });

    it('should emit playing event', () => {
      // Test
    });
  });

  describe('pause', () => {
    it('should pause playback when playing', () => {
      // Test
    });
  });
});
```

### Test Naming

Use descriptive names that explain the behavior:

```typescript
// Good
it('should crossfade to next track when current track ends', () => {});
it('should throw error when AudioContext is not initialized', () => {});
it('should duck music volume to 15% during announcements', () => {});

// Bad
it('works', () => {});
it('test crossfade', () => {});
```

## Arrange-Act-Assert

Every test should follow AAA:

```typescript
it('should calculate total duration correctly', () => {
  // Arrange
  const tracks: Track[] = [
    { id: '1', durationSeconds: 180 },
    { id: '2', durationSeconds: 240 },
  ];
  const playlist = new Playlist(tracks);

  // Act
  const total = playlist.getTotalDuration();

  // Assert
  expect(total).toBe(420);
});
```

## Mocking

### Mock Modules
```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('$lib/server/db', () => ({
  db: {
    track: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));
```

### Mock Functions
```typescript
const mockPlay = vi.fn();
const mockPause = vi.fn();

const audioEngine = {
  play: mockPlay,
  pause: mockPause,
};

// Later in test
expect(mockPlay).toHaveBeenCalledTimes(1);
expect(mockPlay).toHaveBeenCalledWith('track-123');
```

### Mock Timers
```typescript
describe('prefetch manager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should prefetch every 5 minutes', () => {
    const manager = new PrefetchManager();
    manager.start();

    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(manager.prefetchCount).toBe(1);
  });
});
```

## Component Testing

### Basic Render
```typescript
import { render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

it('renders with correct text', () => {
  render(Button, { props: { label: 'Click me' } });
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### User Interactions
```typescript
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';

it('calls onclick when clicked', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(Button, { props: { label: 'Click', onclick: handleClick } });

  await user.click(screen.getByRole('button'));

  expect(handleClick).toHaveBeenCalled();
});
```

### Testing State Changes
```typescript
import { render, screen, waitFor } from '@testing-library/svelte';

it('shows loading state then content', async () => {
  render(TrackList);

  // Initially shows loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for content
  await waitFor(() => {
    expect(screen.getByText('Track 1')).toBeInTheDocument();
  });
});
```

## Async Testing

### Promises
```typescript
it('should load track from API', async () => {
  const track = await loadTrack('123');
  expect(track.title).toBe('Test Track');
});
```

### Waiting for Side Effects
```typescript
import { waitFor } from '@testing-library/svelte';

it('should update UI after async operation', async () => {
  render(Player);

  await user.click(screen.getByRole('button', { name: 'Play' }));

  await waitFor(() => {
    expect(screen.getByText('Now Playing')).toBeInTheDocument();
  });
});
```

## Coverage Requirements

Aim for these coverage targets:
- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

Critical paths (audio engine, scheduling) should have 90%+ coverage.

## What to Test

### Do Test
- Business logic
- User interactions
- Error handling
- Edge cases
- Async operations
- State transitions

### Don't Test
- Framework internals (Svelte, SvelteKit)
- Third-party libraries
- Simple getters/setters
- Constants
