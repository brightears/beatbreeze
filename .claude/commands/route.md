---
argument-hint: [path] [type?]
description: Create a new SvelteKit route with proper structure
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Create SvelteKit Route: $1

Route type: ${2:-page}

## Current Routes Structure
!`find src/routes -type f -name "+*.svelte" -o -name "+*.ts" 2>/dev/null | head -20 || echo "No routes found yet"`

## Your Task

Create a new SvelteKit route at `src/routes/$1/`:

### For Page Routes (type: page)

Create these files:
1. `+page.svelte` - The page component
2. `+page.server.ts` - Server-side data loading
3. `+page.ts` - Client-side load function (if needed)

### For API Routes (type: api)

Create these files:
1. `+server.ts` - API endpoint handlers (GET, POST, PUT, DELETE)

### For Layout Routes (type: layout)

Create these files:
1. `+layout.svelte` - Layout component
2. `+layout.server.ts` - Layout data loading

## Templates

### Page Template (+page.svelte)
```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Page Title | Cloud Code</title>
</svelte:head>

<main class="page">
  <!-- Content -->
</main>

<style>
  .page {
    padding: 1rem;
  }
</style>
```

### Server Load (+page.server.ts)
```typescript
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = locals;
  if (!user) throw error(401, 'Unauthorized');

  return {
    // data
  };
};
```

### API Endpoint (+server.ts)
```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  const { user } = locals;
  if (!user) throw error(401, 'Unauthorized');

  return json({ data: [] });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const { user } = locals;
  if (!user) throw error(401, 'Unauthorized');

  const body = await request.json();
  // Validate with Zod...

  return json({ success: true }, { status: 201 });
};
```

Ensure the route follows SvelteKit conventions and includes proper TypeScript types.
