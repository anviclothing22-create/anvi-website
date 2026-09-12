import DOMPurify from 'dompurify';

/**
 * Sanitizes an untrusted HTML string to prevent XSS attacks when rendering
 * raw rich text or markdown descriptions from the backend.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}
