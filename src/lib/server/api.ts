// API service integrations (ChatGPT and Replicate)

import OpenAI from 'openai';
import Replicate from 'replicate';
import { env } from '$env/dynamic/private';
import type {
	VideoGenerationStatus,
	ReplicateModel,
	VideoResolution,
	VideoDuration,
	ReplicateInput
} from '$lib/types';

const OPENAI_API_KEY = env.OPENAI_API_KEY || '';
const REPLICATE_API_TOKEN = env.REPLICATE_API_TOKEN || '';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Initialize Replicate client
const replicate = new Replicate({
	auth: REPLICATE_API_TOKEN
});

// Validate API keys on startup
if (!OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not configured');
}

if (!REPLICATE_API_TOKEN) {
	throw new Error('REPLICATE_API_TOKEN is not configured');
}

/**
 * Generate an animation prompt based on image description and desired animation details
 * @param imageDescription - What the user drew/uploaded
 * @param animationDetails - What animation the user wants to happen
 * @returns Structured prompt for video generation
 */
export async function generateAnimationPrompt(
	imageDescription: string,
	animationDetails: string
): Promise<string> {
	try {
		// Build user message based on whether animation details are provided
		const userMessage = animationDetails?.trim()
			? `Create a focused 6-second animation prompt for this child's drawing: "${imageDescription}". The user wants: ${animationDetails}. 

Keep it SHORT and impactful:
- Pick 2-3 KEY movements only (one main action + expression/reaction + hero moment)
- Add 2-3 effects that MATCH the character's theme (electric sparks for Pikachu, water splashes for fish, flames for dragons, etc.)
- Brief background description (one sentence)
- Add 2-3 small details that FIT the context (DON'T just use generic butterflies - think creatively about what belongs in this scene!)
- Short magical ending

Keep the hand-drawn, child-like style - NEVER make it realistic. Write as one flowing, concise paragraph optimized for 6 seconds.`
			: `Create a focused 6-second animation prompt for this child's drawing: "${imageDescription}".

Keep it SHORT and impactful:
- Pick 2-3 KEY movements only (one main action + expression/reaction + hero moment)
- Add 2-3 effects that MATCH the character's theme (electric sparks for Pikachu, water splashes for fish, flames for dragons, etc.)
- Brief background description (one sentence)
- Add 2-3 small details that FIT the context (DON'T just use generic butterflies - think creatively about what belongs in this scene!)
- Short magical ending

Keep the hand-drawn, child-like style - NEVER make it realistic. Write as one flowing, concise paragraph optimized for 6 seconds.`;

		console.log('Generating prompt with:', { imageDescription, animationDetails, userMessage });

		// Use GPT-5 Responses API to avoid empty message content and control reasoning/output tokens
		const response = await openai.responses.create({
			model: 'gpt-5-mini',
			instructions: `You are an expert at creating focused, magical animation prompts for 6-second videos.

Write ONE concise flowing paragraph that includes these elements (DO NOT label or number them):

- START with "Animate this child's drawing of [subject]"
- THEN state "Keep the hand-drawn, playful style but make the animation feel smooth, lively, and cinematic"
- ADD 2-3 KEY movements/actions maximum (choose the most impactful ones: a primary movement, an expression change, and one special moment)
- INCLUDE 2-3 CHARACTER-SPECIFIC cartoon effects that match the subject's theme/personality:
  * Electric characters (Pikachu): electric sparks, lightning bolts, glowing cheeks, zapping effects
  * Water creatures (fish, whale): water splashes, bubbles, ripples, droplets
  * Fire characters (dragon): smoke puffs, tiny flames, warm glows, embers
  * Flying things (bird, plane): swoosh lines, air currents, feathers/leaves trailing
  * Space themes: stars, planets, sparkles, cosmic dust
  * Generic/cute: hearts, musical notes, sparkles, gentle glows
- DESCRIBE the background in ONE sentence (colorful, simple layers)
- ADD 2-3 CONTEXTUALLY APPROPRIATE small details that FIT the subject and scene:
  * DON'T just default to "butterfly" - be creative and relevant!
  * For electric characters: tiny lightning bugs, glowing fireflies, static sparkles
  * For ocean scenes: fish, seashells, seaweed, coral, waves
  * For sky/air: clouds, birds, balloons, kites, paper planes
  * For forest: leaves, acorns, squirrels, mushrooms, flowers
  * For space: stars, planets, asteroids, comets, moon
  * For city: cars, buildings, streetlights, windows with lights
- END with a short magical phrase like "as if the drawing is leaping off the page into an animated world"

CRITICAL RULES FOR 6-SECOND VIDEOS:
- Keep it SHORT and FOCUSED - less is more!
- Maximum 2-3 main actions that can happen in 6 seconds
- Make effects and details MATCH the character/scene theme - be contextually creative!
- Write as ONE continuous flowing paragraph with NO labels, NO numbers, NO section headers
- NEVER use realistic descriptors like "glossy", "photorealistic", "realistic textures"
- ALWAYS maintain child-like, hand-drawn, cartoon style
- Prioritize ONE hero moment over many small actions`,
			input: userMessage,
			max_output_tokens: 10000 // Increased to account for reasoning + actual text output
		});

		console.log('OpenAI response:', response);

		// Prefer SDK helper when available
		let generatedPrompt = (response as any)?.output_text?.trim?.() || '';

		// Fallback: stitch from output content parts
		if (!generatedPrompt) {
			try {
				const output = (response as any)?.output as any[] | undefined;
				if (Array.isArray(output)) {
					const stitched = output
						.flatMap((o) => (Array.isArray(o?.content) ? o.content : []))
						.map((c: any) => c?.text?.value ?? c?.text ?? '')
						.join('')
						.trim();
					if (stitched) generatedPrompt = stitched;
				}
			} catch {
				// ignore
			}
		}

		// Last resort: some SDKs still expose choices
		if (!generatedPrompt) {
			const maybeChoices = (response as any)?.choices;
			if (Array.isArray(maybeChoices)) {
				const maybeContent = maybeChoices[0]?.message?.content;
				if (typeof maybeContent === 'string') generatedPrompt = maybeContent.trim();
			}
		}

		console.log('Generated prompt:', generatedPrompt);

		if (!generatedPrompt) {
			console.error('Empty prompt received from OpenAI');
			throw new Error('OpenAI returned an empty response');
		}

		return generatedPrompt;
	} catch (err) {
		console.error('ChatGPT API error:', err);
		if (err instanceof Error) {
			throw new Error(`Failed to generate prompt: ${err.message}`);
		}
		throw new Error('Failed to generate prompt');
	}
}

