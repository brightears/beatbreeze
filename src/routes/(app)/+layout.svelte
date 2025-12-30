<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Temporary hardcoded org for development
	// TODO: Get from auth context
	const currentOrg = {
		id: 'demo-org-id',
		name: 'Demo Organization'
	};
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<span class="text-xl font-bold text-blue-600">Cloud Code</span>
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<a href="/tracks" class="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
							Tracks
						</a>
						<a href="/playlists" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
							Playlists
						</a>
						<a href="/schedules" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
							Schedules
						</a>
						<a href="/zones" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
							Zones
						</a>
					</div>
				</div>
				<div class="flex items-center">
					<span class="text-sm text-gray-500">{currentOrg.name}</span>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
