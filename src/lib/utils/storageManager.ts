// Storage manager for saved generations (Supabase Database)

import type { SavedGeneration } from '$lib/types';

// API endpoint for database operations
const API_BASE = '/api/generations';

/**
 * Get all saved generations from database
 */
export async function getSavedGenerations(): Promise<SavedGeneration[]> {
	try {
		const response = await fetch(API_BASE);
		if (!response.ok) {
			throw new Error('Failed to fetch generations');
		}
		const data = await response.json();
		return data.generations || [];
	} catch (error) {
		console.error('Error loading saved generations:', error);
		return [];
	}
}

/**
 * Save a new generation to database
 */
export async function saveGeneration(
	imageUrl: string,
	videoUrl: string,
	prompt: string,
	model?: string,
	duration?: number,
	resolution?: string
): Promise<SavedGeneration | null> {
	try {
		const response = await fetch(API_BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				imageUrl,
				videoUrl,
				prompt,
				model,
				duration,
				resolution
			})
		});

		if (!response.ok) {
			throw new Error('Failed to save generation');
		}

		const data = await response.json();
		return data.generation;
	} catch (error) {
		console.error('Error saving generation:', error);
		return null;
	}
}

/**
 * Delete a saved generation by ID
 */
export async function deleteGeneration(id: string): Promise<boolean> {
	try {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'DELETE'
		});

		return response.ok;
	} catch (error) {
		console.error('Error deleting generation:', error);
		return false;
	}
}

/**
 * Clear all saved generations
 */
export async function clearAllGenerations(): Promise<boolean> {
	try {
		const response = await fetch(API_BASE, {
			method: 'DELETE'
		});

		return response.ok;
	} catch (error) {
		console.error('Error clearing generations:', error);
		return false;
	}
}

/**
 * Export saved generations as JSON file
 */
export async function exportGenerationsAsJSON(): Promise<void> {
	try {
		const generations = await getSavedGenerations();
		const dataStr = JSON.stringify({ generations }, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `doodlemation-generations-${Date.now()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Error exporting generations:', error);
	}
}

/**
 * Import generations from JSON file
 */
export async function importGenerationsFromJSON(file: File): Promise<number> {
	try {
		const text = await file.text();
		const data = JSON.parse(text);

		if (!data.generations || !Array.isArray(data.generations)) {
			throw new Error('Invalid JSON format');
		}

		const response = await fetch(`${API_BASE}/import`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ generations: data.generations })
		});

		if (!response.ok) {
			throw new Error('Failed to import generations');
		}

		const result = await response.json();
		return result.imported || 0;
	} catch (error) {
		console.error('Error importing generations:', error);
		throw error;
	}
}

