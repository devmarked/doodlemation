// Image compression utility

export async function compressImage(
	file: File,
	maxWidth = 1920,
	maxHeight = 1080,
	quality = 0.8
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Failed to get canvas context'));
			return;
		}

		img.onload = () => {
			let { width, height } = img;

			// Maintain aspect ratio
			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width *= ratio;
				height *= ratio;
			}

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
				'image/jpeg',
				quality
			);
		};

		img.onerror = () => reject(new Error('Failed to load image'));
		img.src = URL.createObjectURL(file);
	});
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
	const maxSize = 10 * 1024 * 1024; // 10MB

	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
		};
	}

	if (file.size > maxSize) {
		return {
			valid: false,
			error: 'File too large. Maximum size is 10MB.'
		};
	}

	return { valid: true };
}

