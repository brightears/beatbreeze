import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/prisma';
import { getPresignedDownloadUrl } from '$lib/server/storage/r2';

/**
 * GET /api/tracks
 * List tracks with optional filtering and pagination
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const orgId = url.searchParams.get('orgId');
		const search = url.searchParams.get('search');
		const genre = url.searchParams.get('genre');
		const mood = url.searchParams.get('mood');
		const limit = parseInt(url.searchParams.get('limit') ?? '50');
		const offset = parseInt(url.searchParams.get('offset') ?? '0');

		if (!orgId) {
			throw error(400, 'Organization ID required');
		}

		// Build where clause
		const where: Record<string, unknown> = {
			organizationId: orgId
		};

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ artist: { contains: search, mode: 'insensitive' } },
				{ album: { contains: search, mode: 'insensitive' } }
			];
		}

		if (genre) {
			where.genre = genre;
		}

		if (mood) {
			where.mood = { has: mood };
		}

		// Fetch tracks
		const [tracks, total] = await Promise.all([
			db.track.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				take: limit,
				skip: offset,
				select: {
					id: true,
					title: true,
					artist: true,
					album: true,
					duration: true,
					bpm: true,
					genre: true,
					mood: true,
					fileUrl: true,
					createdAt: true
				}
			}),
			db.track.count({ where })
		]);

		return json({
			tracks,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + tracks.length < total
			}
		});
	} catch (err) {
		console.error('List tracks error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to list tracks');
	}
};

/**
 * POST /api/tracks
 * Create a new track record (after file upload)
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			orgId,
			title,
			artist,
			album,
			duration,
			bpm,
			genre,
			mood,
			fileKey,
			fileSize,
			originalFilename
		} = body;

		// Validate required fields
		if (!orgId || !title || !fileKey) {
			throw error(400, 'Missing required fields: orgId, title, fileKey');
		}

		// Create track record
		const track = await db.track.create({
			data: {
				organizationId: orgId,
				title,
				artist: artist ?? null,
				album: album ?? null,
				duration: duration ?? 0,
				bpm: bpm ?? null,
				genre: genre ?? null,
				mood: mood ?? [],
				fileUrl: fileKey,
				fileSize: fileSize ?? 0
			}
		});

		return json({ track }, { status: 201 });
	} catch (err) {
		console.error('Create track error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to create track');
	}
};
