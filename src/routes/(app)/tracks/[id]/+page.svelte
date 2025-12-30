<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';

	interface Track {
		id: string;
		title: string;
		artist: string | null;
		album: string | null;
		duration: number;
		bpm: number | null;
		genre: string | null;
		mood: string[];
		fileUrl: string;
		streamUrl: string | null;
		createdAt: string;
	}

	let track = $state<Track | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');

	// Form state
	let title = $state('');
	let artist = $state('');
	let album = $state('');
	let bpm = $state<number | ''>('');
	let genre = $state('');
	let selectedMoods = $state<string[]>([]);

	const availableMoods = ['relaxed', 'energetic', 'happy', 'melancholic', 'upbeat', 'calm', 'intense', 'romantic'];
	const availableGenres = ['pop', 'rock', 'jazz', 'electronic', 'classical', 'ambient', 'hip-hop', 'r&b', 'country', 'latin'];

	// Load track on mount
	$effect(() => {
		const id = $page.params.id;
		if (id) {
			loadTrack(id);
		}
	});

	async function loadTrack(id: string) {
		loading = true;
		error = '';
		try {
			const response = await fetch(`/api/tracks/${id}`);
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Track not found');
				}
				throw new Error('Failed to load track');
			}

			const data = await response.json();
			track = data.track;

			// Populate form
			title = track?.title ?? '';
			artist = track?.artist ?? '';
			album = track?.album ?? '';
			bpm = track?.bpm ?? '';
			genre = track?.genre ?? '';
			selectedMoods = track?.mood ?? [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load track';
		} finally {
			loading = false;
		}
	}

	async function saveTrack() {
		if (!track) return;

		saving = true;
		error = '';

		try {
			const response = await fetch(`/api/tracks/${track.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					artist: artist || null,
					album: album || null,
					bpm: bpm || null,
					genre: genre || null,
					mood: selectedMoods
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save track');
			}

			const data = await response.json();
			track = { ...track, ...data.track };

			// Show success feedback
			alert('Track saved successfully');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save track';
		} finally {
			saving = false;
		}
	}

	async function deleteTrack() {
		if (!track || !confirm('Are you sure you want to delete this track? This cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/tracks/${track.id}`, { method: 'DELETE' });
			if (response.ok) {
				goto('/tracks');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete track';
		}
	}

	function toggleMood(mood: string) {
		if (selectedMoods.includes(mood)) {
			selectedMoods = selectedMoods.filter(m => m !== mood);
		} else {
			selectedMoods = [...selectedMoods, mood];
		}
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<!-- Back link -->
	<a href="/tracks" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
		<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Back to Library
	</a>

	{#if loading}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<svg class="animate-spin h-8 w-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			<p class="mt-2 text-gray-500">Loading track...</p>
		</div>
	{:else if error && !track}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<p class="text-red-600">{error}</p>
			<div class="mt-4">
				<Button onclick={() => goto('/tracks')}>
					{#snippet children()}Back to Library{/snippet}
				</Button>
			</div>
		</div>
	{:else if track}
		<!-- Audio Preview -->
		{#if track.streamUrl}
			<div class="bg-white rounded-lg shadow p-4">
				<h3 class="text-sm font-medium text-gray-700 mb-2">Preview</h3>
				<audio controls class="w-full" src={track.streamUrl}>
					Your browser does not support the audio element.
				</audio>
			</div>
		{/if}

		<!-- Metadata Form -->
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">Track Details</h2>
				<p class="text-sm text-gray-500">Duration: {formatDuration(track.duration)}</p>
			</div>

			{#if error}
				<div class="px-6 py-4 bg-red-50 border-b border-red-200">
					<p class="text-sm text-red-600">{error}</p>
				</div>
			{/if}

			<form class="px-6 py-4 space-y-6" onsubmit={(e) => { e.preventDefault(); saveTrack(); }}>
				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700">Title *</label>
					<input
						id="title"
						type="text"
						required
						bind:value={title}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<!-- Artist -->
				<div>
					<label for="artist" class="block text-sm font-medium text-gray-700">Artist</label>
					<input
						id="artist"
						type="text"
						bind:value={artist}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<!-- Album -->
				<div>
					<label for="album" class="block text-sm font-medium text-gray-700">Album</label>
					<input
						id="album"
						type="text"
						bind:value={album}
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Genre -->
					<div>
						<label for="genre" class="block text-sm font-medium text-gray-700">Genre</label>
						<select
							id="genre"
							bind:value={genre}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">Select genre</option>
							{#each availableGenres as g}
								<option value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
							{/each}
						</select>
					</div>

					<!-- BPM -->
					<div>
						<label for="bpm" class="block text-sm font-medium text-gray-700">BPM</label>
						<input
							id="bpm"
							type="number"
							min="40"
							max="300"
							bind:value={bpm}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Mood Tags -->
				<div>
					<span class="block text-sm font-medium text-gray-700 mb-2" id="mood-label">Mood Tags</span>
					<div class="flex flex-wrap gap-2" role="group" aria-labelledby="mood-label">
						{#each availableMoods as mood}
							<button
								type="button"
								class="px-3 py-1 rounded-full text-sm font-medium transition-colors {selectedMoods.includes(mood)
									? 'bg-blue-600 text-white'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
								onclick={() => toggleMood(mood)}
							>
								{mood}
							</button>
						{/each}
					</div>
				</div>

				<!-- Actions -->
				<div class="flex justify-between pt-4 border-t border-gray-200">
					<Button variant="danger" onclick={deleteTrack}>
						{#snippet children()}Delete Track{/snippet}
					</Button>
					<div class="flex gap-2">
						<Button variant="secondary" onclick={() => goto('/tracks')}>
							{#snippet children()}Cancel{/snippet}
						</Button>
						<Button type="submit" loading={saving}>
							{#snippet children()}Save Changes{/snippet}
						</Button>
					</div>
				</div>
			</form>
		</div>
	{/if}
</div>
