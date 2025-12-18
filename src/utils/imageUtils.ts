
/**
 * Processes an image file to a compressed base64 string.
 * Resizes to max 512x512 to ensure LocalStorage compatibility.
 */
export const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Fail fast for HEIC
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
            reject(new Error("HEIC format not supported. Please convert to JPEG or PNG or upload from an iPad."));
            return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            try {
                URL.revokeObjectURL(url); // Clean up memory

                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Could not get canvas context');
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG 0.7 quality which is usually good enough for icons
                const isTransparent = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/webp';
                const outputType = isTransparent ? 'image/png' : 'image/jpeg';

                resolve(canvas.toDataURL(outputType, 0.7));
            } catch (err) {
                reject(err instanceof Error ? err : new Error("Failed during image conversion."));
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image. The format might be unsupported or the file corrupted."));
        };

        img.src = url;
    });
};
