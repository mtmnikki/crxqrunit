import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. If you have these set, you may need to update to newer API keys from your Supabase dashboard.'
  )
}

console.log('Supabase Configuration:', {
  url: supabaseUrl?.substring(0, 30) + '...',
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  keyLength: supabaseAnonKey?.length
})
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Download a file using the file_url from storage_files_catalog
 */
export async function downloadFileFromBucket(fileUrl: string, fileName?: string): Promise<void> {
  if (!fileUrl) return
  
  try {
    console.log('Downloading file from URL:', fileUrl)
    
    // Simple download approach - fetch as blob then download
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Download completed successfully')
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback: open in new window  
    window.open(fileUrl, '_blank')
  }
}

/**
 * Open a file (video) in a new window using file_url
 */
export function openFileFromBucket(fileUrl: string): void {
  if (!fileUrl) return
  
  console.log('Opening file in new window:', fileUrl)
  window.open(fileUrl, '_blank')
}