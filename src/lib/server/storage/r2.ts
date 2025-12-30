import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';

// R2 client configuration
const r2Client = new S3Client({
	region: 'auto',
	endpoint: env.R2_ENDPOINT,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID ?? '',
		secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? ''
	}
});

const BUCKET_NAME = env.R2_BUCKET_NAME ?? 'cloudcode-audio';

// Allowed audio MIME types
const ALLOWED_AUDIO_TYPES = [
	'audio/mpeg',      // MP3
	'audio/mp4',       // M4A, AAC
	'audio/wav',       // WAV
	'audio/x-wav',
	'audio/flac',      // FLAC
	'audio/ogg',       // OGG
	'audio/aac'        // AAC
];

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export interface UploadResult {
	success: boolean;
	key?: string;
	url?: string;
	error?: string;
}

export interface PresignedUrlResult {
	success: boolean;
	uploadUrl?: string;
	key?: string;
	error?: string;
}

/**
 * Generate a unique key for storing audio files
 * Format: org/{orgId}/tracks/{uuid}.{ext}
 */
export function generateTrackKey(orgId: string, filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? 'mp3';
	const uuid = crypto.randomUUID();
	return `org/${orgId}/tracks/${uuid}.${ext}`;
}

/**
 * Validate file before upload
 */
export function validateAudioFile(
	contentType: string,
	size: number
): { valid: boolean; error?: string } {
	if (!ALLOWED_AUDIO_TYPES.includes(contentType)) {
		return {
			valid: false,
			error: `Invalid file type: ${contentType}. Allowed: MP3, M4A, WAV, FLAC, OGG, AAC`
		};
	}

	if (size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File too large: ${(size / 1024 / 1024).toFixed(1)}MB. Max: 50MB`
		};
	}

	return { valid: true };
}

/**
 * Upload a file directly to R2
 */
export async function uploadToR2(
	key: string,
	body: Buffer | Uint8Array | ReadableStream,
	contentType: string,
	metadata?: Record<string, string>
): Promise<UploadResult> {
	try {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			Body: body,
			ContentType: contentType,
			Metadata: metadata
		});

		await r2Client.send(command);

		return {
			success: true,
			key,
			url: `${env.R2_ENDPOINT}/${BUCKET_NAME}/${key}`
		};
	} catch (error) {
		console.error('R2 upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Upload failed'
		};
	}
}

/**
 * Generate a presigned URL for client-side uploads
 * This allows direct browser-to-R2 uploads without going through our server
 */
export async function getPresignedUploadUrl(
	key: string,
	contentType: string,
	expiresIn: number = 3600 // 1 hour default
): Promise<PresignedUrlResult> {
	try {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			ContentType: contentType
		});

		const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });

		return {
			success: true,
			uploadUrl,
			key
		};
	} catch (error) {
		console.error('Presigned URL error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to generate upload URL'
		};
	}
}

/**
 * Generate a presigned URL for downloading/streaming
 */
export async function getPresignedDownloadUrl(
	key: string,
	expiresIn: number = 3600
): Promise<string | null> {
	try {
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key
		});

		return await getSignedUrl(r2Client, command, { expiresIn });
	} catch (error) {
		console.error('Download URL error:', error);
		return null;
	}
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
	try {
		const command = new DeleteObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key
		});

		await r2Client.send(command);
		return true;
	} catch (error) {
		console.error('R2 delete error:', error);
		return false;
	}
}

/**
 * Check if a file exists in R2
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
	try {
		const command = new HeadObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key
		});

		await r2Client.send(command);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get the public URL for a file (if bucket has public access enabled)
 * Note: Our bucket is private, so use presigned URLs instead
 */
export function getPublicUrl(key: string): string {
	return `${env.R2_ENDPOINT}/${BUCKET_NAME}/${key}`;
}
