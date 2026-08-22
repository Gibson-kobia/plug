/**
 * Foundation util (TASK-002). See TA §7 src/lib/utils.ts.
 * Full helpers (formatKES, slugify, hmacSign/verify, …) arrive with their features.
 */

/** Join conditional Tailwind class names (cn). */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Optimize ImageKit URLs with responsive dimensions, WebP/AVIF format, and quality reduction.
 * ImageKit format: https://ik.imagekit.io/plug/... -> add `?tr=w-{w},h-{h},cm-pad_resize,bg-FFFFFF,q-80,f-auto`
 */
export function getOptimizedImageUrl(url: string | undefined | null, width = 350, height = 350): string {
  if (!url) return '';
  if (!url.includes('ik.imagekit.io')) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  // If already has transformation parameter, return original
  if (url.includes('tr=')) return url;
  
  return `${url}${separator}tr=w-${width},h-${height},cm-pad_resize,bg-FFFFFF,q-80,f-auto`;
}