/**
 * Generate video using Replicate's MiniMax Hailuo-02 model
 * @param imageUrl - URL of the first frame image
 * @param prompt - Text description of the video animation
 * @param duration - Video duration in seconds (6 or 10)
 * @param resolution - Video resolution (512p, 768p, or 1080p)
 * @param promptOptimizer - Whether to use prompt optimization
 * @returns Prediction ID and video URL (when complete)
 */
export async function generateVideo(
	imageUrl: string,
	prompt: string,
	duration: VideoDuration = 6,
	resolution: VideoResolution = '512p',
	promptOptimizer: boolean = false
): Promise<{ predictionId: string; status: string; videoUrl?: string }> {
	try {
		const input: ReplicateInput = {
			prompt,
			first_frame_image: imageUrl,
			duration,
			resolution,
			prompt_optimizer: promptOptimizer
		};

		console.log('Starting Replicate video generation:', {
			...input,
			first_frame_image: '...'
		});

		// Run the prediction
		const output = await replicate.run('minimax/hailuo-02', { input });

		console.log('Replicate prediction completed:', output);

		// Replicate returns the output directly when complete
		let videoUrl: string | undefined;

		if (output && typeof output === 'object' && 'url' in output) {
			videoUrl = (output as any).url();
		} else if (typeof output === 'string') {
			videoUrl = output;
		} else if (Array.isArray(output) && output.length > 0) {
			videoUrl = output[0];
		}

		return {
			predictionId: 'completed',
			status: 'complete',
			videoUrl
		};
	} catch (err) {
		console.error('Video generation error:', err);
		throw new Error(err instanceof Error ? err.message : 'Failed to generate video');
	}
}

// Note: With Replicate, we don't need separate status checking
// The replicate.run() method handles polling automatically and returns
// the final result when complete

