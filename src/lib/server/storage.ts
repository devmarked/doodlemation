// Supabase Storage operations

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function uploadImage(file: File, userId: string = 'anonymous'): Promise<string> {
	const fileName = `${userId}/${Date.now()}-${file.name}`;

	const { data, error } = await supabase.storage
		.from('user-images')
		.upload(fileName, file, {
			cacheControl: '3600',
			upsert: false
		});

	if (error) throw error;

	// Get public URL
	const {
		data: { publicUrl }
	} = supabase.storage.from('user-images').getPublicUrl(fileName);

	return publicUrl;
}

export function getPublicUrl(fileName: string): string {
	const {
		data: { publicUrl }
	} = supabase.storage.from('user-images').getPublicUrl(fileName);

	return publicUrl;
}

/**
 * Upload a video from a URL to Supabase Storage
 * @param videoUrl - External video URL (e.g., from Replicate)
 * @param userId - User identifier for organizing files
 * @returns Public URL of the uploaded video in Supabase
 */
export async function uploadVideoFromUrl(
	videoUrl: string,
	userId: string = 'anonymous'
): Promise<string> {
	try {
		console.log('Downloading video from:', videoUrl);

		// Download the video from the external URL
		const response = await fetch(videoUrl);
		if (!response.ok) {
			throw new Error(`Failed to download video: ${response.statusText}`);
		}

		// Get the video as a buffer
		const videoBuffer = await response.arrayBuffer();
		const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });

		// Generate a unique filename
		const timestamp = Date.now();
		const fileName = `${userId}/${timestamp}-generated.mp4`;

		console.log('Uploading video to Supabase Storage:', fileName);

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage.from('user-videos').upload(fileName, videoBlob, {
			cacheControl: '3600',
			upsert: false,
			contentType: 'video/mp4'
		});

		if (error) {
			console.error('Supabase upload error:', error);
			throw error;
		}

		// Get public URL
		const {
			data: { publicUrl }
		} = supabase.storage.from('user-videos').getPublicUrl(fileName);

		console.log('Video uploaded successfully to:', publicUrl);

		return publicUrl;
	} catch (error) {
		console.error('Error uploading video from URL:', error);
		throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

// Cleanup old files
export async function cleanupOldFiles(olderThanDays = 7): Promise<void> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

	const { data: files } = await supabase.storage.from('user-images').list();

	const oldFiles = files?.filter((file) => {
		const fileDate = new Date(file.created_at);
		return fileDate < cutoffDate;
	});

	if (oldFiles && oldFiles.length > 0) {
		await supabase.storage
			.from('user-images')
			.remove(oldFiles.map((f) => f.name));
	}
}

/**
 * Cleanup old video files
 */
export async function cleanupOldVideos(olderThanDays = 7): Promise<void> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

	const { data: files } = await supabase.storage.from('user-videos').list();

	const oldFiles = files?.filter((file) => {
		const fileDate = new Date(file.created_at);
		return fileDate < cutoffDate;
	});

	if (oldFiles && oldFiles.length > 0) {
		await supabase.storage
			.from('user-videos')
			.remove(oldFiles.map((f) => f.name));
	}
}

