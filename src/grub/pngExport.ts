import { getOsIconSvgString } from './iconLibrary';
import type { OsIconClass } from './types';

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts any browser-loadable image URL (JPG, PNG, WebP, data URL) into genuine PNG bytes.
 */
export async function imageUrlToPngBytes(
  url: string,
  targetWidth?: number,
  targetHeight?: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = targetWidth ?? (img.naturalWidth || 1920);
      const h = targetHeight ?? (img.naturalHeight || 1080);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not initialize 2D canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const pngDataUrl = canvas.toDataURL('image/png');
      resolve(dataUrlToBytes(pngDataUrl));
    };
    img.onerror = () => reject(new Error(`Failed to decode image asset: ${url.slice(0, 64)}`));
    img.src = url;
  });
}

/**
 * Rasterizes an SVG icon (or custom uploaded icon URL) into a 32x32 PNG file for `/icons/<class>.png`.
 */
export async function iconToPngBytes(
  iconClass: OsIconClass,
  customUrl?: string,
  size = 32
): Promise<Uint8Array> {
  if (customUrl) {
    return imageUrlToPngBytes(customUrl, size, size);
  }

  const svgStr = getOsIconSvgString(iconClass, size);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);

  try {
    return await imageUrlToPngBytes(blobUrl, size, size);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Generates a clean translucent PNG highlight box (`select_c.png`) matching the theme highlight color.
 */
export function createSolidTintPngBytes(hexColor: string, alpha = 0.25): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Uint8Array(0);
  ctx.fillStyle = hexColor;
  ctx.globalAlpha = alpha;
  ctx.fillRect(0, 0, 16, 16);
  return dataUrlToBytes(canvas.toDataURL('image/png'));
}
