/**
 * Resources page - Updated to use Supabase data
 * Fetches and displays resources directly from Supabase storage bucket
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { downloadFileFromBucket, openFileFromBucket } from '@/lib/supabase'
import type { ResourceItem, StorageFile } from '@/models'
import {
  Search,
  ListFilter,
  LayoutGrid,
  FileText,
  BookText,
  FileSpreadsheet,
  ClipboardList,
  Download,
  Bookmark,
  Play,
  Video,
  File
} from 'lucide-react'

/**
 * Category keys handled via URL param (?cat=...)
 */
type CategoryKey = 'handouts' | 'billing' | 'clinical' | 'forms' | 'protocols' | 'modules'

/**
 * Lightweight pill component with count (compact, interactive)
 */
function CategoryPill({
  icon: Icon,
  label,
  count,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  count: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs shadow-sm',
        active
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      <Icon className={['h-3.5 w-3.5', active ? 'text-blue-600' : 'text-slate-500'].join(' ')} />
      <span>{label}</span>
      <span
        className={[
          'ml-1 rounded-[4px] px-1.5 py-0.5 text-[11px]',
          active ? 'bg-white/70 text-blue-700' : 'bg-slate-100 text-slate-600',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  )
}

/**
 * Colored badge for resource types
 */
function TypeBadge({ type }: { type: string }) {
  const getTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      'Clinical Guidelines': 'bg-amber-100 text-amber-700',
      'Documentation Forms': 'bg-rose-100 text-rose-700',
      'Patient Handouts': 'bg-emerald-100 text-emerald-700',
      'Protocol Manuals': 'bg-sky-100 text-sky-700',
      'Training Modules': 'bg-purple-100 text-purple-700',
      'Medical Billing': 'bg-orange-100 text-orange-700',
      'Additional Resources': 'bg-slate-100 text-slate-700'
    }
    return typeMap[type] || 'bg-slate-100 text-slate-700'
  }

  return <span className={`rounded-[4px] px-1.5 py-0.5 text-[11px] ${getTypeColor(type)}`}>{type}</span>
}

/**
 * Parse the active category from the current URL query string
 */
function getCategoryFromSearch(search: string): CategoryKey | null {
  const qs = new URLSearchParams(search)
  const v = (qs.get('cat') || '').toLowerCase()
  if (['handouts', 'billing', 'clinical', 'forms', 'protocols', 'modules'].includes(v)) {
    return v as CategoryKey
  }
  return null
}

// Bookmark state management
interface BookmarkState {
  [resourceId: string]: boolean
}

// Get file type icon based on filename or content type
function getFileTypeIcon(fileName: string = '', isVideo: boolean = false) {
  if (isVideo) return Video
  
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return FileText
    case 'doc':
    case 'docx':
      return FileText
    case 'xls':
    case 'xlsx':
      return FileSpreadsheet
    case 'mp4':
    case 'mov':
    case 'avi':
      return Video
    default:
      return File
  }
}

// Determine if file is video based on extension
function isVideoFile(mimeType: string = '', fileName: string = ''): boolean {
  // Check MIME type first (more reliable)
  if (mimeType.startsWith('video/')) {
    return true
  }
  
  // Fallback to file extension
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']
  const ext = fileName.split('.').pop()?.toLowerCase()
  return videoExtensions.includes(ext || '')
}

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Enhanced categorization based on database fields and file paths
function categorizeFile(filePath: string, fileName: string, mimeType: string): { category: string; type: string } {
  const lowerPath = (filePath || fileName || '').toLowerCase()
  
  console.log('Categorizing file:', fileName, 'Path:', filePath)
  
  // Direct path-based categorization
  if (lowerPath.includes('patienthandouts') || lowerPath.includes('patient-handouts')) {
    return { category: 'handouts', type: 'Patient Handouts' }
  } 
  else if (lowerPath.includes('medicalbilling') || lowerPath.includes('medical-billing')) {
    return { category: 'billing', type: 'Medical Billing' }
  } 
  else if (lowerPath.includes('clinicalguidelines') || lowerPath.includes('clinical-guidelines')) {
    return { category: 'clinical', type: 'Clinical Guidelines' }
  }
  else if (lowerPath.includes('/forms/') || lowerPath.includes('forms')) {
    return { category: 'forms', type: 'Documentation Forms' }
  } 
  else if (lowerPath.includes('/protocols/') || lowerPath.includes('protocol')) {
    return { category: 'protocols', type: 'Protocol Manuals' }
  } 
  else if (lowerPath.includes('/training/') || lowerPath.includes('training') || mimeType.startsWith('video/')) {
    return { category: 'modules', type: 'Training Modules' }
  }
  
  // Default to clinical guidelines for now
  console.log('Defaulting to clinical for:', fileName, 'path:', filePath)
  return { category: 'clinical', type: 'Clinical Guidelines' }
}

/**
 * Resources page component
 */
