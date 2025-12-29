---
argument-hint: [name] [type?]
description: Create a new Svelte 5 component with TypeScript and tests
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Create Svelte 5 Component: $1

Component type: ${2:-ui}

## Current Project Structure
!`ls -la src/lib/components/ 2>/dev/null || echo "Components directory not found"`

## Existing Similar Components
!`find src/lib/components -name "*.svelte" 2>/dev/null | head -10 || echo "No components found yet"`

## Your Task

Create a new Svelte 5 component named `$1` in the appropriate directory:
- Type `ui` → `src/lib/components/ui/$1.svelte`
- Type `player` → `src/lib/components/player/$1.svelte`
- Type `scheduling` → `src/lib/components/scheduling/$1.svelte`
- Type `dashboard` → `src/lib/components/dashboard/$1.svelte`

### Component Requirements

1. **Use Svelte 5 Runes** (NOT stores):
   - `$props()` for props
   - `$state()` for reactive state
   - `$derived()` for computed values
   - `$effect()` for side effects

2. **TypeScript**: Use `<script lang="ts">` with proper types

3. **Accessibility**: Include ARIA labels, keyboard navigation

4. **Styling**: Use scoped `<style>` with CSS variables

### Template

```svelte
<script lang="ts">
  // Props with TypeScript types
  let {
    // props here
  }: {
    // types here
  } = $props();

  // Local state
  let example = $state('');

  // Derived values
  let computed = $derived(example.length);
</script>

<!-- Template with accessibility -->
<div class="component">
  <!-- content -->
</div>

<style>
  .component {
    /* styles using CSS variables */
  }
</style>
```

Also create a companion test file at `src/lib/components/[type]/$1.test.ts`.
