<script lang="ts">
	import Button from './Button.svelte';

	let {
		orgId,
		onUploadComplete,
		maxFiles = 20
	}: {
		orgId: string;
		onUploadComplete?: (tracks: UploadedTrack[]) => void;
		maxFiles?: number;
	} = $props();

	interface UploadedTrack {
		key: string;
		filename: string;
		title: string;
		status: 'pending' | 'uploading' | 'complete' | 'error';
		progress: number;
		error?: string;
	}

	let isDragging = $state(false);
	let files = $state<UploadedTrack[]>([]);
	let fileInput: HTMLInputElement;

	const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/ogg', 'audio/aac'];

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const droppedFiles = e.dataTransfer?.files;
		if (droppedFiles) {
			processFiles(Array.from(droppedFiles));
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			processFiles(Array.from(input.files));
		}
	}

	function processFiles(selectedFiles: File[]) {
		const audioFiles = selectedFiles.filter(f => allowedTypes.includes(f.type));

		if (audioFiles.length === 0) {
			alert('No valid audio files selected. Supported: MP3, M4A, WAV, FLAC, OGG, AAC');
			return;
		}

		if (files.length + audioFiles.length > maxFiles) {
			alert(`Maximum ${maxFiles} files allowed`);
			return;
		}

		const newFiles: UploadedTrack[] = audioFiles.map(f => ({
			key: '',
			filename: f.name,
			title: f.name.replace(/\.[^/.]+$/, ''), // Remove extension
			status: 'pending',
			progress: 0,
			file: f
		})) as (UploadedTrack & { file: File })[];

		files = [...files, ...newFiles];

		// Start uploading
		newFiles.forEach((_, index) => {
			uploadFile(files.length - newFiles.length + index, audioFiles[index]);
		});
	}

	async function uploadFile(index: number, file: File) {
		try {
			// Update status
			files[index].status = 'uploading';
			files[index].progress = 10;

			// Get presigned URL
			const response = await fetch('/api/upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type,
					size: file.size,
					orgId
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message || 'Failed to get upload URL');
			}

			const { uploadUrl, key } = await response.json();
			files[index].key = key;
			files[index].progress = 30;

			// Upload to R2
			const uploadResponse = await fetch(uploadUrl, {
				method: 'PUT',
				headers: { 'Content-Type': file.type },
				body: file
			});

			if (!uploadResponse.ok) {
				throw new Error('Upload to storage failed');
			}

			files[index].progress = 70;

			// Create track record in database
			const trackResponse = await fetch('/api/tracks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orgId,
					title: files[index].title,
					fileKey: key,
					fileSize: file.size,
					originalFilename: file.name
				})
			});

			if (!trackResponse.ok) {
				throw new Error('Failed to create track record');
			}

			files[index].status = 'complete';
			files[index].progress = 100;

			// Check if all uploads complete
			const allComplete = files.every(f => f.status === 'complete' || f.status === 'error');
			if (allComplete && onUploadComplete) {
				onUploadComplete(files.filter(f => f.status === 'complete'));
			}
		} catch (error) {
			files[index].status = 'error';
			files[index].error = error instanceof Error ? error.message : 'Upload failed';
		}
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	function clearCompleted() {
		files = files.filter(f => f.status !== 'complete');
	}

	let completedCount = $derived(files.filter(f => f.status === 'complete').length);
	let hasCompleted = $derived(completedCount > 0);
</script>

<div class="space-y-4">
	<!-- Drop Zone -->
	<div
		class="border-2 border-dashed rounded-xl p-8 text-center transition-colors {isDragging
			? 'border-blue-500 bg-blue-50'
			: 'border-gray-300 hover:border-gray-400'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
		aria-label="Drop zone for audio files"
	>
		<div class="space-y-2">
			<svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
				<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<div class="text-gray-600">
				<button
					type="button"
					class="font-medium text-blue-600 cursor-pointer hover:text-blue-800 bg-transparent border-none p-0"
					onclick={() => fileInput.click()}
				>
					Click to upload
				</button>
				{' '}or drag and drop
			</div>
			<p class="text-sm text-gray-500">MP3, M4A, WAV, FLAC, OGG, AAC up to 50MB each</p>
		</div>
		<input
			bind:this={fileInput}
			type="file"
			accept="audio/*"
			multiple
			class="hidden"
			onchange={handleFileSelect}
		/>
	</div>

	<!-- File List -->
	{#if files.length > 0}
		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<h3 class="font-medium text-gray-900">Uploads ({completedCount}/{files.length})</h3>
				{#if hasCompleted}
					<Button variant="ghost" size="sm" onclick={clearCompleted}>Clear completed</Button>
				{/if}
			</div>

			<ul class="divide-y divide-gray-200 border rounded-lg overflow-hidden">
				{#each files as file, index (file.filename + index)}
					<li class="p-3 flex items-center justify-between bg-white">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
							{#if file.status === 'uploading'}
								<div class="mt-1 w-full bg-gray-200 rounded-full h-1.5">
									<div
										class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
										style="width: {file.progress}%"
									></div>
								</div>
							{:else if file.status === 'complete'}
								<p class="text-sm text-green-600">Uploaded successfully</p>
							{:else if file.status === 'error'}
								<p class="text-sm text-red-600">{file.error}</p>
							{/if}
						</div>
						<div class="ml-4 flex-shrink-0">
							{#if file.status === 'complete'}
								<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
							{:else if file.status === 'error'}
								<button
									class="text-gray-400 hover:text-red-500"
									onclick={() => removeFile(index)}
									aria-label="Remove file"
								>
									<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								</button>
							{:else if file.status === 'uploading'}
								<svg class="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
