import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateTrackKey, getPresignedUploadUrl, validateAudioFile } from '$lib/server/storage/r2';

/**
 * POST /api/upload
 * Generate a presigned URL for direct browser-to-R2 upload
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { filename, contentType, size, orgId } = body;

		// Validate required fields
		if (!filename || !contentType || !size || !orgId) {
			throw error(400, 'Missing required fields: filename, contentType, size, orgId');
		}

		// Validate file
		const validation = validateAudioFile(contentType, size);
		if (!validation.valid) {
			throw error(400, validation.error ?? 'Invalid file');
		}

		// Generate storage key
		const key = generateTrackKey(orgId, filename);

		// Get presigned upload URL
		const result = await getPresignedUploadUrl(key, contentType);

		if (!result.success) {
			throw error(500, result.error ?? 'Failed to generate upload URL');
		}

		return json({
			uploadUrl: result.uploadUrl,
			key: result.key,
			filename
		});
	} catch (err) {
		console.error('Upload URL generation error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to generate upload URL');
	}
};