export default function Resources() {
  const location = useLocation()
  const navigate = useNavigate()

  // Search state
  const [search, setSearch] = useState('')
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkState>({})
  
  // Active category derived from URL (?cat=...)
  const [activeCat, setActiveCat] = useState<CategoryKey | null>(getCategoryFromSearch(location.search))

  // Toggle bookmark state
  const handleBookmarkToggle = (resourceId: string) => {
    setBookmarks(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }))
  }

  // Handle download/play action
  const handleFileAction = async (fileUrl: string, fileName: string, resourceName: string) => {
    console.log('=== FILE ACTION DEBUG ===')
    console.log('File URL:', fileUrl)
    console.log('File Name:', fileName)
    console.log('Resource Name:', resourceName)
    
    if (!fileUrl) {
      console.warn('No file URL provided for resource:', resourceName)
      alert(`No file available for: ${resourceName}`)
      return
    }
    
    const isVideo = isVideoFile('', fileName) // We'll determine from filename for now
    console.log('Action type:', isVideo ? 'PLAY' : 'DOWNLOAD')
    
    if (isVideo) {
      openFileFromBucket(fileUrl)
    } else {
      await downloadFileFromBucket(fileUrl, fileName)
    }
  }
  /** Sync category with URL when it changes externally */
  useEffect(() => {
    setActiveCat(getCategoryFromSearch(location.search))
  }, [location.search])

  /** Load all resources from Supabase */
  useEffect(() => {
    let mounted = true

    async function loadResources() {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching organized files from storage_files_catalog...')
        
        // Enhanced query with better categorization
        const { data: fileList, error: listError } = await supabase
          .from('storage_files_catalog')
          .select(`
            id,
            file_name,
            file_path,
            file_url,
            file_size,
            mime_type,
            category,
            program_name,
            subcategory,
            last_modified,
            created_at
          `)
          .eq('bucket_name', 'clinicalrxqfiles')
          .order('program_name', { ascending: true, nullsFirst: false })
          .order('category', { ascending: true })
          .order('file_name', { ascending: true })

        if (listError) {
          console.error('Error fetching files from catalog:', listError)
          throw listError
        }

        console.log('Files found in catalog:', fileList?.length || 0)
        
        const allResources: ResourceItem[] = []
        
        // Process organized files from the enhanced catalog
        fileList?.forEach((file, index) => {
          if (file.file_name && file.file_name !== '.emptyFolderPlaceholder') {
            // Enhanced categorization
            const fileAnalysis = categorizeFile(file.file_path || '', file.file_name, file.mime_type || '')
            
            console.log('File analysis result:', { 
              fileName: file.file_name, 
              filePath: file.file_path,
              category: fileAnalysis.category, 
              type: fileAnalysis.type 
            })

            const isVideo = isVideoFile(file.mime_type, file.file_name)
            
            allResources.push({
              id: file.id,
              name: file.file_name.replace(/\.[^/.]+$/, ''), // Remove file extension for display
              type: fileAnalysis.type,
              category: fileAnalysis.category,
              program: file.program_name,
              condition: file.subcategory,
              url: file.file_url,
              filename: file.file_name,
              mediaType: isVideo ? 'video' : 'document',
              fileSize: file.file_size,
              mimeType: file.mime_type,
              lastModified: file.last_modified
            })
          }
        })
        
        console.log('Total resources processed:', allResources.length)
        
        // Log category distribution
        const categoryStats = allResources.reduce((stats, resource) => {
          stats[resource.category] = (stats[resource.category] || 0) + 1
          return stats
        }, {} as Record<string, number>)
        console.log('Category distribution:', categoryStats)

        if (mounted) {
          setResources(allResources)
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading resources:', err)
          setError(err instanceof Error ? err.message : 'Failed to load resources')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadResources()
    return () => {
      mounted = false
    }
  }, [])

  // Map database categories to display types
  function mapCategoryToType(category: string, subcategory?: string): string {
    const categoryMap: Record<string, string> = {
      'programs': 'Training Modules',
      'clinical-guidelines': 'Clinical Guidelines', 
      'patient-handouts': 'Patient Handouts',
      'medical-billing': 'Medical Billing'
    }
    
    // Use subcategory for more specific typing if available
    if (subcategory) {
      if (subcategory.includes('protocol')) return 'Protocol Manuals'
      if (subcategory.includes('form')) return 'Documentation Forms'
      if (subcategory.includes('training')) return 'Training Modules'
    }
    
    return categoryMap[category] || 'Additional Resources'
  }
  
  /** Apply filter function based on active category + search */
  const filtered = useMemo(() => {
    let list = [...resources]
    
    console.log('Filtering resources:', { 
      total: resources.length, 
      activeCat, 
      search,
      sampleResource: resources[0] ? {
        name: resources[0].name,
        category: resources[0].category,
        type: resources[0].type
      } : 'none'
    })
    
    // Filter by category
    if (activeCat) {
      list = list.filter(r => {
        const matches = r.category === activeCat
        if (matches) {
          console.log('Category match:', { name: r.name, category: r.category, activeCat })
        }
        return matches
      })
    }
    
    // Filter by search
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) || 
        (r.program && r.program.toLowerCase().includes(q)) ||
        r.type.toLowerCase().includes(q)
      )
    }
    
    console.log('Final filtered results:', list.length, 'Category:', activeCat, 'Search:', search)
    return list
  }, [resources, activeCat, search])

  /** Quick counters for pills */
  const counts = useMemo(() => {
    const counts = {
      handouts: resources.filter(r => r.category === 'handouts').length,
      clinical: resources.filter(r => r.category === 'clinical').length,  
      billing: resources.filter(r => r.category === 'billing').length,
      forms: resources.filter(r => r.type === 'Documentation Forms').length,
      protocols: resources.filter(r => r.type === 'Protocol Manuals').length,
      modules: resources.filter(r => r.category === 'modules' || r.type === 'Training Modules').length
    }
    console.log('Category counts:', counts)
    return counts
  }, [resources])

  /** Handlers to set category and sync URL */
  function setCategory(cat: CategoryKey | null) {
    const qs = new URLSearchParams(location.search)
    if (cat) {
      qs.set('cat', cat)
    } else {
      qs.delete('cat')
    }
    navigate({ pathname: '/resources', search: qs.toString() }, { replace: false })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resource Library</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error loading resources: {error}</p>
            <p className="text-red-600 text-sm mt-1">
              Please check your Supabase configuration and try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Complete Resource Library</h1>
          <p className="text-gray-600">
            Browse all {resources.length} clinical and general pharmacy resources from Supabase
          </p>
        </div>

        {/* Search and actions row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, file name, or program..."
              className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <Button variant="outline" className="bg-transparent gap-2">
            <LayoutGrid className="h-4 w-4" />
            View
          </Button>
          <Button variant="outline" className="bg-transparent gap-2">
            <ListFilter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Category pills (interactive) */}
        <div className="mt-4 flex flex-wrap gap-2">
          <CategoryPill
            icon={FileText}
            label="Patient Handouts"
            count={counts.handouts}
            active={activeCat === 'handouts'}
            onClick={() => setCategory('handouts')}
          />
          <CategoryPill
            icon={BookText}
            label="Clinical Guidelines"
            count={counts.clinical}
            active={activeCat === 'clinical'}
            onClick={() => setCategory('clinical')}
          />
          <CategoryPill
            icon={FileSpreadsheet}
            label="Medical Billing"
            count={counts.billing}
            active={activeCat === 'billing'}
            onClick={() => setCategory('billing')}
          />
          <CategoryPill
            icon={ClipboardList}
            label="Documentation Forms"
            count={counts.forms}
            active={activeCat === 'forms'}
            onClick={() => setCategory('forms')}
          />
          <CategoryPill
            icon={BookText}
            label="Protocol Manuals"
            count={counts.protocols}
            active={activeCat === 'protocols'}
            onClick={() => setCategory('protocols')}
          />
          <CategoryPill
            icon={FileText}
            label="Training Modules"
            count={counts.modules}
            active={activeCat === 'modules'}
            onClick={() => setCategory('modules')}
          />
          {/* Clear filter chip (shows when filtered) */}
          {activeCat && (
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Resource table */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Resource Library ({filtered.length} {activeCat ? 'filtered' : 'total'} resources)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border border-gray-200 bg-white">
            {filtered.map((resource) => (
              <div key={resource.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors">
                {/* 1. Icon */}
                <div className="flex-shrink-0">
                  {(() => {
                    const isVideo = isVideoFile(resource.mimeType || '', resource.filename || '')
                    const fileName = resource.filename || resource.name
                    const FileIcon = getFileTypeIcon(fileName, isVideo)
                    return <FileIcon className="h-4 w-4 text-gray-600" />
                  })()}
                </div>
                
                {/* 2. File Name (+ duration for videos) */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 truncate">
                        {resource.name}
                      </span>
                      {resource.duration && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-nowrap">
                          {resource.duration}
                        </span>
                      )}
                      {resource.fileSize && (
                        <span className="text-xs text-gray-400">
                          {formatFileSize(resource.fileSize)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <TypeBadge type={resource.type} />
                      {resource.program && (
                        <span className="text-xs text-gray-500">
                          {resource.program}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 3. Bookmark Icon */}
                <button
                  type="button"
                  onClick={() => handleBookmarkToggle(resource.id)}
                  className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title={bookmarks[resource.id] ? 'Remove bookmark' : 'Add bookmark'}
                >
                  <Bookmark 
                    className={`h-4 w-4 transition-colors ${
                      bookmarks[resource.id] 
                        ? 'text-blue-600 fill-current' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`} 
                  />
                </button>
                
                {/* 4. Download/Play Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Resource action clicked!', { 
                      id: resource.id, 
                      name: resource.name, 
                      filename: resource.filename,
                      url: resource.url,
                      hasFile: !!resource.url 
                    })
                    handleFileAction(resource.url || '', resource.filename || '', resource.name)
                  }}
                  className={`
                    flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors
                    bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 
                    cursor-pointer active:bg-gray-100
                  `}
                >
                  {isVideoFile(resource.mimeType || '', resource.filename || '') ? (
                    <>
                      <Play className="h-3 w-3" />
                      Play
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      Download
                    </>
                  )}
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div
                className="px-4 py-8 text-center text-sm text-gray-600"
              >
                {resources.length === 0 ? 'No resources available.' : 'No resources match your filters.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}