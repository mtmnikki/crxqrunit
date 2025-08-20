// Utility functions for processing Supabase data values

/**
 * Safe text extraction with fallback
 */
export function safeText(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  return fallback
}

/**
 * Get file URL from Supabase storage path
 */
export function getFileUrl(fileUrl: string | null | undefined): string | undefined {
  if (!fileUrl) return undefined
  console.log('getFileUrl result:', fileUrl)
  return fileUrl
}

/**
 * Extract URL from file URL field (now directly from database)
 */
export function getAttachmentUrl(fileUrl: string | null | undefined): string | undefined {
  return getFileUrl(fileUrl)
}

/**
 * Extract filename from file path or URL
 */
export function getAttachmentFilename(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined
  
  // Extract filename from path or URL
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

/**
 * Get select field text value (for enum/text fields)
 */
export function getSelectText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return ''
}

/**
 * Extract array of UUIDs from a text array field
 */
export function getLinkedRecordIds(linkedRecords: string[] | null | undefined): string[] {
  if (!linkedRecords || !Array.isArray(linkedRecords)) {
    return []
  }
  return linkedRecords.filter(Boolean)
}

/**
 * Extract first UUID from a text array field
 */
export function getFirstLinkedRecordId(linkedRecords: string[] | null | undefined): string | undefined {
  const ids = getLinkedRecordIds(linkedRecords)
  return ids.length > 0 ? ids[0] : undefined
}