<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import TrackUploader from '$lib/components/ui/TrackUploader.svelte';

	// Temporary hardcoded org for development
	const orgId = 'demo-org-id';

	interface Track {
		id: string;
		title: string;
		artist: string | null;
		album: string | null;
		duration: number;
		bpm: number | null;
		genre: string | null;
		mood: string[];
		createdAt: string;
	}

	let tracks = $state<Track[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedGenre = $state('');
	let showUploader = $state(false);

	// Fetch tracks on mount
	$effect(() => {
		fetchTracks();
	});

	async function fetchTracks() {
		loading = true;
		try {
			const params = new URLSearchParams({ orgId });
			if (searchQuery) params.set('search', searchQuery);
			if (selectedGenre) params.set('genre', selectedGenre);

			const response = await fetch(`/api/tracks?${params}`);
			if (response.ok) {
				const data = await response.json();
				tracks = data.tracks;
			}
		} catch (error) {
			console.error('Failed to fetch tracks:', error);
		} finally {
			loading = false;
		}
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function handleUploadComplete() {
		showUploader = false;
		fetchTracks();
	}

	async function deleteTrack(id: string) {
		if (!confirm('Are you sure you want to delete this track?')) return;

		try {
			const response = await fetch(`/api/tracks/${id}`, { method: 'DELETE' });
			if (response.ok) {
				tracks = tracks.filter(t => t.id !== id);
			}
		} catch (error) {
			console.error('Failed to delete track:', error);
		}
	}

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchQuery = value;
			fetchTracks();
		}, 300);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Track Library</h1>
			<p class="text-gray-500">{tracks.length} tracks</p>
		</div>
		<Button onclick={() => showUploader = !showUploader}>
			{#snippet children()}
				{showUploader ? 'Close' : 'Upload Tracks'}
			{/snippet}
		</Button>
	</div>

	<!-- Upload Section -->
	{#if showUploader}
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-medium text-gray-900 mb-4">Upload Audio Files</h2>
			<TrackUploader {orgId} onUploadComplete={handleUploadComplete} />
		</div>
	{/if}

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1">
				<input
					type="search"
					placeholder="Search tracks..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					oninput={handleSearch}
				/>
			</div>
			<select
				class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				bind:value={selectedGenre}
				onchange={fetchTracks}
			>
				<option value="">All Genres</option>
				<option value="pop">Pop</option>
				<option value="rock">Rock</option>
				<option value="jazz">Jazz</option>
				<option value="electronic">Electronic</option>
				<option value="classical">Classical</option>
				<option value="ambient">Ambient</option>
			</select>
		</div>
	</div>

	<!-- Track List -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		{#if loading}
			<div class="p-8 text-center text-gray-500">
				<svg class="animate-spin h-8 w-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
				</svg>
				<p class="mt-2">Loading tracks...</p>
			</div>
		{:else if tracks.length === 0}
			<div class="p-8 text-center text-gray-500">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No tracks yet</h3>
				<p class="mt-1 text-sm text-gray-500">Get started by uploading some audio files.</p>
				<div class="mt-4">
					<Button onclick={() => showUploader = true}>
						{#snippet children()}Upload Tracks{/snippet}
					</Button>
				</div>
			</div>
		{:else}
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BPM</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each tracks as track (track.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									<div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
										<svg class="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
											<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
										</svg>
									</div>
									<div class="ml-4">
										<a href="/tracks/{track.id}" class="text-sm font-medium text-gray-900 hover:text-blue-600">
											{track.title}
										</a>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{track.artist ?? '—'}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatDuration(track.duration)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if track.genre}
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
										{track.genre}
									</span>
								{:else}
									<span class="text-gray-400">—</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{track.bpm ?? '—'}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<a href="/tracks/{track.id}" class="text-blue-600 hover:text-blue-900 mr-4">Edit</a>
								<button
									class="text-red-600 hover:text-red-900"
									onclick={() => deleteTrack(track.id)}
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
