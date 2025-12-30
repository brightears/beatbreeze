import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/prisma';
import { deleteFromR2, getPresignedDownloadUrl } from '$lib/server/storage/r2';

/**
 * GET /api/tracks/[id]
 * Get a single track with streaming URL
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const track = await db.track.findUnique({
			where: { id: params.id },
			include: {
				organization: {
					select: { name: true }
				}
			}
		});

		if (!track) {
			throw error(404, 'Track not found');
		}

		// Generate presigned streaming URL
		const streamUrl = await getPresignedDownloadUrl(track.fileUrl, 7200); // 2 hours

		return json({
			track: {
				...track,
				streamUrl
			}
		});
	} catch (err) {
		console.error('Get track error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to get track');
	}
};

/**
 * PUT /api/tracks/[id]
 * Update track metadata
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const { title, artist, album, duration, bpm, genre, mood } = body;

		// Check track exists
		const existing = await db.track.findUnique({
			where: { id: params.id }
		});

		if (!existing) {
			throw error(404, 'Track not found');
		}

		// Update track
		const track = await db.track.update({
			where: { id: params.id },
			data: {
				...(title !== undefined && { title }),
				...(artist !== undefined && { artist }),
				...(album !== undefined && { album }),
				...(duration !== undefined && { duration }),
				...(bpm !== undefined && { bpm }),
				...(genre !== undefined && { genre }),
				...(mood !== undefined && { mood })
			}
		});

		return json({ track });
	} catch (err) {
		console.error('Update track error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to update track');
	}
};

/**
 * DELETE /api/tracks/[id]
 * Delete a track and its file from R2
 */
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		// Get track to find file key
		const track = await db.track.findUnique({
			where: { id: params.id }
		});

		if (!track) {
			throw error(404, 'Track not found');
		}

		// Delete from R2
		await deleteFromR2(track.fileUrl);

		// Delete from database
		await db.track.delete({
			where: { id: params.id }
		});

		return json({ success: true });
	} catch (err) {
		console.error('Delete track error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to delete track');
	}
};
