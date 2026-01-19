// Watermark utility for photos
// Adds date/time, GPS coordinates, and SiteSee logo to images

export const addWatermark = (file, gpsCoords) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            // Don't watermark videos, return as-is
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas size to image size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Watermark settings
                const padding = 20;
                const fontSize = Math.max(16, Math.floor(img.width / 40));
                const lineHeight = fontSize * 1.4;

                // Semi-transparent black bar at bottom
                const barHeight = lineHeight * 3 + padding * 2;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, img.height - barHeight, img.width, barHeight);

                // White text
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                ctx.textBaseline = 'top';

                // Date & Time
                const now = new Date();
                const dateStr = now.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                // GPS Coordinates
                const gpsStr = gpsCoords
                    ? `📍 ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}`
                    : '📍 GPS unavailable';

                // Draw text lines
                const textX = padding;
                let textY = img.height - barHeight + padding;

                ctx.fillText(`📅 ${dateStr}`, textX, textY);
                textY += lineHeight;
                ctx.fillText(gpsStr, textX, textY);
                textY += lineHeight;

                // SiteSee branding
                ctx.font = `bold ${fontSize * 1.2}px Arial, sans-serif`;
                ctx.fillStyle = '#F59E0B'; // Amber color
                ctx.fillText('✓ Verified by SiteSee', textX, textY);

                // Add small logo watermark in corner
                ctx.font = `${fontSize * 0.8}px Arial, sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.textAlign = 'right';
                ctx.fillText('sitesee.app', img.width - padding, textY);

                // Convert canvas to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create new file with watermarked image
                            const watermarkedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(watermarkedFile);
                        } else {
                            reject(new Error('Failed to create watermarked image'));
                        }
                    },
                    'image/jpeg',
                    0.9
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

// Get current GPS coordinates
export const getCurrentGPS = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                console.error('GPS Error:', error);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

// Process multiple files with watermarks
export const processFilesWithWatermark = async (files, gpsCoords) => {
    const processedFiles = [];

    for (const file of files) {
        try {
            const watermarkedFile = await addWatermark(file, gpsCoords);
            processedFiles.push(watermarkedFile);
        } catch (err) {
            console.error('Watermark error:', err);
            // If watermarking fails, use original file
            processedFiles.push(file);
        }
    }

    return processedFiles;
};
