---
paths: src/**/*.svelte
---

# Svelte 5 Component Standards for Cloud Code

## Svelte 5 Runes (NOT Stores)

This project uses **Svelte 5 runes**. Never use the old store API.

### Props with $props()
```svelte
<script lang="ts">
  // Destructure props with types
  let {
    title,
    count = 0,
    disabled = false,
    onclick
  }: {
    title: string;
    count?: number;
    disabled?: boolean;
    onclick?: () => void;
  } = $props();
</script>
```

### State with $state()
```svelte
<script lang="ts">
  // Simple state
  let isOpen = $state(false);

  // Typed state
  let items = $state<string[]>([]);

  // Object state
  let user = $state<User | null>(null);
</script>
```

### Derived Values with $derived()
```svelte
<script lang="ts">
  let items = $state<string[]>([]);

  // Computed value that updates automatically
  let count = $derived(items.length);
  let isEmpty = $derived(items.length === 0);
  let displayText = $derived(`${count} items`);
</script>
```

### Effects with $effect()
```svelte
<script lang="ts">
  let query = $state('');

  // Runs when dependencies change
  $effect(() => {
    console.log('Query changed:', query);
  });

  // With cleanup
  $effect(() => {
    const interval = setInterval(() => {
      // do something
    }, 1000);

    return () => clearInterval(interval);
  });
</script>
```

## Component Structure

Order sections as:
1. Script (TypeScript)
2. Template (HTML)
3. Styles (CSS)

```svelte
<script lang="ts">
  // 1. Type imports
  import type { Track } from '$lib/types';

  // 2. Component imports
  import Button from '$lib/components/ui/Button.svelte';

  // 3. Props
  let { track }: { track: Track } = $props();

  // 4. State
  let isPlaying = $state(false);

  // 5. Derived values
  let duration = $derived(formatDuration(track.durationSeconds));

  // 6. Effects
  $effect(() => {
    // ...
  });

  // 7. Functions
  function handlePlay() {
    isPlaying = true;
  }
</script>

<!-- Template -->
<div class="track-card">
  <h3>{track.title}</h3>
  <Button onclick={handlePlay}>Play</Button>
</div>

<style>
  .track-card {
    /* styles */
  }
</style>
```

## Event Handling

Use the new event syntax (Svelte 5):
```svelte
<!-- Good - Svelte 5 syntax -->
<button onclick={handleClick}>Click</button>
<input oninput={(e) => query = e.target.value} />

<!-- Avoid - Svelte 4 syntax -->
<button on:click={handleClick}>Click</button>
```

## Accessibility

Every component must include:

### Interactive Elements
```svelte
<button
  type="button"
  aria-label="Play track"
  aria-pressed={isPlaying}
  onclick={handlePlay}
>
  {isPlaying ? 'Pause' : 'Play'}
</button>
```

### Form Inputs
```svelte
<label for="volume">Volume</label>
<input
  id="volume"
  type="range"
  min="0"
  max="100"
  bind:value={volume}
  aria-valuenow={volume}
/>
```

### Focus Management
```svelte
<script lang="ts">
  let dialogRef: HTMLDialogElement;

  function openDialog() {
    dialogRef.showModal();
  }
</script>

<dialog bind:this={dialogRef}>
  <!-- First focusable element gets focus -->
</dialog>
```

## Styling

### Use CSS Variables
```svelte
<style>
  .button {
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-md);
  }
</style>
```

### Scoped Styles (Default)
```svelte
<style>
  /* These styles are scoped to this component */
  .card {
    background: white;
  }
</style>
```

### Global Styles (Rare)
```svelte
<style>
  :global(body.modal-open) {
    overflow: hidden;
  }
</style>
```

## Component Composition

### Slots
```svelte
<!-- Card.svelte -->
<div class="card">
  <slot name="header" />
  <slot />
  <slot name="footer" />
</div>

<!-- Usage -->
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}

  <p>Content</p>

  {#snippet footer()}
    <Button>Action</Button>
  {/snippet}
</Card>
```

### Snippets (Svelte 5)
```svelte
{#snippet trackItem(track)}
  <div class="track">
    <span>{track.title}</span>
    <span>{track.artist}</span>
  </div>
{/snippet}

{#each tracks as track}
  {@render trackItem(track)}
{/each}
```
