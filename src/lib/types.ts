// Core type definitions for DoodleMation

export type GenerationStatus = 'idle' | 'processing' | 'complete' | 'failed';

export type ReplicateModel = 'minimax/hailuo-02';
export type VideoResolution = '512p' | '768p' | '1080p'; // Replicate uses lowercase 'p'
export type VideoDuration = 6 | 10;

export interface VideoGenerationRequest {
	imageUrl: string;
	prompt: string;
	model?: ReplicateModel;
	duration?: VideoDuration;
	resolution?: VideoResolution;
	promptOptimizer?: boolean;
}

export interface VideoGenerationResult {
	success: boolean;
	videoUrl?: string;
	predictionId?: string;
	duration?: number;
	resolution?: string;
	model?: string;
	error?: string;
}

export interface ReplicateInput {
	prompt: string;
	first_frame_image?: string;
	duration?: VideoDuration;
	resolution?: VideoResolution;
	prompt_optimizer?: boolean;
}

export interface PromptEnhancementRequest {
	prompt: string;
}

export interface PromptEnhancementResult {
	success: boolean;
	enhanced: string;
	cached?: boolean;
}

export interface VideoGenerationStatus {
	predictionId: string;
	status: GenerationStatus;
	progress?: number;
	videoUrl?: string;
	error?: string;
}

export interface UploadImageRequest {
	file: File;
}

export interface UploadImageResult {
	success: boolean;
	url: string;
	fileName?: string;
	error?: string;
}

export interface ImageData {
	file: File | null;
	url: string;
	preview?: string;
}

export interface SavedGeneration {
	id: string;
	imageUrl: string;
	videoUrl: string;
	prompt: string;
	createdAt: string;
	model?: string;
	duration?: number;
	resolution?: string;
}

