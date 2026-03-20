/**
 * Utility to optimize Supabase Storage URLs using built-in image transformations.
 * This helps significantly with mobile performance by reducing asset size.
 */
export function getOptimizedImageUrl(url: string | undefined, options: { width?: number; quality?: number; format?: 'webp' | 'avif' } = {}) {
  if (!url) return url;
  
  // Only apply to Supabase storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;
  
  const { width, quality = 80, format = 'webp' } = options;
  
  // Use URL object to safely append parameters
  try {
    const urlObj = new URL(url);
    if (width) urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('quality', quality.toString());
    urlObj.searchParams.set('format', format);
    
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}
