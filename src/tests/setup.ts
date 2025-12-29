// Vitest setup file
// Runs before each test file

import { vi } from 'vitest';
import '@testing-library/svelte/vitest';

// Mock browser APIs not available in jsdom
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: class AudioContext {
    createGain() {
      return {
        gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn()
      };
    }
    createBufferSource() {
      return {
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null
      };
    }
    decodeAudioData = vi.fn();
    get currentTime() {
      return 0;
    }
    get destination() {
      return {};
    }
  }
});

// Mock MediaSession API
Object.defineProperty(navigator, 'mediaSession', {
  writable: true,
  value: {
    metadata: null,
    playbackState: 'none',
    setActionHandler: vi.fn(),
    setPositionState: vi.fn()
  }
});

// Mock OPFS
Object.defineProperty(navigator, 'storage', {
  writable: true,
  value: {
    getDirectory: vi.fn().mockResolvedValue({
      getDirectoryHandle: vi.fn(),
      getFileHandle: vi.fn()
    }),
    estimate: vi.fn().mockResolvedValue({ usage: 0, quota: 500 * 1024 * 1024 })
  }
});
