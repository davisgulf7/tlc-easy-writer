
/**
 * Processes an image file to a compressed base64 string.
 * Resizes to max 512x512 to ensure LocalStorage compatibility.
 */
export const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
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
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG 0.7 quality which is usually good enough for icons
            // Use JPEG for photos to save space, but PNG for graphics if needed?
            // Actually, for user photos, JPEG 0.7 is ideal for localstorage.
            // If original was PNG/SVG with transparency, we might lose it if we force JPEG?
            // But canvas default background is transparent black, JPEG makes it black.
            // Let's check type.
            const isTransparent = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/webp';
            const outputType = isTransparent ? 'image/png' : 'image/jpeg';

            // For PNG, the quality param is generally ignored by browsers, but resizing helps size.
            // For JPEG, 0.7 helps a lot.
            resolve(canvas.toDataURL(outputType, 0.7));
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };

        img.src = url;
    });
};
