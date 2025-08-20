// Slug utility for URL-friendly strings

/**
 * Convert text to URL-friendly slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert slug back to readable text (capitalize words)
 */
export function unslugify(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}