---
argument-hint: [file-path]
description: Generate comprehensive tests for a file using Vitest
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generate Tests for: $ARGUMENTS

## File to Test
@$ARGUMENTS

## Current Test Structure
!`find src -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | head -10 || echo "No test files found yet"`

## Existing Test Patterns
!`cat src/**/*.test.ts 2>/dev/null | head -50 || echo "No existing tests to reference"`

## Your Task

Create comprehensive tests for the file at `$ARGUMENTS`:

1. **Test File Location**: Place the test file next to the source file with `.test.ts` extension
   - `src/lib/audio/engine.ts` → `src/lib/audio/engine.test.ts`
   - `src/lib/components/Button.svelte` → `src/lib/components/Button.test.ts`

2. **Testing Framework**: Use Vitest with @testing-library/svelte for components

3. **Test Coverage**:
   - Happy path (normal operation)
   - Edge cases (empty, null, undefined)
   - Error conditions
   - Async operations
   - Component interactions (if Svelte)

## Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Import the module to test

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  describe('functionName', () => {
    it('should handle normal input', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should throw on invalid input', () => {
      expect(() => {
        // Invalid operation
      }).toThrow('Expected error message');
    });
  });
});
```

## Svelte Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Component from './Component.svelte';

describe('Component', () => {
  it('renders with default props', () => {
    render(Component);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const { component } = render(Component);
    const button = screen.getByRole('button');

    await fireEvent.click(button);

    // Assert state change
  });
});
```

Generate tests that are:
- Readable and well-organized
- Using descriptive test names
- Testing behavior, not implementation
- Properly mocking external dependencies
